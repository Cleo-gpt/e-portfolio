<?php
// Récupère les dernières publications du compte Instagram professionnel
// via l'API Instagram Graph, avec le token stocké dans data/instagram-token.json.
//
// Ce token est renouvelé automatiquement tous les ~45 jours par un workflow
// GitHub Actions qui appelle update-instagram-token.php — voir
// .github/workflows/refresh-instagram-token.yml et netlify/functions/README.md
// pour la procédure de configuration complète. Zéro maintenance manuelle une
// fois configuré.

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$tokenFile = __DIR__ . '/data/instagram-token.json';

function read_json($path, $fallback) {
    if (!file_exists($path)) return $fallback;
    $content = file_get_contents($path);
    $decoded = json_decode($content, true);
    return is_array($decoded) ? $decoded : $fallback;
}

$tokenData = read_json($tokenFile, null);
$accessToken = $tokenData['access_token'] ?? '';
$igUserId = $tokenData['ig_user_id'] ?? '';

if (empty($accessToken) || empty($igUserId)) {
    http_response_code(500);
    echo json_encode(['error' => 'Token Instagram non configuré. Voir netlify/functions/README.md.']);
    exit;
}

function fetch_json($url) {
    $context = stream_context_create(['http' => ['timeout' => 10, 'ignore_errors' => true]]);
    $body = @file_get_contents($url, false, $context);
    $status = 200;
    // http_get_last_response_headers() (PHP 8.5+) remplace la variable
    // magique $http_response_header, dépréciée à partir de cette version ;
    // on garde l'ancienne en repli pour les versions de PHP antérieures.
    if (function_exists('http_get_last_response_headers')) {
        $responseHeaders = http_get_last_response_headers() ?? [];
    } else {
        $responseHeaders = $http_response_header ?? [];
    }
    foreach ($responseHeaders as $header) {
        if (preg_match('#^HTTP/\S+\s+(\d+)#', $header, $m)) {
            $status = (int) $m[1];
        }
    }
    $data = $body !== false ? json_decode($body, true) : null;
    return ['status' => $status, 'data' => $data];
}

$fields = implode(',', [
    'id', 'caption', 'media_type', 'media_url',
    'thumbnail_url', 'permalink', 'like_count', 'comments_count'
]);

$url = 'https://graph.instagram.com/v21.0/' . urlencode($igUserId)
    . '/media?fields=' . $fields . '&limit=9&access_token=' . urlencode($accessToken);

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
            . '/insights?metric=plays&access_token=' . urlencode($accessToken);
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
