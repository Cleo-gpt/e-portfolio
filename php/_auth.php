<?php
// Authentification partagée du back office (email fixe + code modifiable),
// utilisée par tous les scripts qui écrivent (content-*.php, upload-file.php,
// auth-change-password.php).
//
// Email : constante ADMIN_EMAIL dans config.php.
// Code : stocké dans data/credentials.json, modifiable via auth-change-password.php.
// Tant qu'aucun changement n'a eu lieu, le repli est ADMIN_PASSWORD_DEFAULT
// dans config.php.

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/_commun.php';

define('CREDENTIALS_FILE', __DIR__ . '/data/credentials.json');

function auth_expected_password() {
    $credentials = read_json_file(CREDENTIALS_FILE, null);
    if ($credentials && isset($credentials['password'])) {
        return $credentials['password'];
    }
    return defined('ADMIN_PASSWORD_DEFAULT') ? ADMIN_PASSWORD_DEFAULT : null;
}

function auth_provided_credentials() {
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $email = '';
    $password = '';
    foreach ($headers as $key => $value) {
        $lower = strtolower($key);
        if ($lower === 'x-admin-email') $email = trim($value);
        if ($lower === 'x-admin-password') $password = $value;
    }
    return ['email' => strtolower($email), 'password' => $password];
}

// Vérifie les identifiants fournis. En cas d'échec, envoie une réponse 401
// JSON et termine le script — à appeler en tête de chaque script protégé.
function require_admin() {
    $expectedPassword = auth_expected_password();
    if (!$expectedPassword) json_error(500, 'Aucun code admin configuré sur le serveur.');

    $provided = auth_provided_credentials();
    $emailOk = hash_equals(strtolower(ADMIN_EMAIL), $provided['email']);
    $passwordOk = hash_equals((string) $expectedPassword, $provided['password']);
    if (!$emailOk || !$passwordOk) json_error(401, 'Email ou code incorrect.');
}
