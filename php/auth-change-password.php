<?php
// Change le code admin du back office, protégé par le code actuel.

require __DIR__ . '/_auth.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Email, X-Admin-Password');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée.']);
    exit;
}

require_admin();

$rawBody = file_get_contents('php://input');
$payload = json_decode($rawBody, true);
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['error' => 'Corps de requête invalide.']);
    exit;
}

$newPassword = isset($payload['newPassword']) ? trim((string) $payload['newPassword']) : '';
if (strlen($newPassword) < 4) {
    http_response_code(400);
    echo json_encode(['error' => 'Le nouveau code doit contenir au moins 4 caractères.']);
    exit;
}

auth_write_json(CREDENTIALS_FILE, ['password' => $newPassword]);
echo json_encode(['ok' => true]);
