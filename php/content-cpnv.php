<?php
// Contenu des projets CPNV-Médiamatique (cartes + détail + galerie +
// documents + vidéos + lien vers le site pour les projets web).
// GET  -> public, renvoie { projects }.
// POST -> protégé (back office), remplace toute la liste de projets
// (envoyée dans l'ordre final voulu — pas de fusion avec l'existant).

require __DIR__ . '/_auth.php';

start_json_endpoint(['GET', 'POST']);

$dataFile = __DIR__ . '/data/content-cpnv.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(read_json_file($dataFile, ['projects' => []]));
    exit;
}

require_admin();
$payload = read_request_json();

$projects = [];
foreach (list_field($payload, 'projects') as $pi => $p) {
    $title = str_field($p['title'] ?? '');
    if ($title === '') continue;

    $gallery = [];
    foreach (list_field($p, 'gallery') as $g) {
        $image = str_field($g['image'] ?? '');
        if ($image === '') continue;
        $gallery[] = ['image' => $image, 'alt' => str_field($g['alt'] ?? '')];
    }

    $documents = [];
    foreach (list_field($p, 'documents') as $d) {
        $file = str_field($d['file'] ?? '');
        if ($file === '') continue;
        $documents[] = ['label' => str_field($d['label'] ?? 'Voir le document (PDF)'), 'file' => $file];
    }

    $videos = [];
    foreach (list_field($p, 'videos') as $v) {
        $url = str_field($v['url'] ?? '');
        if ($url === '') continue;
        $videos[] = [
            'url' => $url,
            'thumbnail' => str_field($v['thumbnail'] ?? ''),
            'alt' => str_field($v['alt'] ?? ''),
            'title' => str_field($v['title'] ?? ''),
            'short' => !empty($v['short'])
        ];
    }

    $project = [
        'id' => slugify($p['id'] ?? $title, 'projet-' . $pi),
        'category' => str_field($p['category'] ?? 'design'),
        'categoryLabel' => str_field($p['categoryLabel'] ?? ''),
        'title' => $title,
        'cardImage' => str_field($p['cardImage'] ?? ''),
        'cardImageAlt' => str_field($p['cardImageAlt'] ?? $title),
        'cardDescription' => str_field($p['cardDescription'] ?? ''),
        'detailText' => str_field($p['detailText'] ?? ''),
        'gallery' => $gallery,
        'documents' => $documents,
        'videos' => $videos
    ];

    $siteUrl = str_field($p['siteUrl'] ?? '');
    if ($siteUrl !== '') $project['siteUrl'] = $siteUrl;

    $cover = $p['coverDocument'] ?? null;
    if (is_array($cover) && str_field($cover['image'] ?? '') !== '' && str_field($cover['file'] ?? '') !== '') {
        $project['coverDocument'] = [
            'image' => str_field($cover['image']),
            'imageAlt' => str_field($cover['imageAlt'] ?? $title),
            'file' => str_field($cover['file'])
        ];
    }

    $projects[] = $project;
}

$cleaned = ['projects' => $projects];
write_json_file($dataFile, $cleaned);
echo json_encode($cleaned);
