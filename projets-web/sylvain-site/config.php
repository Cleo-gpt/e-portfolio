<?php

// ── CONFIGURATION DE LA BASE DE DONNÉES ──────────────────────────────────────
// Ce fichier centralise l'accès à la base de données du site.
// Il est inclus par toutes les pages PHP qui ont besoin d'accéder à la BD.
//
// Base SQLite (fichier local) : pas d'identifiants, pas de serveur MySQL à
// configurer. Le fichier de données (data/sylvain.sqlite) est créé et
// initialisé automatiquement au premier accès à partir du schéma versionné
// (data/schema.sqlite.sql). Convention alignée sur php/data/ à la racine du
// portefolio, qui stocke de la même façon le contenu éditable du site.
//
// Remarque : le fichier .sqlite généré contient des données (y compris de
// test créées à l'exécution) et n'est donc pas versionné — voir .gitignore.
// Seul le schéma SQL l'est.

define('DB_DIR', __DIR__ . '/data'); // Dossier contenant le fichier de base de données
define('DB_FILE', DB_DIR . '/sylvain.sqlite'); // Chemin du fichier SQLite
define('DB_SCHEMA', DB_DIR . '/schema.sqlite.sql'); // Chemin du schéma versionné utilisé pour l'initialisation

// ── CRÉATION DE LA CONNEXION PDO ─────────────────────────────────────────────
// PDO (PHP Data Objects) reste la même API qu'avec MySQL : seul le DSN change.
// On crée la connexion une seule fois ici, puis on l'importe avec require.

try { // Essaie d'établir la connexion — si ça échoue, le bloc catch s'exécute
    if (!is_dir(DB_DIR)) { // Vérifie que le dossier de données existe
        mkdir(DB_DIR, 0755, true); // Le crée si besoin (écriture pour le propriétaire, lecture pour les autres)
    }

    $needs_init = !file_exists(DB_FILE); // La base n'existe pas encore : il faudra l'initialiser depuis le schéma

    $db = new PDO( // Crée une nouvelle connexion à la base de données
        'sqlite:' . DB_FILE, // DSN SQLite : simple chemin de fichier, aucun identifiant nécessaire
        null, // Pas d'utilisateur pour SQLite
        null, // Pas de mot de passe pour SQLite
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Lève une exception PHP si une requête SQL échoue
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Retourne les résultats sous forme de tableaux clé => valeur
        ]
    );
    $db->exec('PRAGMA foreign_keys = ON'); // Active les contraintes de clé étrangère (désactivées par défaut sous SQLite)

    if ($needs_init && file_exists(DB_SCHEMA)) { // Premier lancement : la base vient d'être créée vide par PDO, on la peuple
        $db->exec(file_get_contents(DB_SCHEMA)); // Exécute le schéma versionné (CREATE TABLE + données de test)
    }
} catch (PDOException $e) { // Capture l'erreur si la connexion échoue
    // Affiche un message d'erreur lisible et arrête le script
    // En production, on éviterait d'afficher $e->getMessage() pour ne pas exposer les détails
    http_response_code(500); // Envoie le code HTTP 500 (erreur serveur)
    die('Erreur de connexion à la base de données : ' . $e->getMessage()); // Affiche l'erreur et stoppe tout
}
