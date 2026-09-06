# Connexion Instagram — La Lanterne de Yuna

Cette fonction (`instagram-posts.js`, et son équivalent PHP
`php/instagram-posts.php`) sert les dernières publications du compte
Instagram professionnel `la_lanterne_de_yuna` au site.

Elle passe par **Behold.so** (https://behold.so), un service gratuit qui se
connecte une fois à ton compte Instagram et gère lui-même le renouvellement
du token à ta place — plus besoin de régénérer quoi que ce soit tous les
~60 jours comme avec l'API Instagram Graph en direct. Ton site appelle
juste une URL JSON publique fournie par Behold.

**Important : ne mets jamais de mot de passe Instagram dans le code du site
ou dans un chat.** La connexion à Instagram se fait uniquement via
l'interface officielle de Behold.

## 1. Compte Instagram professionnel

1. Instagram → Paramètres → Compte → vérifier que le compte est en mode
   Professionnel (Créateur ou Entreprise). Behold ne demande pas de Page
   Facebook liée.

## 2. Créer le feed sur Behold.so

1. Va sur https://behold.so et crée un compte gratuit.
2. Crée un nouveau feed et connecte-le au compte Instagram
   `la_lanterne_de_yuna` (Behold ouvre le flux d'autorisation Instagram
   officiel — aucun mot de passe ne transite par un tiers).
3. Dans les réglages du feed, ouvre l'onglet **JSON Feed** et copie l'URL
   fournie (ex: `https://feeds.behold.so/xxxxxxxxxxxx`).

Le plan gratuit affiche jusqu'à 6 posts et se met à jour environ une fois
par jour — largement suffisant pour cet usage, et Behold renouvelle le
token Instagram tout seul en arrière-plan.

## 3. Déployer sur Netlify

1. Crée un compte gratuit sur https://netlify.com et relie ce dossier de
   projet (par Git, ou glisser-déposer pour un déploiement manuel).
2. Une fois le site créé : **Site settings → Environment variables**,
   ajoute :
   - `BEHOLD_FEED_URL` = l'URL JSON copiée à l'étape 2.3
3. Redéploie le site pour que la variable soit prise en compte.

La fonction sera alors disponible à `/.netlify/functions/instagram-posts`
et le site ira automatiquement chercher les nouvelles publications à chaque
chargement de page — plus besoin de mettre à jour un tableau à la main, ni
de jamais retoucher à un token.

## 4. Sur un hébergement PHP (ex: mediamatique.ch)

Renseigne la même URL dans `php/config.php` (constante `BEHOLD_FEED_URL`)
— voir la section dédiée plus bas dans ce document.

## 5. Sécurité

- L'URL du feed Behold est publique par nature (elle ne fait que lire tes
  posts déjà publics) : pas besoin de la traiter comme un secret, mais
  évite quand même de la republier inutilement ailleurs.

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
  vers le feed Behold.so), avec l'URL du feed dans `config.php` au lieu
  d'une variable d'environnement Netlify.

Utilisable sur n'importe quel hébergement mutualisé qui exécute PHP.

**`index.html` et `admin.html` pointent déjà vers ces fichiers PHP**
(`/php/skills.php` et `/php/instagram-posts.php`) — aucune ligne à changer
dans le code au moment de la migration, juste la configuration ci-dessous.

## Étapes pour basculer

1. Ouvre `php/config.php` et renseigne :
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD_DEFAULT` (ce dernier ne sert que tant
     qu'aucun code n'a encore été changé depuis `admin.html`).
   - `BEHOLD_FEED_URL` (voir la procédure de création plus haut dans ce
     document) — sans cette valeur, la section Instagram affichera une
     erreur.
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
