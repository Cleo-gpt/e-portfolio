# E-portefolio de Cléo Ana Forclaz

Site statique (HTML / CSS / JavaScript) avec un petit back office en PHP.
Il tourne sur n'importe quel hébergement qui exécute PHP (ex :
mediamatique.ch) et ne dépend d'aucun service tiers.

## Lancer le site en local

Le contenu du site (photo de présentation, projets CPNV, compétences,
réseaux sociaux, posts Instagram) n'est **pas** écrit en dur dans
`index.html` : il est chargé au chargement de la page par `content.js`, qui
appelle `/php/content-*.php`.

**Live Server (l'extension VS Code) ne fait pas tourner PHP** : le site
s'affiche alors avec une copie de secours du contenu (voir `FALLBACK_DATA`
dans `content.js`), et ni le back office ni la grille Instagram ne
fonctionnent.

Pour tout avoir en local, lance le serveur PHP à la racine du projet :

```
npm run dev
```

(équivalent à `php -S localhost:8765`), puis ouvre `http://localhost:8765/`.

## Organisation

| Fichier / dossier | Rôle |
|---|---|
| `index.html`, `style.css` | La page publique et son style (identité visuelle CF). |
| `ciel.js` | Ciel étoilé animé en fond de page + bouton « retour en haut ». |
| `site.js` | Pop up de connexion, carrousel RetroMania et grille Instagram de la page publique. |
| `content.js` | Charge le contenu éditable et l'injecte dans la page. |
| `instagram-grid.js`, `instagram-grid.css` | Grille Instagram de La Lanterne de Yuna (voir `php/INSTAGRAM.md`). |
| `back-office.html`, `back-office.js` | Back office pour modifier le contenu sans toucher au code. |
| `php/` | Scripts PHP : contenu, login, upload, Instagram. Les fonctions communes sont dans `php/_commun.php`, le login dans `php/_auth.php`. |
| `php/data/` | Contenu édité (`content-*.json`), code admin et token Instagram. |
| `Images/identite-visuelle-cf/` | Logo CF et carpes koï (SVG) utilisés par le site. |
| `Images/videos/` | Vidéos compressées en 720p, rangées par catégorie (marketing, multimédias, culture générale). |
| `Images/miniatures-videos/` | Miniatures de toutes les vidéos (YouTube et locales). |
| `fonts/` | Polices du site : Dustismo (texte) et Jura (chiffres). |

## Back office

`back-office.html` permet de modifier tout le contenu éditable du site,
protégé par un login email + code. Chaque domaine a son script PHP, avec
un GET public (lu par `index.html`) et un POST protégé (utilisé par le
back office) :

| Domaine | Script PHP | Fichier JSON |
|---|---|---|
| Présentation | `php/content-presentation.php` | `php/data/content-presentation.json` |
| Formation / expérience / langues | `php/content-timeline.php` | `php/data/content-timeline.json` |
| Compétences / outils | `php/content-skills.php` | `php/data/content-skills.json` |
| Projets CPNV | `php/content-cpnv.php` | `php/data/content-cpnv.json` |
| Réseaux sociaux | `php/content-social.php` | `php/data/content-social.json` |

### Login

Un email fixe et un code modifiable : `ADMIN_EMAIL` et
`ADMIN_PASSWORD_DEFAULT` dans `php/config.php`. Une fois le code changé
depuis l'onglet « Compte » du back office, il est stocké dans
`php/data/credentials.json` et `ADMIN_PASSWORD_DEFAULT` n'est plus utilisé.

### Upload d'images et de documents

`php/upload-file.php` stocke les fichiers dans `Images/` (images) ou
`Documents/` (PDF), avec un nom sécurisé (slug + suffixe aléatoire) et une
vérification du type réel du fichier, pas seulement de son extension.

### Instagram

L'onglet « Instagram » du back office connecte la grille de La Lanterne de
Yuna. Procédure complète : `php/INSTAGRAM.md`.

## Mise en ligne (FileZilla)

1. Ouvre `php/config.php` et renseigne `ADMIN_EMAIL` /
   `ADMIN_PASSWORD_DEFAULT` (code initial du back office, à changer depuis
   `back-office.html` dès la première connexion).
2. Dépose tout le contenu du projet sur le serveur, y compris le dossier
   `php/` en entier (avec `data/.htaccess`).
3. Vérifie que `php/data/` est accessible en écriture par PHP (permissions
   755 ou 775 selon l'hébergeur) : c'est là que sont stockés le contenu
   édité, le code admin et le token Instagram.
4. Vérifie que `Images/` et `Documents/` sont aussi accessibles en écriture
   si tu utilises l'upload de fichiers depuis le back office.

**Sécurité du dossier `php/data/`** : le fichier `data/.htaccess` bloque
l'accès direct aux fichiers `.json` (dont `credentials.json`, qui contient
le code admin) sur un serveur Apache. Cette protection **ne fonctionne
pas** avec le serveur de test `php -S`. Après la mise en ligne, vérifie
qu'une adresse comme `https://tonsite/php/data/credentials.json` renvoie
bien une erreur d'accès refusé et non le contenu du fichier.
