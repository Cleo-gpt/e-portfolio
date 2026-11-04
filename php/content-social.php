<?php
// Contenu du footer : nom et réseaux sociaux. Pas d'e-mail ni de téléphone :
// le contact passe par le formulaire (contact.php), qui garde mon adresse
// côté serveur.
// GET  -> public.
// POST -> protégé (back office), remplace le contenu.

require __DIR__ . '/_auth.php';

start_json_endpoint(['GET', 'POST']);

$dataFile = __DIR__ . '/data/content-social.json';
$fields = ['name', 'linktree', 'instagramLanterne', 'linkedin'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $default = array_fill_keys($fields, '');
    // Seulement les champs prévus (d'anciennes versions enregistraient
    // aussi l'e-mail et le téléphone : ils ne sont plus jamais renvoyés).
    echo json_encode(array_intersect_key(array_merge($default, read_json_file($dataFile, [])), $default));
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
