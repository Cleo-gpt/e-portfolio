<?php // Début du bloc de script serveur PHP
$page_title = $page_title ?? 'Sylvain Lyve - Fan Site'; // Si la variable $page_title n'existe pas encore, lui attribue un titre de secours par défaut
$active_nav = $active_nav ?? ''; // Si la variable $active_nav n'est pas définie, l'initialise à vide pour éviter une erreur notice
?> <!-- Fin du bloc de script PHP -->
<!DOCTYPE html> <!-- Spécifie au navigateur que le document utilise la norme HTML5 -->
<html lang="fr"> <!-- Balise racine ouvrant le document HTML, configurée pour la langue française -->
<head> <!-- Section d'en-tête technique contenant les métadonnées de la page (non visibles directement à l'écran) -->
    <meta charset="UTF-8"> <!-- Définit le codage des caractères en UTF-8 pour afficher correctement les accents et symboles -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> <!-- Assure l'adaptation automatique de la mise en page sur les mobiles et tablettes -->
    <title><?php echo htmlspecialchars($page_title); ?></title> <!-- Génère dynamiquement le titre de l'onglet en sécurisant le texte contre les failles XSS -->
    <link rel="stylesheet" href="style.css"> <!-- Lie la feuille de style CSS externe pour appliquer le design visuel de la page -->
</head> <!-- Fin de la section d'en-tête technique -->
<body> <!-- Début du corps du document contenant tous les éléments qui seront visibles par l'utilisateur -->

<header class="site-header"> <!-- Balise structurelle définissant la zone d'en-tête principale du site web -->
    <div class="header-inner"> <!-- Conteneur interne permettant de centrer, borner et espacer les éléments de l'en-tête -->
        <a href="index.php" class="logo-wrap"> <!-- Lien cliquable qui englobe le logo et redirige vers la page d'accueil -->
            <img src="img/channels4_profile.jpg" alt="Sylvain Lyve" class="logo-img"> <!-- Affiche la photo de profil utilisée comme logo avec un texte de remplacement -->
            <span class="logo-text">SYLVAIN LYVE</span> <!-- Affiche le nom textuel du logo à côté de l'image -->
        </a> <!-- Fin du lien du logo -->
        <nav class="site-nav"> <!-- Zone contenant les liens de navigation principaux du site -->
            <!-- Génère le lien Accueil et ajoute la classe "active" uniquement si la variable PHP $active_nav vaut 'accueil' -->
            <a href="index.php" <?php echo $active_nav === 'accueil' ? 'class="active"' : ''; ?>>Accueil</a>
            <!-- Génère le lien À propos menant à l'ancre dédiée et ajoute la classe "active" si $active_nav vaut 'about' -->
            <a href="index.php#about" <?php echo $active_nav === 'about' ? 'class="active"' : ''; ?>>À propos</a>
            <!-- Génère le lien menant au Quiz et lui injecte la classe "active" si la variable PHP correspond à 'quiz' -->
            <a href="quiz.html" <?php echo $active_nav === 'quiz' ? 'class="active"' : ''; ?>>Quiz</a>
            <!-- Génère le lien vers l'espace d'administration Résultats et applique la classe "active" si $active_nav vaut 'admin' -->
            <a href="admin.php" <?php echo $active_nav === 'admin' ? 'class="active"' : ''; ?>>Résultats</a>
        </nav> <!-- Fin de la barre de navigation -->
    </div> <!-- Fin du conteneur interne de l'en-tête -->
</header> <!-- Fin de la zone d'en-tête principale -->

<main> <!-- Ouverture du conteneur destiné à accueillir le contenu unique et central de cette page -->