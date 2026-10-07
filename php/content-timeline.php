<?php
// Contenu "Formation", "Expérience professionnelle" et "Langues".
// GET  -> public, renvoie { formation, experience, languages }.
// POST -> protégé (back office), remplace tout le contenu (listes envoyées
// dans l'ordre final voulu — pas de fusion avec l'existant).

require __DIR__ . '/_auth.php';

start_json_endpoint(['GET', 'POST']);

$dataFile = __DIR__ . '/data/content-timeline.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(read_json_file($dataFile, ['formation' => [], 'experience' => [], 'languages' => []]));
    exit;
}

require_admin();
$payload = read_request_json();

$formation = [];
foreach (list_field($payload, 'formation') as $i => $item) {
    $title = str_field($item['title'] ?? '');
    if ($title === '') continue;
    $formation[] = [
        'id' => slugify($item['id'] ?? $title, 'formation-' . $i),
        'title' => $title,
        'place' => str_field($item['place'] ?? '')
    ];
}

$experience = [];
foreach (list_field($payload, 'experience') as $i => $item) {
    $title = str_field($item['title'] ?? '');
    if ($title === '') continue;
    $experience[] = [
        'id' => slugify($item['id'] ?? $title, 'experience-' . $i),
        'title' => $title,
        'date' => str_field($item['date'] ?? ''),
        'place' => str_field($item['place'] ?? ''),
        'description' => str_field($item['description'] ?? ''),
        'extra' => !empty($item['extra'])
    ];
}

$languages = [];
foreach (list_field($payload, 'languages') as $item) {
    $name = str_field($item['name'] ?? '');
    if ($name === '') continue;
    $languages[] = ['name' => $name, 'level' => str_field($item['level'] ?? '')];
}

$cleaned = ['formation' => $formation, 'experience' => $experience, 'languages' => $languages];
write_json_file($dataFile, $cleaned);
echo json_encode($cleaned);
