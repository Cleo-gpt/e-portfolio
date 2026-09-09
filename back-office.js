// Logique du back office : login, chargement/édition/sauvegarde de chaque
// section de contenu, upload d'images/documents (PHP uniquement).

(function () {
    const SESSION_EMAIL_KEY = 'cleoAdminEmail';
    const SESSION_PASSWORD_KEY = 'cleoAdminPassword';

    function getSessionEmail() { return sessionStorage.getItem(SESSION_EMAIL_KEY) || ''; }
    function getSessionPassword() { return sessionStorage.getItem(SESSION_PASSWORD_KEY) || ''; }

    function authHeaders() {
        return {
            'Content-Type': 'application/json',
            'X-Admin-Email': getSessionEmail(),
            'X-Admin-Password': getSessionPassword()
        };
    }

    // ---------- Détection d'environnement (PHP vs Netlify) ----------

    let usePhp = null; // true, false, ou null (pas encore déterminé)

    function detectEnvironment() {
        return fetch('/php/auth-check.php', { method: 'OPTIONS' })
            .then(function (res) { usePhp = res.status !== 404; return usePhp; })
            .catch(function () { usePhp = false; return usePhp; });
    }

    function authUrl(name) {
        return usePhp ? '/php/' + name + '.php' : '/.netlify/functions/' + name;
    }

    function contentUrl(key) {
        return window.EPortfolioContent.endpoints(usePhp ? 'php' : 'netlify')[key];
    }

    // ---------- Login ----------

    function attemptLogin() {
        const email = document.getElementById('emailInput').value.trim();
        const password = document.getElementById('passwordInput').value;
        const errorEl = document.getElementById('loginError');
        errorEl.textContent = '';

        detectEnvironment().then(function () {
            return fetch(authUrl('auth-check'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Email': email, 'X-Admin-Password': password }, body: JSON.stringify({}) });
        }).then(function (res) {
            if (res.status === 401) { errorEl.textContent = 'Email ou code incorrect.'; return; }
            if (!res.ok) { errorEl.textContent = 'Impossible de vérifier les identifiants. Réessaie.'; return; }
            sessionStorage.setItem(SESSION_EMAIL_KEY, email);
            sessionStorage.setItem(SESSION_PASSWORD_KEY, password);
            showBackOffice();
        }).catch(function () {
            errorEl.textContent = 'Impossible de contacter le serveur. Réessaie.';
        });
    }

    function showBackOffice() {
        document.getElementById('loginBox').style.display = 'none';
        document.getElementById('boPanel').classList.add('visible');
        loadAllSections();
        renderUploadAvailability();
    }

    // ---------- Navigation entre onglets ----------

    function initTabs() {
        const navButtons = document.querySelectorAll('.bo-nav-btn');
        const tabs = document.querySelectorAll('.bo-tab');
        navButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                navButtons.forEach(function (b) { b.classList.remove('active'); });
                tabs.forEach(function (t) { t.classList.remove('active'); });
                btn.classList.add('active');
                document.querySelector('[data-tab-panel="' + btn.dataset.tab + '"]').classList.add('active');
            });
        });
    }

    // ---------- Upload (PHP uniquement) ----------

    function renderUploadAvailability() {
        const container = document.getElementById('presPhotoUpload');
        if (!container) return;
        container.innerHTML = usePhp
            ? '<input type="file" accept="image/png,image/jpeg,image/webp" data-upload-target="presPhoto"><p class="upload-hint">PNG, JPEG ou WebP, 5 Mo max.</p>'
            : '<p class="upload-unavailable">Upload d\'image disponible uniquement une fois le site déployé sur l\'hébergement PHP (mediamatique.ch).</p>';

        if (usePhp) {
            container.querySelector('input[type="file"]').addEventListener('change', function (e) {
                uploadFile(e.target.files[0], 'image').then(function (path) {
                    if (path) document.getElementById(e.target.dataset.uploadTarget).value = path;
                });
            });
        }
    }

    function uploadFile(file, kind) {
        if (!file || !usePhp) return Promise.resolve(null);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('kind', kind);
        return fetch('/php/upload-file.php', {
            method: 'POST',
            headers: { 'X-Admin-Email': getSessionEmail(), 'X-Admin-Password': getSessionPassword() },
            body: formData
        })
            .then(function (res) { return res.json(); })
            .then(function (data) { return data.path || null; })
            .catch(function () { return null; });
    }

    function buildUploadField(kind, onUploaded) {
        if (!usePhp) {
            const p = document.createElement('p');
            p.className = 'upload-unavailable';
            p.textContent = "Upload disponible uniquement sur l'hébergement PHP (mediamatique.ch).";
            return p;
        }
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = kind === 'document' ? 'application/pdf' : 'image/png,image/jpeg,image/webp';
        input.addEventListener('change', function () {
            uploadFile(input.files[0], kind).then(function (path) {
                if (path) onUploaded(path);
            });
        });
        return input;
    }

    // ---------- Présentation ----------

    function loadPresentation() {
        return window.EPortfolioContent.fetchContent('presentation').then(function (data) {
            document.getElementById('presPhoto').value = data.photo || '';
            const list = document.getElementById('presParagraphs');
            list.innerHTML = '';
            (data.paragraphs || ['']).forEach(function (p) { addParagraphField(p); });
        });
    }

    function addParagraphField(value) {
        const list = document.getElementById('presParagraphs');
        const wrapper = document.createElement('div');
        wrapper.className = 'item-card';
        const textarea = document.createElement('textarea');
        textarea.value = value || '';
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-danger btn-small';
        removeBtn.textContent = 'Supprimer';
        removeBtn.style.marginTop = '8px';
        removeBtn.addEventListener('click', function () { wrapper.remove(); });
        wrapper.appendChild(textarea);
        wrapper.appendChild(document.createElement('br'));
        wrapper.appendChild(removeBtn);
        list.appendChild(wrapper);
    }

    function savePresentation() {
        const status = document.getElementById('presStatus');
        status.textContent = 'Enregistrement…';
        const paragraphs = Array.from(document.querySelectorAll('#presParagraphs textarea')).map(function (t) { return t.value; });
        fetch(contentUrl('presentation'), {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ photo: document.getElementById('presPhoto').value, paragraphs: paragraphs })
        })
            .then(function (res) { if (!res.ok) throw new Error(); return res.json(); })
            .then(function () { status.textContent = 'Enregistré ✓'; setTimeout(function () { status.textContent = ''; }, 3000); })
            .catch(function () { status.textContent = 'Erreur lors de l\'enregistrement.'; });
    }

    // ---------- Timeline (formation, expérience, langues) ----------

    function moveItem(el, direction) {
        const parent = el.parentElement;
        if (direction === -1 && el.previousElementSibling) parent.insertBefore(el, el.previousElementSibling);
        if (direction === 1 && el.nextElementSibling) parent.insertBefore(el.nextElementSibling, el);
    }

    function addFormationField(item) {
        item = item || {};
        const list = document.getElementById('formationList');
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML =
            '<div class="item-card-header"><span>Formation</span><div class="item-actions">' +
            '<button class="btn btn-secondary btn-small" data-action="up">▲</button>' +
            '<button class="btn btn-secondary btn-small" data-action="down">▼</button>' +
            '<button class="btn btn-danger btn-small" data-action="remove">Supprimer</button>' +
            '</div></div>' +
            '<label>Titre</label><input type="text" data-field="title" value="' + escapeAttr(item.title) + '">' +
            '<label>Lieu / période</label><input type="text" data-field="place" value="' + escapeAttr(item.place) + '">';
        bindItemActions(card, list);
        list.appendChild(card);
    }

    function addExperienceField(item) {
        item = item || {};
        const list = document.getElementById('experienceList');
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML =
            '<div class="item-card-header"><span>Expérience</span><div class="item-actions">' +
            '<button class="btn btn-secondary btn-small" data-action="up">▲</button>' +
            '<button class="btn btn-secondary btn-small" data-action="down">▼</button>' +
            '<button class="btn btn-danger btn-small" data-action="remove">Supprimer</button>' +
            '</div></div>' +
            '<label>Titre</label><input type="text" data-field="title" value="' + escapeAttr(item.title) + '">' +
            '<label>Date</label><input type="text" data-field="date" value="' + escapeAttr(item.date) + '">' +
            '<label>Lieu</label><input type="text" data-field="place" value="' + escapeAttr(item.place) + '">' +
            '<label>Description</label><textarea data-field="description">' + escapeHtml(item.description) + '</textarea>' +
            '<div class="checkbox-row"><input type="checkbox" data-field="extra" id="extra-' + Math.random().toString(36).slice(2) + '"' + (item.extra ? ' checked' : '') + '>' +
            '<label>Masquée par défaut (repliée sous "Voir plus")</label></div>';
        bindItemActions(card, list);
        list.appendChild(card);
    }

    function addLanguageField(item) {
        item = item || {};
        const list = document.getElementById('languagesList');
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML =
            '<div class="item-card-header"><span>Langue</span><div class="item-actions">' +
            '<button class="btn btn-secondary btn-small" data-action="up">▲</button>' +
            '<button class="btn btn-secondary btn-small" data-action="down">▼</button>' +
            '<button class="btn btn-danger btn-small" data-action="remove">Supprimer</button>' +
            '</div></div>' +
            '<label>Nom</label><input type="text" data-field="name" value="' + escapeAttr(item.name) + '">' +
            '<label>Niveau</label><input type="text" data-field="level" value="' + escapeAttr(item.level) + '">';
        bindItemActions(card, list);
        list.appendChild(card);
    }

    function bindItemActions(card, list) {
        card.querySelector('[data-action="up"]').addEventListener('click', function () { moveItem(card, -1); });
        card.querySelector('[data-action="down"]').addEventListener('click', function () { moveItem(card, 1); });
        card.querySelector('[data-action="remove"]').addEventListener('click', function () { card.remove(); });
    }

    function readItemFields(card) {
        const result = {};
        card.querySelectorAll('[data-field]').forEach(function (el) {
            if (el.type === 'checkbox') result[el.dataset.field] = el.checked;
            else result[el.dataset.field] = el.value;
        });
        return result;
    }

    function loadTimeline() {
        return window.EPortfolioContent.fetchContent('timeline').then(function (data) {
            document.getElementById('formationList').innerHTML = '';
            document.getElementById('experienceList').innerHTML = '';
            document.getElementById('languagesList').innerHTML = '';
            (data.formation || []).forEach(addFormationField);
            (data.experience || []).forEach(addExperienceField);
            (data.languages || []).forEach(addLanguageField);
        });
    }

    function saveTimeline() {
        const status = document.getElementById('timelineStatus');
        status.textContent = 'Enregistrement…';
        const formation = Array.from(document.querySelectorAll('#formationList .item-card')).map(readItemFields);
        const experience = Array.from(document.querySelectorAll('#experienceList .item-card')).map(readItemFields);
        const languages = Array.from(document.querySelectorAll('#languagesList .item-card')).map(readItemFields);

        fetch(contentUrl('timeline'), {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ formation: formation, experience: experience, languages: languages })
        })
            .then(function (res) { if (!res.ok) throw new Error(); return res.json(); })
            .then(function () { status.textContent = 'Enregistré ✓'; setTimeout(function () { status.textContent = ''; }, 3000); })
            .catch(function () { status.textContent = 'Erreur lors de l\'enregistrement.'; });
    }

    // ---------- Compétences & outils ----------

    function addSkillsCategoryField(cat) {
        cat = cat || { label: '', skills: [] };
        const list = document.getElementById('skillsCategoriesList');
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML =
            '<div class="item-card-header"><span>Catégorie</span><div class="item-actions">' +
            '<button class="btn btn-secondary btn-small" data-action="up">▲</button>' +
            '<button class="btn btn-secondary btn-small" data-action="down">▼</button>' +
            '<button class="btn btn-danger btn-small" data-action="remove">Supprimer</button>' +
            '</div></div>' +
            '<label>Nom de la catégorie</label><input type="text" data-field="label" value="' + escapeAttr(cat.label) + '">' +
            '<div data-skills-inner></div>' +
            '<button class="btn btn-secondary btn-small" data-action="add-skill" style="margin-top:8px;">+ Ajouter un logiciel</button>';
        bindItemActions(card, list);

        const inner = card.querySelector('[data-skills-inner]');
        function addSkillRow(skill) {
            skill = skill || { label: '', level: 0 };
            const row = document.createElement('div');
            row.className = 'slider-row';
            row.innerHTML =
                '<input type="text" data-field="skill-label" value="' + escapeAttr(skill.label) + '" style="flex:1;" placeholder="Nom du logiciel">' +
                '<input type="range" min="0" max="10" step="1" data-field="skill-level" value="' + (skill.level || 0) + '">' +
                '<span>' + (skill.level || 0) + '/10</span>' +
                '<button class="btn btn-danger btn-small" data-action="remove-skill">✕</button>';
            row.querySelector('input[type="range"]').addEventListener('input', function (e) {
                row.querySelector('span').textContent = e.target.value + '/10';
            });
            row.querySelector('[data-action="remove-skill"]').addEventListener('click', function () { row.remove(); });
            inner.appendChild(row);
        }
        (cat.skills || []).forEach(addSkillRow);
        card.querySelector('[data-action="add-skill"]').addEventListener('click', function () { addSkillRow(); });

        list.appendChild(card);
    }

    function readSkillsCategory(card) {
        const label = card.querySelector('[data-field="label"]').value;
        const skills = Array.from(card.querySelectorAll('[data-skills-inner] .slider-row')).map(function (row) {
            return {
                label: row.querySelector('[data-field="skill-label"]').value,
                level: Number(row.querySelector('[data-field="skill-level"]').value)
            };
        });
        return { label: label, skills: skills };
    }

    function addToolsCategoryField(cat) {
        cat = cat || { label: '', items: [] };
        const list = document.getElementById('toolsCategoriesList');
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML =
            '<div class="item-card-header"><span>Catégorie</span><div class="item-actions">' +
            '<button class="btn btn-secondary btn-small" data-action="up">▲</button>' +
            '<button class="btn btn-secondary btn-small" data-action="down">▼</button>' +
            '<button class="btn btn-danger btn-small" data-action="remove">Supprimer</button>' +
            '</div></div>' +
            '<label>Nom de la catégorie</label><input type="text" data-field="label" value="' + escapeAttr(cat.label) + '">' +
            '<label>Logiciels (un par ligne)</label><textarea data-field="items">' + escapeHtml((cat.items || []).join('\n')) + '</textarea>';
        bindItemActions(card, list);
        list.appendChild(card);
    }

    function readToolsCategory(card) {
        const label = card.querySelector('[data-field="label"]').value;
        const items = card.querySelector('[data-field="items"]').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        return { label: label, items: items };
    }

    function loadSkills() {
        return window.EPortfolioContent.fetchContent('skills').then(function (data) {
            document.getElementById('skillsCategoriesList').innerHTML = '';
            document.getElementById('toolsCategoriesList').innerHTML = '';
            (data.categories || []).forEach(addSkillsCategoryField);
            (data.tools || []).forEach(addToolsCategoryField);
        });
    }

    function saveSkills() {
        const status = document.getElementById('skillsStatus');
        status.textContent = 'Enregistrement…';
        const categories = Array.from(document.querySelectorAll('#skillsCategoriesList .item-card')).map(readSkillsCategory);
        const tools = Array.from(document.querySelectorAll('#toolsCategoriesList .item-card')).map(readToolsCategory);

        fetch(contentUrl('skills'), {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ categories: categories, tools: tools })
        })
            .then(function (res) { if (!res.ok) throw new Error(); return res.json(); })
            .then(function () { status.textContent = 'Enregistré ✓'; setTimeout(function () { status.textContent = ''; }, 3000); })
            .catch(function () { status.textContent = 'Erreur lors de l\'enregistrement.'; });
    }

    // ---------- Projets CPNV ----------

    function addCpnvProjectField(project) {
        project = project || { title: '', category: 'design', categoryLabel: '', cardImage: '', cardImageAlt: '', cardDescription: '', detailText: '', gallery: [], documents: [], videos: [] };
        const list = document.getElementById('cpnvProjectsList');
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML =
            '<div class="item-card-header"><span>Projet</span><div class="item-actions">' +
            '<button class="btn btn-secondary btn-small" data-action="up">▲</button>' +
            '<button class="btn btn-secondary btn-small" data-action="down">▼</button>' +
            '<button class="btn btn-danger btn-small" data-action="remove">Supprimer</button>' +
            '</div></div>' +
            '<label>Titre</label><input type="text" data-field="title" value="' + escapeAttr(project.title) + '">' +
            '<label>Catégorie (design / multimedias / marketing)</label><input type="text" data-field="category" value="' + escapeAttr(project.category) + '">' +
            '<label>Libellé de la catégorie (affiché)</label><input type="text" data-field="categoryLabel" value="' + escapeAttr(project.categoryLabel) + '">' +
            '<label>Image de la carte</label><input type="text" data-field="cardImage" value="' + escapeAttr(project.cardImage) + '">' +
            '<div data-upload-card-image></div>' +
            '<label>Texte alternatif de l\'image</label><input type="text" data-field="cardImageAlt" value="' + escapeAttr(project.cardImageAlt) + '">' +
            '<label>Description (carte)</label><textarea data-field="cardDescription">' + escapeHtml(project.cardDescription) + '</textarea>' +
            '<label>Texte détaillé</label><textarea data-field="detailText">' + escapeHtml(project.detailText) + '</textarea>' +
            '<label>Galerie d\'images</label><div data-gallery-inner></div>' +
            '<button class="btn btn-secondary btn-small" data-action="add-gallery">+ Ajouter une image à la galerie</button>' +
            '<label>Image de couverture cliquable (optionnel, ex: aperçu PDF)</label>' +
            '<input type="text" data-field="cover-image" placeholder="Chemin de l\'image" value="' + escapeAttr(project.coverDocument ? project.coverDocument.image : '') + '">' +
            '<input type="text" data-field="cover-image-alt" placeholder="Texte alternatif" value="' + escapeAttr(project.coverDocument ? project.coverDocument.imageAlt : '') + '">' +
            '<input type="text" data-field="cover-file" placeholder="Chemin du PDF associé" value="' + escapeAttr(project.coverDocument ? project.coverDocument.file : '') + '">' +
            '<div data-upload-cover-image></div>' +
            '<label>Documents (PDF)</label><div data-documents-inner></div>' +
            '<button class="btn btn-secondary btn-small" data-action="add-document">+ Ajouter un document</button>' +
            '<label>Vidéos</label><div data-videos-inner></div>' +
            '<button class="btn btn-secondary btn-small" data-action="add-video">+ Ajouter une vidéo</button>';
        bindItemActions(card, list);

        const cardImageUploadContainer = card.querySelector('[data-upload-card-image]');
        cardImageUploadContainer.appendChild(buildUploadField('image', function (path) {
            card.querySelector('[data-field="cardImage"]').value = path;
        }));

        const coverImageUploadContainer = card.querySelector('[data-upload-cover-image]');
        coverImageUploadContainer.appendChild(buildUploadField('image', function (path) {
            card.querySelector('[data-field="cover-image"]').value = path;
        }));

        const galleryInner = card.querySelector('[data-gallery-inner]');
        function addGalleryRow(g) {
            g = g || { image: '', alt: '' };
            const row = document.createElement('div');
            row.className = 'gallery-item-row';
            row.innerHTML =
                '<input type="text" data-field="image" value="' + escapeAttr(g.image) + '" placeholder="Chemin de l\'image">' +
                '<input type="text" data-field="alt" value="' + escapeAttr(g.alt) + '" placeholder="Texte alternatif">';
            const uploadContainer = document.createElement('div');
            uploadContainer.appendChild(buildUploadField('image', function (path) { row.querySelector('[data-field="image"]').value = path; }));
            row.appendChild(uploadContainer);
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn btn-danger btn-small';
            removeBtn.textContent = 'Retirer de la galerie';
            removeBtn.addEventListener('click', function () { row.remove(); });
            row.appendChild(removeBtn);
            galleryInner.appendChild(row);
        }
        (project.gallery || []).forEach(addGalleryRow);
        card.querySelector('[data-action="add-gallery"]').addEventListener('click', function () { addGalleryRow(); });

        const documentsInner = card.querySelector('[data-documents-inner]');
        function addDocumentRow(d) {
            d = d || { label: '', file: '' };
            const row = document.createElement('div');
            row.className = 'doc-item-row';
            row.innerHTML =
                '<input type="text" data-field="label" value="' + escapeAttr(d.label) + '" placeholder="Libellé du lien">' +
                '<input type="text" data-field="file" value="' + escapeAttr(d.file) + '" placeholder="Chemin du PDF">';
            const uploadContainer = document.createElement('div');
            uploadContainer.appendChild(buildUploadField('document', function (path) { row.querySelector('[data-field="file"]').value = path; }));
            row.appendChild(uploadContainer);
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn btn-danger btn-small';
            removeBtn.textContent = 'Retirer';
            removeBtn.addEventListener('click', function () { row.remove(); });
            row.appendChild(removeBtn);
            documentsInner.appendChild(row);
        }
        (project.documents || []).forEach(addDocumentRow);
        card.querySelector('[data-action="add-document"]').addEventListener('click', function () { addDocumentRow(); });

        const videosInner = card.querySelector('[data-videos-inner]');
        function addVideoRow(v) {
            v = v || { url: '', thumbnail: '', alt: '', title: '', short: false };
            const row = document.createElement('div');
            row.className = 'video-item-row';
            row.innerHTML =
                '<input type="text" data-field="url" value="' + escapeAttr(v.url) + '" placeholder="URL YouTube">' +
                '<input type="text" data-field="thumbnail" value="' + escapeAttr(v.thumbnail) + '" placeholder="URL de la miniature">' +
                '<input type="text" data-field="alt" value="' + escapeAttr(v.alt) + '" placeholder="Texte alternatif">' +
                '<input type="text" data-field="title" value="' + escapeAttr(v.title) + '" placeholder="Titre affiché">' +
                '<div class="checkbox-row"><input type="checkbox" data-field="short"' + (v.short ? ' checked' : '') + '><label>Format court (short)</label></div>';
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn btn-danger btn-small';
            removeBtn.textContent = 'Retirer';
            removeBtn.addEventListener('click', function () { row.remove(); });
            row.appendChild(removeBtn);
            videosInner.appendChild(row);
        }
        (project.videos || []).forEach(addVideoRow);
        card.querySelector('[data-action="add-video"]').addEventListener('click', function () { addVideoRow(); });

        list.appendChild(card);
    }

    function readCpnvProject(card) {
        // ":scope > [data-field]" pour ne lire que les champs directs du
        // projet, pas ceux imbriqués dans ses lignes de galerie/documents/vidéos.
        const field = function (name) { return card.querySelector(':scope > [data-field="' + name + '"]').value; };
        const gallery = Array.from(card.querySelectorAll('[data-gallery-inner] .gallery-item-row')).map(function (row) {
            return { image: row.querySelector('[data-field="image"]').value, alt: row.querySelector('[data-field="alt"]').value };
        });
        const documents = Array.from(card.querySelectorAll('[data-documents-inner] .doc-item-row')).map(function (row) {
            return { label: row.querySelector('[data-field="label"]').value, file: row.querySelector('[data-field="file"]').value };
        });
        const videos = Array.from(card.querySelectorAll('[data-videos-inner] .video-item-row')).map(function (row) {
            return {
                url: row.querySelector('[data-field="url"]').value,
                thumbnail: row.querySelector('[data-field="thumbnail"]').value,
                alt: row.querySelector('[data-field="alt"]').value,
                title: row.querySelector('[data-field="title"]').value,
                short: row.querySelector('[data-field="short"]').checked
            };
        });

        const result = {
            title: field('title'),
            category: field('category'),
            categoryLabel: field('categoryLabel'),
            cardImage: field('cardImage'),
            cardImageAlt: field('cardImageAlt'),
            cardDescription: field('cardDescription'),
            detailText: field('detailText'),
            gallery: gallery,
            documents: documents,
            videos: videos
        };

        const coverImage = field('cover-image');
        const coverFile = field('cover-file');
        if (coverImage && coverFile) {
            result.coverDocument = { image: coverImage, imageAlt: field('cover-image-alt'), file: coverFile };
        }

        return result;
    }

    function loadCpnv() {
        return window.EPortfolioContent.fetchContent('cpnv').then(function (data) {
            document.getElementById('cpnvProjectsList').innerHTML = '';
            (data.projects || []).forEach(addCpnvProjectField);
        });
    }

    function saveCpnv() {
        const status = document.getElementById('cpnvStatus');
        status.textContent = 'Enregistrement…';
        const projects = Array.from(document.querySelectorAll('#cpnvProjectsList > .item-card')).map(readCpnvProject);

        fetch(contentUrl('cpnv'), {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ projects: projects })
        })
            .then(function (res) { if (!res.ok) throw new Error(); return res.json(); })
            .then(function () { status.textContent = 'Enregistré ✓'; setTimeout(function () { status.textContent = ''; }, 3000); })
            .catch(function () { status.textContent = 'Erreur lors de l\'enregistrement.'; });
    }

    // ---------- Réseaux sociaux ----------

    function loadSocial() {
        return window.EPortfolioContent.fetchContent('social').then(function (data) {
            document.getElementById('socialName').value = data.name || '';
            document.getElementById('socialPhone').value = data.phone || '';
            document.getElementById('socialPhoneDisplay').value = data.phoneDisplay || '';
            document.getElementById('socialInstagramPortfolio').value = data.instagramPortfolio || '';
            document.getElementById('socialInstagramLanterne').value = data.instagramLanterne || '';
            document.getElementById('socialLinkedin').value = data.linkedin || '';
            document.getElementById('socialEmail').value = data.email || '';
        });
    }

    function saveSocial() {
        const status = document.getElementById('socialStatus');
        status.textContent = 'Enregistrement…';
        fetch(contentUrl('social'), {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({
                name: document.getElementById('socialName').value,
                phone: document.getElementById('socialPhone').value,
                phoneDisplay: document.getElementById('socialPhoneDisplay').value,
                instagramPortfolio: document.getElementById('socialInstagramPortfolio').value,
                instagramLanterne: document.getElementById('socialInstagramLanterne').value,
                linkedin: document.getElementById('socialLinkedin').value,
                email: document.getElementById('socialEmail').value
            })
        })
            .then(function (res) { if (!res.ok) throw new Error(); return res.json(); })
            .then(function () { status.textContent = 'Enregistré ✓'; setTimeout(function () { status.textContent = ''; }, 3000); })
            .catch(function () { status.textContent = 'Erreur lors de l\'enregistrement.'; });
    }

    // ---------- Changement de code ----------

    function changePassword() {
        const newPassword = document.getElementById('newPasswordInput').value;
        const confirmPassword = document.getElementById('newPasswordConfirmInput').value;
        const status = document.getElementById('changePasswordStatus');
        status.textContent = '';

        if (newPassword.length < 4) { status.textContent = 'Le nouveau code doit contenir au moins 4 caractères.'; return; }
        if (newPassword !== confirmPassword) { status.textContent = 'Les deux codes ne correspondent pas.'; return; }

        status.textContent = 'Changement en cours…';
        fetch(authUrl('auth-change-password'), {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ newPassword: newPassword })
        })
            .then(function (res) { if (!res.ok) throw new Error(); return res.json(); })
            .then(function () {
                sessionStorage.setItem(SESSION_PASSWORD_KEY, newPassword);
                document.getElementById('newPasswordInput').value = '';
                document.getElementById('newPasswordConfirmInput').value = '';
                status.textContent = 'Code changé ✓';
                setTimeout(function () { status.textContent = ''; }, 4000);
            })
            .catch(function () { status.textContent = 'Erreur lors du changement de code.'; });
    }

    // ---------- Utilitaires ----------

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str == null ? '' : String(str);
        return div.innerHTML;
    }

    function escapeAttr(str) {
        return escapeHtml(str).replace(/"/g, '&quot;');
    }

    function loadAllSections() {
        loadPresentation();
        loadTimeline();
        loadSkills();
        loadCpnv();
        loadSocial();
    }

    // ---------- Initialisation ----------

    document.addEventListener('DOMContentLoaded', function () {
        initTabs();

        document.getElementById('loginBtn').addEventListener('click', attemptLogin);
        document.getElementById('emailInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') attemptLogin(); });
        document.getElementById('passwordInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') attemptLogin(); });

        document.getElementById('presAddParagraph').addEventListener('click', function () { addParagraphField(''); });
        document.getElementById('presSaveBtn').addEventListener('click', savePresentation);

        document.getElementById('formationAddBtn').addEventListener('click', function () { addFormationField(); });
        document.getElementById('experienceAddBtn').addEventListener('click', function () { addExperienceField(); });
        document.getElementById('languagesAddBtn').addEventListener('click', function () { addLanguageField(); });
        document.getElementById('timelineSaveBtn').addEventListener('click', saveTimeline);

        document.getElementById('skillsAddCategoryBtn').addEventListener('click', function () { addSkillsCategoryField(); });
        document.getElementById('toolsAddCategoryBtn').addEventListener('click', function () { addToolsCategoryField(); });
        document.getElementById('skillsSaveBtn').addEventListener('click', saveSkills);

        document.getElementById('cpnvAddProjectBtn').addEventListener('click', function () { addCpnvProjectField(); });
        document.getElementById('cpnvSaveBtn').addEventListener('click', saveCpnv);

        document.getElementById('socialSaveBtn').addEventListener('click', saveSocial);

        document.getElementById('changePasswordBtn').addEventListener('click', changePassword);

        // Reste connectée pour la durée de l'onglet.
        if (getSessionEmail() && getSessionPassword()) {
            detectEnvironment().then(function () {
                return fetch(authUrl('auth-check'), { method: 'POST', headers: authHeaders(), body: JSON.stringify({}) });
            }).then(function (res) {
                if (res.ok) showBackOffice();
            }).catch(function () {});
        }
    });
})();
