<?php
// Contenu "Formation", "Expérience professionnelle" et "Langues".
// GET  -> public, renvoie { formation, experience, languages }.
// POST -> protégé (back office), remplace tout le contenu (listes envoyées
// dans l'ordre final voulu — pas de fusion avec l'existant).

require __DIR__ . '/_auth.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Email, X-Admin-Password');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataFile = __DIR__ . '/data/content-timeline.json';

$default = ['formation' => [], 'experience' => [], 'languages' => []];

function timeline_slugify($text, $fallback) {
    $slug = strtolower(trim($text));
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
    $slug = trim($slug, '-');
    return $slug !== '' ? $slug : $fallback;
}

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

    $formation = [];
    foreach ((isset($payload['formation']) && is_array($payload['formation'])) ? $payload['formation'] : [] as $i => $item) {
        $title = trim((string) ($item['title'] ?? ''));
        if ($title === '') continue;
        $formation[] = [
            'id' => timeline_slugify($item['id'] ?? $title, 'formation-' . $i),
            'title' => $title,
            'place' => trim((string) ($item['place'] ?? ''))
        ];
    }

    $experience = [];
    foreach ((isset($payload['experience']) && is_array($payload['experience'])) ? $payload['experience'] : [] as $i => $item) {
        $title = trim((string) ($item['title'] ?? ''));
        if ($title === '') continue;
        $experience[] = [
            'id' => timeline_slugify($item['id'] ?? $title, 'experience-' . $i),
            'title' => $title,
            'date' => trim((string) ($item['date'] ?? '')),
            'place' => trim((string) ($item['place'] ?? '')),
            'description' => trim((string) ($item['description'] ?? '')),
            'extra' => !empty($item['extra'])
        ];
    }

    $languages = [];
    foreach ((isset($payload['languages']) && is_array($payload['languages'])) ? $payload['languages'] : [] as $item) {
        $name = trim((string) ($item['name'] ?? ''));
        if ($name === '') continue;
        $languages[] = [
            'name' => $name,
            'level' => trim((string) ($item['level'] ?? ''))
        ];
    }

    $cleaned = ['formation' => $formation, 'experience' => $experience, 'languages' => $languages];
    auth_write_json($dataFile, $cleaned);
    echo json_encode($cleaned);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Méthode non autorisée.']);
