<?php
// Formulaire de contact : reçoit le message d'un visiteur et me l'envoie par
// e-mail (ADMIN_EMAIL, config.php). Mon adresse n'apparaît jamais sur le site.
//
// POST (JSON) : { nom, email, message, site }
//   "site" est un champ piège, invisible pour les visiteurs : seuls les
//   robots le remplissent, et leur message est alors ignoré sans le dire.
//
// Contre le spam, en plus de la vérification de la carpe (contact.js) :
// 3 messages par heure et par visiteur, 30 messages par jour au total.

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/_commun.php';

start_json_endpoint(['POST']);

define('LIMITES_FILE', __DIR__ . '/data/contact-limites.json');
define('MAX_PAR_HEURE_VISITEUR', 3);
define('MAX_PAR_JOUR', 30);

// Longueur en caractères (mbstring n'est pas forcément installé).
function longueur($texte) {
    return function_exists('mb_strlen') ? mb_strlen($texte, 'UTF-8') : strlen(utf8_decode($texte));
}

$donnees = read_request_json();
$nom = str_field($donnees['nom'] ?? '');
$email = str_field($donnees['email'] ?? '');
$message = str_field($donnees['message'] ?? '');
$piege = str_field($donnees['site'] ?? '');

// Robot : on fait comme si tout s'était bien passé.
if ($piege !== '') {
    echo json_encode(['ok' => true]);
    exit;
}

// Les retours à la ligne dans le nom ou l'e-mail serviraient à glisser de
// faux en-têtes dans l'e-mail envoyé : on les refuse.
if ($nom === '' || longueur($nom) > 100 || preg_match('/[\r\n]/', $nom)) {
    json_error(400, 'Indique ton nom (100 caractères au maximum).');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $email)) {
    json_error(400, 'Cette adresse e-mail ne semble pas valide.');
}
if (longueur($message) < 10 || longueur($message) > 5000) {
    json_error(400, 'Le message doit faire entre 10 et 5000 caractères.');
}

// ---------- Limites d'envoi ----------
// Les visiteurs sont reconnus par une empreinte de leur adresse IP (l'IP
// elle-même n'est pas enregistrée).

$maintenant = time();
$visiteur = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|' . ADMIN_EMAIL);

$fichier = fopen(LIMITES_FILE, 'c+');
if (!$fichier || !flock($fichier, LOCK_EX)) json_error(500, 'Envoi impossible pour le moment.');
$envois = json_decode(stream_get_contents($fichier), true);
if (!is_array($envois)) $envois = [];

// On ne garde que les envois des dernières 24 heures.
$envois = array_values(array_filter($envois, function ($e) use ($maintenant) {
    return isset($e['t']) && $maintenant - $e['t'] < 86400;
}));
$duVisiteur = array_filter($envois, function ($e) use ($maintenant, $visiteur) {
    return $e['v'] === $visiteur && $maintenant - $e['t'] < 3600;
});

function liberer($fichier) {
    flock($fichier, LOCK_UN);
    fclose($fichier);
}

if (count($duVisiteur) >= MAX_PAR_HEURE_VISITEUR || count($envois) >= MAX_PAR_JOUR) {
    liberer($fichier);
    json_error(429, 'Trop de messages envoyés. Réessaie un peu plus tard.');
}

// ---------- Envoi ----------

$serveur = preg_replace('/[^a-z0-9.-]/i', '', $_SERVER['SERVER_NAME'] ?? 'localhost');
$sujet = 'Nouveau message depuis ton e-portfolio — ' . $nom;
$corps = "Message envoyé depuis le formulaire de contact de ton e-portfolio.\n\n"
    . "Nom : $nom\n"
    . "E-mail : $email\n\n"
    . "------------------------------\n\n"
    . $message . "\n\n"
    . "------------------------------\n"
    . "Réponds directement à cet e-mail pour lui écrire.\n";
$entetes = implode("\r\n", [
    'Content-Type: text/plain; charset=UTF-8',
    'From: E-portfolio <no-reply@' . $serveur . '>',
    'Reply-To: ' . $email,
]);

$envoye = mail(ADMIN_EMAIL, '=?UTF-8?B?' . base64_encode($sujet) . '?=', $corps, $entetes);

if ($envoye) {
    $envois[] = ['t' => $maintenant, 'v' => $visiteur];
    ftruncate($fichier, 0);
    rewind($fichier);
    fwrite($fichier, json_encode($envois));
}
liberer($fichier);

if (!$envoye) json_error(500, "Le message n'a pas pu partir. Réessaie plus tard ou écris-moi via LinkedIn.");
echo json_encode(['ok' => true]);
