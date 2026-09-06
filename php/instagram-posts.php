<?php
// Équivalent PHP de netlify/functions/instagram-posts.js, pour un
// hébergement mutualisé classique sans fonctions serverless.
//
// Récupère les dernières publications du compte Instagram professionnel
// via Behold.so (https://behold.so), un service qui gère la connexion et
// le renouvellement du token Instagram à notre place — aucun token Meta
// à renouveler manuellement ici.
//
// Configuration : renseigne BEHOLD_FEED_URL dans php/config.php avec
// l'URL JSON de ton feed (Behold → ton feed → "JSON Feed").
// Voir netlify/functions/README.md pour la procédure complète.

require __DIR__ . '/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if (empty(BEHOLD_FEED_URL)) {
    http_response_code(500);
    echo json_encode(['error' => "BEHOLD_FEED_URL manquant dans config.php."]);
    exit;
}

function fetch_json($url) {
    $context = stream_context_create(['http' => ['timeout' => 10, 'ignore_errors' => true]]);
    $body = @file_get_contents($url, false, $context);
    $status = 200;
    if (isset($http_response_header)) {
        foreach ($http_response_header as $header) {
            if (preg_match('#^HTTP/\S+\s+(\d+)#', $header, $m)) {
                $status = (int) $m[1];
            }
        }
    }
    $data = $body !== false ? json_decode($body, true) : null;
    return ['status' => $status, 'data' => $data];
}

$result = fetch_json(BEHOLD_FEED_URL);

if ($result['status'] !== 200 || !is_array($result['data'])) {
    http_response_code($result['status'] !== 200 ? $result['status'] : 500);
    echo json_encode(['error' => 'Erreur en récupérant le feed Behold.']);
    exit;
}

$items = isset($result['data']['posts']) && is_array($result['data']['posts']) ? $result['data']['posts'] : [];
$posts = [];

foreach ($items as $item) {
    $image = null;
    if (isset($item['sizes']['medium']['url'])) {
        $image = $item['sizes']['medium']['url'];
    } elseif (isset($item['mediaUrl'])) {
        $image = $item['mediaUrl'];
    }

    $posts[] = [
        'id' => $item['id'] ?? null,
        'url' => $item['permalink'] ?? null,
        'image' => $image,
        'caption' => isset($item['prunedCaption']) ? mb_substr($item['prunedCaption'], 0, 120) : '',
        'likes' => $item['likeCount'] ?? 0,
        'comments' => $item['commentsCount'] ?? 0,
        // Behold ne fournit pas le nombre de vues des vidéos/reels.
        'views' => null
    ];
}

header('Cache-Control: public, max-age=300');
echo json_encode(['posts' => $posts]);
