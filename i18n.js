// Traduction du site : français (langue d'origine), anglais et allemand.
//
// Les boutons FR / EN / DE du menu (data-langue) changent la langue. Le
// choix est retenu pour les visites suivantes.
//
// Fonctionnement : chaque texte français de la page (textes, attributs
// alt / aria-label / title / placeholder, descriptions du carrousel) est
// cherché dans le dictionnaire TRADUCTIONS (traductions.js) et remplacé.
// Les textes ajoutés plus tard par les scripts (contenu du back office,
// messages du formulaire…) sont traduits au fil de l'eau. Un texte absent
// du dictionnaire reste en français : après une modification dans le back
// office, il suffit d'ajouter sa traduction dans traductions.js.

(function () {
    'use strict';

    const LANGUES = ['fr', 'en', 'de'];
    const ATTRIBUTS = ['alt', 'aria-label', 'title', 'placeholder', 'data-description'];
    const CLE_STOCKAGE = 'langue';
    const dico = window.TRADUCTIONS || {};

    // Retrouve le texte français d'origine, quelle que soit la langue
    // affichée en ce moment (on peut passer d'EN à DE sans repasser par FR).
    const versFrancais = new Map();
    Object.keys(dico).forEach(function (fr) {
        versFrancais.set(fr, fr);
        LANGUES.forEach(function (l) {
            if (l !== 'fr' && dico[fr][l]) versFrancais.set(dico[fr][l], fr);
        });
    });

    let langue = 'fr';
    try {
        const memo = localStorage.getItem(CLE_STOCKAGE);
        if (LANGUES.indexOf(memo) !== -1) langue = memo;
    } catch (e) {}

    function normaliser(texte) {
        return texte.replace(/\s+/g, ' ').trim();
    }

    function traduire(texte) {
        const fr = versFrancais.get(normaliser(texte));
        if (!fr) return null;
        return langue === 'fr' ? fr : (dico[fr][langue] || fr);
    }

    // Garde les espaces autour du texte (indentation du HTML).
    function remplacer(original, traduction) {
        const debut = original.match(/^\s*/)[0];
        const fin = original.match(/\s*$/)[0];
        return debut + traduction + fin;
    }

    function traduireNoeudTexte(noeud) {
        if (!noeud.nodeValue.trim()) return;
        const parent = noeud.parentElement;
        if (parent && parent.closest('script, style, [data-pas-traduire]')) return;
        const t = traduire(noeud.nodeValue);
        if (t === null) return;
        const nouveau = remplacer(noeud.nodeValue, t);
        if (nouveau !== noeud.nodeValue) noeud.nodeValue = nouveau;
    }

    function traduireAttributs(el) {
        if (el.closest('[data-pas-traduire]')) return;
        ATTRIBUTS.forEach(function (attr) {
            const valeur = el.getAttribute(attr);
            if (!valeur) return;
            const t = traduire(valeur);
            if (t !== null && t !== valeur) el.setAttribute(attr, t);
        });
    }

    function traduireArbre(racine) {
        if (racine.nodeType === Node.TEXT_NODE) { traduireNoeudTexte(racine); return; }
        if (racine.nodeType !== Node.ELEMENT_NODE) return;
        if (racine.closest('[data-pas-traduire]')) return;
        traduireAttributs(racine);
        const marcheur = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
        let n;
        while ((n = marcheur.nextNode())) {
            if (n.nodeType === Node.TEXT_NODE) traduireNoeudTexte(n);
            else traduireAttributs(n);
        }
    }

    function majBoutons() {
        document.querySelectorAll('[data-langue]').forEach(function (b) {
            b.setAttribute('aria-pressed', b.getAttribute('data-langue') === langue ? 'true' : 'false');
        });
    }

    function appliquer() {
        document.documentElement.lang = langue;
        const titre = traduire(document.title);
        if (titre) document.title = titre;
        traduireArbre(document.body);
        majBoutons();
    }

    function changerLangue(nouvelle) {
        if (LANGUES.indexOf(nouvelle) === -1) return;
        langue = nouvelle;
        try { localStorage.setItem(CLE_STOCKAGE, langue); } catch (e) {}
        appliquer();
    }

    document.addEventListener('click', function (e) {
        const bouton = e.target.closest('[data-langue]');
        if (bouton) changerLangue(bouton.getAttribute('data-langue'));
    });

    // Textes ajoutés ou modifiés par les autres scripts.
    const observateur = new MutationObserver(function (mutations) {
        if (langue === 'fr') return;
        mutations.forEach(function (m) {
            if (m.type === 'characterData') traduireNoeudTexte(m.target);
            else if (m.type === 'attributes') traduireAttributs(m.target);
            else m.addedNodes.forEach(traduireArbre);
        });
    });

    document.addEventListener('DOMContentLoaded', function () {
        appliquer();
        observateur.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ATTRIBUTS
        });
    });

    window.Langue = {
        actuelle: function () { return langue; },
        changer: changerLangue
    };
})();
