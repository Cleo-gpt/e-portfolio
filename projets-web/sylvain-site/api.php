<?php

// ── EN-TÊTES HTTP ────────────────────────────────────────────────────────────
// Définit le type de réponse JSON et autorise les requêtes cross-origin (CORS)
// pour que le front-end puisse appeler cette API depuis n'importe quelle origine.

header('Content-Type: application/json'); // Indique au client que la réponse sera du JSON
header('Access-Control-Allow-Origin: *'); // Autorise toutes les origines à interroger cette API
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS'); // Déclare les méthodes HTTP acceptées
header('Access-Control-Allow-Headers: Content-Type'); // Autorise l'en-tête Content-Type dans les requêtes

// Réponse immédiate aux requêtes préliminaires OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { // Vérifie si la requête est un preflight CORS
    http_response_code(204); // Renvoie un statut "No Content" pour valider le preflight
    exit; // Stoppe l'exécution, aucun corps de réponse n'est nécessaire
}


// ── CONNEXION BDD ────────────────────────────────────────────────────────────
// On importe config.php qui crée la variable $db (connexion PDO).
// Ce fichier détecte automatiquement si on est en local ou chez un hébergeur.

require __DIR__ . '/config.php'; // Inclut la connexion centralisée — __DIR__ désigne le dossier du fichier actuel


// ── PARAMÈTRES DE LA REQUÊTE ─────────────────────────────────────────────────
// Lecture de la méthode HTTP, de l'action demandée et de l'identifiant
// éventuel transmis en query string (?action=...&id=...).

$method = $_SERVER['REQUEST_METHOD']; // Récupère la méthode HTTP utilisée (GET, POST, DELETE…)
$action = $_GET['action'] ?? ''; // Lit le paramètre "action" de l'URL, chaîne vide par défaut
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null; // Convertit le paramètre "id" en entier, ou null s'il est absent


// ── ROUTES ───────────────────────────────────────────────────────────────────

// ── POST ?action=quiz ─────────────────────────────────────────────────────────
// Enregistre un nouveau résultat de quiz en base de données.
// Corps JSON attendu : { pseudo, score, total, answers, duration_seconds? }

if ($method === 'POST' && $action === 'quiz') { // Correspond à la route d'enregistrement d'un résultat de quiz
    $body = json_decode(file_get_contents('php://input'), true); // Lit et décode le corps JSON de la requête entrante

    // Validation : tous les champs obligatoires doivent être présents
    if (!$body || !isset($body['pseudo'], $body['score'], $body['total'], $body['answers'])) { // Vérifie que le JSON est valide et que les champs requis sont présents
        http_response_code(400); // Retourne un statut 400 Bad Request si des données sont manquantes
        echo json_encode(['error' => 'Données manquantes']); // Envoie un message d'erreur explicite au client
        exit; // Interrompt l'exécution après la réponse d'erreur
    }

    // La durée est optionnelle
    $duration = isset($body['duration_seconds']) ? (int)$body['duration_seconds'] : null; // Récupère la durée en secondes si fournie, sinon null

    $stmt = $db->prepare( // Prépare la requête d'insertion pour éviter les injections SQL
        "INSERT INTO quiz_results (pseudo, score, total, answers, duration_seconds)
         VALUES (?, ?, ?, ?, ?)"
    );
    $stmt->execute([ // Exécute la requête préparée avec les valeurs du corps de la requête
        $body['pseudo'], // Pseudo du joueur tel que fourni dans le JSON
        (int)$body['score'], // Score obtenu, converti en entier
        (int)$body['total'], // Nombre total de questions, converti en entier
        json_encode($body['answers'], JSON_UNESCAPED_UNICODE), // Sérialise le tableau des réponses en JSON pour le stockage
        $duration, // Durée de la partie en secondes (peut être null)
    ]);

    // Retourne l'identifiant de la ligne insérée
    echo json_encode(['id' => $db->lastInsertId()]); // Renvoie l'ID auto-incrémenté de l'enregistrement créé
    exit; // Stoppe l'exécution après la réponse
}

// ── GET ?action=results ───────────────────────────────────────────────────────
// Retourne tous les résultats de quiz, triés du plus récent au plus ancien.
// Le champ `answers` (stocké en JSON texte) est décodé avant l'envoi.

if ($method === 'GET' && $action === 'results') { // Correspond à la route de récupération de tous les résultats
    $rows = $db->query( // Exécute directement la requête SELECT sans paramètre utilisateur
        "SELECT id, pseudo, score, total, duration_seconds, submitted_at, answers
         FROM quiz_results
         ORDER BY submitted_at DESC"
    )->fetchAll(); // Récupère toutes les lignes du résultat en un seul tableau

    // Désérialisation du champ answers pour chaque ligne
    foreach ($rows as &$r) { // Parcourt chaque ligne par référence pour pouvoir la modifier en place
        $r['answers'] = json_decode($r['answers'], true); // Convertit la chaîne JSON "answers" en tableau PHP associatif
    }

    echo json_encode($rows); // Sérialise l'ensemble des résultats en JSON et les envoie au client
    exit; // Stoppe l'exécution après l'envoi de la réponse
}

// ── DELETE ?action=delete&id=X ────────────────────────────────────────────────
// Supprime un résultat de quiz par son identifiant.
// L'identifiant doit être fourni en query string (?id=X).

if ($method === 'DELETE' && $action === 'delete' && $id) { // Correspond à la route de suppression d'un résultat identifié par son id
    $db->prepare("DELETE FROM quiz_results WHERE id = ?")->execute([$id]); // Prépare et exécute la suppression de la ligne correspondant à l'id
    echo json_encode(['success' => true]); // Confirme au client que la suppression s'est bien déroulée
    exit; // Stoppe l'exécution après la réponse
}


// ── ROUTE INCONNUE ───────────────────────────────────────────────────────────
// Aucune route ne correspond à la combinaison méthode + action reçue.

http_response_code(404); // Retourne un statut 404 Not Found pour signaler que la route est inexistante
echo json_encode(['error' => 'Route inconnue']); // Envoie un message d'erreur indiquant qu'aucune route ne correspond
