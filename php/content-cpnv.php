<?php
// Contenu des projets CPNV-Médiamatique (cartes + détail + galerie +
// documents + vidéos).
// GET  -> public, renvoie { projects }.
// POST -> protégé (back office), remplace toute la liste de projets
// (envoyée dans l'ordre final voulu — pas de fusion avec l'existant).

require __DIR__ . '/_auth.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Email, X-Admin-Password');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataFile = __DIR__ . '/data/content-cpnv.json';

$default = ['projects' => []];

function cpnv_slugify($text, $fallback) {
    $slug = strtolower(trim($text));
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
    $slug = trim($slug, '-');
    return $slug !== '' ? $slug : $fallback;
}

function cpnv_str($v) {
    return trim((string) ($v ?? ''));
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

    $projects = [];
    foreach ((isset($payload['projects']) && is_array($payload['projects'])) ? $payload['projects'] : [] as $pi => $p) {
        $title = cpnv_str($p['title'] ?? '');
        if ($title === '') continue;

        $gallery = [];
        foreach ((isset($p['gallery']) && is_array($p['gallery'])) ? $p['gallery'] : [] as $g) {
            $image = cpnv_str($g['image'] ?? '');
            if ($image === '') continue;
            $gallery[] = ['image' => $image, 'alt' => cpnv_str($g['alt'] ?? '')];
        }

        $documents = [];
        foreach ((isset($p['documents']) && is_array($p['documents'])) ? $p['documents'] : [] as $d) {
            $file = cpnv_str($d['file'] ?? '');
            if ($file === '') continue;
            $documents[] = ['label' => cpnv_str($d['label'] ?? 'Voir le document (PDF)'), 'file' => $file];
        }

        $videos = [];
        foreach ((isset($p['videos']) && is_array($p['videos'])) ? $p['videos'] : [] as $v) {
            $url = cpnv_str($v['url'] ?? '');
            if ($url === '') continue;
            $videos[] = [
                'url' => $url,
                'thumbnail' => cpnv_str($v['thumbnail'] ?? ''),
                'alt' => cpnv_str($v['alt'] ?? ''),
                'title' => cpnv_str($v['title'] ?? ''),
                'short' => !empty($v['short'])
            ];
        }

        $project = [
            'id' => cpnv_slugify($p['id'] ?? $title, 'projet-' . $pi),
            'category' => cpnv_str($p['category'] ?? 'design'),
            'categoryLabel' => cpnv_str($p['categoryLabel'] ?? ''),
            'title' => $title,
            'cardImage' => cpnv_str($p['cardImage'] ?? ''),
            'cardImageAlt' => cpnv_str($p['cardImageAlt'] ?? $title),
            'cardDescription' => cpnv_str($p['cardDescription'] ?? ''),
            'detailText' => cpnv_str($p['detailText'] ?? ''),
            'gallery' => $gallery,
            'documents' => $documents,
            'videos' => $videos
        ];

        if (isset($p['coverDocument']) && is_array($p['coverDocument'])) {
            $coverImage = cpnv_str($p['coverDocument']['image'] ?? '');
            $coverFile = cpnv_str($p['coverDocument']['file'] ?? '');
            if ($coverImage !== '' && $coverFile !== '') {
                $project['coverDocument'] = [
                    'image' => $coverImage,
                    'imageAlt' => cpnv_str($p['coverDocument']['imageAlt'] ?? $title),
                    'file' => $coverFile
                ];
            }
        }

        $projects[] = $project;
    }

    $cleaned = ['projects' => $projects];
    auth_write_json($dataFile, $cleaned);
    echo json_encode($cleaned);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Méthode non autorisée.']);
