<?php
// Fonctions partagées de la connexion Instagram (instagram-posts.php et
// instagram-token.php) : lecture/écriture du token, appels à l'API et
// renouvellement automatique du token.
//
// Le token (type "Instagram API with Instagram Login", commence par IGAA…)
// est collé une seule fois dans le back office (onglet Instagram), puis
// renouvelé automatiquement par le site lui-même — voir php/INSTAGRAM.md.

// Version de l'API Instagram Graph. Meta retire chaque version environ deux
// ans après sa sortie : à monter ici si l'API renvoie une erreur de version.
define('IG_API_BASE', 'https://graph.instagram.com/v24.0/');

define('IG_TOKEN_FILE', __DIR__ . '/data/instagram-token.json');
define('IG_CACHE_FILE', __DIR__ . '/data/instagram-cache.json');

// Le token dure 60 jours ; Meta n'accepte de le prolonger qu'après 24 h.
// On le renouvelle dès qu'il a plus de 7 jours, à la première visite du site.
define('IG_REFRESH_AFTER', 7 * 24 * 3600);

function ig_read_json($path, $fallback) {
    if (!file_exists($path)) return $fallback;
    $decoded = json_decode(file_get_contents($path), true);
    return is_array($decoded) ? $decoded : $fallback;
}

function ig_write_json($path, $data) {
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

function ig_fetch_json($url) {
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
    if ($body === false) $status = 502;
    $data = $body !== false ? json_decode($body, true) : null;
    return ['status' => $status, 'data' => $data];
}

// Message d'erreur lisible à partir d'une réponse de l'API.
function ig_error_message($result) {
    if (is_array($result['data']) && isset($result['data']['error']['message'])) {
        return $result['data']['error']['message'];
    }
    return 'Instagram ne répond pas (code ' . $result['status'] . ').';
}

// Vérifie un token auprès d'Instagram et renvoie le compte associé.
function ig_check_token($accessToken) {
    return ig_fetch_json(IG_API_BASE . 'me?fields=user_id,username&access_token=' . urlencode($accessToken));
}

function ig_save_token($accessToken, $username, $expiresIn) {
    ig_write_json(IG_TOKEN_FILE, [
        'access_token' => $accessToken,
        'username' => $username,
        'updated_at' => time(),
        'expires_at' => time() + $expiresIn
    ]);
    // Le nouveau token peut concerner un autre compte : on vide le cache.
    @unlink(IG_CACHE_FILE);
}

// Renvoie le token enregistré, après l'avoir prolongé de 60 jours s'il a
// plus de IG_REFRESH_AFTER. En cas d'échec du renouvellement, l'ancien token
// reste utilisé (il sera retenté à la visite suivante).
function ig_current_token() {
    $tokenData = ig_read_json(IG_TOKEN_FILE, null);
    if (!$tokenData || empty($tokenData['access_token'])) return null;

    $updatedAt = (int) ($tokenData['updated_at'] ?? 0);
    if (time() - $updatedAt > IG_REFRESH_AFTER) {
        $result = ig_fetch_json('https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token='
            . urlencode($tokenData['access_token']));
        if ($result['status'] === 200 && !empty($result['data']['access_token'])) {
            ig_save_token(
                $result['data']['access_token'],
                $tokenData['username'] ?? '',
                (int) ($result['data']['expires_in'] ?? 60 * 24 * 3600)
            );
            return $result['data']['access_token'];
        }
    }

    return $tokenData['access_token'];
}
