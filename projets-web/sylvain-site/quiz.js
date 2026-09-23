// ══════════════════════════════════════════════════════════════════
// CONFIGURATION — Données du quiz
// ══════════════════════════════════════════════════════════════════

// Liste de toutes les questions.
// Chaque objet contient :
//   q       : le texte de la question
//   opts    : le tableau des réponses possibles
//   correct : l'index (0-based) de la bonne réponse
//   type    : (optionnel) 'select' → liste déroulante,
//                          'radio'  → boutons radio sans lettre,
//                          absent   → boutons avec lettre (A, B, C…)
const QUESTIONS = [ // tableau contenant tous les objets de questions du quiz
    { q: 'Quel est le vrai nom de Sylvain Lyve ?',
      opts: ['Sylvain Laurent', 'Sylvain Levy', 'Sylvain Lebrun', 'Sylvain Leclerc'], correct: 1 }, // bonne réponse : index 1 = "Sylvain Levy"
    { q: "Quelle est la date d'anniversaire de Sylvain Lyve ?",
      opts: ['12 mars', '3 octobre', '16 juin', '28 janvier', '5 février', '21 décembre', '9 août', '30 avril'],
      correct: 2, type: 'select' }, // affiché en liste déroulante car beaucoup d'options ; bonne réponse : index 2 = "16 juin"
    { q: 'Quelle est la taille de Sylvain Lyve ?',
      opts: ['1m60', '1m63', '1m65', '1m68', '1m70', '1m73', '1m75', '1m80'],
      correct: 4, type: 'select' }, // liste déroulante ; bonne réponse : index 4 = "1m70"
    { q: "Quel est l'objectif de vitesse du projet fou de Sylvain ?",
      opts: ['300 km/h', '400 km/h', '500 km/h', '600 km/h', '700 km/h', '800 km/h'],
      correct: 2, type: 'select' }, // liste déroulante ; bonne réponse : index 2 = "500 km/h"
    { q: 'Sur quelle marque de voiture repose le projet 500 km/h de Sylvain ?',
      opts: ['Renault', 'Peugeot', 'Citroën', 'BMW'], correct: 2 }, // bonne réponse : index 2 = "Citroën"
    { q: 'Sur quelle plateforme Sylvain Lyve est-il principalement présent ?',
      opts: ['TikTok', 'YouTube', 'Twitch', 'Instagram'], correct: 1 }, // bonne réponse : index 1 = "YouTube"
    { q: 'Dans quel domaine Sylvain Lyve crée-t-il principalement du contenu ?',
      opts: ['Cuisine', 'Jeux vidéo', 'Automobile', 'Voyage'], correct: 2 }, // bonne réponse : index 2 = "Automobile"
    { q: 'Quelle couleur est la Citroën du projet 500 km/h dans sa miniature ?',
      opts: ['Bleue', 'Noire', 'Rouge', 'Blanche'], correct: 2 }, // bonne réponse : index 2 = "Rouge"
    { q: "Quelle immatriculation apparaît sur la Citroën du projet 500 km/h ?",
      opts: ['AB-123-CD', 'FK-923-KM', 'SL-500-KH', '75-LYVE-75'], correct: 1 }, // bonne réponse : index 1 = "FK-923-KM"
    { q: "Comment Sylvain Lyve décrit-il l'attente depuis son annonce du projet 500 ?",
      opts: ['"C\'est trop court"', '"C\'est atrocement long"', '"Le temps passe vite"', '"On y est presque"'], correct: 1 }, // bonne réponse : index 1 = "C'est atrocement long"
    { q: "Quel chiffre apparaît sur la photo d'identité (style casier judiciaire) de Sylvain ?",
      opts: ['1905025', '0025190', '5002519', '9052150'], correct: 0 }, // bonne réponse : index 0 = "1905025"
    { q: 'Quelle nationalité est Sylvain Lyve ?',
      opts: ['Belge', 'Suisse', 'Française', 'Canadienne', 'Luxembourgeoise', 'Monégasque'],
      correct: 2, type: 'select' }, // liste déroulante ; bonne réponse : index 2 = "Française"
    { q: 'Sur la photo de profil YouTube, avec quel véhicule Sylvain est-il en selfie ?',
      opts: ['Une Citroën', 'Une Renault', 'Une Volkswagen', 'Une Peugeot'], correct: 2, type: 'radio' }, // affiché en boutons radio sans lettre ; bonne réponse : index 2 = "Une Volkswagen"
    { q: 'Quel accessoire porte Sylvain sur sa photo de profil YouTube ?',
      opts: ['Un casque de moto', 'Des lunettes de soleil', 'Une casquette', 'Des gants de mécanicien'],
      correct: 1, type: 'radio' }, // boutons radio ; bonne réponse : index 1 = "Des lunettes de soleil"
    { q: 'Dans la vidéo podcast, devant quelle couleur de fond Sylvain est-il filmé ?',
      opts: ['Orange', 'Bleu', 'Violet / Rose', 'Vert'], correct: 2, type: 'radio' }, // boutons radio ; bonne réponse : index 2 = "Violet / Rose"
    { q: 'Quel équipement de sécurité porte Sylvain dans la miniature du projet 500 ?',
      opts: ['Un casque intégral', 'Une combinaison de pilote', 'Un gilet pare-balles', 'Rien de spécial'],
      correct: 1 }, // bonne réponse : index 1 = "Une combinaison de pilote"
    { q: 'Quel type de micro est visible dans la vidéo podcast ?',
      opts: ['Un micro-cravate', 'Un micro USB classique', 'Un micro de studio sur bras', 'Un micro de karaoké'],
      correct: 2, type: 'radio' }, // boutons radio ; bonne réponse : index 2 = "Un micro de studio sur bras"
    { q: 'Dans quelle catégorie de contenu Sylvain se distingue-t-il particulièrement ?',
      opts: ["Le contenu éducatif sérieux", "L'humour absurde mêlé à l'automobile", 'Les reviews tech', 'Le gaming'],
      correct: 1 }, // bonne réponse : index 1 = "L'humour absurde mêlé à l'automobile"
    { q: 'Quelle est la communauté de Sylvain Lyve sur internet ?',
      opts: ['Une communauté de gamers', 'Une communauté mode/lifestyle', 'Une communauté automobile francophone', 'Une communauté culinaire'],
      correct: 2 }, // bonne réponse : index 2 = "Une communauté automobile francophone"
    { q: 'Quel adjectif qualifie le mieux le style de Sylvain Lyve ?',
      opts: ['Austère et technique', 'Décalé et passionné', 'Sobre et académique', 'Agressif et polémique'],
      correct: 1 }, // bonne réponse : index 1 = "Décalé et passionné"
    { q: "Combien de temps après son annonce Sylvain a-t-il donné des nouvelles du projet 500 ?",
      opts: ['6 mois', '1 an', '2 ans', '3 mois'], correct: 1 }, // bonne réponse : index 1 = "1 an"
    { q: 'Quelle expression désigne le plus le projet de Sylvain Lyve ?',
      opts: ['Objectif 300', 'Mission Vitesse', 'Objectif 500 km/h', 'Speed 500'], correct: 2 }, // bonne réponse : index 2 = "Objectif 500 km/h"
    { q: "Sur la photo de type casier judiciaire, quelle mention indique la taille de Sylvain ?",
      opts: ['height : 1" 65', 'height : 1" 70', 'height : 1" 75', 'height : 1" 80'], correct: 1 }, // bonne réponse : index 1 = 'height : 1" 70'
    { q: 'Quel style de veste Sylvain porte-t-il dans la vidéo podcast ?',
      opts: ['Une veste de costume noire', 'Une veste en cuir', 'Une veste style chemise beige décontractée', 'Un hoodie'],
      correct: 2 }, // bonne réponse : index 2 = "Une veste style chemise beige décontractée"
    { q: 'Quelle est la particularité du projet 500 km/h de Sylvain comparé aux records habituels ?',
      opts: ["C'est un projet Ferrari officiel", "Il utilise une voiture de série modifiée — une Citroën", "Il bat un record déjà établi", "C'est fait sur circuit fermé homologué FIA"],
      correct: 1 }, // bonne réponse : index 1 = "Il utilise une voiture de série modifiée — une Citroën"
];

// Lettres utilisées pour labelliser les options du mode "buttons" (A, B, C…)
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']; // tableau des étiquettes alphabétiques pour les boutons de réponse


// ══════════════════════════════════════════════════════════════════
// ÉTAT — Variables de session
// ══════════════════════════════════════════════════════════════════

// État courant du quiz (réinitialisé ou restauré depuis sessionStorage)
let pseudo = ''; // stocke le pseudo saisi par l'utilisateur
let userAnswers = new Array(QUESTIONS.length).fill(null); // tableau indexé par question, initialisé à null = pas encore répondu
let submitted = false; // indique si le quiz a été validé et soumis
let startTime = Date.now(); // timestamp de démarrage, pour calculer la durée

// Restauration de la session précédente si elle existe (ex: rechargement de page)
const savedAnswers   = sessionStorage.getItem('quizAnswers'); // récupère les réponses précédemment sauvegardées
const savedPseudo    = sessionStorage.getItem('quizPseudo'); // récupère le pseudo précédemment sauvegardé
const savedSubmitted = sessionStorage.getItem('quizSubmitted'); // récupère l'état de soumission précédent
const savedStart     = sessionStorage.getItem('quizStartTime'); // récupère le timestamp de démarrage précédent

if (savedAnswers)           userAnswers = JSON.parse(savedAnswers); // restaure le tableau des réponses s'il existe en session
if (savedPseudo)            pseudo = savedPseudo; // restaure le pseudo s'il existe en session
if (savedSubmitted === 'true') submitted = true; // restaure l'état soumis en convertissant la chaîne en booléen
if (savedStart)             startTime = parseInt(savedStart); // restaure le timestamp de début en le convertissant en entier
else                        sessionStorage.setItem('quizStartTime', startTime); // enregistre le timestamp de démarrage si c'est une nouvelle session


// ══════════════════════════════════════════════════════════════════
// PERSISTANCE — Sauvegarde en session
// ══════════════════════════════════════════════════════════════════

// Enregistre l'état courant dans sessionStorage pour survivre aux rechargements.
function saveState() {
    sessionStorage.setItem('quizAnswers',   JSON.stringify(userAnswers)); // sérialise et persiste le tableau de réponses
    sessionStorage.setItem('quizPseudo',    pseudo); // persiste le pseudo courant
    sessionStorage.setItem('quizSubmitted', submitted); // persiste l'état de soumission (converti automatiquement en chaîne)
}


// ══════════════════════════════════════════════════════════════════
// UTILITAIRES
// ══════════════════════════════════════════════════════════════════

// Échappe les caractères HTML spéciaux pour éviter les injections XSS
// lors de l'affichage de la valeur du pseudo dans l'attribut HTML.
function escHtml(str) {
    return str
        .replace(/&/g, '&amp;') // remplace & par son entité HTML pour éviter l'ambiguïté
        .replace(/</g, '&lt;') // remplace < pour empêcher l'ouverture de balises non voulues
        .replace(/>/g, '&gt;') // remplace > pour empêcher la fermeture de balises non voulues
        .replace(/"/g, '&quot;'); // remplace " pour sécuriser les valeurs dans les attributs HTML
}


// ══════════════════════════════════════════════════════════════════
// RENDU — Affichage principal
// ══════════════════════════════════════════════════════════════════

// Point d'entrée du rendu : redirige vers le résultat si le quiz
// est déjà soumis, sinon affiche le formulaire complet.
function render() {
    const container = document.getElementById('quiz-container'); // cible le div principal qui accueille tout le contenu du quiz

    if (submitted) { // si le quiz est déjà soumis, on passe directement à l'écran de résultat
        renderResult(container); // délègue l'affichage de l'écran de résultat
        return; // stoppe l'exécution pour ne pas générer le formulaire
    }

    // Bloc de saisie du pseudo
    const pseudoBlock = `
        <div class="quiz-start-block">
            <label for="pseudo-input">Ton pseudo</label>
            <input type="text" id="pseudo-input" placeholder="Entrez votre pseudo..." maxlength="30" value="${escHtml(pseudo)}">
        </div>`; // construit le HTML du champ de saisie du pseudo avec la valeur restaurée échappée

    // Génération de toutes les cartes de questions
    const questions = QUESTIONS.map((q, i) => renderQuestion(q, i)).join(''); // génère le HTML de chaque question et les concatène en une seule chaîne

    // Bouton de validation du quiz
    const submitBtn = `
        <div class="quiz-submit">
            <button class="btn btn-primary" onclick="submitQuiz()">Terminer le quiz</button>
        </div>`; // construit le HTML du bouton de soumission qui déclenche submitQuiz()

    container.innerHTML = pseudoBlock + `<form id="quiz-form" onsubmit="return false;">` + questions + submitBtn + `</form>`; // assemble et injecte l'intégralité du formulaire dans le DOM

    // Mise à jour du pseudo en temps réel à chaque frappe
    document.getElementById('pseudo-input').addEventListener('input', e => { // écoute chaque frappe dans le champ pseudo
        pseudo = e.target.value; // met à jour la variable globale avec la valeur saisie
        saveState(); // persiste immédiatement le nouveau pseudo en session
    });
}

// Génère le HTML d'une question selon son type d'affichage :
//   'select' → liste déroulante (utile pour beaucoup d'options)
//   'radio'  → boutons radio sans lettre
//   default  → boutons avec lettre (A, B, C…)
function renderQuestion(q, i) {
    const type = q.type || 'buttons'; // lit le type de la question ou utilise 'buttons' comme valeur par défaut
    let inputsHtml = ''; // initialise la chaîne HTML des champs de réponse à vide

    if (type === 'select') { // branche vers le rendu liste déroulante
        // Liste déroulante : pré-sélectionne la réponse sauvegardée si elle existe
        const opts = q.opts.map((opt, j) =>
            `<option value="${j}" ${userAnswers[i] === j ? 'selected' : ''}>${opt}</option>`
        ).join(''); // construit chaque <option> en marquant comme selected l'index de la réponse déjà choisie
        inputsHtml = `
            <div class="select-wrap">
                <select class="quiz-select" onchange="setAnswer(${i}, parseInt(this.value))">
                    <option value="">-- Choisissez une réponse --</option>
                    ${opts}
                </select>
            </div>`; // enveloppe les options dans un <select> dont le changement appelle setAnswer avec l'index converti en entier

    } else if (type === 'radio') { // branche vers le rendu boutons radio sans lettre
        // Boutons radio sans lettre préfixe
        inputsHtml = `<div class="radio-group">` + q.opts.map((opt, j) => `
            <label class="radio-label">
                <input type="radio" name="q${i}" value="${j}" ${userAnswers[i] === j ? 'checked' : ''}
                    onchange="setAnswer(${i}, ${j})">
                <span class="radio-text">${opt}</span>
            </label>`).join('') + `</div>`; // génère un bouton radio par option, en cochant celui qui correspond à la réponse déjà sauvegardée

    } else { // branche par défaut : boutons avec lettre (A, B, C…)
        // Boutons radio avec lettre (A, B, C…) — mode par défaut
        inputsHtml = `<div class="options">` + q.opts.map((opt, j) => `
            <label class="option-label">
                <input type="radio" name="q${i}" value="${j}" ${userAnswers[i] === j ? 'checked' : ''}
                    onchange="setAnswer(${i}, ${j})">
                <span class="opt-letter">${LETTERS[j]}</span>
                <span>${opt}</span>
            </label>`).join('') + `</div>`; // génère un bouton radio préfixé d'une lettre par option, avec cochage de la réponse sauvegardée
    }

    return `
        <div class="question-card" id="qcard-${i}">
            <div class="question-num">Question ${i + 1} / ${QUESTIONS.length}</div>
            <div class="question-text">${q.q}</div>
            ${inputsHtml}
        </div>`; // retourne la carte complète de la question avec son numéro, son texte et ses champs de réponse
}

// Affiche l'écran de résultat après soumission :
//   - score et pourcentage
//   - titre et message selon la performance
//   - récapitulatif détaillé de chaque réponse
function renderResult(container) {
    const score   = parseInt(sessionStorage.getItem('quizScore') || 0); // récupère le score stocké en session et le convertit en entier
    const total   = QUESTIONS.length; // nombre total de questions, utilisé pour calculer le pourcentage
    const pct     = Math.round((score / total) * 100); // calcule le pourcentage de bonnes réponses arrondi à l'entier le plus proche
    const answers = JSON.parse(sessionStorage.getItem('quizAnswersDetail') || '[]'); // désérialise le détail des réponses depuis la session

    // Message de résultat selon le pourcentage de bonnes réponses
    let title, msg; // déclare les variables qui recevront le titre et le message selon le score
    if (pct >= 90)      { title = '🏆 Légendaire !';       msg = 'Tu es un vrai expert de Sylvain Lyve !'; } // palier excellence : 90% et plus
    else if (pct >= 70) { title = '🔥 Excellent !';         msg = 'Tu connais vraiment bien Sylvain Lyve. Bravo !'; } // palier très bon : entre 70% et 89%
    else if (pct >= 50) { title = '👍 Pas mal !';           msg = 'Encore quelques vidéos à regarder !'; } // palier moyen : entre 50% et 69%
    else if (pct >= 30) { title = '🚗 En apprentissage…';  msg = 'Regarde plus de contenu de Sylvain Lyve !'; } // palier faible : entre 30% et 49%
    else                { title = '😅 Oups !';             msg = 'Tu découvres Sylvain Lyve ?'; } // palier très faible : moins de 30%

    // Construction du récapitulatif : une ligne par question avec correction colorée
    const recap = answers.map((a, i) => `
        <div class="recap-item ${a.isCorrect ? 'ok' : 'ko'}">
            <div class="recap-q">${i + 1}. ${a.question}</div>
            <div class="recap-a">
                Ta réponse : <span class="${a.isCorrect ? 'correct-tag' : 'wrong-tag'}">${a.chosen}</span>
                ${!a.isCorrect ? `&mdash; Bonne réponse : <span class="correct-tag">${a.correct}</span>` : ''}
            </div>
        </div>`).join(''); // génère une ligne de récapitulatif par question avec classe CSS ok/ko et affiche la correction si la réponse est fausse

    container.innerHTML = `
        <div class="quiz-result">
            <div class="result-score">${score} <span>/ ${total}</span></div>
            <div class="result-title">${title}</div>
            <p class="result-msg">${msg}</p>
            <div class="result-actions">
                <a href="admin.php" class="btn btn-primary">Voir les résultats</a>
                <a href="#" class="btn btn-outline" onclick="resetQuiz()">Rejouer</a>
            </div>
            <details class="answers-recap">
                <summary>Détail de mes réponses</summary>
                ${recap}
            </details>
        </div>`; // injecte l'écran de résultat complet avec score, message, boutons d'action et récapitulatif dépliable
}


// ══════════════════════════════════════════════════════════════════
// INTERACTIONS — Actions de l'utilisateur
// ══════════════════════════════════════════════════════════════════

// Enregistre la réponse de l'utilisateur pour la question d'index i.
// Appelé à chaque changement de sélection (onchange).
function setAnswer(i, val) {
    userAnswers[i] = val; // stocke l'index de l'option choisie pour la question i
    saveState(); // persiste immédiatement les réponses en session pour éviter toute perte
}

// Valide et soumet le quiz :
//   1. Vérifie que le pseudo est renseigné
//   2. Vérifie que toutes les questions ont une réponse
//   3. Calcule le score
//   4. Envoie le résultat à l'API (api.php)
//   5. Passe en mode "résultat" et re-render
async function submitQuiz() {
    pseudo = document.getElementById('pseudo-input')?.value.trim() || pseudo; // récupère le pseudo depuis le champ, en fallback sur la variable globale si le champ est absent
    if (!pseudo) { alert('Entre ton pseudo avant de valider !'); return; } // bloque la soumission si aucun pseudo n'est saisi

    // Détection des questions sans réponse
    const unanswered = userAnswers.map((a, i) => a === null ? i + 1 : null).filter(Boolean); // construit la liste des numéros de questions sans réponse (1-based)
    if (unanswered.length > 0) { // bloque la soumission si au moins une question est sans réponse
        alert(`Tu n'as pas répondu aux questions : ${unanswered.join(', ')}`); // affiche la liste des questions manquantes
        return; // stoppe la soumission pour forcer l'utilisateur à compléter le quiz
    }

    // Calcul du score et construction du détail des réponses
    let score = 0; // initialise le compteur de bonnes réponses
    const answers = QUESTIONS.map((q, i) => { // parcourt chaque question pour évaluer la réponse donnée
        const chosen    = userAnswers[i]; // récupère l'index de la réponse choisie pour cette question
        const isCorrect = chosen === q.correct; // compare l'index choisi à l'index de la bonne réponse
        if (isCorrect) score++; // incrémente le score si la réponse est juste
        return {
            question: q.q, // texte de la question pour l'affichage dans le récapitulatif
            chosen:   chosen !== null ? q.opts[chosen] : '(sans réponse)', // texte de l'option choisie ou mention explicite si aucune
            correct:  q.opts[q.correct], // texte de la bonne réponse pour la correction
            isCorrect // booléen indiquant si la réponse était juste
        };
    });

    // Envoi du résultat à l'API (erreur non bloquante : on continue quoi qu'il arrive)
    const duration_seconds = Math.round((Date.now() - startTime) / 1000); // calcule la durée totale du quiz en secondes
    try {
        const response = await fetch('api.php?action=quiz', { // envoie une requête POST à l'API pour sauvegarder le résultat
            method:  'POST', // méthode HTTP POST pour envoyer des données
            headers: { 'Content-Type': 'application/json' }, // indique que le corps de la requête est du JSON
            body:    JSON.stringify({ pseudo, score, total: QUESTIONS.length, answers, duration_seconds }) // sérialise toutes les données du quiz pour l'envoi
        });
        if (!response.ok) console.error('Erreur API:', await response.text()); // log l'erreur serveur sans bloquer la suite si l'API répond en erreur
    } catch (e) {
        console.error('Erreur sauvegarde:', e); // log les erreurs réseau sans bloquer l'affichage du résultat
    }

    // Marque le quiz comme soumis, sauvegarde et affiche les résultats
    submitted = true; // bascule l'état global pour indiquer que le quiz est terminé
    sessionStorage.setItem('quizScore',          score); // persiste le score pour le récupérer dans renderResult
    sessionStorage.setItem('quizAnswersDetail',  JSON.stringify(answers)); // persiste le détail des réponses pour le récapitulatif
    saveState(); // sauvegarde l'état complet incluant submitted = true
    render(); // relance le rendu qui va détecter submitted=true et afficher l'écran de résultat
}

// Remet le quiz à zéro : vide la session et réinitialise toutes les variables.
function resetQuiz() {
    sessionStorage.clear(); // supprime toutes les données du quiz stockées en session
    userAnswers = new Array(QUESTIONS.length).fill(null); // recrée le tableau de réponses vierge de la taille du quiz
    pseudo      = ''; // efface le pseudo pour repartir d'une ardoise vierge
    submitted   = false; // repasse l'état en non-soumis pour afficher le formulaire
    render(); // relance le rendu pour afficher le formulaire de quiz vide
}


// ══════════════════════════════════════════════════════════════════
// INITIALISATION
// ══════════════════════════════════════════════════════════════════

// Premier rendu au chargement de la page
render(); // déclenche l'affichage initial du quiz dès que le script est exécuté
