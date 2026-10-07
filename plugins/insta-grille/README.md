# InstaGrille — grille Instagram automatique

Plug-in interne en HTML / CSS / JavaScript pur (aucune dépendance, aucun
PHP, aucun service externe) qui affiche **toutes** les publications d'un
compte Instagram dans une grille de carrés, comme sur un profil Instagram.

- 3 colonnes sur ordinateur, 2 sur téléphone, 1 sur très petit écran.
- Images parfaitement carrées (`object-fit: cover`).
- Au survol : likes et commentaires si la source les fournit, sinon
  « Voir sur Instagram ».
- Au clic : la publication s'ouvre sur Instagram dans un nouvel onglet.
- Icône en haut à droite pour les vidéos et les carrousels.

## Comment ça marche sur le portfolio

```
Instagram ──(API officielle, toutes les heures)──► robot GitHub Actions
                                                     │
              Images/instagram/*.jpg  ◄──────────────┤  télécharge les images
              instagram-posts.js      ◄──────────────┤  réécrit la liste
                                                     │
              mediamatique.ch         ◄──(FTP)───────┘  envoie ces fichiers
```

1. `.github/workflows/instagram.yml` lance `scripts/instagram-sync.mjs`
   toutes les heures.
2. Le script récupère **toutes** les publications du compte, enregistre
   l'image de chaque nouvelle publication dans `Images/instagram/` (les
   adresses d'images d'Instagram expirent, celles-ci non), retire celles des
   posts supprimés, et réécrit `instagram-posts.js`.
3. S'il y a du nouveau, le robot commite ces fichiers et les envoie sur le
   site par FTP.
4. La page lit `instagram-posts.js` et la grille s'affiche : c'est l'option A
   (liste dans le site), mais remplie automatiquement.

Le token Instagram n'apparaît jamais en clair : il est rangé chiffré dans
`.github/instagram-token.enc`, et le robot le prolonge de 60 jours chaque
semaine. Il n'y a plus rien à faire une fois la mise en place terminée.

## Mise en place (une seule fois, environ 15 minutes)

### 1. Créer le token Instagram

1. Instagram → Paramètres → Type de compte → passe le compte en compte
   **professionnel** (Créateur ou Entreprise).
2. Va sur https://developers.facebook.com/apps → **Créer une app** → cas
   d'usage **« Gérer les messages et le contenu sur Instagram »**.
3. Dans l'app : **Instagram → Configuration de l'API avec connexion
   Instagram** → section **« Générer des tokens d'accès »** → **Ajouter un
   compte** → connecte-toi avec le compte (ex : `la_lanterne_de_yuna`).
4. Clique sur **Générer le token** et copie-le (il commence par `IGAA…`).

**Ne colle jamais ce token dans le code ni dans un chat** : le dépôt GitHub
est public. Il va uniquement dans les secrets GitHub (étape suivante).

### 2. Ajouter les secrets sur GitHub

Dépôt GitHub → **Settings → Secrets and variables → Actions → New
repository secret**, et ajoute :

| Secret | Valeur |
|---|---|
| `INSTAGRAM_TOKEN` | le token `IGAA…` de l'étape 1 |
| `INSTAGRAM_TOKEN_KEY` | une phrase secrète d'au moins 16 caractères, inventée par toi (elle chiffre le token ; ne la change plus ensuite) |
| `FTP_SERVEUR` | l'adresse du serveur FTP (celle de FileZilla, ex : `ftp.mediamatique.ch`) |
| `FTP_UTILISATEUR` | ton identifiant FTP |
| `FTP_MOT_DE_PASSE` | ton mot de passe FTP |
| `FTP_DOSSIER` | le dossier du site sur le serveur, tel que FileZilla l'affiche à droite (ex : `/public_html`). Vide = dossier de connexion |

Sans les secrets FTP, le robot met quand même le dépôt à jour, mais il
faudra envoyer `instagram-posts.js` et `Images/instagram/` toi-même avec
FileZilla.

### 3. Lancer le robot une première fois

Dépôt GitHub → onglet **Actions** → **Publications Instagram** → **Run
workflow**. Au bout d'une minute, le run doit être vert : la grille du site
affiche tes publications. Ensuite, il tourne tout seul toutes les heures.

## En cas de problème

- **Le run est rouge** : clique dessus, le message dit ce qui manque
  (secret absent, token refusé…).
- **Token expiré** (robot arrêté plus de 60 jours) : refais l'étape 1, mets
  le nouveau token dans `INSTAGRAM_TOKEN`, supprime le fichier
  `.github/instagram-token.enc` du dépôt, puis relance le robot.
- **GitHub a désactivé le robot** : GitHub suspend les tâches planifiées
  d'un dépôt public sans activité pendant 60 jours et envoie un e-mail. Un
  clic sur **Enable workflow** (onglet Actions) le relance.

## Fichiers du plug-in

| Fichier | Rôle |
|---|---|
| `insta-grille.js` | Le plug-in : lit les publications et construit la grille. |
| `insta-grille.css` | Le style (CSS Grid, variables pour l'adapter à un site). |
| `posts.js` | Exemple de liste de publications au format du plug-in. |
| `exemple-flux.json` | Exemple de flux au format Behold (voir plus bas). |
| `demo.html` | Page de démonstration. |

## Intégrer la grille dans une page

```html
<link rel="stylesheet" href="plugins/insta-grille/insta-grille.css">

<ul id="grille-instagram" aria-label="Publications Instagram"></ul>

<script src="plugins/insta-grille/insta-grille.js"></script>
<script src="instagram-posts.js"></script>
<script>
    InstaGrille.monter('#grille-instagram', { posts: window.INSTA_POSTS || [] });
</script>
```

Format d'une publication (seuls `image` et `lien` sont obligatoires) :

```js
{
    image: 'Images/instagram/123.jpg',            // chemin vu depuis la page
    lien: 'https://www.instagram.com/p/XXXX/',    // lien du post
    legende: 'Texte du post',                     // texte alternatif
    likes: 120, commentaires: 8,                  // facultatif
    type: 'image' | 'video' | 'carrousel',        // facultatif (icône)
    date: '2026-09-30T10:00:00+0000'              // facultatif (tri)
}
```

### Adapter le style

Redéfinis les variables sur la grille, par exemple :

```css
#grille-instagram {
    --ig-espace: 10px;      /* espace entre les images */
    --ig-arrondi: 12px;     /* coins arrondis */
    --ig-voile: rgba(32, 26, 119, 0.6);
}
```

La classe `insta-grille--sombre` donne un exemple prêt à l'emploi pour un
fond sombre.

## Autres sources possibles

Au lieu d'une liste, `source` accepte l'adresse d'un flux JSON :

```js
InstaGrille.monter('#grille-instagram', {
    source: 'https://feeds.behold.so/AbCdEf123',
    posts: window.INSTA_POSTS   // complète le flux, et le remplace s'il ne répond pas
});
```

Le plug-in reconnaît tout seul le format de **Behold.so** et celui de l'**API
Instagram Graph**. Behold est gratuit mais limité (6 derniers posts, mis à
jour une fois par jour, 1 200 affichages par mois — voir
https://behold.so/pricing) ; avec une liste en complément, la grille fusionne
les deux sans doublon.

Récupérer directement la page publique d'Instagram (« bypass ») est contraire
aux conditions d'Instagram et casse dès qu'Instagram change son site : à
éviter.
