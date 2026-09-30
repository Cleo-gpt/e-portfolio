// ciel.js — ciel étoilé animé en fond de page + bouton "retour en haut".
//
// Dessine sur le canvas #cielEtoiles des étoiles qui scintillent et, de
// temps en temps, une étoile filante. Les couleurs reprennent la palette de
// l'identité visuelle CF (blanc, lilas, bleu, cyan des carpes).
//
// Si la personne a demandé moins d'animations dans les réglages de son
// appareil, le ciel est dessiné une seule fois et reste immobile.

(function () {
    'use strict';

    // ---------- Bouton "retour en haut" ----------

    const retourHaut = document.getElementById('retourHaut');
    if (retourHaut) {
        const majRetourHaut = function () {
            retourHaut.classList.toggle('visible', window.scrollY > window.innerHeight * 0.8);
        };
        window.addEventListener('scroll', majRetourHaut, { passive: true });
        majRetourHaut();
    }

    // ---------- Ciel étoilé ----------

    const canvas = document.getElementById('cielEtoiles');
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)');
    const COULEURS = ['#ffffff', '#ffffff', '#ffffff', '#d0a0f3', '#d0a0f3', '#5bc1dc', '#8fb8ff'];
    const INTERVALLE_IMAGE = 1000 / 30; // 30 images par seconde suffisent pour un scintillement

    let largeur = 0;
    let hauteur = 0;
    let etoiles = [];
    let filante = null;
    let prochaineFilante = 0;
    let derniereImage = 0;
    let animationId = null;

    function hasard(min, max) {
        return min + Math.random() * (max - min);
    }

    function creerEtoiles() {
        const nombre = Math.max(110, Math.min(480, Math.round(largeur * hauteur / 3800)));
        etoiles = [];
        for (let i = 0; i < nombre; i++) {
            // Beaucoup de petites étoiles, quelques grosses.
            const taille = Math.pow(Math.random(), 3);
            etoiles.push({
                x: Math.random() * largeur,
                y: Math.random() * hauteur,
                rayon: 0.45 + taille * 1.6,
                eclat: hasard(0.35, 1),
                vitesse: hasard(0.0006, 0.0024),
                phase: Math.random() * Math.PI * 2,
                couleur: COULEURS[Math.floor(Math.random() * COULEURS.length)]
            });
        }
    }

    function redimensionner() {
        const nouvelleLargeur = window.innerWidth;
        const nouvelleHauteur = window.innerHeight;

        // Sur mobile, la barre d'adresse qui se replie change légèrement la
        // hauteur : on ne redessine pas tout le ciel pour si peu.
        if (nouvelleLargeur === largeur && Math.abs(nouvelleHauteur - hauteur) < 160) return;

        const densite = Math.min(window.devicePixelRatio || 1, 2);
        largeur = nouvelleLargeur;
        hauteur = nouvelleHauteur;
        canvas.width = Math.round(largeur * densite);
        canvas.height = Math.round(hauteur * densite);
        ctx.setTransform(densite, 0, 0, densite, 0, 0);
        creerEtoiles();
        dessiner(performance.now());
    }

    function lancerFilante() {
        const angle = hasard(0.35, 0.7); // trajectoire descendante vers la droite
        const vitesse = hasard(0.55, 0.9); // pixels par milliseconde
        filante = {
            x: hasard(-0.1, 0.7) * largeur,
            y: hasard(0, 0.35) * hauteur,
            vx: Math.cos(angle) * vitesse,
            vy: Math.sin(angle) * vitesse,
            age: 0,
            duree: hasard(700, 1100)
        };
    }

    function dessinerFilante(ecart) {
        filante.age += ecart;
        filante.x += filante.vx * ecart;
        filante.y += filante.vy * ecart;

        const avancement = filante.age / filante.duree;
        if (avancement >= 1) {
            filante = null;
            return;
        }

        const longueur = 170;
        const queueX = filante.x - filante.vx / Math.hypot(filante.vx, filante.vy) * longueur;
        const queueY = filante.y - filante.vy / Math.hypot(filante.vx, filante.vy) * longueur;
        const degrade = ctx.createLinearGradient(filante.x, filante.y, queueX, queueY);
        degrade.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        degrade.addColorStop(0.3, 'rgba(208, 160, 243, 0.55)');
        degrade.addColorStop(1, 'rgba(0, 111, 252, 0)');

        ctx.globalAlpha = Math.sin(avancement * Math.PI); // apparaît puis s'efface
        ctx.strokeStyle = degrade;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(filante.x, filante.y);
        ctx.lineTo(queueX, queueY);
        ctx.stroke();
    }

    function dessiner(temps, ecart) {
        ctx.clearRect(0, 0, largeur, hauteur);

        for (let i = 0; i < etoiles.length; i++) {
            const e = etoiles[i];
            const scintillement = 0.6 + 0.4 * Math.sin(temps * e.vitesse + e.phase);
            ctx.globalAlpha = e.eclat * scintillement;
            ctx.fillStyle = e.couleur;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.rayon, 0, Math.PI * 2);
            ctx.fill();

            // Les plus grosses étoiles ont de petites branches en croix.
            if (e.rayon > 1.4) {
                const branche = e.rayon * 3.2 * scintillement;
                ctx.globalAlpha = e.eclat * scintillement * 0.55;
                ctx.fillRect(e.x - branche, e.y - 0.3, branche * 2, 0.6);
                ctx.fillRect(e.x - 0.3, e.y - branche, 0.6, branche * 2);
            }
        }

        if (filante && ecart) dessinerFilante(ecart);
        ctx.globalAlpha = 1;
    }

    function boucle(temps) {
        animationId = requestAnimationFrame(boucle);
        const ecart = temps - derniereImage;
        if (ecart < INTERVALLE_IMAGE) return;
        derniereImage = temps;

        if (!filante && temps > prochaineFilante) {
            if (prochaineFilante !== 0) lancerFilante();
            prochaineFilante = temps + hasard(7000, 16000);
        }

        dessiner(temps, Math.min(ecart, 100));
    }

    function demarrer() {
        if (animationId !== null || mouvementReduit.matches || document.hidden) return;
        derniereImage = performance.now();
        animationId = requestAnimationFrame(boucle);
    }

    function arreter() {
        if (animationId === null) return;
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    redimensionner();
    demarrer();

    window.addEventListener('resize', redimensionner);

    // Inutile d'animer le ciel quand l'onglet n'est pas affiché.
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) arreter(); else demarrer();
    });

    mouvementReduit.addEventListener('change', function () {
        if (mouvementReduit.matches) {
            arreter();
            filante = null;
            dessiner(performance.now());
        } else {
            demarrer();
        }
    });
})();
