// Contact : formulaire « Me contacter » et liens protégés (CV).
//
// - Le formulaire envoie le message à php/contact.php, qui me le transmet
//   par e-mail : mon adresse n'apparaît jamais sur le site.
// - Avant l'envoi (et avant d'ouvrir le CV, qui contient mes coordonnées),
//   une petite vérification « anti-robot » : glisser la carpe jusqu'à la
//   lune. Elle n'est demandée qu'une fois par visite.
//
// Dans la page :
//   <button data-contact-ouvrir>  → ouvre la fenêtre « Me contacter »
//   <a data-protege="…">          → lien ouvert après vérification (CV),
//                                    adresse encodée pour les robots

(function () {
    'use strict';

    // Adresse encodée : base64 à l'envers.
    function decoder(texte) {
        try {
            return decodeURIComponent(escape(atob(texte.split('').reverse().join(''))));
        } catch (e) {
            return '';
        }
    }

    const CLE_VERIFIE = 'contact-verifie';
    let verifie = false;
    try { verifie = sessionStorage.getItem(CLE_VERIFIE) === 'oui'; } catch (e) {}

    let fenetreVerification = null;
    let actionEnAttente = null;

    // Une fois vérifié, les liens protégés deviennent des liens normaux.
    function debloquerLiens() {
        document.querySelectorAll('a[data-protege]').forEach(function (a) {
            const adresse = decoder(a.getAttribute('data-protege'));
            if (adresse) a.href = adresse;
            a.removeAttribute('data-protege');
        });
    }

    // ---------- Vérification « anti-robot » ----------

    function creerFenetreVerification() {
        const d = document.createElement('dialog');
        d.className = 'contact-fenetre contact-verification';
        d.setAttribute('aria-labelledby', 'verificationTitre');
        d.innerHTML =
            '<button type="button" class="contact-fermer" aria-label="Fermer">&times;</button>' +
            '<h2 id="verificationTitre">Petite vérification</h2>' +
            '<p>Pour éloigner les robots, fais glisser la carpe jusqu\'à la lune.</p>' +
            '<div class="verification-piste">' +
            '<img src="Images/identite-visuelle-cf/carpe-bleue.svg" alt="" class="verification-carpe">' +
            '<span class="verification-lune" aria-hidden="true"></span>' +
            '<input type="range" min="0" max="100" value="0" step="1" class="verification-curseur" ' +
            'aria-label="Glisser la carpe jusqu\'à la lune">' +
            '</div>' +
            '<p class="verification-message" aria-live="polite"></p>';

        const curseur = d.querySelector('.verification-curseur');
        const carpe = d.querySelector('.verification-carpe');
        const message = d.querySelector('.verification-message');
        let reussi = false;

        function placer() {
            d.style.setProperty('--progression', curseur.value / 100);
        }

        // Un vrai geste (souris, doigt ou clavier) qui amène la carpe au bout.
        // Un script qui change la valeur produit un événement « non fiable »
        // (isTrusted = false) et ne passe pas.
        curseur.addEventListener('input', function (e) {
            placer();
            if (!reussi && e.isTrusted && Number(curseur.value) >= 97) reussite();
        });
        // Relâchée avant la lune : la carpe repart au début.
        curseur.addEventListener('change', function () {
            if (reussi) return;
            curseur.value = 0;
            placer();
        });

        function reussite() {
            reussi = true;
            verifie = true;
            try { sessionStorage.setItem(CLE_VERIFIE, 'oui'); } catch (e) {}
            message.textContent = 'Merci !';
            carpe.classList.add('verification-carpe--arrivee');
            debloquerLiens();
            // Tout de suite, pendant le geste : sinon le navigateur peut
            // bloquer l'ouverture du CV dans un nouvel onglet.
            const action = actionEnAttente;
            actionEnAttente = null;
            if (action) action();
            setTimeout(function () { d.close(); }, 450);
        }

        d.querySelector('.contact-fermer').addEventListener('click', function () { d.close(); });
        d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
        d.addEventListener('close', function () {
            actionEnAttente = null;
            curseur.value = 0;
            reussi = false;
            message.textContent = '';
            carpe.classList.remove('verification-carpe--arrivee');
            placer();
        });
        document.body.appendChild(d);
        placer();
        return d;
    }

    function verifierPuis(action) {
        if (verifie) { action(); return; }
        actionEnAttente = action;
        if (!fenetreVerification) fenetreVerification = creerFenetreVerification();
        fenetreVerification.showModal();
        fenetreVerification.querySelector('.verification-curseur').focus();
    }

    // ---------- Formulaire « Me contacter » ----------

    function initFormulaire() {
        const fenetre = document.getElementById('contactFenetre');
        const formulaire = document.getElementById('contactFormulaire');
        if (!fenetre || !formulaire) return;

        const statut = formulaire.querySelector('.contact-statut');
        const bouton = formulaire.querySelector('.contact-envoyer');

        function afficherStatut(texte, type) {
            statut.textContent = texte;
            statut.className = 'contact-statut' + (type ? ' contact-statut--' + type : '');
        }

        function envoyer() {
            const donnees = Object.fromEntries(new FormData(formulaire));
            bouton.disabled = true;
            afficherStatut('Envoi en cours…');
            fetch('php/contact.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(donnees)
            })
                .then(function (reponse) {
                    return reponse.json().catch(function () { return {}; }).then(function (corps) {
                        if (!reponse.ok || !corps.ok) throw new Error(corps.error || '');
                    });
                })
                .then(function () {
                    formulaire.reset();
                    afficherStatut('Merci, ton message est bien parti ! Je te réponds dès que possible.', 'ok');
                })
                .catch(function (erreur) {
                    // Page ouverte sans PHP (fichier local) : explication.
                    const texte = location.protocol === 'file:'
                        ? 'Le formulaire fonctionne seulement sur le site en ligne.'
                        : (erreur.message || "Le message n'a pas pu partir. Réessaie plus tard.");
                    afficherStatut(texte, 'erreur');
                })
                .then(function () { bouton.disabled = false; });
        }

        formulaire.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!formulaire.reportValidity()) return;
            verifierPuis(envoyer);
        });

        fenetre.querySelector('.contact-fermer').addEventListener('click', function () { fenetre.close(); });
        fenetre.addEventListener('click', function (e) { if (e.target === fenetre) fenetre.close(); });

        document.addEventListener('click', function (e) {
            if (!e.target.closest('[data-contact-ouvrir]')) return;
            e.preventDefault();
            afficherStatut('');
            fenetre.showModal();
        });
    }

    // ---------- Branchements ----------

    // Lien protégé (CV) : vérification, puis ouverture.
    document.addEventListener('click', function (e) {
        const lien = e.target.closest('a[data-protege]');
        if (!lien) return;
        e.preventDefault();
        const adresse = decoder(lien.getAttribute('data-protege'));
        verifierPuis(function () {
            if (adresse) window.open(adresse, lien.target || '_self', 'noopener');
        });
    });

    document.addEventListener('DOMContentLoaded', function () {
        if (verifie) debloquerLiens();
        initFormulaire();
    });
})();
