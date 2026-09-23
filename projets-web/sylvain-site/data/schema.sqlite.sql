-- Schéma SQLite du fan site Sylvain Lyve
-- Adapté depuis le dump MySQL d'origine (sylvain_lyve.sql) pour fonctionner
-- sans base de données externe : ce fichier est versionné, et sert à
-- initialiser automatiquement data/sylvain.sqlite au premier accès (voir
-- config.php). Il n'y a plus besoin de CREATE DATABASE / USE, ni
-- d'identifiants : SQLite est une base fichier lue/écrite directement par PHP.

-- ── TABLE quiz_results ────────────────────────────────────────────────────────
-- Stocke les résultats des quiz passés par les visiteurs.

CREATE TABLE IF NOT EXISTS quiz_results (
    id               INTEGER PRIMARY KEY AUTOINCREMENT, -- Identifiant unique auto-incrémenté
    pseudo           TEXT     NOT NULL,                  -- Pseudo du joueur
    score            INTEGER  NOT NULL,                  -- Nombre de bonnes réponses
    total            INTEGER  NOT NULL,                  -- Nombre total de questions
    answers          TEXT     NOT NULL,                  -- Détail des réponses en JSON
    duration_seconds INTEGER  DEFAULT NULL,               -- Durée du quiz en secondes
    submitted_at     TEXT     NOT NULL DEFAULT (datetime('now')) -- Date et heure de soumission (ISO 8601)
);

CREATE INDEX IF NOT EXISTS idx_quiz_results_submitted ON quiz_results (submitted_at);
CREATE INDEX IF NOT EXISTS idx_quiz_results_score ON quiz_results (score);

-- ── TABLE videos ─────────────────────────────────────────────────────────────
-- Stocke les vidéos de Sylvain Lyve présentées sur la page d'accueil.
-- Chaque ligne représente une vidéo avec ses informations complètes.

CREATE TABLE IF NOT EXISTS videos (
    id           INTEGER PRIMARY KEY AUTOINCREMENT, -- Identifiant unique de la vidéo
    titre        TEXT    NOT NULL,                   -- Titre de la vidéo
    description  TEXT    NOT NULL,                   -- Description complète de la vidéo
    image_path   TEXT    NOT NULL,                   -- Chemin vers l'image de miniature (ex: img/ma-video.jpg)
    url_youtube  TEXT    DEFAULT NULL,                -- Lien URL vers la vidéo sur YouTube
    date_ajout   TEXT    NOT NULL DEFAULT (datetime('now')) -- Date à laquelle la vidéo a été ajoutée au site
);

-- ── DONNÉES DE TEST (videos) ──────────────────────────────────────────────────
-- Quelques vidéos pré-remplies pour que la page d'accueil ne soit pas vide.

INSERT INTO videos (titre, description, image_path, url_youtube)
SELECT
    'Objectif 500 km/h — Le projet fou de Sylvain',
    'Sylvain Lyve annonce vouloir propulser une Citroën modifiée au-delà des 500 km/h. Un projet ambitieux, technique et totalement dans son style. Tout le monde pensait que c''était impossible, mais Sylvain est déterminé à prouver le contraire.',
    'img/objectif-500km_h-sylvain-lyve-1024x576.jpg',
    'https://www.youtube.com/@SylvainLyve'
WHERE NOT EXISTS (SELECT 1 FROM videos);

INSERT INTO videos (titre, description, image_path, url_youtube)
SELECT
    'Un an après l''annonce — Les nouvelles du projet',
    'C''est atrocement long, un an après l''annonce. Sylvain donne des nouvelles de son projet 500 km/h. Les préparatifs avancent, les défis techniques s''accumulent, mais la motivation reste intacte.',
    'img/c-est-atrocement-long-un-an-apres-l-annonce-sylvain-levy-donne-des-nouvelles-de-son-gros-projet-500.jpg',
    'https://www.youtube.com/@SylvainLyve'
WHERE (SELECT COUNT(*) FROM videos) < 2;

INSERT INTO videos (titre, description, image_path, url_youtube)
SELECT
    'Sylvain Lyve en podcast — Qui est-il vraiment ?',
    'Découvrez le vrai Sylvain Lyve dans cette interview podcast. Il parle de ses débuts sur YouTube, de sa passion pour l''automobile et de ce qui l''a poussé à lancer le projet 500 km/h. Une conversation authentique et sans filtre.',
    'img/5d15782baa5d7a813c82a102467a9ce7.jpg',
    'https://www.youtube.com/@SylvainLyve'
WHERE (SELECT COUNT(*) FROM videos) < 3;
