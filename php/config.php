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

// URL du feed JSON Behold.so pour instagram-posts.php (voir
// netlify/functions/README.md pour la procédure de création du compte).
// Behold gère la connexion et le renouvellement du token Instagram à
// notre place — aucune maintenance de token nécessaire ici.

define('BEHOLD_FEED_URL', '');
