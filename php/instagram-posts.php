<?php
// Récupère les publications du compte Instagram professionnel via l'API
// Instagram Graph, avec le token enregistré depuis le back office (onglet
// Instagram). Le token est renouvelé automatiquement (voir _instagram.php) :
// zéro maintenance une fois configuré. Procédure : php/INSTAGRAM.md.

require __DIR__ . '/_instagram.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// La première page est gardée en cache 5 minutes côté serveur : le site
// reste rapide et un nouveau post apparaît au plus 5 minutes après sa
// publication sur Instagram.
define('IG_CACHE_TTL', 300);

// Pagination : le front envoie le curseur "after" reçu à la page précédente
// pour continuer à descendre dans l'historique, jusqu'au tout premier post.
$after = isset($_GET['after']) ? trim($_GET['after']) : '';

if ($after === '') {
    $cache = ig_read_json(IG_CACHE_FILE, null);
    if ($cache && time() - (int) ($cache['cached_at'] ?? 0) < IG_CACHE_TTL) {
        header('Cache-Control: public, max-age=300');
        echo json_encode($cache['response']);
        exit;
    }
}

$accessToken = ig_current_token();

if (!$accessToken) {
    http_response_code(500);
    echo json_encode(['error' => 'Token Instagram non configuré. Voir php/INSTAGRAM.md.']);
    exit;
}

$fields = implode(',', [
    'id', 'caption', 'media_type', 'media_url',
    'thumbnail_url', 'permalink', 'like_count', 'comments_count'
]);

$url = IG_API_BASE . 'me/media?fields=' . $fields . '&limit=9&access_token=' . urlencode($accessToken);
if ($after !== '') {
    $url .= '&after=' . urlencode($after);
}

$result = ig_fetch_json($url);

if ($result['status'] !== 200 || !is_array($result['data'])) {
    http_response_code($result['status'] !== 200 ? $result['status'] : 500);
    echo json_encode(['error' => ig_error_message($result)]);
    exit;
}

$items = isset($result['data']['data']) && is_array($result['data']['data']) ? $result['data']['data'] : [];
$posts = [];

foreach ($items as $item) {
    $views = null;

    // Les vues ne sont récupérées que pour les Reels/vidéos, via l'endpoint
    // insights dédié (métrique "views", qui remplace l'ancienne "plays").
    if (isset($item['media_type']) && in_array($item['media_type'], ['VIDEO', 'REELS'], true)) {
        $insights = ig_fetch_json(IG_API_BASE . urlencode($item['id'])
            . '/insights?metric=views&access_token=' . urlencode($accessToken));
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

$nextCursor = $result['data']['paging']['cursors']['after'] ?? null;
$hasMore = isset($result['data']['paging']['next']);

$response = [
    'posts' => $posts,
    'nextCursor' => $hasMore ? $nextCursor : null
];

if ($after === '') {
    ig_write_json(IG_CACHE_FILE, ['cached_at' => time(), 'response' => $response]);
}

header('Cache-Control: public, max-age=300');
echo json_encode($response);
