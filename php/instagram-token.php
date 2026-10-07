<?php
// Connexion Instagram depuis le back office (onglet Instagram).
// Protégé par le login du back office (email + code).
//
// GET  -> état de la connexion (compte, dernier renouvellement, expiration).
//         Le token lui-même n'est jamais renvoyé.
// POST -> { access_token } : vérifie le token auprès d'Instagram puis
//         l'enregistre dans data/instagram-token.json.

require __DIR__ . '/_auth.php';
require __DIR__ . '/_instagram.php';

start_json_endpoint(['GET', 'POST']);
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $tokenData = read_json_file(IG_TOKEN_FILE, null);
    if (!$tokenData || empty($tokenData['access_token'])) {
        echo json_encode(['configured' => false]);
        exit;
    }
    echo json_encode([
        'configured' => true,
        'username' => $tokenData['username'] ?? '',
        'updatedAt' => $tokenData['updated_at'] ?? null,
        'expiresAt' => $tokenData['expires_at'] ?? null
    ]);
    exit;
}

$payload = read_request_json();
$accessToken = str_field($payload['access_token'] ?? '');
if ($accessToken === '') json_error(400, 'Colle le token Instagram (il commence par IGAA).');

$check = ig_check_token($accessToken);
if ($check['status'] !== 200 || empty($check['data']['username'])) {
    json_error(400, 'Token refusé par Instagram : ' . ig_error_message($check));
}

// Un token généré depuis le tableau de bord Meta est valable 60 jours.
ig_save_token($accessToken, $check['data']['username'], 60 * 24 * 3600);

echo json_encode(['ok' => true, 'username' => $check['data']['username']]);
