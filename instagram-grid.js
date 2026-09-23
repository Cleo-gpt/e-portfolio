// instagram-grid.js — plug-in autonome pour afficher un flux Instagram en
// grille (3 colonnes par défaut) avec pagination illimitée : un bouton
// "suivant" charge la page suivante depuis l'API, jusqu'au tout premier
// post du compte ; un bouton "précédent" permet de remonter.
//
// Ne dépend d'aucun service tiers (pas de Netlify, pas de Behold) : il
// interroge directement l'endpoint PHP fourni en option, qui lui-même
// appelle l'API Instagram Graph (voir php/instagram-posts.php).
//
// Utilisation :
//   InstagramGrid.mount({
//       container: document.getElementById('lanternePosts'),
//       btnPrev: document.getElementById('lanterneUp'),
//       btnNext: document.getElementById('lanterneDown'),
//       endpoint: '/php/instagram-posts.php',
//       postsPerPage: 3
//   });

(function (global) {
    'use strict';

    function formatStat(value) {
        if (value === null || value === undefined) return '—';
        return value;
    }

    function chunk(items, size) {
        const groups = [];
        for (let i = 0; i < items.length; i += size) {
            groups.push(items.slice(i, i + size));
        }
        return groups;
    }

    function createPostCard(post) {
        const card = document.createElement('a');
        card.href = post.url;
        card.target = '_blank';
        card.rel = 'noopener';
        card.className = 'instagram-grid-post';
        card.innerHTML = `
            <img src="${post.image}" alt="${post.caption || 'Publication Instagram'}" loading="lazy">
            <div class="instagram-grid-post-overlay">
                <div class="instagram-grid-post-stat">
                    <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 7.61 17 4.5 12 4.5zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8a3 3 0 100 6 3 3 0 000-6z"/></svg>
                    <span>${formatStat(post.views)}</span>
                </div>
                <div class="instagram-grid-post-stat">
                    <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M12 21s-6.5-4.35-9.33-8.02C1 10.5 1.5 6.5 5 5c2-.83 4 0 5 2 1-2 3-2.83 5-2 3.5 1.5 4 5.5 2.33 7.98C18.5 16.65 12 21 12 21z"/></svg>
                    <span>${formatStat(post.likes)}</span>
                </div>
                <div class="instagram-grid-post-stat">
                    <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
                    <span>${formatStat(post.comments)}</span>
                </div>
            </div>
        `;
        return card;
    }

    function mount(options) {
        const container = options.container;
        const btnPrev = options.btnPrev;
        const btnNext = options.btnNext;
        const endpoint = options.endpoint;
        const postsPerPage = options.postsPerPage || 3;
        const loadingMessage = options.loadingMessage || 'Chargement des publications…';
        const errorMessage = options.errorMessage || 'Publications indisponibles pour le moment.';

        let pages = [];       // groupes de `postsPerPage` posts déjà chargés
        let pageIndex = 0;    // page actuellement affichée
        let nextCursor = null;
        let hasMore = true;
        let isLoading = false;

        function showMessage(text) {
            container.innerHTML = `<p class="instagram-grid-status">${text}</p>`;
            btnPrev.disabled = true;
            btnNext.disabled = true;
        }

        function updateNavState() {
            btnPrev.disabled = pageIndex === 0;
            const onLastLoadedPage = pageIndex === pages.length - 1;
            btnNext.disabled = onLastLoadedPage && !hasMore;
        }

        function render() {
            container.innerHTML = '';
            const visible = pages[pageIndex] || [];
            visible.forEach(post => container.appendChild(createPostCard(post)));
            updateNavState();
        }

        function fetchPage(after) {
            const url = after
                ? endpoint + '?after=' + encodeURIComponent(after)
                : endpoint;
            return fetch(url).then(res => res.json().then(data => ({ ok: res.ok, data })));
        }

        btnPrev.addEventListener('click', function () {
            if (pageIndex === 0) return;
            pageIndex -= 1;
            render();
        });

        btnNext.addEventListener('click', function () {
            if (isLoading) return;

            if (pageIndex < pages.length - 1) {
                pageIndex += 1;
                render();
                return;
            }

            if (!hasMore) return;

            isLoading = true;
            btnNext.disabled = true;

            fetchPage(nextCursor)
                .then(({ ok, data }) => {
                    if (!ok || !data.posts || data.posts.length === 0) {
                        hasMore = false;
                        updateNavState();
                        return;
                    }
                    const nextPageToShow = pages.length;
                    pages = pages.concat(chunk(data.posts, postsPerPage));
                    nextCursor = data.nextCursor || null;
                    hasMore = Boolean(nextCursor);
                    pageIndex = nextPageToShow;
                    render();
                })
                .catch(() => {
                    hasMore = false;
                    updateNavState();
                })
                .finally(() => {
                    isLoading = false;
                });
        });

        showMessage(loadingMessage);

        fetchPage(null)
            .then(({ ok, data }) => {
                if (!ok || !data.posts || data.posts.length === 0) {
                    showMessage(errorMessage);
                    return;
                }
                pages = chunk(data.posts, postsPerPage);
                nextCursor = data.nextCursor || null;
                hasMore = Boolean(nextCursor);
                pageIndex = 0;
                render();
            })
            .catch(() => {
                showMessage(errorMessage);
            });
    }

    global.InstagramGrid = { mount: mount };
})(window);
