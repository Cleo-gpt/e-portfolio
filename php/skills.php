<?php
// Équivalent PHP de netlify/functions/skills.js, pour un hébergement
// mutualisé classique (ex: eleve.mediamatique.ch) sans fonctions
// serverless ni Netlify Blobs.
//
// GET  -> public, renvoie les niveaux actuels (ou les valeurs par défaut).
// POST -> protégé par email + code, met à jour les niveaux (ou le code).
//
// Stockage : deux fichiers JSON dans le dossier data/ (voir data/.htaccess
// et data/README.txt) :
//   - data/levels.json      -> niveaux de compétences
//   - data/credentials.json -> code admin actuel (l'email reste fixe,
//     défini ci-dessous)
//
// Avant la première utilisation, configure le code admin initial dans
// config.php (voir ce fichier) — ne mets jamais ce code dans skills.php
// ni dans un fichier versionné/partagé publiquement.

require __DIR__ . '/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Email, X-Admin-Password');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$dataDir = __DIR__ . '/data';
$levelsFile = $dataDir . '/levels.json';
$credentialsFile = $dataDir . '/credentials.json';

$defaultSkills = [
    'adobe-illustrator' => 8,
    'adobe-photoshop' => 7,
    'adobe-indesign' => 8,
    'google-slides' => 0,
    'google-sheets' => 0,
    'google-docs' => 0,
    'microsoft-powerpoint' => 0,
    'microsoft-excel' => 0,
    'microsoft-word' => 0,
    'developpement-web' => 8,
    'procreate' => 0
];

function clamp_level($value) {
    $n = is_numeric($value) ? (float) $value : 0;
    return (int) max(0, min(10, round($n)));
}

function read_json($path, $fallback) {
    if (!file_exists($path)) return $fallback;
    $content = file_get_contents($path);
    $decoded = json_decode($content, true);
    return is_array($decoded) ? $decoded : $fallback;
}

function write_json($path, $data) {
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $saved = read_json($levelsFile, []);
    echo json_encode(['skills' => array_merge($defaultSkills, $saved)]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $credentials = read_json($credentialsFile, null);
    $expectedEmail = strtolower(ADMIN_EMAIL);
    $expectedPassword = ($credentials && isset($credentials['password']))
        ? $credentials['password']
        : (defined('ADMIN_PASSWORD_DEFAULT') ? ADMIN_PASSWORD_DEFAULT : null);

    if (!$expectedPassword) {
        http_response_code(500);
        echo json_encode(['error' => 'Aucun code admin configuré sur le serveur.']);
        exit;
    }

    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $providedEmail = '';
    $providedPassword = '';
    foreach ($headers as $key => $value) {
        $lower = strtolower($key);
        if ($lower === 'x-admin-email') $providedEmail = trim($value);
        if ($lower === 'x-admin-password') $providedPassword = $value;
    }
    $providedEmail = strtolower($providedEmail);

    if ($providedEmail !== $expectedEmail || $providedPassword !== $expectedPassword) {
        http_response_code(401);
        echo json_encode(['error' => 'Email ou code incorrect.']);
        exit;
    }

    $rawBody = file_get_contents('php://input');
    $payload = json_decode($rawBody, true);
    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode(['error' => 'Corps de requête invalide.']);
        exit;
    }

    if (!empty($payload['__checkOnly'])) {
        echo json_encode(['ok' => true]);
        exit;
    }

    if (!empty($payload['__changePassword'])) {
        $newPassword = isset($payload['newPassword']) ? trim((string) $payload['newPassword']) : '';
        if (strlen($newPassword) < 4) {
            http_response_code(400);
            echo json_encode(['error' => 'Le nouveau code doit contenir au moins 4 caractères.']);
            exit;
        }
        write_json($credentialsFile, ['password' => $newPassword]);
        echo json_encode(['ok' => true]);
        exit;
    }

    $incoming = isset($payload['skills']) && is_array($payload['skills']) ? $payload['skills'] : [];
    $cleaned = [];
    foreach ($defaultSkills as $key => $default) {
        $cleaned[$key] = clamp_level(isset($incoming[$key]) ? $incoming[$key] : $default);
    }

    write_json($levelsFile, $cleaned);
    echo json_encode(['skills' => $cleaned]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Méthode non autorisée.']);
