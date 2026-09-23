<?php
// ── PAGE D'AJOUT D'UNE VIDÉO ─────────────────────────────────────────────────
// Cette page contient un formulaire pour ajouter une nouvelle vidéo.
// Quand le formulaire est soumis (méthode POST), le PHP :
//   1. Vérifie que tous les champs obligatoires sont remplis
//   2. Uploade l'image dans le dossier img/uploads/
//   3. Insère une nouvelle ligne dans la table "videos"
//   4. Redirige vers la page d'accueil

require 'config.php'; // Inclut la connexion à la base de données

$erreurs = []; // Tableau qui contiendra les messages d'erreur si un champ est mal rempli
$succes  = false; // Booléen qui passe à true quand la vidéo est bien ajoutée

// ── TRAITEMENT DU FORMULAIRE ──────────────────────────────────────────────────
// Ce bloc s'exécute seulement quand le formulaire est soumis (méthode POST).
// Sinon (première visite, méthode GET), on affiche juste le formulaire vide.

if ($_SERVER['REQUEST_METHOD'] === 'POST') { // Vérifie que la page est appelée après soumission du formulaire

    // ── RÉCUPÉRATION DES CHAMPS TEXTE ─────────────────────────────────────────
    // trim() supprime les espaces en début et fin de chaîne
    // ?? '' signifie "si le champ n'existe pas, utiliser une chaîne vide"
    $titre       = trim($_POST['titre'] ?? ''); // Récupère et nettoie le titre
    $description = trim($_POST['description'] ?? ''); // Récupère et nettoie la description
    $url_youtube = trim($_POST['url_youtube'] ?? ''); // Récupère et nettoie l'URL YouTube (optionnelle)

    // ── VALIDATION DES CHAMPS OBLIGATOIRES ───────────────────────────────────
    if ($titre === '') { // Si le titre est vide
        $erreurs[] = 'Le titre est obligatoire.'; // Ajoute un message d'erreur au tableau
    }
    if ($description === '') { // Si la description est vide
        $erreurs[] = 'La description est obligatoire.';
    }

    // ── VALIDATION ET UPLOAD DE L'IMAGE ──────────────────────────────────────
    // $_FILES contient les informations sur les fichiers envoyés via le formulaire.
    // $_FILES['image']['error'] === 0 signifie que le fichier a été uploadé sans erreur.
    $image_path = ''; // Chemin final où l'image sera sauvegardée

    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== 0) {
        // Si aucun fichier n'a été envoyé ou s'il y a eu une erreur d'upload
        $erreurs[] = 'Une image est obligatoire.';
    } else {
        // ── VÉRIFICATION DU TYPE DE FICHIER ───────────────────────────────────
        // On n'accepte que les images (jpeg, png, gif, webp) pour la sécurité.
        $types_autorises = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']; // Types MIME acceptés
        $type_fichier = $_FILES['image']['type']; // Type MIME du fichier uploadé (ex: "image/jpeg")

        if (!in_array($type_fichier, $types_autorises)) { // Vérifie si le type est dans la liste autorisée
            $erreurs[] = 'Seules les images JPG, PNG, GIF et WebP sont acceptées.';
        }

        // ── VÉRIFICATION DE LA TAILLE ─────────────────────────────────────────
        $taille_max = 5 * 1024 * 1024; // Taille maximum : 5 Mo (5 × 1024 × 1024 octets)
        if ($_FILES['image']['size'] > $taille_max) { // Vérifie si le fichier dépasse la limite
            $erreurs[] = 'L\'image ne doit pas dépasser 5 Mo.';
        }

        if (empty($erreurs)) { // Si aucune erreur jusqu'ici, on peut déplacer le fichier
            // ── CRÉATION DU DOSSIER DE DESTINATION ────────────────────────────
            $dossier = 'img/uploads/'; // Dossier où seront stockées les images uploadées
            if (!is_dir($dossier)) { // Vérifie si le dossier existe
                mkdir($dossier, 0755, true); // Crée le dossier avec les bonnes permissions (0755 = lecture/exécution pour tous, écriture seulement pour le propriétaire)
            }

            // ── GÉNÉRATION D'UN NOM DE FICHIER UNIQUE ─────────────────────────
            // On génère un nom unique pour éviter d'écraser un fichier existant.
            // uniqid() génère un identifiant unique basé sur l'heure.
            $extension   = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION); // Récupère l'extension du fichier (ex: "jpg")
            $extension   = strtolower($extension); // Convertit en minuscules pour la cohérence
            $nom_fichier = uniqid('video_') . '.' . $extension; // Crée un nom unique (ex: "video_64a3f1b2c8d45.jpg")
            $chemin_dest = $dossier . $nom_fichier; // Chemin complet de destination

            // ── DÉPLACEMENT DU FICHIER ────────────────────────────────────────
            // move_uploaded_file() déplace le fichier temporaire vers sa destination finale.
            // C'est la fonction PHP recommandée pour les uploads car elle est sécurisée.
            if (move_uploaded_file($_FILES['image']['tmp_name'], $chemin_dest)) { // Si le déplacement réussit
                $image_path = $chemin_dest; // Sauvegarde le chemin pour l'insertion en BD
            } else {
                $erreurs[] = 'Erreur lors du déplacement de l\'image. Vérifiez les permissions du dossier.';
            }
        }
    }

    // ── INSERTION EN BASE DE DONNÉES ──────────────────────────────────────────
    // Si aucune erreur n'a été détectée, on insère la vidéo dans la table.
    if (empty($erreurs)) { // empty() retourne true si le tableau est vide (pas d'erreurs)
        $stmt = $db->prepare( // Prépare la requête d'insertion
            "INSERT INTO videos (titre, description, image_path, url_youtube)
             VALUES (?, ?, ?, ?)"
        );
        $stmt->execute([ // Exécute la requête avec les valeurs collectées
            $titre, // Titre de la vidéo
            $description, // Description complète
            $image_path, // Chemin de l'image uploadée
            $url_youtube !== '' ? $url_youtube : null, // URL YouTube, ou null si non renseignée
        ]);

        // Redirige vers la page de détail de la vidéo nouvellement créée
        $new_id = $db->lastInsertId(); // Récupère l'id de la ligne qui vient d'être insérée
        header('Location: detail.php?id=' . $new_id); // Redirige vers sa page de détail
        exit; // Stoppe l'exécution après la redirection
    }
}

// ── AFFICHAGE DE LA PAGE ──────────────────────────────────────────────────────
$page_title = 'Ajouter une vidéo — Sylvain Lyve'; // Titre de l'onglet
$active_nav = 'ajouter'; // Met en évidence le bon lien dans la nav

require 'header.php'; // Affiche le header commun
?>

<!-- ── FORMULAIRE D'AJOUT ─────────────────────────────────────────────────────-->
<section class="form-section"><!-- Section contenant le formulaire -->
    <div class="section-inner">

        <h1 class="section-title">Ajouter une <span>vidéo</span></h1><!-- Titre de la page -->
        <div class="section-line"></div><!-- Ligne décorative -->

        <?php if (!empty($erreurs)): ?><!-- Affiche le bloc d'erreurs seulement s'il y en a -->
        <div class="form-errors"><!-- Boîte d'erreurs rouge -->
            <ul>
                <?php foreach ($erreurs as $erreur): ?><!-- Boucle sur chaque message d'erreur -->
                <li><?php echo htmlspecialchars($erreur); ?></li><!-- Affiche le message — htmlspecialchars protège contre l'injection HTML -->
                <?php endforeach; ?>
            </ul>
        </div>
        <?php endif; ?>

        <form
            method="POST"<!-- Le formulaire envoie les données en méthode POST (données cachées dans le corps de la requête) -->
            action="ajouter.php"<!-- La page qui reçoit et traite les données (cette même page) -->
            enctype="multipart/form-data"<!-- OBLIGATOIRE pour les formulaires avec upload de fichier -->
            class="add-form"<!-- Classe CSS pour le style -->
            novalidate<!-- Désactive la validation native du navigateur pour utiliser notre propre validation PHP -->
        >

            <!-- ── CHAMP TITRE ── -->
            <div class="form-group"><!-- Groupe label + champ -->
                <label for="titre">Titre <span class="required">*</span></label><!-- Label lié au champ par for="titre" — * = champ obligatoire -->
                <input
                    type="text"<!-- Champ de texte sur une ligne -->
                    id="titre"<!-- Relie ce champ au label ci-dessus -->
                    name="titre"<!-- Nom utilisé pour récupérer la valeur en PHP : $_POST['titre'] -->
                    value="<?php echo htmlspecialchars($_POST['titre'] ?? ''); ?>"<!-- Réaffiche la valeur saisie si le formulaire est resoumis avec erreurs -->
                    required<!-- Indique que le champ est obligatoire -->
                    maxlength="150"<!-- Limite à 150 caractères (correspond à la BD) -->
                    placeholder="Ex: Objectif 500 km/h — Le projet fou de Sylvain"<!-- Texte indicatif dans le champ vide -->
                >
            </div>

            <!-- ── CHAMP DESCRIPTION ── -->
            <div class="form-group">
                <label for="description">Description <span class="required">*</span></label>
                <textarea
                    id="description"<!-- Relie ce textarea au label -->
                    name="description"<!-- Nom PHP : $_POST['description'] -->
                    required<!-- Champ obligatoire -->
                    rows="5"<!-- Hauteur du champ en nombre de lignes visibles -->
                    placeholder="Décris la vidéo en quelques phrases..."<!-- Texte indicatif -->
                ><?php echo htmlspecialchars($_POST['description'] ?? ''); ?></textarea><!-- Contenu entre les balises = valeur actuelle du champ -->
            </div>

            <!-- ── CHAMP IMAGE ── -->
            <div class="form-group">
                <label for="image">Image <span class="required">*</span></label><!-- Label de l'input fichier -->
                <input
                    type="file"<!-- Champ pour choisir un fichier sur l'ordinateur -->
                    id="image"
                    name="image"<!-- Nom PHP : $_FILES['image'] -->
                    accept="image/jpeg,image/png,image/gif,image/webp"<!-- Filtre les fichiers proposés dans l'explorateur de fichiers -->
                    required<!-- Champ obligatoire -->
                >
                <small class="form-hint">JPG, PNG, GIF ou WebP · max. 5 Mo</small><!-- Indication pour l'utilisateur -->
            </div>

            <!-- ── CHAMP URL YOUTUBE (optionnel) ── -->
            <div class="form-group">
                <label for="url_youtube">URL YouTube <span class="optional">(optionnel)</span></label><!-- Champ non obligatoire -->
                <input
                    type="url"<!-- Type "url" vérifie que la valeur ressemble à une URL -->
                    id="url_youtube"
                    name="url_youtube"<!-- Nom PHP : $_POST['url_youtube'] -->
                    value="<?php echo htmlspecialchars($_POST['url_youtube'] ?? ''); ?>"<!-- Réaffiche la valeur si erreur -->
                    placeholder="https://www.youtube.com/watch?v=..."<!-- Exemple de format -->
                >
            </div>

            <!-- ── BOUTONS ── -->
            <div class="form-actions"><!-- Groupe de boutons en bas du formulaire -->
                <button type="submit" class="btn btn-primary">Ajouter la vidéo</button><!-- Soumet le formulaire -->
                <a href="index.php" class="btn btn-outline">Annuler</a><!-- Retour à l'accueil sans sauvegarder -->
            </div>

        </form>

    </div>
</section>

<?php require 'footer.php'; // Affiche le footer commun ?>
