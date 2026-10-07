<?php
// Change le code admin du back office, protégé par le code actuel.

require __DIR__ . '/_auth.php';

start_json_endpoint(['POST']);
require_admin();

$payload = read_request_json();
$newPassword = str_field($payload['newPassword'] ?? '');
if (strlen($newPassword) < 4) json_error(400, 'Le nouveau code doit contenir au moins 4 caractères.');

write_json_file(CREDENTIALS_FILE, ['password' => $newPassword]);
echo json_encode(['ok' => true]);
