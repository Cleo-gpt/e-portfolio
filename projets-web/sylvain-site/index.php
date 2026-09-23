<?php // Début du bloc de script PHP exécuté côté serveur
$page_title = 'Sylvain Lyve - Fan Site'; // Déclare la variable du titre de la page, qui sera lue par 'header.php'
$active_nav = 'accueil'; // Définit la page courante sur 'accueil' pour que le menu puisse lui appliquer le style actif

require 'header.php'; // Inclut et exécute le fichier 'header.php' (contient la structure HTML de base, le head et le menu)
?> <!-- Fin du bloc de script PHP pour repasser en affichage de contenu HTML -->

<section class="hero-section"> <!-- Section d'introduction visuelle principale (bannière haute) -->
    <div class="hero-content"> <!-- Conteneur flexible centralisant le texte et l'image d'en-tête -->
        <div class="hero-text"> <!-- Bloc regroupant les éléments textuels de la zone d'introduction -->
            <h1>SYLVAIN<br><span>LYVE</span></h1> <!-- Titre majeur de la page avec un retour à la ligne et un style spécifique sur le nom -->
            <p class="tagline">Youtubeur automobile, passionné de mécanique.<br> <!-- Texte secondaire décrivant l'activité principale -->
                L'homme qui veut faire rouler une <strong>Citroën à 500 km/h</strong>.</p> <!-- Phrase d'accroche mettant en gras le projet emblématique -->
            <div class="hero-cta"> <!-- Zone regroupant les boutons d'appel à l'action pour guider l'utilisateur -->
                <a href="quiz.html" class="btn btn-primary">Faire le quiz</a> <!-- Bouton principal stylisé pour inciter à lancer l'application du quiz -->
                <a href="#about" class="btn btn-outline">En savoir plus</a> <!-- Bouton secondaire transparent pointant vers l'ancre de la biographie -->
            </div> <!-- Fin de la zone des boutons -->
        </div> <!-- Fin du bloc textuel -->
        <div class="hero-img-wrap"> <!-- Conteneur gérant l'image principale et ses éléments superposés -->
            <img src="img/objectif-500km_h-sylvain-lyve-1024x576.jpg" alt="Sylvain Lyve Objectif 500 km/h"> <!-- Image d'illustration du défi de vitesse -->
            <span class="hero-badge">Objectif 500 km/h</span> <!-- Badge textuel d'avertissement posé en transparence sur l'image -->
        </div> <!-- Fin du conteneur d'image -->
    </div> <!-- Fin du conteneur flexible de la section Hero -->
</section> <!-- Fin de la section d'introduction -->

<section class="about-section" id="about"> <!-- Section biographique identifiée par "about" pour le défilement des ancres -->
    <div class="section-inner"> <!-- Sous-conteneur limitant la largeur maximale pour garantir une bonne lisibilité -->
        <h2 class="section-title">Qui est <span>Sylvain Lyve</span>&nbsp;?</h2> <!-- Titre de section incluant une espace insécable avant le point d'interrogation -->
        <div class="section-line"></div> <!-- Élément graphique créant une ligne de séparation décorative sous le titre -->
        <div class="about-grid"> <!-- Grille de mise en page séparant la biographie en deux colonnes distinctes -->
            <div class="about-imgs"> <!-- Colonne de gauche dédiée à la composition de la galerie de photos -->
                <div class="img-frame img-frame-wide"> <!-- Encadrement photo configuré pour prendre un format étendu -->
                    <img src="img/c-est-atrocement-long-un-an-apres-l-annonce-sylvain-levy-donne-des-nouvelles-de-son-gros-projet-500.jpg" alt="Sylvain Levy identité"> <!-- Photo de couverture du projet automobile -->
                </div> <!-- Fin du cadre large -->
                <div class="img-frame"> <!-- Encadrement photo standard de taille classique -->
                    <img src="img/5d15782baa5d7a813c82a102467a9ce7.jpg" alt="Sylvain en podcast"> <!-- Photo illustrant les interventions de Sylvain -->
                </div> <!-- Fin du cadre standard 1 -->
                <div class="img-frame"> <!-- Deuxième encadrement photo standard -->
                    <img src="img/channels4_profile.jpg" alt="Sylvain Lyve profil YouTube"> <!-- Photo correspondante à l'icône de sa chaîne YouTube -->
                </div> <!-- Fin du cadre standard 2 -->
            </div> <!-- Fin de la colonne d'images -->
            <div class="about-text"> <!-- Colonne de droite regroupant l'ensemble de la biographie textuelle -->
                <h3>Le gars derrière le volant</h3> <!-- Sous-titre de la présentation textuelle -->
                <p>Sylvain Lyve (de son vrai nom Sylvain Levy) est un créateur de contenu français spécialisé <!-- Premier paragraphe présentant les origines de sa notoriété automobile -->
                dans l'automobile. Né le <strong>16 juin</strong>, il mesure 1m70.</p> <!-- Données personnelles clés mises en valeur en caractères gras -->
                <p>Il est connu pour ses formats décalés, ses tests de voitures improbables et son projet fou : <!-- Deuxième paragraphe détaillant son approche de contenu -->
                atteindre les <strong>500 km/h</strong> avec une Citroën modifiée.</p> <!-- Rappel de l'objectif mécanique phare en gras -->
                <div class="stats-row"> <!-- Ligne horizontale agencée pour afficher des blocs de chiffres de statistiques -->
                    <div class="stat"> <!-- Bloc statistique 1 -->
                        <div class="stat-number">500</div> <!-- Chiffre clé de la vitesse maximale visée -->
                        <div class="stat-label">km/h objectif</div> <!-- Libellé descriptif pour la vitesse -->
                    </div> <!-- Fin bloc 1 -->
                    <div class="stat"> <!-- Bloc statistique 2 -->
                        <div class="stat-number">1m70</div> <!-- Chiffre clé décrivant la taille de la personne -->
                        <div class="stat-label">sous le capot</div> <!-- Libellé humoristique calqué sur le lexique mécanique -->
                    </div> <!-- Fin bloc 2 -->
                    <div class="stat"> <!-- Bloc statistique 3 -->
                        <div class="stat-number">16 juin</div> <!-- Chiffre clé indiquant la date d'anniversaire -->
                        <div class="stat-label">anniversaire</div> <!-- Libellé descriptif du jour de naissance -->
                    </div> <!-- Fin bloc 3 -->
                </div> <!-- Fin de la rangée de statistiques -->
            </div> <!-- Fin de la colonne textuelle biographique -->
        </div> <!-- Fin de l'agencement en grille -->
    </div> <!-- Fin du conteneur interne de section -->
</section> <!-- Fin de la section de présentation générale -->


<?php require 'footer.php'; ?> <!-- Ouvre un bloc PHP pour inclure le fichier 'footer.php' (ferme le main, intègre le pied de page et les scripts), puis clôt le script -->