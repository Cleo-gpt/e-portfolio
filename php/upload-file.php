<?php
// Upload d'un fichier (image ou document PDF) depuis le back office,
// stocké directement dans Images/ ou Documents/ à la racine du site.
//
// POST multipart/form-data :
//   - file : le fichier à uploader
//   - kind : "image" ou "document"
// Réponse : { "path": "Images/mon-fichier-<hash>.png" }

require __DIR__ . '/_auth.php';

start_json_endpoint(['POST']);
require_admin();

$kind = isset($_POST['kind']) ? $_POST['kind'] : 'image';
$maxSize = 5 * 1024 * 1024; // 5 Mo

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    json_error(400, 'Aucun fichier valide reçu.');
}

$tmpPath = $_FILES['file']['tmp_name'];
$size = $_FILES['file']['size'];

if ($size > $maxSize) {
    json_error(400, 'Le fichier dépasse la taille maximale de 5 Mo.');
}

if ($kind === 'document') {
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $tmpPath);

    if ($mime !== 'application/pdf') {
        json_error(400, 'Seuls les fichiers PDF sont acceptés pour un document.');
    }

    $extension = 'pdf';
    $targetDir = dirname(__DIR__) . '/Documents';
    $publicPrefix = 'Documents';
} else {
    $imageInfo = @getimagesize($tmpPath);
    if ($imageInfo === false) {
        json_error(400, 'Le fichier n\'est pas une image valide.');
    }

    $allowedMimes = [
        'image/png' => 'png',
        'image/jpeg' => 'jpg',
        'image/webp' => 'webp'
    ];
    $mime = $imageInfo['mime'];

    if (!isset($allowedMimes[$mime])) {
        json_error(400, 'Seuls les formats PNG, JPEG et WebP sont acceptés.');
    }

    $extension = $allowedMimes[$mime];
    $targetDir = dirname(__DIR__) . '/Images';
    $publicPrefix = 'Images';
}

if (!is_dir($targetDir)) {
    mkdir($targetDir, 0755, true);
}

$slug = slugify(pathinfo($_FILES['file']['name'], PATHINFO_FILENAME), $kind);

$filename = $slug . '-' . substr(bin2hex(random_bytes(4)), 0, 8) . '.' . $extension;
$destination = $targetDir . '/' . $filename;

if (!move_uploaded_file($tmpPath, $destination)) {
    json_error(500, 'Impossible d\'enregistrer le fichier sur le serveur.');
}

echo json_encode(['path' => $publicPrefix . '/' . $filename]);
