<?php
// Configuration du login admin pour l'hébergement PHP.
//
// ADMIN_EMAIL : adresse mail exigée pour se connecter (fixe).
// ADMIN_PASSWORD_DEFAULT : code utilisé UNIQUEMENT tant qu'aucun code n'a
// encore été enregistré via "Changer le code" dans admin.html. Une fois
// changé, le nouveau code est stocké dans data/credentials.json et cette
// constante n'est plus utilisée.
//
// Change ADMIN_PASSWORD_DEFAULT ci-dessous avant le premier déploiement,
// puis change le code depuis admin.html dès la première connexion.

define('ADMIN_EMAIL', 'cleoforclaz2007@gmail.com');
define('ADMIN_PASSWORD_DEFAULT', 'change-moi');

// Identifiants Instagram Graph API pour instagram-posts.php (voir
// netlify/functions/README.md pour la procédure d'obtention).
// Ne mets jamais ces valeurs dans un fichier versionné publiquement.

define('IG_USER_ID', '');
define('IG_ACCESS_TOKEN', '');
