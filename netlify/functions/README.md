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
