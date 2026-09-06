<?php
// Équivalent PHP de netlify/functions/instagram-posts.js, pour un
// hébergement mutualisé classique sans fonctions serverless.
//
// Récupère les 9 dernières publications du compte Instagram professionnel
// via l'API Instagram Graph. Le token n'est jamais exposé au navigateur :
// il est lu depuis php/config.php (IG_USER_ID / IG_ACCESS_TOKEN).
//
// Voir netlify/functions/README.md pour la procédure d'obtention du token.

require __DIR__ . '/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if (empty(IG_USER_ID) || empty(IG_ACCESS_TOKEN)) {
    http_response_code(500);
    echo json_encode(['error' => "Identifiants IG_USER_ID / IG_ACCESS_TOKEN manquants dans config.php."]);
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

$fields = implode(',', [
    'id', 'caption', 'media_type', 'media_url',
    'thumbnail_url', 'permalink', 'like_count', 'comments_count'
]);

$url = 'https://graph.instagram.com/v21.0/' . urlencode(IG_USER_ID)
    . '/media?fields=' . $fields . '&limit=9&access_token=' . urlencode(IG_ACCESS_TOKEN);

$result = fetch_json($url);

if ($result['status'] !== 200 || !is_array($result['data'])) {
    http_response_code($result['status'] !== 200 ? $result['status'] : 500);
    $error = is_array($result['data']) && isset($result['data']['error'])
        ? $result['data']['error']
        : 'Erreur API Instagram';
    echo json_encode(['error' => $error]);
    exit;
}

$items = isset($result['data']['data']) && is_array($result['data']['data']) ? $result['data']['data'] : [];
$posts = [];

foreach ($items as $item) {
    $views = null;

    // Les vues (plays) ne sont disponibles que pour les Reels/vidéos,
    // via l'endpoint insights dédié.
    if (isset($item['media_type']) && in_array($item['media_type'], ['VIDEO', 'REELS'], true)) {
        $insightsUrl = 'https://graph.instagram.com/v21.0/' . urlencode($item['id'])
            . '/insights?metric=plays&access_token=' . urlencode(IG_ACCESS_TOKEN);
        $insights = fetch_json($insightsUrl);
        if (is_array($insights['data']) && isset($insights['data']['data'][0]['values'][0]['value'])) {
            $views = $insights['data']['data'][0]['values'][0]['value'];
        }
    }

    $posts[] = [
        'id' => $item['id'] ?? null,
        'url' => $item['permalink'] ?? null,
        'image' => $item['thumbnail_url'] ?? ($item['media_url'] ?? null),
        'caption' => isset($item['caption']) ? mb_substr($item['caption'], 0, 120) : '',
        'likes' => $item['like_count'] ?? 0,
        'comments' => $item['comments_count'] ?? 0,
        'views' => $views
    ];
}

header('Cache-Control: public, max-age=300');
echo json_encode(['posts' => $posts]);
