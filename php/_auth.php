<?php
// Authentification partagée du back office (email fixe + code modifiable),
// utilisée par tous les endpoints d'écriture (content-*.php, upload-file.php).
//
// Email : constante ADMIN_EMAIL dans config.php.
// Code : stocké dans data/credentials.json, modifiable via auth-change-password.php.
// Tant qu'aucun changement n'a eu lieu, le repli est ADMIN_PASSWORD_DEFAULT
// dans config.php.

require_once __DIR__ . '/config.php';

define('CREDENTIALS_FILE', __DIR__ . '/data/credentials.json');

function auth_read_json($path, $fallback) {
    if (!file_exists($path)) return $fallback;
    $content = file_get_contents($path);
    $decoded = json_decode($content, true);
    return is_array($decoded) ? $decoded : $fallback;
}

function auth_write_json($path, $data) {
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

function auth_expected_password() {
    $credentials = auth_read_json(CREDENTIALS_FILE, null);
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
// JSON et termine le script — à appeler en tête de chaque endpoint protégé.
function require_admin() {
    $expectedEmail = strtolower(ADMIN_EMAIL);
    $expectedPassword = auth_expected_password();

    if (!$expectedPassword) {
        http_response_code(500);
        echo json_encode(['error' => 'Aucun code admin configuré sur le serveur.']);
        exit;
    }

    $provided = auth_provided_credentials();

    if ($provided['email'] !== $expectedEmail || $provided['password'] !== $expectedPassword) {
        http_response_code(401);
        echo json_encode(['error' => 'Email ou code incorrect.']);
        exit;
    }
}
