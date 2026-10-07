// site.js — interactions de la page publique (index.html) :
// pop up de connexion au back office, carrousel RetroMania et grille
// Instagram de La Lanterne de Yuna.

(function () {
    'use strict';

    // ---------- Pop up de connexion au back office ----------
    // Vérifie l'email + le code, puis redirige vers back-office.html
    // (déjà authentifiée pour la durée de l'onglet).

    function initConnexion() {
        const SESSION_EMAIL_KEY = 'cleoAdminEmail';
        const SESSION_PASSWORD_KEY = 'cleoAdminPassword';

        const triggerBtn = document.getElementById('loginTriggerBtn');
        const overlay = document.getElementById('loginModalOverlay');
        const closeBtn = document.getElementById('loginModalClose');
        const emailInput = document.getElementById('loginModalEmail');
        const passwordInput = document.getElementById('loginModalPassword');
        const submitBtn = document.getElementById('loginModalSubmit');
        const errorEl = document.getElementById('loginModalError');

        function openModal() {
            overlay.hidden = false;
            errorEl.textContent = '';
            emailInput.value = '';
            passwordInput.value = '';
            emailInput.focus();
        }

        function closeModal() {
            overlay.hidden = true;
            triggerBtn.focus();
        }

        function attemptLogin() {
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            errorEl.textContent = '';
            submitBtn.disabled = true;

            fetch('/php/auth-check.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Email': email,
                    'X-Admin-Password': password
                },
                body: JSON.stringify({})
            })
                .then(function (res) {
                    submitBtn.disabled = false;
                    if (res.status === 401) {
                        errorEl.textContent = 'Email ou code incorrect.';
                        return;
                    }
                    if (!res.ok) {
                        errorEl.textContent = 'Impossible de vérifier les identifiants. Réessaie.';
                        return;
                    }
                    sessionStorage.setItem(SESSION_EMAIL_KEY, email);
                    sessionStorage.setItem(SESSION_PASSWORD_KEY, password);
                    window.location.href = 'back-office.html';
                })
                .catch(function () {
                    submitBtn.disabled = false;
                    errorEl.textContent = 'Impossible de contacter le serveur. Réessaie.';
                });
        }

        function onEnter(e) {
            if (e.key === 'Enter') attemptLogin();
        }

        triggerBtn.addEventListener('click', openModal);
        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeModal();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !overlay.hidden) closeModal();
        });
        submitBtn.addEventListener('click', attemptLogin);
        emailInput.addEventListener('keydown', onEnter);
        passwordInput.addEventListener('keydown', onEnter);
    }

    // ---------- Carrousel RetroMania ----------
    // Chaque clic sur le duo de carpes passe à la vidéo suivante et le fait
    // tourner d'un cran. Le texte affiché sous le carrousel vient de
    // l'attribut data-description de la diapositive active.

    function initCarrousel() {
        const slides = Array.prototype.slice.call(document.querySelectorAll('.carousel-slide'));
        const bouton = document.getElementById('carouselTourner');
        const roue = document.getElementById('gearImage');
        const description = document.getElementById('videoDescription');
        if (!slides.length || !bouton) return;

        let courante = 0;
        let rotation = 0;

        function afficher() {
            const total = slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === courante);
                slide.classList.toggle('prev', i === (courante - 1 + total) % total);
                slide.classList.toggle('next', i === (courante + 1) % total);
            });

            description.style.opacity = '0';
            setTimeout(function () {
                description.textContent = slides[courante].dataset.description || '';
                description.style.opacity = '1';
            }, 300);
        }

        bouton.addEventListener('click', function () {
            courante = (courante + 1) % slides.length;
            rotation += 360 / slides.length;
            roue.style.transform = 'rotate(' + rotation + 'deg)';
            afficher();
        });

        afficher();
    }

    // ---------- Publications Instagram — La Lanterne de Yuna ----------
    // Grille affichée par le plug-in instagram-grid.js, qui appelle
    // php/instagram-posts.php.

    function initInstagram() {
        InstagramGrid.mount({
            container: document.getElementById('lanternePosts'),
            btnPrev: document.getElementById('lanterneUp'),
            btnNext: document.getElementById('lanterneDown'),
            endpoint: '/php/instagram-posts.php',
            postsPerPage: 3,
            errorMessage: 'Publications indisponibles pour le moment. Voir directement le compte Instagram ci-dessous.'
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initConnexion();
        initCarrousel();
        initInstagram();
    });
})();
