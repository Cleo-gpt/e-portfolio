/* ==========================================================================
   InstaGrille — grille Instagram légère, en JavaScript pur (sans dépendance)
   --------------------------------------------------------------------------
   Affiche une liste de publications Instagram dans une grille de carrés.
   Chaque image ouvre la publication sur Instagram dans un nouvel onglet.

   Deux façons de lui donner les publications :

   1) OPTION A — tableau collé à la main (voir posts.js) :
        InstaGrille.monter('#ma-grille', { posts: INSTA_POSTS });

   2) OPTION B — adresse d'un fichier ou d'un flux JSON (voir le README) :
        InstaGrille.monter('#ma-grille', { source: 'https://…/posts.json' });

   Format d'une publication (seuls "image" et "lien" sont obligatoires) :
        {
            image: 'Images/instagram/mon-post.jpg',   // URL de l'image
            lien: 'https://www.instagram.com/p/XXXX/', // lien du post
            legende: 'Texte du post',                  // texte alternatif
            likes: 120,                                // optionnel
            commentaires: 8,                           // optionnel
            type: 'image' | 'video' | 'carrousel',     // optionnel (icône)
            date: '2026-09-30'                         // optionnel (tri)
        }

   Si likes et commentaires sont absents, le survol affiche simplement
   "Voir sur Instagram" : aucun chiffre inventé.
   ========================================================================== */

(function (global) {
    'use strict';

    const SVG_NS = 'http://www.w3.org/2000/svg';

    // Tracés des icônes (style Instagram), dessinés dans un carré 24×24.
    const ICONES = {
        coeur: 'M12 21s-6.7-4.35-9.5-8.05C.6 10.4 1.5 6.3 5 5.1c2.1-.7 4.1.2 5.4 1.9L12 9l1.6-2c1.3-1.7 3.3-2.6 5.4-1.9 3.5 1.2 4.4 5.3 2.5 7.85C18.7 16.65 12 21 12 21z',
        bulle: 'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z',
        sortie: 'M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14V3zM5 5h6v2H5v12h12v-6h2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
        video: 'M5 3l15 9-15 9V3z',
        carrousel: 'M8 3h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-5 5h1v11a1 1 0 0 0 1 1h11v1H5a2 2 0 0 1-2-2V8z'
    };

    // Crée une petite icône SVG (sans innerHTML, donc sans risque d'injection).
    function icone(nom, classe) {
        const svg = document.createElementNS(SVG_NS, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('aria-hidden', 'true');
        if (classe) svg.setAttribute('class', classe);
        const chemin = document.createElementNS(SVG_NS, 'path');
        chemin.setAttribute('d', ICONES[nom]);
        svg.appendChild(chemin);
        return svg;
    }

    // 1234 → "1,2 k", 1250000 → "1,3 M" (comme sur Instagram)
    function formaterNombre(n) {
        if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.', ',').replace(',0', '') + ' M';
        if (n >= 1e4) return Math.round(n / 1e3) + ' k';
        if (n >= 1e3) return (n / 1e3).toFixed(1).replace('.', ',').replace(',0', '') + ' k';
        return String(n);
    }

    function statistique(nomIcone, valeur, libelle) {
        const span = document.createElement('span');
        span.className = 'insta-grille__stat';
        span.setAttribute('aria-label', valeur + ' ' + libelle);
        span.appendChild(icone(nomIcone));
        span.appendChild(document.createTextNode(formaterNombre(valeur)));
        return span;
    }

    // Garde seulement les publications utilisables et uniformise leurs champs.
    function normaliser(posts) {
        return (Array.isArray(posts) ? posts : [])
            .filter(function (p) { return p && p.image && p.lien; })
            .map(function (p) {
                return {
                    image: String(p.image),
                    lien: String(p.lien),
                    legende: p.legende ? String(p.legende) : '',
                    likes: Number.isFinite(p.likes) ? p.likes : null,
                    commentaires: Number.isFinite(p.commentaires) ? p.commentaires : null,
                    type: p.type || 'image',
                    date: p.date ? new Date(p.date) : null
                };
            });
    }

    // Construit la carte d'une publication : un lien vers Instagram qui
    // contient l'image carrée et le voile affiché au survol.
    function creerCarte(post) {
        const item = document.createElement('li');

        const lien = document.createElement('a');
        lien.className = 'insta-grille__post';
        lien.href = post.lien;
        lien.target = '_blank';
        lien.rel = 'noopener noreferrer';
        lien.setAttribute('aria-label', (post.legende || 'Publication Instagram') + ' (ouvre Instagram dans un nouvel onglet)');

        const img = document.createElement('img');
        img.className = 'insta-grille__image';
        img.src = post.image;
        img.alt = post.legende;
        img.loading = 'lazy';      // les images hors écran se chargent au défilement
        img.decoding = 'async';
        // Image introuvable (lien expiré…) : on retire la carte plutôt que
        // d'afficher un carré cassé.
        img.addEventListener('error', function () { item.remove(); });
        lien.appendChild(img);

        if (post.type === 'video' || post.type === 'carrousel') {
            lien.appendChild(icone(post.type, 'insta-grille__type'));
        }

        const voile = document.createElement('span');
        voile.className = 'insta-grille__voile';
        voile.setAttribute('aria-hidden', 'true');
        if (post.likes !== null || post.commentaires !== null) {
            if (post.likes !== null) voile.appendChild(statistique('coeur', post.likes, 'j\'aime'));
            if (post.commentaires !== null) voile.appendChild(statistique('bulle', post.commentaires, 'commentaires'));
        } else {
            const sortie = document.createElement('span');
            sortie.className = 'insta-grille__stat';
            sortie.appendChild(icone('sortie'));
            sortie.appendChild(document.createTextNode('Voir sur Instagram'));
            voile.appendChild(sortie);
        }
        lien.appendChild(voile);

        item.appendChild(lien);
        return item;
    }

    function message(conteneur, texte) {
        const item = document.createElement('li');
        item.className = 'insta-grille__message';
        item.textContent = texte;
        conteneur.replaceChildren(item);
    }

    function afficher(conteneur, posts) {
        const liste = normaliser(posts);
        // Du plus récent au plus ancien quand les dates sont connues
        if (liste.every(function (p) { return p.date; })) {
            liste.sort(function (a, b) { return b.date - a.date; });
        }
        if (!liste.length) {
            message(conteneur, 'Aucune publication pour le moment.');
            return;
        }
        const fragment = document.createDocumentFragment();
        liste.forEach(function (post) { fragment.appendChild(creerCarte(post)); });
        conteneur.replaceChildren(fragment);
    }

    /**
     * Monte la grille dans un élément de la page.
     * @param {string|Element} cible   sélecteur CSS ou élément (de préférence un <ul>)
     * @param {Object} options
     * @param {Array}  [options.posts]  OPTION A : publications collées à la main
     * @param {string} [options.source] OPTION B : URL d'un JSON (tableau de publications,
     *                                  ou objet { posts: [...] })
     * @param {string} [options.messageErreur] texte affiché si la source ne répond pas
     * @returns {Promise<void>}
     */
    function monter(cible, options) {
        const conteneur = typeof cible === 'string' ? document.querySelector(cible) : cible;
        options = options || {};
        if (!conteneur) {
            console.warn('InstaGrille : élément introuvable', cible);
            return Promise.resolve();
        }
        conteneur.classList.add('insta-grille');
        if (conteneur.tagName !== 'UL' && conteneur.tagName !== 'OL') {
            conteneur.setAttribute('role', 'list');
        }

        if (Array.isArray(options.posts)) {
            afficher(conteneur, options.posts);
            return Promise.resolve();
        }

        if (options.source) {
            message(conteneur, 'Chargement des publications…');
            return fetch(options.source)
                .then(function (reponse) {
                    if (!reponse.ok) throw new Error('HTTP ' + reponse.status);
                    return reponse.json();
                })
                .then(function (donnees) {
                    afficher(conteneur, Array.isArray(donnees) ? donnees : donnees.posts);
                })
                .catch(function (erreur) {
                    console.warn('InstaGrille : source indisponible', erreur);
                    message(conteneur, options.messageErreur || 'Publications indisponibles pour le moment.');
                });
        }

        message(conteneur, 'Aucune publication pour le moment.');
        return Promise.resolve();
    }

    global.InstaGrille = { monter: monter };
})(window);
