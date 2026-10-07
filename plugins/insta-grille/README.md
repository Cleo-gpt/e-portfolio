# InstaGrille — grille Instagram légère

Plug-in interne en HTML / CSS / JavaScript pur (aucune dépendance, aucun
PHP) qui affiche les publications d'un compte Instagram dans une grille de
carrés, comme sur un profil Instagram.

- 3 colonnes sur ordinateur, 2 sur téléphone, 1 sur très petit écran.
- Images parfaitement carrées (`object-fit: cover`).
- Au survol : likes et commentaires si la source les fournit, sinon
  « Voir sur Instagram ».
- Au clic : la publication s'ouvre sur Instagram dans un nouvel onglet.
- Icône en haut à droite pour les vidéos et les carrousels.

## Fichiers

| Fichier | Rôle |
|---|---|
| `insta-grille.js` | Le plug-in : lit les publications et construit la grille. |
| `insta-grille.css` | Le style (CSS Grid, variables pour l'adapter à un site). |
| `posts.js` | Publications collées à la main (option A, ou complément de l'option B). |
| `exemple-flux.json` | Exemple de flux au format Behold, pour tester la démo. |
| `demo.html` | Page de démonstration. |

## Option B — flux dynamique avec Behold.so (recommandé)

Behold se connecte à ton compte Instagram, garde le token secret de son
côté et te donne une adresse de flux JSON publique que la grille lit
directement. Rien à renouveler, rien à héberger.

### Mise en place (une seule fois)

1. Passe ton compte Instagram en compte **professionnel** (Créateur ou
   Entreprise) : Paramètres → Type de compte.
2. Crée un compte gratuit sur https://behold.so.
3. **Add source** → connecte ton compte Instagram.
4. **Add feed** → choisis **JSON** comme type de flux.
5. Copie l'adresse du flux (du type `https://feeds.behold.so/AbCdEf123`).
6. Colle-la dans la page, à la place de `exemple-flux.json` :

```js
InstaGrille.monter('#grille-instagram', {
    source: 'https://feeds.behold.so/AbCdEf123',
    posts: window.INSTA_POSTS   // complément : posts plus anciens (facultatif)
});
```

### Limites du plan gratuit

Le plan gratuit donne **les 6 dernières publications**, **mises à jour une
fois par jour**, avec **1 200 affichages par mois** (vérifie sur
https://behold.so/pricing, les offres peuvent changer). Les plans payants
vont jusqu'à 150 posts et une mise à jour toutes les 5 minutes.

Pour afficher **tous** tes posts avec le plan gratuit, mets les plus
anciens dans `posts.js` : la grille montre d'abord les posts récents du
flux, puis complète avec ceux de `posts.js`, sans doublon.

Si le flux ne répond pas (panne, quota dépassé, page ouverte en
double-clic), la grille affiche seulement les posts de `posts.js`.

## Option A — publications collées à la main

Sans flux, la grille marche avec `posts.js` seul :

```js
InstaGrille.monter('#grille-instagram', { posts: window.INSTA_POSTS });
```

Pour chaque publication : copie son lien sur Instagram, enregistre son
image dans le site (les adresses d'images d'Instagram expirent au bout de
quelques jours), puis ajoute-la en haut de la liste dans `posts.js`.

## Autres sources possibles

`source` accepte n'importe quelle adresse qui renvoie du JSON. Le plug-in
reconnaît tout seul ces formats :

- **Behold.so** (`{ posts: [...] }`, champs `permalink`, `sizes`, `mediaType`…) ;
- **API Instagram Graph** (`{ data: [...] }`, champs `permalink`, `media_url`,
  `like_count`, `comments_count`…) — par exemple un fichier généré par un
  script ou une GitHub Action qui interroge l'API avec ton token ;
- l'ancien script **`php/instagram-posts.php`** du portfolio ;
- le format du plug-in (`image`, `lien`, `legende`, `likes`, `commentaires`,
  `type`, `date`).

RSS.app sait aussi créer un flux depuis un compte Instagram, mais
uniquement sur ses offres payantes. Récupérer directement la page publique
d'Instagram (« bypass ») est contraire aux conditions d'Instagram et casse
dès qu'Instagram change son site : à éviter.

## Intégrer la grille dans une page

```html
<link rel="stylesheet" href="plugins/insta-grille/insta-grille.css">

<ul id="grille-instagram" aria-label="Publications Instagram"></ul>

<script src="plugins/insta-grille/insta-grille.js"></script>
<script src="plugins/insta-grille/posts.js"></script>
<script>
    InstaGrille.monter('#grille-instagram', {
        source: 'https://feeds.behold.so/AbCdEf123',
        posts: window.INSTA_POSTS
    });
</script>
```

Dans `posts.js`, les chemins d'images sont relatifs **à la page** qui
affiche la grille (ceux de l'exemple partent de `plugins/insta-grille/`).

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
