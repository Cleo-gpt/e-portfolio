<?php
// Contenu du footer : nom, téléphone, réseaux sociaux, mail.
// GET  -> public.
// POST -> protégé (back office), remplace le contenu.

require __DIR__ . '/_auth.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Email, X-Admin-Password');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataFile = __DIR__ . '/data/content-social.json';

$default = [
    'name' => '',
    'phone' => '',
    'phoneDisplay' => '',
    'instagramPortfolio' => '',
    'instagramLanterne' => '',
    'linkedin' => '',
    'email' => ''
];

function social_str($v) {
    return trim((string) ($v ?? ''));
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(array_merge($default, auth_read_json($dataFile, [])));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_admin();

    $rawBody = file_get_contents('php://input');
    $payload = json_decode($rawBody, true);
    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode(['error' => 'Corps de requête invalide.']);
        exit;
    }

    $cleaned = [
        'name' => social_str($payload['name'] ?? ''),
        'phone' => social_str($payload['phone'] ?? ''),
        'phoneDisplay' => social_str($payload['phoneDisplay'] ?? ''),
        'instagramPortfolio' => social_str($payload['instagramPortfolio'] ?? ''),
        'instagramLanterne' => social_str($payload['instagramLanterne'] ?? ''),
        'linkedin' => social_str($payload['linkedin'] ?? ''),
        'email' => social_str($payload['email'] ?? '')
    ];

    auth_write_json($dataFile, $cleaned);
    echo json_encode($cleaned);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Méthode non autorisée.']);
