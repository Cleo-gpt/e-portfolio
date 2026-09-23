// Charge le contenu éditable du site (présentation, timeline, compétences,
// projets CPNV, réseaux sociaux) depuis le backend (Netlify ou PHP selon
// l'hébergement) et régénère le DOM correspondant.
//
// Utilisé à la fois par index.html (rendu public) et back-office.html
// (aperçu / pré-remplissage des formulaires) via window.EPortfolioContent.

(function () {
    // Copie statique du contenu actuel (voir php/data/*.json), utilisée
    // uniquement quand ni PHP ni Netlify ne répondent — cas d'un test en
    // local via Live Server ou en ouvrant index.html directement (double-clic),
    // qui ne font tourner aucun des deux backends. Permet au site de rester
    // consultable partout. À tenir à jour manuellement si le contenu est
    // édité via le back office (les fichiers php/data/*.json restent la
    // source de vérité en production).
    const FALLBACK_DATA = {
        presentation: {
            photo: "Images/presentation/Photo Cléo.jpeg",
            paragraphs: [
                "Bonjour ! Je suis Cléo Ana Forclaz. Je suis actuellement en troisième année de médiamatique.",
                "J'ai énormément de passions dans la vie comme l'illustration, Star Wars, Saint Seiya/ les chevaliers du zodiaque, Naruto, et plein d'autres choses",
                "Vous découvrirez tout au long de ce E-portefolio, mon travail durant 3 ans, à l'école comme du personnel."
            ]
        },
        timeline: {
            formation: [
                {
                    id: "cpnv-mediamatique",
                    title: "Centre professionnel du Nord vaudois (CPNV)",
                    place: "CFC Médiamaticienne (en cours) · 2023 – 2027"
                }
            ],
            experience: [
                {
                    id: "asp-polymanga-2026",
                    title: "ASP PolyManga",
                    date: "Avril 2026 · 1 mois",
                    place: "Polymanga · CDD · Lausanne, Vaud, Suisse · Sur site",
                    description: "Mise en place des espaces de restauration, distribution des repas, accueil des participants et soutien aux équipes en cuisine.",
                    extra: false
                },
                {
                    id: "asp-polymanga-2025",
                    title: "ASP PolyManga",
                    date: "Avril 2025 · 1 mois",
                    place: "Polymanga · CDD · Béaulieu Lausanne · Sur site",
                    description: "Accueil des visiteurs, mise en œuvre des procédures de sécurité du théâtre, gestion des effets personnels des spectateurs avec remise en main propre à la fin du spectacle.",
                    extra: false
                },
                {
                    id: "scanner-dossiers",
                    title: "Scanner des dossiers",
                    date: "Janvier 2025 - Mars 2025 · 3 mois",
                    place: "Cabinet de cardiologie Andrei Forclaz · CDD · Yverdon-les-Bains, Vaud, Suisse · Sur site",
                    description: "La tâche consistait à scanner les dossiers médicaux.",
                    extra: false
                },
                {
                    id: "bankai-adventure",
                    title: "Stagiaire de travail chez Bankai Adventure",
                    date: "Février 2025 · 1 mois",
                    place: "Bankai Adventures · Stage · Suisse romande, Vaud, Suisse · Sur site",
                    description: "Stage de deux jours au magasin Bankai Adventures.",
                    extra: false
                },
                {
                    id: "salon-des-metiers",
                    title: "Production de vidéo",
                    date: "Octobre 2024 · 1 mois",
                    place: "Salon des métiers · Stage · Lausanne, Vaud, Suisse · Sur site",
                    description: "Réalisation de vidéos pour le Salon des métiers.",
                    extra: true
                },
                {
                    id: "explorit-ergotherapie",
                    title: "Stagiaire ergothérapie",
                    date: "Janvier 2022 · 1 mois",
                    place: "EXPLORiT · Stage · Suisse romande, Vaud, Suisse · Sur site",
                    description: "Stagiaire durant un jour, le 25/01/2022 en ergothérapie.",
                    extra: true
                },
                {
                    id: "yverdon-travailleur-social",
                    title: "Stagiaire d'observation travailleur social de proximité",
                    date: "Janvier 2022 · 1 mois",
                    place: "Commune d'Yverdon-les-Bains · Stage · Yverdon-les-Bains, Vaud, Suisse · Sur site",
                    description: "Observation du métier de travailleur social durant 3 jours, aux côtés de Nathalie Rapin et de ses collègues.",
                    extra: true
                }
            ],
            languages: [
                { name: "Français", level: "Langue maternelle" },
                { name: "Anglais", level: "Connaissances scolaires" },
                { name: "Allemand", level: "Connaissances scolaires" }
            ]
        },
        skills: {
            categories: [
                {
                    id: "adobe",
                    label: "Adobe",
                    skills: [
                        { id: "adobe-illustrator", label: "Adobe Illustrator", level: 8 },
                        { id: "adobe-photoshop", label: "Adobe Photoshop", level: 7 },
                        { id: "adobe-indesign", label: "Adobe InDesign", level: 8 }
                    ]
                },
                {
                    id: "google",
                    label: "Google",
                    skills: [
                        { id: "google-slides", label: "Google Slides", level: 0 },
                        { id: "google-sheets", label: "Google Sheets", level: 0 },
                        { id: "google-docs", label: "Google Docs", level: 0 }
                    ]
                },
                {
                    id: "microsoft",
                    label: "Microsoft",
                    skills: [
                        { id: "microsoft-powerpoint", label: "Microsoft PowerPoint", level: 0 },
                        { id: "microsoft-excel", label: "Microsoft Excel", level: 0 },
                        { id: "microsoft-word", label: "Microsoft Word", level: 0 }
                    ]
                },
                {
                    id: "autres",
                    label: "Autres",
                    skills: [
                        { id: "developpement-web", label: "Développement Web", level: 8 },
                        { id: "procreate", label: "Procreate", level: 0 }
                    ]
                }
            ],
            tools: [
                { id: "google", label: "Google", items: ["Google Slides", "Google Sheets", "Google Docs"] },
                { id: "microsoft", label: "Microsoft", items: ["Microsoft PowerPoint", "Microsoft Excel", "Microsoft Word"] },
                { id: "adobe", label: "Adobe", items: ["Adobe InDesign", "Adobe Illustrator", "Adobe Photoshop", "Adobe Premiere Pro", "After Effects"] },
                { id: "autres", label: "Autres", items: ["Procreate"] }
            ]
        },
        cpnv: {
            projects: [
                {
                    id: "identite-visuelle-cf",
                    category: "design",
                    categoryLabel: "Design",
                    title: "Identité visuelle CF",
                    cardImage: "Images/identite-visuelle-cf/logo-cf-monogramme.png",
                    cardImageAlt: "Logo CF Multi médiamaticienne",
                    cardDescription: "Création de mon identité visuelle personnelle : monogramme CF et élément graphique associé.",
                    detailText: "Création de mon identité visuelle personnelle, autour d'un monogramme \"CF\" habillé d'un motif de poissons stylisés (violet et bleu), décliné avec le libellé \"Multi médiamaticienne\".",
                    gallery: [
                        { image: "Images/identite-visuelle-cf/logo-cf-monogramme.png", alt: "Logo CF Multi médiamaticienne, monogramme complet" },
                        { image: "Images/identite-visuelle-cf/logo-cf-poissons.png", alt: "Élément graphique des poissons stylisés de l'identité visuelle CF" }
                    ],
                    documents: [],
                    videos: []
                },
                {
                    id: "duck-n-go",
                    category: "design",
                    categoryLabel: "Design",
                    title: "Duck n'go — Identité visuelle",
                    cardImage: "Images/cpnv-duck-ngo/Duck n'go logo texte.png",
                    cardImageAlt: "Logo Duck n'go",
                    cardDescription: "Création d'une identité de marque complète pour un fast-food engagé autour du canard.",
                    detailText: "Projet pédagogique de création d'une identité de marque pour un fast-food engagé autour du canard : mascotte Bucky, charte graphique complète (logo, typographies, palette chromatique) et set administratif (carte de visite, enveloppe, courrier).",
                    gallery: [
                        { image: "Images/cpnv-duck-ngo/Duck n'go logo.png", alt: "Logo Duck n'go avec la mascotte Bucky" },
                        { image: "Images/cpnv-duck-ngo/Duck n'go logo texte.png", alt: "Logo Duck n'go avec le texte Duck n'go" },
                        { image: "Images/cpnv-duck-ngo/Duck n'go carte de visite.jpg", alt: "Carte de visite Duck n'go" }
                    ],
                    documents: [
                        { label: "Voir la charte graphique (PDF)", file: "Documents/Duck n'go charte graphique.pdf" },
                        { label: "Voir la carte de visite (PDF)", file: "Documents/Duck n'go carte de visite.pdf" }
                    ],
                    videos: []
                },
                {
                    id: "videos",
                    category: "multimedias",
                    categoryLabel: "Multimédias",
                    title: "Vidéos",
                    cardImage: "https://img.youtube.com/vi/VHWPITKgmTo/hqdefault.jpg",
                    cardImageAlt: "Vidéos CPNV",
                    cardDescription: "Quatre réalisations vidéo : fiction, tutoriel technique et reportage d'événement.",
                    detailText: "",
                    gallery: [],
                    documents: [],
                    videos: [
                        { url: "https://youtu.be/VHWPITKgmTo", thumbnail: "https://img.youtube.com/vi/VHWPITKgmTo/hqdefault.jpg", alt: "Famille recomposée", title: "Famille recomposée", short: false },
                        { url: "https://youtu.be/at5eeLY0Xyw", thumbnail: "https://img.youtube.com/vi/at5eeLY0Xyw/hqdefault.jpg", alt: "Vidéo CPNV 2", title: "Première Pro", short: false },
                        { url: "https://youtu.be/AxhW9_Kfvwc", thumbnail: "https://img.youtube.com/vi/AxhW9_Kfvwc/hqdefault.jpg", alt: "Femme Fragile Violences Conjugales", title: "Femme Fragile Violences Conjugales", short: false },
                        { url: "https://youtube.com/shorts/Bjy2dsa-m3M", thumbnail: "https://img.youtube.com/vi/Bjy2dsa-m3M/hqdefault.jpg", alt: "Short CPNV 4", title: "Le Cinéma Open Air d'Estavayer le Lac", short: true }
                    ]
                },
                {
                    id: "sleepy-bear",
                    category: "marketing",
                    categoryLabel: "Marketing",
                    title: "Sleepy Bear Coffee",
                    cardImage: "Images/cpnv-sleepy-bear/Sleepy Bear Coffee couverture.png",
                    cardImageAlt: "Sleepy Bear Coffee",
                    cardDescription: "Stratégie marketing complète pour un café-espace de coworking à Lausanne.",
                    detailText: "Projet de stratégie marketing pour Sleepy Bear Coffee, café-espace de coworking à Lausanne : étude de marché, focus group, persona, mix marketing (4P), sales funnel, campagnes Ad Words et Meta Ads, et plan de communication.",
                    gallery: [],
                    documents: [
                        { label: "Voir la présentation complète (PDF)", file: "Documents/Sleepy Bear Coffee présentation.pdf" }
                    ],
                    videos: [
                        { url: "https://youtu.be/IXso1eFylj8", thumbnail: "https://img.youtube.com/vi/IXso1eFylj8/hqdefault.jpg", alt: "Audio marketing Sleepy Bear Coffee mixage final 2", title: "Audio marketing Sleepy Bear Coffee mixage final 2", short: false }
                    ],
                    coverDocument: {
                        image: "Images/cpnv-sleepy-bear/Sleepy Bear Coffee couverture.png",
                        imageAlt: "Couverture de la présentation Sleepy Bear Coffee",
                        file: "Documents/Sleepy Bear Coffee présentation.pdf"
                    }
                }
            ]
        },
        social: {
            name: "Cléo Ana Forclaz",
            phone: "0764391272",
            phoneDisplay: "076 439 12 72",
            instagramPortfolio: "https://www.instagram.com/le_mini_portefolio_de_cleo/",
            instagramLanterne: "https://www.instagram.com/la_lanterne_de_yuna/",
            linkedin: "https://www.linkedin.com/in/cleo-forclaz/",
            email: "cleoforclaz2007@gmail.com"
        }
    };

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
    // quel que soit l'hébergement courant. Si aucun des deux ne répond
    // (Live Server, double-clic sur index.html), retombe sur FALLBACK_DATA
    // pour que le site reste consultable.
    function fetchContent(key) {
        const fallback = function () {
            if (FALLBACK_DATA[key]) return FALLBACK_DATA[key];
            throw new Error('no-fallback');
        };

        if (detectedBase) {
            return fetchJson(endpoints(detectedBase)[key]).catch(fallback);
        }
        return fetchJson(endpoints('php')[key])
            .then(function (data) { detectedBase = 'php'; return data; })
            .catch(function () {
                return fetchJson(endpoints('netlify')[key]).then(function (data) {
                    detectedBase = 'netlify';
                    return data;
                });
            })
            .catch(fallback);
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
