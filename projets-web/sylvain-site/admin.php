<!DOCTYPE html> <!-- Déclare au navigateur que ce document est un fichier HTML5 -->
<html lang="fr"> <!-- Balise racine du document, configurée en langue française -->
<head> <!-- Section contenant les métadonnées qui ne s'affichent pas directement sur la page -->
    <meta charset="UTF-8"> <!-- Définit l'encodage des caractères en UTF-8 pour gérer correctement les accents -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> <!-- Rend le site responsive (adapté aux mobiles et tablettes) -->
    <title>Résultats - Sylvain Lyve</title> <!-- Titre de la page qui s'affiche dans l'onglet du navigateur -->
    <link rel="stylesheet" href="style.css"> <!-- Relie la page HTML au fichier CSS externe pour le design -->
</head> <!-- Fin de la section des métadonnées -->
<body> <!-- Début du contenu visible de la page -->

<header class="site-header"> <!-- En-tête principal du site -->
    <div class="header-inner"> <!-- Conteneur interne pour aligner et centrer les éléments de l'en-tête -->
        <a href="index.php" class="logo-wrap"> <!-- Lien clickable qui renvoie vers la page d'accueil -->
            <img src="img/channels4_profile.jpg" alt="Sylvain Lyve" class="logo-img"> <!-- Image du logo avec une alternative textuelle -->
            <span class="logo-text">SYLVAIN LYVE</span> <!-- Texte du logo à côté de l'image -->
        </a> <!-- Fin du lien du logo -->
        <nav class="site-nav"> <!-- Barre de navigation principale -->
            <a href="index.php">Accueil</a> <!-- Lien vers l'accueil -->
            <a href="index.php#about">À propos</a> <!-- Lien ancré vers la section "À propos" de l'accueil -->
            <a href="quiz.html">Quiz</a> <!-- Lien vers la page du questionnaire -->
            <a href="admin.php" class="active">Résultats</a> <!-- Lien vers la page actuelle (admin), marquée comme active graphiquement -->
        </nav> <!-- Fin de la navigation -->
    </div> <!-- Fin du conteneur interne de l'en-tête -->
</header> <!-- Fin de l'en-tête -->

<main> <!-- Zone de contenu principal et unique de la page -->
<div class="admin-wrap"> <!-- Conteneur global de la zone d'administration -->

    <div class="admin-header"> <!-- En-tête de la zone admin (titre + bouton) -->
        <div> <!-- Bloc regroupant les textes à gauche -->
            <h1 class="section-title" style="text-align:left;">Résultats du <span>Quiz</span></h1> <!-- Titre principal aligné à gauche avec un mot mis en évidence -->
            <p style="color:#a8c8a8; font-size:0.9rem;">Toutes les participations enregistrées</p> <!-- Sous-titre stylisé en vert clair et texte plus petit -->
        </div> <!-- Fin du bloc de textes -->
        <a href="quiz.html" class="btn btn-primary">Faire le quiz</a> <!-- Bouton d'action pour aller faire le quiz -->
    </div> <!-- Fin de l'en-tête de la zone admin -->

    <div class="admin-stats" id="stats"> <!-- Grille contenant les blocs de statistiques globales -->
        <div class="admin-stat-card"> <!-- Carte Statistique 1 : Total -->
            <div class="num" id="stat-total">—</div> <!-- Zone où JavaScript injectera le nombre total de participants (par défaut "—") -->
            <div class="lbl">Participations</div> <!-- Libellé de la statistique -->
        </div> <!-- Fin carte 1 -->
        <div class="admin-stat-card"> <!-- Carte Statistique 2 : Moyenne -->
            <div class="num" id="stat-avg">—</div> <!-- Zone où JavaScript injectera la note moyenne -->
            <div class="lbl">Score moyen</div> <!-- Libellé de la statistique -->
        </div> <!-- Fin carte 2 -->
        <div class="admin-stat-card"> <!-- Carte Statistique 3 : Record -->
            <div class="num" id="stat-best">—</div> <!-- Zone où JavaScript injectera le meilleur score trouvé -->
            <div class="lbl">Meilleur score</div> <!-- Libellé de la statistique -->
        </div> <!-- Fin carte 3 -->
        <div class="admin-stat-card"> <!-- Carte Statistique 4 : Sans-faute -->
            <div class="num" id="stat-perfect">—</div> <!-- Zone où JavaScript injectera le nombre de scores parfaits -->
            <div class="lbl">Score parfait</div> <!-- Libellé de la statistique -->
        </div> <!-- Fin carte 4 -->
    </div> <!-- Fin de la grille des statistiques -->

    <div id="results-container"></div> <!-- Conteneur vide : JavaScript viendra y construire le tableau des résultats ou le message d'erreur -->

</div> <!-- Fin de admin-wrap -->
</main> <!-- Fin du contenu principal -->

<footer class="site-footer"> <!-- Pied de page du site -->
    <div class="footer-inner"> <!-- Conteneur interne pour le centrage et l'espacement du pied de page -->
        <div class="footer-social"> <!-- Zone regroupant les liens vers les réseaux sociaux -->
            <!-- Lien vers la chaîne YouTube principale (s'ouvre dans un nouvel onglet de manière sécurisée) -->
            <a href="https://www.youtube.com/@SylvainLyve" target="_blank" rel="noopener" class="social-link social-yt">
                <!-- Icône SVG officielle de YouTube -->
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>
                YouTube <!-- Texte du lien -->
            </a>
            <!-- Lien vers la chaîne YouTube Best Of -->
            <a href="https://www.youtube.com/@SylvainLyvebestof" target="_blank" rel="noopener" class="social-link social-yt">
                <!-- Icône SVG officielle de YouTube -->
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>
                YouTube Best Of <!-- Texte du lien -->
            </a>
            <!-- Lien vers le compte Instagram -->
            <a href="https://www.instagram.com/sylvain_lyve/" target="_blank" rel="noopener" class="social-link social-ig">
                <!-- Icône SVG officielle d'Instagram -->
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.2 4.8 1.7 5 5 .1 1.3.1 1.6.1 4.8 0 3.2 0 3.6-.1 4.8-.2 3.3-1.7 4.8-5 5-1.3.1-1.6.1-4.9.1-3.2 0-3.6 0-4.8-.1-3.3-.2-4.8-1.7-5-5C2.1 15.6 2 15.3 2 12c0-3.2 0-3.6.1-4.8.2-3.3 1.7-4.8 5-5C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.2 0-3.5 0-4.8.1-2.3.1-3.3 1.1-3.4 3.4C3.7 8.5 3.7 8.8 3.7 12s0 3.5.1 4.8c.1 2.3 1.1 3.3 3.4 3.4 1.3.1 1.6.1 4.8.1s3.5 0 4.8-.1c2.3-.1 3.3-1.1 3.4-3.4.1-1.3.1-1.6.1-4.8s0-3.5-.1-4.8c-.1-2.3-1.1-3.3-3.4-3.4C15.5 4 15.2 4 12 4zm0 3a5 5 0 1 1 0 10A5 5 0 0 1 12 7zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zm5.2-.2a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z"/></svg>
                Instagram <!-- Texte du lien -->
            </a>
            <!-- Lien vers la chaîne Twitch -->
            <a href="https://www.twitch.tv/sylvainlyve" target="_blank" rel="noopener" class="social-link social-tw">
                <!-- Icône SVG officielle de Twitch -->
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M11.6 6H13v4.5h-1.4V6zm3.8 0h1.4v4.5h-1.4V6zM2 1L.5 4.5V21h5V24h3l3-3h4l5.5-5.5V1H2zm19 13.5L17.5 18H13l-3 3v-3H5V2.5h16v12z"/></svg>
                Twitch <!-- Texte du lien -->
            </a>
        </div> <!-- Fin de la zone des réseaux sociaux -->
        <p class="footer-copy">&copy; 2026 Sylvain Lyve &mdash; Fan site non officiel</p> <!-- Mention légale de Copyright (générée pour l'année 2026) -->
        <p class="footer-credit">Fait avec passion &amp; JavaScript</p> <!-- Note de crédit de développement -->
    </div> <!-- Fin du conteneur interne du pied de page -->
</footer> <!-- Fin du pied de page -->

<script> <!-- Début du script JavaScript pour dynamiser la page -->
async function loadResults() { // Déclaration d'une fonction asynchrone pour charger les données du quiz
    let rows; // Variable qui stockera la liste des participations reçues sous forme de tableau
    try { // Début du bloc sécurisé pour intercepter d'éventuelles pannes réseaux ou erreurs de code
        const res = await fetch('api.php?action=results'); // Lance une requête HTTP vers "api.php" pour récupérer les scores
        if (!res.ok) throw new Error('HTTP ' + res.status); // Si le serveur répond par une erreur (ex: 404, 500), stoppe tout et va au bloc "catch"
        const text = await res.text(); // Extrait la réponse brute sous forme de texte textuel
        rows = JSON.parse(text); // Convertit ce texte brut (format JSON attendu) en objet/tableau manipulable en JavaScript
    } catch (e) { // S'exécute uniquement si une erreur s'est produite dans le bloc "try"
        document.getElementById('results-container').innerHTML = // Cible la zone de résultats pour afficher un message visuel
            '<p class="empty" style="color:#e74c3c;">Erreur API : ' + e.message + '</p>'; // Affiche le message d'erreur en rouge
        return; // Quitte définitivement la fonction pour ne pas exécuter la suite du script en mode crash
    } // Fin du bloc de sécurité try/catch

    const total   = rows.length; // Calcule le nombre d'entrées dans le tableau (nombre de participations)
    const avg     = total > 0 ? (rows.reduce((s, r) => s + r.score, 0) / total).toFixed(1) : '—'; // Calcule la moyenne des scores des joueurs, arrondie à 1 décimale (si aucun joueur, affiche "—")
    const best    = total > 0 ? Math.max(...rows.map(r => r.score)) + '/25' : '—'; // Trouve la note maximale obtenue parmi toutes les lignes et ajoute "/25" (si aucun joueur, affiche "—")
    const perfect = rows.filter(r => r.score === r.total).length; // Filtre la liste pour compter combien de personnes ont eu un score égal au total max (sans-faute)

    document.getElementById('stat-total').textContent   = total; // Injecte le nombre de participations dans la carte correspondante du HTML
    document.getElementById('stat-avg').textContent     = avg; // Injecte la note moyenne calculée dans sa carte HTML
    document.getElementById('stat-best').textContent    = best; // Injecte le meilleur score dans sa carte HTML
    document.getElementById('stat-perfect').textContent = perfect; // Injecte le nombre de scores parfaits dans sa carte HTML

    const container = document.getElementById('results-container'); // Récupère à nouveau le conteneur principal des résultats pour y mettre la table

    if (total === 0) { // Si le tableau renvoyé par l'API est totalement vide
        container.innerHTML = '<p class="empty">Aucune participation pour l\'instant. <a href="quiz.html">Sois le premier !</a></p>'; // Affiche une phrase d'invitation à jouer
        return; // Quitte la fonction immédiatement car il n'y a rien à afficher dans un tableau
    } // Fin de la condition tableau vide

    const tbody = rows.map(r => { // Boucle sur chaque participation (r) pour générer une ligne de tableau HTML (<tr>) par joueur
        const pct  = Math.round((r.score / r.total) * 100); // Calcule le pourcentage de bonnes réponses de la personne (arrondi à l'entier)
        const cls  = pct >= 70 ? 'high' : pct >= 40 ? 'mid' : 'low'; // Détermine une classe CSS selon le pourcentage (Vert si >=70%, Orange si >=40%, Rouge en dessous)
        const date = new Date(r.submitted_at).toLocaleString('fr-FR'); // Convertit la date système (souvent UTC) au format lisible heure/date française
        const dur  = formatDuration(r.duration_seconds); // Appelle la fonction utilitaire du dessous pour transformer les secondes brutes en chaîne lisible (ex: 1m 20s)
        const answers = r.answers.map((a, i) => ` // Boucle interne sur le détail des réponses (a) données par ce joueur précis
            <div class="recap-item ${a.isCorrect ? 'ok' : 'ko'}"> <!-- Boîte individuelle colorée selon si la réponse est juste (ok) ou fausse (ko) -->
                <div class="recap-q">${i + 1}. ${a.question}</div> <!-- Affiche le numéro de la question et l'intitulé de la question -->
                <div class="recap-a">Réponse : <span class="${a.isCorrect ? 'correct-tag' : 'wrong-tag'}">${a.chosen}</span> <!-- Affiche la réponse que le joueur a sélectionnée -->
                ${!a.isCorrect ? `&mdash; Bonne : <span class="correct-tag">${a.correct}</span>` : ''} <!-- Si le joueur s'est trompé, ajoute un texte affichant la bonne réponse attendue -->
                </div>
            </div>`).join(''); // Fusionne le tableau de div de réponses individuelles en une seule grande chaîne de texte HTML
        return `<tr> <!-- Retourne la structure HTML complète d'une ligne de tableau pour ce joueur -->
            <td style="color:#fff;font-weight:600;">${r.pseudo}</td> <!-- Colonne 1 : Pseudonyme du joueur écrit en blanc et gras -->
            <td><span class="score-badge ${cls}">${r.score} / ${r.total}</span></td> <!-- Colonne 2 : Note chiffrée enveloppée dans son badge de couleur (high/mid/low) -->
            <td>${pct}%</td> <!-- Colonne 3 : Le pourcentage de réussite -->
            <td>${dur}</td> <!-- Colonne 4 : Le temps total mis pour faire le quiz -->
            <td>${date}</td> <!-- Colonne 5 : Date et heure de soumission -->
            <td><details class="inline-details"><summary>Voir</summary><div class="detail-answers">${answers}</div></details></td> <!-- Colonne 6 : Menu déroulant HTML natif (<details>) masquant le bloc complet des réponses générées plus haut -->
            <td><a href="#" class="btn-delete" onclick="deleteResult(${r.id}, this)">✕</a></td> <!-- Colonne 7 : Bouton de suppression qui appelle la fonction de suppression au clic en transmettant l'identifiant unique du score -->
        </tr>`; // Fin du modèle de la ligne
    }).join(''); // Fusionne toutes les lignes de tous les utilisateurs en un seul bloc HTML global

    container.innerHTML = ` // Injecte la structure finale globale de la table HTML au sein du conteneur
        <div class="admin-table-wrap"> <!-- Sécurité pour le défilement horizontal de la table sur smartphone -->
            <table class="admin-table"> <!-- Balise de table principale -->
                <thead><tr> <!-- En-tête de la table définissant le titre des colonnes -->
                    <th>Pseudo</th><th>Score</th><th>%</th><th>Durée</th><th>Date</th><th>Détail</th><th>Action</th>
                </tr></thead>
                <tbody>${tbody}</tbody> <!-- Corps de la table où l'on insère toutes les lignes de joueurs générées par notre boucle map -->
            </table>
        </div>`; // Fin de l'injection globale
} // Fin de la fonction asynchrone loadResults

loadResults(); // Déclenche automatiquement l'exécution de la fonction ci-dessus dès que le navigateur lit cette ligne au chargement de la page

function formatDuration(sec) { // Fonction utilitaire pour convertir un nombre brut de secondes en format texte temporel
    if (!sec) return '—'; // Si le paramètre est absent, égal à zéro ou null, retourne un tiret
    const h = Math.floor(sec / 3600); // Calcule la part entière d'heures contenues dans les secondes
    const m = Math.floor((sec % 3600) / 60); // Extrait le reste des secondes puis calcule la part entière de minutes
    const s = sec % 60; // Récupère le reste final qui correspond aux secondes restantes
    if (h > 0) return `${h}h ${m}m ${s}s`; // Si le temps dépasse une heure, renvoie un format complet : Xh Xm Xs
    if (m > 0) return `${m}m ${s}s`; // Si le temps est inférieur à une heure mais fait plus d'une minute, renvoie : Xm Xs
    return `${s}s`; // Si ça fait moins d'une minute, renvoie uniquement : Xs
} // Fin de la fonction de formatage

async function deleteResult(id, el) { // Fonction asynchrone appelée lors du clic sur la croix pour supprimer un résultat
    if (!confirm('Supprimer cette participation ?')) return; // Affiche une boîte de dialogue de confirmation du navigateur. Si l'utilisateur clique sur "Annuler", stoppe la fonction.
    await fetch('api.php?action=delete&id=' + id, { method: 'DELETE' }); // Envoie une requête réseau en mode "DELETE" à l'API pour supprimer définitivement la ligne en BDD via son ID
    el.closest('tr').remove(); // Cible l'élément HTML parent le plus proche qui correspond à une ligne de tableau (<tr>) et la supprime de l'écran en temps réel
} // Fin de la fonction de suppression
</script> <!-- Fin de la zone d'écriture du script JavaScript -->

</body> <!-- Fin de la zone du corps du document HTML -->
</html> <!-- Fin ultime du fichier HTML -->