<?php
// Configuration de l'hébergement PHP.

// Back office : email exigé pour se connecter (fixe) et code initial
// (utilisé UNIQUEMENT tant qu'aucun code n'a encore été enregistré via
// "Changer le code" dans back-office.html — une fois changé, le nouveau
// code est stocké dans data/credentials.json et cette constante n'est
// plus utilisée). Change ADMIN_PASSWORD_DEFAULT avant le premier
// déploiement, puis change le code depuis back-office.html.

define('ADMIN_EMAIL', 'cleoforclaz2007@gmail.com');
define('ADMIN_PASSWORD_DEFAULT', 'change-moi');
