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

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Email, X-Admin-Password');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $tokenData = ig_read_json(IG_TOKEN_FILE, null);
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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $payload = json_decode(file_get_contents('php://input'), true);
    $accessToken = is_array($payload) ? trim((string) ($payload['access_token'] ?? '')) : '';

    if ($accessToken === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Colle le token Instagram (il commence par IGAA).']);
        exit;
    }

    $check = ig_check_token($accessToken);
    if ($check['status'] !== 200 || empty($check['data']['username'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Token refusé par Instagram : ' . ig_error_message($check)]);
        exit;
    }

    // Un token généré depuis le tableau de bord Meta est valable 60 jours.
    ig_save_token($accessToken, $check['data']['username'], 60 * 24 * 3600);

    echo json_encode(['ok' => true, 'username' => $check['data']['username']]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Méthode non autorisée.']);
