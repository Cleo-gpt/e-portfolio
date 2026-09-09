<?php
// Contenu de la section "À propos de moi".
// GET  -> public, renvoie { photo, paragraphs }.
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

$dataFile = __DIR__ . '/data/content-presentation.json';

$default = [
    'photo' => 'Images/Photo Cléo.jpeg',
    'paragraphs' => []
];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(auth_read_json($dataFile, $default));
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

    $photo = isset($payload['photo']) ? trim((string) $payload['photo']) : '';
    $paragraphs = isset($payload['paragraphs']) && is_array($payload['paragraphs'])
        ? array_values(array_filter(array_map('trim', $payload['paragraphs']), function ($p) { return $p !== ''; }))
        : [];

    if ($photo === '' || count($paragraphs) === 0) {
        http_response_code(400);
        echo json_encode(['error' => 'La photo et au moins un paragraphe sont requis.']);
        exit;
    }

    $cleaned = ['photo' => $photo, 'paragraphs' => $paragraphs];
    auth_write_json($dataFile, $cleaned);
    echo json_encode($cleaned);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Méthode non autorisée.']);
