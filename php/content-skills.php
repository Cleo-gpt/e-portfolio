<?php
// Contenu "Maîtrise des logiciels" (catégories + niveaux) et
// "Outils & logiciels" (catégories + listes de puces).
// GET  -> public, renvoie { categories, tools }.
// POST -> protégé (back office), remplace tout le contenu.

require __DIR__ . '/_auth.php';

start_json_endpoint(['GET', 'POST']);

$dataFile = __DIR__ . '/data/content-skills.json';

// Niveau entier entre 0 et 10.
function skills_clamp_level($value) {
    $n = is_numeric($value) ? (float) $value : 0;
    return (int) max(0, min(10, round($n)));
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(read_json_file($dataFile, ['categories' => [], 'tools' => []]));
    exit;
}

require_admin();
$payload = read_request_json();

$categories = [];
foreach (list_field($payload, 'categories') as $ci => $cat) {
    $label = str_field($cat['label'] ?? '');
    if ($label === '') continue;
    $catId = slugify($cat['id'] ?? $label, 'categorie-' . $ci);
    $skills = [];
    foreach (list_field($cat, 'skills') as $si => $skill) {
        $skillLabel = str_field($skill['label'] ?? '');
        if ($skillLabel === '') continue;
        $skills[] = [
            'id' => slugify($skill['id'] ?? $skillLabel, $catId . '-' . $si),
            'label' => $skillLabel,
            'level' => skills_clamp_level($skill['level'] ?? 0)
        ];
    }
    $categories[] = ['id' => $catId, 'label' => $label, 'skills' => $skills];
}

$tools = [];
foreach (list_field($payload, 'tools') as $ti => $tool) {
    $label = str_field($tool['label'] ?? '');
    if ($label === '') continue;
    $items = array_values(array_filter(array_map('str_field', list_field($tool, 'items')), 'strlen'));
    $tools[] = ['id' => slugify($tool['id'] ?? $label, 'outils-' . $ti), 'label' => $label, 'items' => $items];
}

$cleaned = ['categories' => $categories, 'tools' => $tools];
write_json_file($dataFile, $cleaned);
echo json_encode($cleaned);
