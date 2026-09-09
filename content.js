// Charge le contenu éditable du site (présentation, timeline, compétences,
// projets CPNV, réseaux sociaux) depuis le backend (Netlify ou PHP selon
// l'hébergement) et régénère le DOM correspondant.
//
// Utilisé à la fois par index.html (rendu public) et back-office.html
// (aperçu / pré-remplissage des formulaires) via window.EPortfolioContent.

(function () {
    // Sur Netlify, chaque domaine a sa propre fonction. Sur PHP, son propre
    // script. On mémorise lequel des deux répond une fois détecté, pour ne
    // pas retenter le mauvais backend à chaque appel.
    let detectedBase = null;

    function endpoints(base) {
        if (base === 'php') {
            return {
                presentation: '/php/content-presentation.php',
                timeline: '/php/content-timeline.php',
                skills: '/php/content-skills.php',
                cpnv: '/php/content-cpnv.php',
                social: '/php/content-social.php'
            };
        }
        return {
            presentation: '/.netlify/functions/content-presentation',
            timeline: '/.netlify/functions/content-timeline',
            skills: '/.netlify/functions/content-skills',
            cpnv: '/.netlify/functions/content-cpnv',
            social: '/.netlify/functions/content-social'
        };
    }

    function fetchJson(url) {
        return fetch(url).then(function (res) {
            if (!res.ok) throw new Error('request-failed');
            return res.json();
        });
    }

    // Essaie d'abord le backend déjà détecté (le cas échéant), sinon PHP
    // puis Netlify en repli, pour fonctionner sans configuration explicite
    // quel que soit l'hébergement courant.
    function fetchContent(key) {
        if (detectedBase) {
            return fetchJson(endpoints(detectedBase)[key]);
        }
        return fetchJson(endpoints('php')[key])
            .then(function (data) { detectedBase = 'php'; return data; })
            .catch(function () {
                return fetchJson(endpoints('netlify')[key]).then(function (data) {
                    detectedBase = 'netlify';
                    return data;
                });
            });
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str == null ? '' : String(str);
        return div.innerHTML;
    }

    // ---------- Présentation ----------

    function renderPresentation(data) {
        const photo = document.getElementById('presentationPhoto');
        const text = document.getElementById('presentationText');
        if (!data || !photo || !text) return;

        if (data.photo) {
            photo.src = data.photo;
        }

        const paragraphs = Array.isArray(data.paragraphs) ? data.paragraphs : [];
        if (paragraphs.length === 0) return;

        const h2 = text.querySelector('h2');
        text.innerHTML = '';
        if (h2) text.appendChild(h2);
        else {
            const heading = document.createElement('h2');
            heading.textContent = 'À propos de moi';
            text.appendChild(heading);
        }
        paragraphs.forEach(function (p) {
            const para = document.createElement('p');
            para.textContent = p;
            text.appendChild(para);
        });
    }

    // ---------- Timeline (formation, expérience, langues) ----------

    function renderTimeline(data) {
        if (!data) return;

        const formationEl = document.getElementById('formationTimeline');
        if (formationEl && Array.isArray(data.formation) && data.formation.length) {
            formationEl.innerHTML = data.formation.map(function (item) {
                return '<div class="experience-item">' +
                    '<h4>' + escapeHtml(item.title) + '</h4>' +
                    '<p class="experience-place">' + escapeHtml(item.place) + '</p>' +
                    '</div>';
            }).join('');
        }

        const experienceEl = document.getElementById('experienceTimeline');
        const moreBtn = document.getElementById('experienceMoreBtn');
        if (experienceEl && Array.isArray(data.experience) && data.experience.length) {
            experienceEl.innerHTML = data.experience.map(function (item) {
                const extraAttrs = item.extra ? ' class="experience-item experience-item-extra" hidden' : ' class="experience-item"';
                return '<div' + extraAttrs + '>' +
                    '<div class="experience-header">' +
                    '<h4>' + escapeHtml(item.title) + '</h4>' +
                    '<span class="experience-date">' + escapeHtml(item.date) + '</span>' +
                    '</div>' +
                    '<p class="experience-place">' + escapeHtml(item.place) + '</p>' +
                    (item.description ? '<p>' + escapeHtml(item.description) + '</p>' : '') +
                    '</div>';
            }).join('');

            const hasExtra = data.experience.some(function (item) { return item.extra; });
            if (moreBtn) moreBtn.parentElement.hidden = !hasExtra;
        }

        const languesEl = document.getElementById('profilLangues');
        if (languesEl && Array.isArray(data.languages) && data.languages.length) {
            languesEl.innerHTML = data.languages.map(function (lang) {
                return '<li><span>' + escapeHtml(lang.name) + '</span><em>' + escapeHtml(lang.level) + '</em></li>';
            }).join('');
        }

        attachExperienceMoreToggle();
    }

    function attachExperienceMoreToggle() {
        const moreBtn = document.getElementById('experienceMoreBtn');
        if (!moreBtn || moreBtn.dataset.bound) return;
        moreBtn.dataset.bound = 'true';
        moreBtn.addEventListener('click', function () {
            const extraItems = document.querySelectorAll('.experience-item-extra');
            if (!extraItems.length) return;
            const isHidden = extraItems[0].hidden;
            extraItems.forEach(function (item) { item.hidden = !isHidden; });
            moreBtn.textContent = isHidden ? 'Voir moins' : 'Voir plus';
        });
    }

    // ---------- Compétences & outils ----------

    function renderSkills(data) {
        if (!data) return;

        const categoriesEl = document.getElementById('skillsCategories');
        const barsEl = document.getElementById('skillsBars');
        if (categoriesEl && barsEl && Array.isArray(data.categories) && data.categories.length) {
            categoriesEl.innerHTML = data.categories.map(function (cat, i) {
                return '<button class="tools-category' + (i === 0 ? ' active' : '') + '" data-skills-category="' + escapeHtml(cat.id) + '">' + escapeHtml(cat.label) + '</button>';
            }).join('');

            barsEl.innerHTML = data.categories.map(function (cat, i) {
                const skillsHtml = (cat.skills || []).map(function (skill) {
                    const level = Math.max(0, Math.min(10, Number(skill.level) || 0));
                    return '<div class="skill-bar">' +
                        '<div class="skill-bar-label"><span>' + escapeHtml(skill.label) + '</span>' +
                        '<span class="skill-bar-value" data-skill="' + escapeHtml(skill.id) + '">' + level + '/10</span></div>' +
                        '<div class="skill-bar-track"><div class="skill-bar-fill" data-skill-fill="' + escapeHtml(skill.id) + '" style="width: ' + (level * 10) + '%;"></div></div>' +
                        '</div>';
                }).join('');
                return '<div class="skill-bars-panel" data-skills-panel="' + escapeHtml(cat.id) + '"' + (i === 0 ? '' : ' hidden') + '>' + skillsHtml + '</div>';
            }).join('');
        }

        const toolsCategoriesEl = document.getElementById('toolsCategories');
        const toolsGridEl = document.getElementById('toolsGrid');
        if (toolsCategoriesEl && toolsGridEl && Array.isArray(data.tools) && data.tools.length) {
            toolsCategoriesEl.innerHTML = data.tools.map(function (tool, i) {
                return '<button class="tools-category' + (i === 0 ? ' active' : '') + '" data-tools-category="' + escapeHtml(tool.id) + '">' + escapeHtml(tool.label) + '</button>';
            }).join('');

            toolsGridEl.innerHTML = data.tools.map(function (tool, i) {
                const chips = (tool.items || []).map(function (item) {
                    return '<span class="tool-chip">' + escapeHtml(item) + '</span>';
                }).join('');
                return '<div class="tools-panel" data-tools-panel="' + escapeHtml(tool.id) + '"' + (i === 0 ? '' : ' hidden') + '>' + chips + '</div>';
            }).join('');
        }

        attachCategorySwitchers();
    }

    function attachCategorySwitchers() {
        const toolsButtons = document.querySelectorAll('.tools-category[data-tools-category]');
        const toolsPanels = document.querySelectorAll('.tools-panel');
        toolsButtons.forEach(function (btn) {
            if (btn.dataset.bound) return;
            btn.dataset.bound = 'true';
            btn.addEventListener('click', function () {
                toolsButtons.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                const category = btn.dataset.toolsCategory;
                toolsPanels.forEach(function (panel) {
                    panel.hidden = panel.dataset.toolsPanel !== category;
                });
            });
        });

        const skillsButtons = document.querySelectorAll('.tools-category[data-skills-category]');
        const skillsPanels = document.querySelectorAll('.skill-bars-panel');
        skillsButtons.forEach(function (btn) {
            if (btn.dataset.bound) return;
            btn.dataset.bound = 'true';
            btn.addEventListener('click', function () {
                skillsButtons.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                const category = btn.dataset.skillsCategory;
                skillsPanels.forEach(function (panel) {
                    panel.hidden = panel.dataset.skillsPanel !== category;
                });
            });
        });
    }

    // ---------- Projets CPNV ----------

    function renderProjectDetail(project) {
        let html = '<h4>' + escapeHtml(project.title) + '</h4>';
        if (project.detailText) {
            html += '<p>' + escapeHtml(project.detailText) + '</p>';
        }

        if (project.gallery && project.gallery.length) {
            html += '<div class="cpnv-gallery">' + project.gallery.map(function (g) {
                return '<a href="' + escapeHtml(g.image) + '" target="_blank" class="cpnv-gallery-item">' +
                    '<img src="' + escapeHtml(g.image) + '" alt="' + escapeHtml(g.alt) + '"></a>';
            }).join('') + '</div>';
        }

        if (project.videos && project.videos.length) {
            html += '<div class="cpnv-videos">' + project.videos.map(function (v) {
                return '<a class="cpnv-video-card" href="' + escapeHtml(v.url) + '" target="_blank">' +
                    '<div class="cpnv-video-thumb' + (v.short ? ' cpnv-video-short' : '') + '">' +
                    '<img src="' + escapeHtml(v.thumbnail) + '" alt="' + escapeHtml(v.alt) + '">' +
                    '<div class="play-overlay"><svg viewBox="0 0 24 24" fill="white" width="50" height="50"><path d="M8 5v14l11-7z"/></svg></div>' +
                    '</div><p class="cpnv-video-title">' + escapeHtml(v.title) + '</p></a>';
            }).join('') + '</div>';
        }

        if (project.coverDocument) {
            html += '<div class="cpnv-media-row">' +
                '<a href="' + escapeHtml(project.coverDocument.file) + '" target="_blank" class="cpnv-gallery-item">' +
                '<img src="' + escapeHtml(project.coverDocument.image) + '" alt="' + escapeHtml(project.coverDocument.imageAlt) + '"></a>' +
                '</div>';
        }

        if (project.documents && project.documents.length) {
            html += '<div class="cpnv-links">' + project.documents.map(function (d) {
                return '<a href="' + escapeHtml(d.file) + '" target="_blank" class="cpnv-doc-link">' + escapeHtml(d.label) + '</a>';
            }).join('') + '</div>';
        }

        return html;
    }

    function renderCpnv(data) {
        if (!data || !Array.isArray(data.projects) || data.projects.length === 0) return;

        const gridEl = document.getElementById('cpnvGrid');
        const detailsEl = document.getElementById('cpnvProjectDetails');
        if (!gridEl || !detailsEl) return;

        gridEl.innerHTML = data.projects.map(function (p) {
            return '<button class="cpnv-card" data-category="' + escapeHtml(p.category) + '" data-project="' + escapeHtml(p.id) + '">' +
                '<div class="cpnv-card-image"><img src="' + escapeHtml(p.cardImage) + '" alt="' + escapeHtml(p.cardImageAlt) + '"></div>' +
                '<div class="cpnv-card-info">' +
                '<h3 class="cpnv-card-title">' + escapeHtml(p.title) + '</h3>' +
                '<p class="cpnv-card-desc">' + escapeHtml(p.cardDescription) + '</p>' +
                '<div class="cpnv-card-footer">' +
                '<span class="cpnv-card-badge">' + escapeHtml(p.categoryLabel) + '</span>' +
                '<span class="cpnv-card-link">En savoir plus →</span>' +
                '</div></div></button>';
        }).join('');

        detailsEl.innerHTML = data.projects.map(function (p) {
            return '<div class="cpnv-project" data-project-detail="' + escapeHtml(p.id) + '" hidden>' + renderProjectDetail(p) + '</div>';
        }).join('');

        attachCpnvInteractions();
    }

    function attachCpnvInteractions() {
        const filterButtons = document.querySelectorAll('.cpnv-filter-btn');
        const cards = document.querySelectorAll('.cpnv-card');
        const details = document.querySelectorAll('.cpnv-project[data-project-detail]');
        const detailHint = document.getElementById('cpnvDetailHint');

        function showDetail(projectId) {
            if (detailHint) detailHint.hidden = true;
            details.forEach(function (detail) {
                detail.hidden = detail.dataset.projectDetail !== projectId;
            });
            cards.forEach(function (card) {
                card.classList.toggle('active', card.dataset.project === projectId);
            });
        }

        cards.forEach(function (card) {
            if (card.dataset.bound) return;
            card.dataset.bound = 'true';
            card.addEventListener('click', function () {
                showDetail(card.dataset.project);
                const detailSection = document.querySelector('.cpnv-detail');
                if (detailSection) detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        filterButtons.forEach(function (btn) {
            if (btn.dataset.bound) return;
            btn.dataset.bound = 'true';
            btn.addEventListener('click', function () {
                filterButtons.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                cards.forEach(function (card) {
                    card.style.display = (filter === 'tous' || card.dataset.category === filter) ? '' : 'none';
                });
            });
        });
    }

    // ---------- Réseaux sociaux (footer) ----------

    function renderSocial(data) {
        if (!data) return;

        const nameEl = document.getElementById('footerName');
        if (nameEl && data.name) nameEl.textContent = data.name;

        const phoneLink = document.getElementById('footerPhoneLink');
        if (phoneLink && data.phone) {
            phoneLink.href = 'tel:' + data.phone;
            phoneLink.textContent = data.phoneDisplay || data.phone;
        }

        const igPortfolio = document.getElementById('footerInstagramPortfolio');
        if (igPortfolio && data.instagramPortfolio) igPortfolio.href = data.instagramPortfolio;

        const igLanterne = document.getElementById('footerInstagramLanterne');
        if (igLanterne && data.instagramLanterne) igLanterne.href = data.instagramLanterne;

        const linkedin = document.getElementById('footerLinkedin');
        if (linkedin && data.linkedin) linkedin.href = data.linkedin;

        const mail = document.getElementById('footerMail');
        const mailText = document.getElementById('footerMailText');
        if (mail && data.email) mail.href = 'mailto:' + data.email;
        if (mailText && data.email) mailText.textContent = data.email;
    }

    // ---------- Chargement global ----------

    function loadAll() {
        return Promise.all([
            fetchContent('presentation').then(renderPresentation).catch(function () {}),
            fetchContent('timeline').then(renderTimeline).catch(function () { attachExperienceMoreToggle(); }),
            fetchContent('skills').then(renderSkills).catch(function () { attachCategorySwitchers(); }),
            fetchContent('cpnv').then(renderCpnv).catch(function () { attachCpnvInteractions(); }),
            fetchContent('social').then(renderSocial).catch(function () {})
        ]);
    }

    document.addEventListener('DOMContentLoaded', function () {
        loadAll();
    });

    // Exposé pour back-office.html (fetch brut, sans injection DOM).
    window.EPortfolioContent = { fetchContent: fetchContent, endpoints: endpoints };
})();
