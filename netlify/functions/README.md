# Connexion Instagram — La Lanterne de Yuna

Cette fonction (`instagram-posts.js`) sert les 9 dernières publications du
compte Instagram professionnel `la_lanterne_de_yuna` au site, sans jamais
exposer de token dans le code ou le navigateur.

**Important : ne mets jamais de mot de passe Instagram ni de token dans le
code du site ou dans un chat.** Les identifiants ne s'utilisent que via les
pages officielles Meta / Netlify ci-dessous.

## 1. Compte Instagram professionnel + Page Facebook

1. Instagram → Paramètres → Compte → vérifier que le compte est en mode
   Professionnel (Créateur ou Entreprise).
2. Ce compte doit être lié à une Page Facebook (Paramètres → Compte lié).
   Si tu n'as pas de Page, crée-en une (gratuit, quelques clics).

## 2. Créer l'app Meta for Developers

1. Va sur https://developers.facebook.com/apps et connecte-toi avec le
   compte Facebook lié à ta Page.
2. « Créer une app » → type **Autre** → **Entreprise**.
3. Dans le tableau de bord de l'app, ajoute le produit **Instagram Graph
   API** (ou « Instagram » selon la version de l'interface).
4. Dans les paramètres de l'app, ajoute ton compte comme testeur/utilisateur
   si demandé (mode développement suffit pour un usage personnel).

## 3. Récupérer l'ID Instagram Business et le token

1. Ouvre l'outil **Graph API Explorer** :
   https://developers.facebook.com/tools/explorer/
2. Sélectionne ton app dans le menu déroulant.
3. « Générer un token d'accès utilisateur », coche les permissions :
   - `instagram_basic`
   - `pages_show_list`
   - `pages_read_engagement`
4. Autorise l'accès à ton compte Instagram quand demandé.
5. Récupère l'**ID Instagram Business** :
   requête `GET /me/accounts` → note l'`id` de ta Page, puis
   `GET /{page-id}?fields=instagram_business_account` → c'est l'`id`
   retourné qui est ton `IG_USER_ID`.
6. Le token généré à l'étape 3 est un token court (~1h). Échange-le contre
   un **token longue durée** (~60 jours) :
   ```
   GET https://graph.facebook.com/v21.0/oauth/access_token
     ?grant_type=fb_exchange_token
     &client_id={app-id}
     &client_secret={app-secret}
     &fb_exchange_token={token-court}
   ```
   Le `access_token` renvoyé est ton `IG_ACCESS_TOKEN`.

Ce token expire tous les ~60 jours : il faudra répéter l'étape 6
périodiquement (ou automatiser un renouvellement, à voir plus tard si
besoin).

## 4. Déployer sur Netlify

1. Crée un compte gratuit sur https://netlify.com et relie ce dossier de
   projet (par Git, ou glisser-déposer pour un déploiement manuel).
2. Une fois le site créé : **Site settings → Environment variables**,
   ajoute :
   - `IG_USER_ID` = l'ID récupéré à l'étape 3.5
   - `IG_ACCESS_TOKEN` = le token longue durée de l'étape 3.6
3. Redéploie le site pour que les variables soient prises en compte.

La fonction sera alors disponible à `/.netlify/functions/instagram-posts`
et le site ira automatiquement chercher les nouvelles publications à chaque
chargement de page — plus besoin de mettre à jour un tableau à la main.

## 5. Sécurité

- Ne commite jamais `IG_ACCESS_TOKEN` dans le code ou un fichier versionné.
- Si ce token a été partagé accidentellement quelque part, régénère-le
  immédiatement depuis le Graph API Explorer.

---

# Administration — Maîtrise des logiciels

La fonction `skills.js` stocke les niveaux affichés dans la section
« Maîtrise des logiciels » de l'E-portefolio, dans un store **Netlify
Blobs** partagé par tous les visiteurs du site. La page `admin.html`
permet de modifier ces niveaux avec des curseurs, protégée par mot de
passe.

## Configurer le mot de passe admin

1. Sur Netlify : **Site settings → Environment variables**.
2. Ajoute une variable `ADMIN_PASSWORD` = le mot de passe de ton choix.
3. Redéploie le site.

Sans cette variable configurée, la page admin refuse toute modification
(l'API renvoie une erreur 500) — c'est volontaire, pour ne jamais
autoriser d'écriture avec un mot de passe par défaut.

**Ne mets jamais ce mot de passe dans le code du site.** Il ne doit
exister que dans les variables d'environnement Netlify.

## Utilisation

1. Ouvre `admin.html` (ex: `https://tonsite.netlify.app/admin.html`).
2. Entre le mot de passe configuré ci-dessus.
3. Ajuste les curseurs par catégorie (Adobe, Google, Microsoft, Autres).
4. Clique sur **Enregistrer** : le changement est immédiatement visible
   par tous les visiteurs de l'E-portefolio, sans qu'ils aient besoin de
   faire quoi que ce soit.

`Netlify Blobs` est disponible nativement dans les fonctions Netlify —
aucun compte ni service tiers à configurer en plus.

---

# Migration vers un hébergement PHP classique (ex: FileZilla / mediamatique.ch)

Le dossier `php/` à la racine du projet contient l'équivalent complet en
PHP des deux fonctions Netlify ci-dessus :

- `skills.php` -> équivalent de `skills.js` (login email + code, changement
  de code, sauvegarde des niveaux de compétences), stocké dans de simples
  fichiers JSON au lieu de Netlify Blobs.
- `instagram-posts.php` -> équivalent de `instagram-posts.js` (proxy public
  vers l'API Instagram Graph), avec les identifiants dans `config.php` au
  lieu des variables d'environnement Netlify.

Utilisable sur n'importe quel hébergement mutualisé qui exécute PHP.

**`index.html` et `admin.html` pointent déjà vers ces fichiers PHP**
(`/php/skills.php` et `/php/instagram-posts.php`) — aucune ligne à changer
dans le code au moment de la migration, juste la configuration ci-dessous.

## Étapes pour basculer

1. Ouvre `php/config.php` et renseigne :
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD_DEFAULT` (ce dernier ne sert que tant
     qu'aucun code n'a encore été changé depuis `admin.html`).
   - `IG_USER_ID` / `IG_ACCESS_TOKEN` (voir la procédure d'obtention plus
     haut dans ce document) — sans ces valeurs, la section Instagram
     affichera une erreur.
2. Dépose tout le contenu du projet sur le serveur via FileZilla, y compris
   le dossier `php/` avec ses sous-fichiers (`config.php`, `skills.php`,
   `instagram-posts.php`, `data/.htaccess`).
3. Vérifie que le dossier `php/data/` est accessible en écriture par PHP
   (permissions 755 ou 775 selon l'hébergeur).
4. Si `php/` n'est pas déployé à la racine du site, adapte les chemins
   `/php/skills.php` et `/php/instagram-posts.php` dans `index.html` et
   `admin.html` en conséquence.
5. Ouvre `admin.html` sur le nouveau serveur, connecte-toi avec le code par
   défaut défini à l'étape 1, puis change immédiatement le code depuis la
   section "Changer le code de connexion".

Le dossier `data/` contient un `.htaccess` qui bloque tout accès direct
aux fichiers `.json` depuis le navigateur — ne le supprime pas.

## Revenir à Netlify

Pour redéployer sur Netlify, remets `/.netlify/functions/skills` et
`/.netlify/functions/instagram-posts` dans `index.html` et `admin.html` à
la place des chemins `/php/...`.
