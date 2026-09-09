<?php
// Upload d'un fichier (image ou document PDF) depuis le back office,
// stocké directement dans Images/ ou Documents/ à la racine du site.
//
// Disponible uniquement sur un hébergement PHP classique (pas de fonction
// équivalente côté Netlify : les fonctions serverless ne peuvent pas
// écrire de fichiers disque persistants).
//
// POST multipart/form-data :
//   - file : le fichier à uploader
//   - kind : "image" ou "document"
// Réponse : { "path": "Images/mon-fichier-<hash>.png" }

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

$kind = isset($_POST['kind']) ? $_POST['kind'] : 'image';
$maxSize = 5 * 1024 * 1024; // 5 Mo

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Aucun fichier valide reçu.']);
    exit;
}

$tmpPath = $_FILES['file']['tmp_name'];
$size = $_FILES['file']['size'];

if ($size > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'Le fichier dépasse la taille maximale de 5 Mo.']);
    exit;
}

if ($kind === 'document') {
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $tmpPath);

    if ($mime !== 'application/pdf') {
        http_response_code(400);
        echo json_encode(['error' => 'Seuls les fichiers PDF sont acceptés pour un document.']);
        exit;
    }

    $extension = 'pdf';
    $targetDir = dirname(__DIR__) . '/Documents';
    $publicPrefix = 'Documents';
} else {
    $imageInfo = @getimagesize($tmpPath);
    if ($imageInfo === false) {
        http_response_code(400);
        echo json_encode(['error' => 'Le fichier n\'est pas une image valide.']);
        exit;
    }

    $allowedMimes = [
        'image/png' => 'png',
        'image/jpeg' => 'jpg',
        'image/webp' => 'webp'
    ];
    $mime = $imageInfo['mime'];

    if (!isset($allowedMimes[$mime])) {
        http_response_code(400);
        echo json_encode(['error' => 'Seuls les formats PNG, JPEG et WebP sont acceptés.']);
        exit;
    }

    $extension = $allowedMimes[$mime];
    $targetDir = dirname(__DIR__) . '/Images';
    $publicPrefix = 'Images';
}

if (!is_dir($targetDir)) {
    mkdir($targetDir, 0755, true);
}

$originalName = pathinfo($_FILES['file']['name'], PATHINFO_FILENAME);
$slug = strtolower($originalName);
$slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
$slug = trim($slug, '-');
if ($slug === '') $slug = $kind;

$filename = $slug . '-' . substr(bin2hex(random_bytes(4)), 0, 8) . '.' . $extension;
$destination = $targetDir . '/' . $filename;

if (!move_uploaded_file($tmpPath, $destination)) {
    http_response_code(500);
    echo json_encode(['error' => 'Impossible d\'enregistrer le fichier sur le serveur.']);
    exit;
}

echo json_encode(['path' => $publicPrefix . '/' . $filename]);
