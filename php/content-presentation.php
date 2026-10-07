<?php
// Contenu de la section "À propos de moi".
// GET  -> public, renvoie { photo, paragraphs }.
// POST -> protégé (back office), remplace le contenu.

require __DIR__ . '/_auth.php';

start_json_endpoint(['GET', 'POST']);

$dataFile = __DIR__ . '/data/content-presentation.json';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode(read_json_file($dataFile, ['photo' => 'Images/presentation/Photo Cléo.jpeg', 'paragraphs' => []]));
    exit;
}

require_admin();
$payload = read_request_json();

$photo = str_field($payload['photo'] ?? '');
$paragraphs = array_values(array_filter(array_map('str_field', list_field($payload, 'paragraphs')), 'strlen'));
if ($photo === '' || count($paragraphs) === 0) json_error(400, 'La photo et au moins un paragraphe sont requis.');

$cleaned = ['photo' => $photo, 'paragraphs' => $paragraphs];
write_json_file($dataFile, $cleaned);
echo json_encode($cleaned);
