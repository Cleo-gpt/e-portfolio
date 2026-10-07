<?php
// Contenu du footer : nom, téléphone, réseaux sociaux, mail.
// GET  -> public.
// POST -> protégé (back office), remplace le contenu.

require __DIR__ . '/_auth.php';

start_json_endpoint(['GET', 'POST']);

$dataFile = __DIR__ . '/data/content-social.json';
$fields = ['name', 'phone', 'phoneDisplay', 'linktree', 'instagramLanterne', 'linkedin', 'email'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $default = array_fill_keys($fields, '');
    echo json_encode(array_merge($default, read_json_file($dataFile, [])));
    exit;
}

require_admin();
$payload = read_request_json();

$cleaned = [];
foreach ($fields as $field) {
    $cleaned[$field] = str_field($payload[$field] ?? '');
}

write_json_file($dataFile, $cleaned);
echo json_encode($cleaned);
