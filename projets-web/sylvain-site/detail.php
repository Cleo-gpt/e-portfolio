<?php
// ── PAGE DE DÉTAIL D'UNE VIDÉO ────────────────────────────────────────────────
// Cette page affiche TOUTES les informations d'une vidéo sélectionnée.
// Elle reçoit l'identifiant de la vidéo via l'URL : detail.php?id=3
// Elle permet aussi de supprimer la vidéo via un bouton avec confirmation.

require 'config.php'; // Inclut la connexion à la base de données

// ── RÉCUPÉRATION DE L'ID ──────────────────────────────────────────────────────
// On lit l'id passé dans l'URL (?id=...) et on le convertit en entier.
// Si l'id est absent ou invalide (0), on redirige vers l'accueil.

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0; // (int) convertit en entier — si non numérique, donne 0

if ($id <= 0) { // Si l'id est 0 ou négatif, c'est invalide
    header('Location: index.php'); // Redirige vers la page d'accueil
    exit; // Arrête l'exécution du reste de la page
}

// ── SUPPRESSION ───────────────────────────────────────────────────────────────
// Si le formulaire de suppression a été soumis (méthode POST avec action=supprimer),
// on supprime la vidéo de la base de données, puis on redirige vers l'accueil.

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'supprimer') {
    // Récupère le chemin de l'image pour supprimer le fichier du serveur
    $stmt = $db->prepare("SELECT image_path FROM videos WHERE id = ?"); // Prépare la requête pour éviter les injections SQL
    $stmt->execute([$id]); // Exécute avec l'id de la vidéo
    $row = $stmt->fetch(); // Récupère la ligne correspondante

    if ($row) { // Si la vidéo existe bien
        $image_file = $row['image_path']; // Récupère le chemin de l'image (ex: img/ma-photo.jpg)
        // Supprime le fichier image du serveur s'il existe et n'est pas une des images par défaut
        if ($image_file && file_exists($image_file) && strpos($image_file, 'img/') === 0) {
            unlink($image_file); // Supprime le fichier physiquement du disque
        }
        // Supprime la ligne dans la base de données
        $db->prepare("DELETE FROM videos WHERE id = ?")->execute([$id]); // Suppression de la vidéo en BD
    }

    header('Location: index.php'); // Redirige vers la page d'accueil après suppression
    exit; // Stoppe l'exécution
}

// ── RÉCUPÉRATION DE LA VIDÉO ──────────────────────────────────────────────────
// On sélectionne TOUTES les colonnes de la vidéo correspondant à l'id.
// Si aucune ligne n'est trouvée (id inexistant), on redirige vers l'accueil.

$stmt = $db->prepare( // Prépare la requête avec un paramètre ? pour éviter les injections SQL
    "SELECT id, titre, description, image_path, url_youtube, date_ajout
     FROM videos
     WHERE id = ?"
);
$stmt->execute([$id]); // Exécute la requête en remplaçant ? par la valeur de $id
$video = $stmt->fetch(); // Récupère la ligne sous forme de tableau associatif

if (!$video) { // Si fetch() retourne false, la vidéo n'existe pas
    header('Location: index.php'); // Redirige vers l'accueil
    exit;
}

// ── TITRE DE LA PAGE ──────────────────────────────────────────────────────────
$page_title = htmlspecialchars($video['titre']) . ' — Sylvain Lyve'; // Titre dynamique avec le nom de la vidéo
$active_nav = 'accueil'; // Met en évidence le lien "Accueil" dans la nav

require 'header.php'; // Affiche le header commun
?>

<!-- ── DÉTAIL DE LA VIDÉO ─────────────────────────────────────────────────────-->
<section class="detail-section"><!-- Section principale de la page de détail -->
    <div class="section-inner">

        <a href="index.php" class="btn btn-outline btn-sm back-link">&larr; Retour à l'accueil</a><!-- Flèche retour — &larr; = ← -->

        <div class="detail-card"><!-- Carte qui contient toutes les informations de la vidéo -->

            <!-- ── IMAGE ── -->
            <div class="detail-img-wrap"><!-- Conteneur de l'image -->
                <img
                    src="<?php echo htmlspecialchars($video['image_path']); ?>"<!-- Affiche l'image de la vidéo -->
                    alt="<?php echo htmlspecialchars($video['titre']); ?>"<!-- Texte alternatif pour l'accessibilité -->
                    class="detail-img"<!-- Classe CSS pour styliser l'image -->
                >
            </div>

            <!-- ── INFORMATIONS ── -->
            <div class="detail-body"><!-- Partie texte avec toutes les informations -->

                <h1 class="detail-title"><?php echo htmlspecialchars($video['titre']); ?></h1><!-- Titre complet de la vidéo -->

                <p class="detail-date">
                    Ajoutée le <?php echo date('d/m/Y à H:i', strtotime($video['date_ajout'])); ?><!-- Date formatée : jj/mm/aaaa à hh:mm -->
                </p>

                <div class="detail-description"><!-- Bloc de la description complète -->
                    <h2>Description</h2><!-- Sous-titre de la section description -->
                    <p><?php echo nl2br(htmlspecialchars($video['description'])); ?></p><!-- Affiche la description — nl2br() convertit les retours à la ligne en <br> HTML -->
                </div>

                <?php if ($video['url_youtube']): ?><!-- Affiche le lien YouTube seulement si une URL est enregistrée -->
                <div class="detail-youtube"><!-- Bloc du lien YouTube -->
                    <h2>Lien YouTube</h2>
                    <a href="<?php echo htmlspecialchars($video['url_youtube']); ?>" target="_blank" rel="noopener" class="btn btn-primary">
                        Voir sur YouTube &rarr;<!-- &rarr; = → -->
                    </a>
                </div>
                <?php endif; ?>

                <!-- ── TABLEAU RÉCAPITULATIF (toutes les colonnes) ── -->
                <div class="detail-table-wrap"><!-- Conteneur du tableau -->
                    <h2>Informations complètes</h2><!-- Titre du tableau récapitulatif -->
                    <table class="detail-table"><!-- Tableau HTML des données brutes -->
                        <tbody>
                            <tr><!-- Ligne du tableau -->
                                <th>ID</th><!-- En-tête de colonne -->
                                <td><?php echo (int)$video['id']; ?></td><!-- Valeur de la colonne id -->
                            </tr>
                            <tr>
                                <th>Titre</th>
                                <td><?php echo htmlspecialchars($video['titre']); ?></td>
                            </tr>
                            <tr>
                                <th>Description</th>
                                <td><?php echo nl2br(htmlspecialchars($video['description'])); ?></td>
                            </tr>
                            <tr>
                                <th>Image</th>
                                <td><?php echo htmlspecialchars($video['image_path']); ?></td><!-- Affiche le chemin du fichier image -->
                            </tr>
                            <tr>
                                <th>URL YouTube</th>
                                <td>
                                    <?php if ($video['url_youtube']): ?><!-- Si une URL YouTube existe -->
                                        <a href="<?php echo htmlspecialchars($video['url_youtube']); ?>" target="_blank" rel="noopener">
                                            <?php echo htmlspecialchars($video['url_youtube']); ?><!-- Affiche l'URL cliquable -->
                                        </a>
                                    <?php else: ?><!-- Si pas d'URL -->
                                        <em>Non renseignée</em><!-- Texte en italique pour indiquer l'absence de valeur -->
                                    <?php endif; ?>
                                </td>
                            </tr>
                            <tr>
                                <th>Date d'ajout</th>
                                <td><?php echo date('d/m/Y à H:i:s', strtotime($video['date_ajout'])); ?></td><!-- Date complète avec secondes -->
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- ── BOUTON SUPPRIMER ── -->
                <div class="detail-delete"><!-- Bloc du bouton de suppression -->
                    <form method="POST" action="detail.php?id=<?php echo (int)$video['id']; ?>" onsubmit="return confirm('Supprimer cette vidéo définitivement ?')"><!-- Formulaire POST — onsubmit demande une confirmation avant de soumettre -->
                        <input type="hidden" name="action" value="supprimer"><!-- Champ caché qui indique l'action au PHP -->
                        <button type="submit" class="btn btn-delete">Supprimer cette vidéo</button><!-- Bouton de soumission du formulaire -->
                    </form>
                </div>

            </div><!-- Fin du bloc d'informations -->
        </div><!-- Fin de la carte de détail -->
    </div>
</section>

<?php require 'footer.php'; // Affiche le footer commun ?>
