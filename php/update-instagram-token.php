<?php
// Lit et met à jour le token d'accès Instagram Graph, renouvelé
// automatiquement tous les ~45 jours par un workflow GitHub Actions
// (voir .github/workflows/refresh-instagram-token.yml).
//
// Protégé par un secret dédié (INSTAGRAM_TOKEN_UPDATE_SECRET dans
// php/secrets.php, non versionné), différent du code du back office :
// ce secret n'existe que dans les GitHub Secrets du dépôt et sur ce
// serveur, jamais publié.
//
// GET  : renvoie le token actuel (pour que le workflow puisse le rafraîchir).
// POST : enregistre le nouveau token après rafraîchissement.
// Les deux méthodes exigent l'en-tête X-Update-Secret.

require __DIR__ . '/config.php';

header('Content-Type: application/json');

if (empty(INSTAGRAM_TOKEN_UPDATE_SECRET)) {
    http_response_code(500);
    echo json_encode(['error' => 'INSTAGRAM_TOKEN_UPDATE_SECRET non configuré sur le serveur.']);
    exit;
}

$headers = function_exists('getallheaders') ? getallheaders() : [];
$providedSecret = '';
foreach ($headers as $key => $value) {
    if (strtolower($key) === 'x-update-secret') $providedSecret = $value;
}

if (!hash_equals(INSTAGRAM_TOKEN_UPDATE_SECRET, $providedSecret)) {
    http_response_code(401);
    echo json_encode(['error' => 'Secret invalide.']);
    exit;
}

$tokenFile = __DIR__ . '/data/instagram-token.json';

function read_json($path, $fallback) {
    if (!file_exists($path)) return $fallback;
    $content = file_get_contents($path);
    $decoded = json_decode($content, true);
    return is_array($decoded) ? $decoded : $fallback;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data = read_json($tokenFile, null);
    if (!$data) {
        http_response_code(404);
        echo json_encode(['error' => 'Aucun token enregistré pour le moment.']);
        exit;
    }
    echo json_encode($data);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawBody = file_get_contents('php://input');
    $payload = json_decode($rawBody, true);
    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode(['error' => 'Corps de requête invalide.']);
        exit;
    }

    $accessToken = isset($payload['access_token']) ? trim((string) $payload['access_token']) : '';
    $igUserId = isset($payload['ig_user_id']) ? trim((string) $payload['ig_user_id']) : '';

    if ($accessToken === '') {
        http_response_code(400);
        echo json_encode(['error' => 'access_token est requis.']);
        exit;
    }

    // Garde l'ig_user_id existant si le workflow n'en renvoie pas un nouveau
    // (le refresh de token ne change jamais cet identifiant).
    if ($igUserId === '') {
        $existing = read_json($tokenFile, []);
        $igUserId = $existing['ig_user_id'] ?? '';
    }

    $data = [
        'access_token' => $accessToken,
        'ig_user_id' => $igUserId,
        'updated_at' => gmdate('c')
    ];

    file_put_contents($tokenFile, json_encode($data, JSON_PRETTY_PRINT), LOCK_EX);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Méthode non autorisée.']);
