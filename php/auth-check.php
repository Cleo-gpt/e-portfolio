<?php
// Vérifie les identifiants (email + code) du back office, sans rien écrire.
// Utilisé par l'écran de login de back-office.html et le pop up de index.html.

require __DIR__ . '/_auth.php';

start_json_endpoint(['POST']);
require_admin();

echo json_encode(['ok' => true]);
