<?php
// Modèle pour php/secrets.php (à créer toi-même, jamais versionné).
//
// 1. Copie ce fichier en php/secrets.php sur ton serveur (ou en local).
// 2. Génère une valeur aléatoire longue pour INSTAGRAM_TOKEN_UPDATE_SECRET,
//    par exemple avec la commande : openssl rand -hex 32
// 3. Mets EXACTEMENT la même valeur dans le secret GitHub
//    INSTAGRAM_TOKEN_UPDATE_SECRET (Settings → Secrets and variables →
//    Actions, sur le dépôt GitHub du projet).
//
// php/secrets.php ne doit JAMAIS être commité ni partagé — il est déjà
// exclu par .gitignore.

define('INSTAGRAM_TOKEN_UPDATE_SECRET', 'remplace-moi-par-une-valeur-aleatoire-longue');
