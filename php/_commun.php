<?php
// Fonctions partagées par tous les scripts PHP du site : lecture/écriture
// des fichiers JSON de php/data/, réponses JSON et nettoyage des champs
// envoyés par le back office.

// Lit un fichier JSON ; renvoie $fallback s'il n'existe pas ou est invalide.
function read_json_file($path, $fallback) {
    if (!file_exists($path)) return $fallback;
    $decoded = json_decode(file_get_contents($path), true);
    return is_array($decoded) ? $decoded : $fallback;
}

function write_json_file($path, $data) {
    file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

// Envoie une erreur JSON avec le code HTTP donné et arrête le script.
function json_error($status, $message) {
    http_response_code($status);
    echo json_encode(['error' => $message]);
    exit;
}

// Début de chaque script : réponse en JSON, requête OPTIONS acceptée (le
// back office s'en sert pour vérifier que PHP répond), et toute méthode
// absente de $methods refusée.
function start_json_endpoint(array $methods) {
    header('Content-Type: application/json');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
    if (!in_array($_SERVER['REQUEST_METHOD'], $methods, true)) {
        json_error(405, 'Méthode non autorisée.');
    }
}

// Corps JSON de la requête, sous forme de tableau (erreur 400 sinon).
function read_request_json() {
    $payload = json_decode(file_get_contents('php://input'), true);
    if (!is_array($payload)) json_error(400, 'Corps de requête invalide.');
    return $payload;
}

// Champ texte nettoyé (null → chaîne vide, espaces retirés).
function str_field($value) {
    return trim((string) ($value ?? ''));
}

// Liste envoyée par le back office ($data[$key]), ou liste vide.
function list_field($data, $key) {
    return (isset($data[$key]) && is_array($data[$key])) ? $data[$key] : [];
}

// "Mon Projet 2" → "mon-projet-2" ; $fallback si le texte ne donne rien.
function slugify($text, $fallback) {
    $slug = trim(preg_replace('/[^a-z0-9]+/', '-', strtolower(trim((string) $text))), '-');
    return $slug !== '' ? $slug : $fallback;
}
