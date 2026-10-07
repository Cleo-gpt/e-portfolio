/* ==========================================================================
   OPTION A — Publications collées à la main
   --------------------------------------------------------------------------
   Pour ajouter une publication :
     1. Sur Instagram, ouvre le post → "…" → "Copier le lien".
     2. Enregistre son image dans un dossier du site (ex : Images/instagram/)
        plutôt que d'utiliser l'adresse de l'image donnée par Instagram :
        ces adresses expirent au bout de quelques jours.
     3. Ajoute un objet en HAUT de la liste (le plus récent en premier).

   Champs : image + lien obligatoires ; legende, likes, commentaires, type
   ("image", "video" ou "carrousel") et date facultatifs.
   Sans likes ni commentaires, le survol affiche "Voir sur Instagram".

   Ce fichier est un simple script (pas un .json) pour que la grille marche
   aussi en ouvrant la page en double-clic, sans serveur.
   ========================================================================== */

window.INSTA_POSTS = [
    {
        image: '../../Images/intro-videos/Minia 1.png',
        lien: 'https://www.instagram.com/p/DQpdpc6jAtp/',
        legende: 'Vidéo RetroMania — réservation des tables pour les vendeurs',
        type: 'video'
    },
    {
        image: '../../Images/intro-videos/Minia 2.png',
        lien: 'https://www.instagram.com/p/DRfgm_Gjtaa/',
        legende: 'Vidéo RetroMania — réservation des tables pour les artistes',
        type: 'video'
    },
    {
        image: '../../Images/intro-videos/Minia 3.png',
        lien: 'https://www.instagram.com/p/DI26sShhKiM/',
        legende: 'Short RetroMania',
        type: 'video'
    }
    // Exemple avec les statistiques (à recopier au-dessus, avec tes vrais chiffres) :
    // {
    //     image: '../../Images/instagram/mon-post.jpg',
    //     lien: 'https://www.instagram.com/p/XXXXXXXXXXX/',
    //     legende: 'Ma dernière illustration',
    //     likes: 128,
    //     commentaires: 9,
    //     type: 'carrousel',
    //     date: '2026-10-01'
    // }
];
