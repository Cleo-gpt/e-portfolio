# Connexion Instagram — La Lanterne de Yuna (hébergement PHP)

`php/instagram-posts.php` sert les 9 dernières publications du compte
Instagram professionnel `la_lanterne_de_yuna` au site, via l'API Instagram
Graph en direct, avec un token renouvelé **automatiquement tous les ~45
jours par GitHub Actions** — zéro maintenance manuelle une fois configuré,
et sans dépendre d'un service tiers comme Behold.so.

**Important : ne mets jamais de mot de passe Instagram, de token, ni de
secret dans le code du site ou dans un chat.** Le token et les secrets de
ce système ne doivent exister que dans `php/secrets.php` (non versionné)
et dans les GitHub Secrets du dépôt.

## Comment ça marche

1. Le token Instagram vit uniquement dans `php/data/instagram-token.json`
   sur ton serveur (protégé par `data/.htaccess`, jamais accessible
   publiquement).
2. Tous les 45 jours, le workflow `.github/workflows/refresh-instagram-token.yml`
   se déclenche automatiquement : il lit le token actuel sur ton serveur,
   demande à Meta de le rafraîchir (`refresh_access_token`, qui prolonge sa
   validité de 60 jours sans redemander d'autorisation), puis renvoie le
   nouveau token à ton serveur — qui l'enregistre.
3. `instagram-posts.php` lit ce token à chaque affichage du site.

Le token n'est **jamais** stocké dans Git ni visible publiquement : seul
un secret dédié (différent du token) protège les échanges entre GitHub
Actions et ton serveur.

## 1. Compte Instagram professionnel + Page Facebook

1. Instagram → Paramètres → Compte → vérifier que le compte est en mode
   Professionnel (Créateur ou Entreprise).
2. Ce compte doit être lié à une Page Facebook (Paramètres → Compte lié).

## 2. Créer l'app Meta for Developers et le premier token

1. Va sur https://developers.facebook.com/apps, connecte-toi avec le
   compte Facebook lié à ta Page, crée une app (type **Autre** →
   **Entreprise**), puis ajoute le produit **Instagram Graph API**.
2. Via le **Graph API Explorer**
   (https://developers.facebook.com/tools/explorer/), génère un token
   d'accès utilisateur avec les permissions `instagram_basic`,
   `pages_show_list`, `pages_read_engagement`.
3. Récupère l'**ID Instagram Business** (`GET /me/accounts` → id de la
   Page → `GET /{page-id}?fields=instagram_business_account`).
4. Échange le token court contre un token longue durée (~60 jours) :
   ```
   GET https://graph.facebook.com/v21.0/oauth/access_token
     ?grant_type=fb_exchange_token
     &client_id={app-id}
     &client_secret={app-secret}
     &fb_exchange_token={token-court}
   ```

## 3. Configurer le serveur PHP

1. Copie `php/secrets.example.php` en `php/secrets.php` sur ton serveur
   (ce fichier ne doit jamais être commité — il est déjà dans
   `.gitignore`).
2. Génère un secret aléatoire long : `openssl rand -hex 32`, et mets cette
   valeur dans `php/secrets.php` (`INSTAGRAM_TOKEN_UPDATE_SECRET`).
3. Dépose le token initial sur le serveur avec une requête `curl` (à faire
   une seule fois, depuis ton ordinateur) :
   ```
   curl -X POST https://tonsite/php/update-instagram-token.php \
     -H "Content-Type: application/json" \
     -H "X-Update-Secret: LE_SECRET_GENERE_A_L_ETAPE_2" \
     -d '{"access_token":"LE_TOKEN_LONGUE_DUREE","ig_user_id":"L_ID_RECUPERE_ETAPE_2.3"}'
   ```

## 4. Configurer GitHub Actions

Dans le dépôt GitHub du projet : **Settings → Secrets and variables →
Actions**, ajoute deux secrets :

- `INSTAGRAM_TOKEN_UPDATE_URL` = `https://tonsite/php/update-instagram-token.php`
- `INSTAGRAM_TOKEN_UPDATE_SECRET` = exactement la même valeur que dans
  `php/secrets.php`

Le workflow tourne automatiquement tous les 1er et 16 du mois. Tu peux
aussi le déclencher manuellement depuis l'onglet **Actions** du dépôt
(bouton « Run workflow ») pour vérifier que tout fonctionne sans attendre.

## 5. Sécurité

- `php/secrets.php` et le fichier `data/instagram-token.json` ne doivent
  **jamais** être commités ni partagés — le dépôt GitHub de ce projet est
  public.
- Si le secret `INSTAGRAM_TOKEN_UPDATE_SECRET` a été exposé accidentellement
  quelque part, régénère-en un nouveau et mets-le à jour aux deux endroits
  (GitHub Secrets + `php/secrets.php`).

---

# Alternative : Behold.so (sur Netlify, ou en secours)

Le dossier contient aussi un chemin plus simple pour Netlify, où GitHub
Actions n'a pas accès au serveur pour déposer un token : **Behold.so**
(https://behold.so) se connecte une fois à Instagram et gère le
renouvellement à sa place, en échange d'une limite de 6 posts sur son plan
gratuit (au lieu de 9).

1. Va sur https://behold.so, crée un compte gratuit, connecte le compte
   Instagram `la_lanterne_de_yuna`.
2. Dans les réglages du feed, onglet **JSON Feed**, copie l'URL
   (`https://feeds.behold.so/xxxxxxxxxxxx`).
3. Sur Netlify : **Site settings → Environment variables**, ajoute
   `BEHOLD_FEED_URL` = cette URL, puis redéploie.

`netlify/functions/instagram-posts.js` utilise cette variable — voir son
code source pour le détail.

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

1. Ouvre `php/config.php` et renseigne :
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD_DEFAULT` (code initial du back
     office, à changer depuis `back-office.html` dès la première
     connexion).
   - `BEHOLD_FEED_URL` (voir la procédure de création plus haut) — sans
     cette valeur, la section Instagram affichera une erreur.
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
