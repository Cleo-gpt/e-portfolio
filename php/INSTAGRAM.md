# Grille Instagram automatique — La Lanterne de Yuna

Les publications du compte `@la_lanterne_de_yuna` s'affichent toutes seules
sur le site (section Lanterne de Yuna) : chaque nouveau post publié sur
Instagram apparaît sur le site en 5 minutes maximum, sans rien toucher.

Tout tourne sur l'hébergement PHP (ex : mediamatique.ch) — **aucun service
tiers, pas de Netlify, pas de GitHub Actions**. Ne fonctionne pas avec Live
Server : en local, lance `npm run dev` puis ouvre `http://localhost:8765/`.

**Ne mets jamais de mot de passe Instagram ni de token dans le code du site
ou dans un chat.** Le dépôt GitHub est public : le token se colle uniquement
dans le back office.

## Comment ça marche

| Fichier | Rôle |
| --- | --- |
| `instagram-grid.js` + `instagram-grid.css` | Le plug-in : grille de 3 posts, flèches pour naviguer jusqu'au tout premier post, likes / commentaires / vues au survol. |
| `php/instagram-posts.php` | Récupère les posts auprès de l'API Instagram (première page gardée 5 min en cache). |
| `php/instagram-token.php` | Onglet **Instagram** du back office : vérifie et enregistre le token. |
| `php/_instagram.php` | Fonctions communes + **renouvellement automatique** : dès que le token a plus de 7 jours, le site le prolonge de 60 jours à la visite suivante. Il n'expire donc jamais tant que le site reçoit au moins une visite tous les 2 mois. |
| `php/data/instagram-token.json` | Le token (sur le serveur uniquement, jamais dans Git, protégé par `data/.htaccess`). |

## 1. Compte Instagram professionnel

Instagram → Paramètres → Type de compte → passer en compte
**Professionnel** (Créateur ou Entreprise). Pas besoin de Page Facebook.

## 2. Créer l'app Meta et générer le token

1. Va sur https://developers.facebook.com/apps → **Créer une app** →
   cas d'usage **« Gérer les messages et le contenu sur Instagram »**
   (type Entreprise).
2. Dans l'app : **Instagram → Configuration de l'API avec connexion
   Instagram** (*API setup with Instagram login*).
3. Section **« Générer des tokens d'accès »** → **Ajouter un compte** →
   connecte-toi avec `la_lanterne_de_yuna` et accepte les autorisations
   (`instagram_business_basic` et `instagram_business_manage_insights`
   pour afficher les vues des Reels).
4. Clique sur **Générer le token** et copie-le (il commence par `IGAA…`).

## 3. Coller le token dans le back office

1. Ouvre `https://TON-SITE/back-office.html` et connecte-toi.
2. Onglet **Instagram** → colle le token → **Connecter**.
3. Le site vérifie le token auprès d'Instagram et affiche
   « Connecté à @la_lanterne_de_yuna ✓ ». C'est terminé : la grille du site
   affiche maintenant les posts.

Prérequis serveur : le dossier `php/data/` doit être accessible en écriture
par PHP (755 ou 775). Vérifie aussi que
`https://TON-SITE/php/data/instagram-token.json` renvoie bien une erreur
d'accès refusé.

## En cas de problème

- **« Publications indisponibles »** sur le site : ouvre l'onglet Instagram
  du back office pour voir l'état, ou `https://TON-SITE/php/instagram-posts.php`
  pour le message d'erreur exact.
- **Token expiré** (site sans aucune visite pendant plus de 60 jours) :
  refais les étapes 2.4 et 3.
- **Erreur de version d'API** : monte la version dans `IG_API_BASE` en haut
  de `php/_instagram.php`.
