# Développement local — ne pas utiliser Live Server seul

Le contenu du site (photo de présentation, projets CPNV, compétences,
réseaux sociaux, posts Instagram) n'est **pas** écrit en dur dans
`index.html` : il est chargé dynamiquement au chargement de la page via
`content.js`, qui appelle `/php/content-*.php`. **Live Server (l'extension
VS Code) ne fait tourner aucun PHP** — ces appels échouent silencieusement
et les sections restent vides (grille CPNV vide, etc.), ce qui peut donner
l'impression à tort que des chemins d'image sont cassés.

Pour développer en local avec le contenu dynamique fonctionnel, lance le
serveur PHP intégré à la racine du projet :

```
npm run dev
```

(équivalent à `php -S localhost:8765`), puis ouvre `http://localhost:8765/`.

---

# Connexion Instagram — La Lanterne de Yuna

Voir `php/INSTAGRAM.md` (grille Instagram automatique, hébergement PHP
uniquement, sans Netlify).

---

# Back office — éditer tout le contenu du site

`back-office.html` permet de modifier tout le contenu éditable du site
(présentation, formation/expérience/langues, compétences, outils, projets
CPNV, réseaux sociaux) sans toucher au code, protégé par un login
email + code.

Le contenu est chargé et injecté dans `index.html` au chargement de la
page par `content.js`, à partir de 5 domaines (chacun avec sa propre
fonction Netlify et son propre script PHP, sur le même modèle que
`instagram-posts` ci-dessus) :

| Domaine | Fonction Netlify | Script PHP | Fichier JSON (PHP) |
|---|---|---|---|
| Présentation | `content-presentation.js` | `content-presentation.php` | `data/content-presentation.json` |
| Formation / expérience / langues | `content-timeline.js` | `content-timeline.php` | `data/content-timeline.json` |
| Compétences / outils | `content-skills.js` | `content-skills.php` | `data/content-skills.json` |
| Projets CPNV | `content-cpnv.js` | `content-cpnv.php` | `data/content-cpnv.json` |
| Réseaux sociaux | `content-social.js` | `content-social.php` | `data/content-social.json` |

Chaque domaine expose un GET public (lu par `index.html`) et un POST
protégé (utilisé par `back-office.html`).

## Login du back office

Même principe que l'ancien système : un email fixe et un code modifiable.

- Côté Netlify : `ADMIN_EMAIL` (variable d'environnement, repli codé en
  dur) + code stocké dans Netlify Blobs (`admin-auth`/`credentials`),
  avec repli initial sur `ADMIN_PASSWORD` (variable d'environnement).
- Côté PHP : `ADMIN_EMAIL` / `ADMIN_PASSWORD_DEFAULT` dans `php/config.php`
  + code stocké dans `php/data/credentials.json` une fois changé.

Configure le code initial (`ADMIN_PASSWORD` sur Netlify,
`ADMIN_PASSWORD_DEFAULT` dans `php/config.php`), connecte-toi sur
`back-office.html`, puis change immédiatement le code depuis l'onglet
« Compte ».

## Upload d'images et de documents

Disponible **uniquement sur l'hébergement PHP** (`php/upload-file.php`) :
les fonctions serverless Netlify ne peuvent pas écrire de fichiers disque
persistants. Sur Netlify, le back office détecte automatiquement
l'absence de cette route et masque les champs d'upload (avec un message
l'indiquant) — les chemins d'image/document restent modifiables en texte
libre dans ce cas.

Les fichiers uploadés sont stockés directement dans `Images/` (images) ou
`Documents/` (PDF), avec un nom sécurisé (slug + suffixe aléatoire) et une
validation stricte du type réel du fichier (pas seulement son extension).

---

# Migration vers un hébergement PHP classique (ex: FileZilla / mediamatique.ch)

Le dossier `php/` à la racine du projet contient l'équivalent complet en
PHP de toutes les fonctions Netlify ci-dessus (contenu, login, upload,
Instagram). Utilisable sur n'importe quel hébergement mutualisé qui
exécute PHP.

**`index.html` et `back-office.html` détectent automatiquement** s'ils
tournent sur PHP ou sur Netlify (`content.js` / `back-office.js` testent
les deux backends) — aucune ligne à changer dans le code au moment de la
migration, juste la configuration ci-dessous.

## Étapes pour basculer

1. Ouvre `php/config.php` et renseigne `ADMIN_EMAIL` /
   `ADMIN_PASSWORD_DEFAULT` (code initial du back office, à changer depuis
   `back-office.html` dès la première connexion).
2. Dépose tout le contenu du projet sur le serveur via FileZilla, y compris
   le dossier `php/` en entier (avec `data/.htaccess`).
3. Vérifie que le dossier `php/data/` est accessible en écriture par PHP
   (permissions 755 ou 775 selon l'hébergeur) — c'est là que sont stockés
   le contenu édité et le code admin.
4. Vérifie que `Images/` et `Documents/` sont aussi accessibles en écriture
   si tu comptes utiliser l'upload de fichiers depuis le back office.

**Important — sécurité du dossier `data/`** : le fichier `data/.htaccess`
bloque l'accès direct aux fichiers `.json` (dont `credentials.json`, qui
contient le code admin) via Apache (`mod_authz_core`/`mod_access`). Cette
protection **ne fonctionne pas** avec le serveur de développement intégré
de PHP (`php -S`) utilisé pour les tests en local — uniquement avec un
vrai serveur Apache comme mediamatique.ch. Vérifie après la mise en ligne
qu'une URL comme `https://tonsite/php/data/credentials.json` renvoie bien
une erreur d'accès refusé et non le contenu du fichier.

## Revenir à Netlify

Aucune action nécessaire dans le code : `content.js` et `back-office.js`
retombent automatiquement sur les fonctions Netlify si les scripts PHP ne
répondent pas.
