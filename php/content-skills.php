<?php
// Contenu "Maîtrise des logiciels" (catégories + niveaux) et
// "Outils & logiciels" (catégories + listes de puces).
// GET  -> public, renvoie { categories, tools }.
// POST -> protégé (back office), remplace tout le contenu.

require __DIR__ . '/_auth.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Email, X-Admin-Password');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataFile = __DIR__ . '/data/content-skills.json';

$default = ['categories' => [], 'tools' => []];

function skills_clamp_level($value) {
    $n = is_numeric($value) ? (float) $value : 0;
    return (int) max(0, min(10, round($n)));
}

function skills_slugify($text, $fallback) {
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

    $categories = [];
    foreach ((isset($payload['categories']) && is_array($payload['categories'])) ? $payload['categories'] : [] as $ci => $cat) {
        $label = trim((string) ($cat['label'] ?? ''));
        if ($label === '') continue;
        $catId = skills_slugify($cat['id'] ?? $label, 'categorie-' . $ci);
        $skills = [];
        foreach ((isset($cat['skills']) && is_array($cat['skills'])) ? $cat['skills'] : [] as $si => $skill) {
            $skillLabel = trim((string) ($skill['label'] ?? ''));
            if ($skillLabel === '') continue;
            $skills[] = [
                'id' => skills_slugify($skill['id'] ?? $skillLabel, $catId . '-' . $si),
                'label' => $skillLabel,
                'level' => skills_clamp_level($skill['level'] ?? 0)
            ];
        }
        $categories[] = ['id' => $catId, 'label' => $label, 'skills' => $skills];
    }

    $tools = [];
    foreach ((isset($payload['tools']) && is_array($payload['tools'])) ? $payload['tools'] : [] as $ti => $tool) {
        $label = trim((string) ($tool['label'] ?? ''));
        if ($label === '') continue;
        $items = [];
        foreach ((isset($tool['items']) && is_array($tool['items'])) ? $tool['items'] : [] as $item) {
            $item = trim((string) $item);
            if ($item !== '') $items[] = $item;
        }
        $tools[] = ['id' => skills_slugify($tool['id'] ?? $label, 'outils-' . $ti), 'label' => $label, 'items' => $items];
    }

    $cleaned = ['categories' => $categories, 'tools' => $tools];
    auth_write_json($dataFile, $cleaned);
    echo json_encode($cleaned);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Méthode non autorisée.']);
