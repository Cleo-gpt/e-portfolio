// instagram-sync.mjs — synchronise les publications Instagram avec le site.
//
// Lancé toutes les heures par GitHub Actions (.github/workflows/instagram.yml),
// sans PHP ni service externe. Pour chaque compte de la liste COMPTES :
//   1. lit son token Instagram (chiffré dans .github/) ;
//   2. le renouvelle s'il a plus de 7 jours (il en dure 60) ;
//   3. récupère TOUTES les publications du compte via l'API Instagram ;
//   4. télécharge l'image de chaque nouvelle publication dans son dossier
//      d'images (les adresses d'images d'Instagram expirent, celles-ci non) ;
//   5. réécrit sa liste (ex : instagram-posts.js), lue par la grille
//      (plugins/insta-grille), en marquant les publications épinglées listées
//      dans son fichier d'épingles (l'API d'Instagram ne dit pas lesquelles).
//
// Variables d'environnement :
//   INSTAGRAM_TOKEN_KEY  phrase secrète qui chiffre les tokens (obligatoire)
//   INSTAGRAM_TOKEN      token de départ de @la_lanterne_de_yuna, utilisé
//                        seulement si son fichier chiffré n'existe pas encore
//   INSTAGRAM_TOKEN_PHOTO  idem pour @cleo1712_photographie (compte sauté tant
//                        qu'il n'a ni token ni fichier chiffré)
//   INSTAGRAM_API_BASE   adresse de l'API (pour les tests uniquement)
//
// Node 18+ requis (fetch intégré). Aucune dépendance.

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');

// Un compte = un token, un dossier d'images, une liste pour la grille et un
// fichier d'épingles. Chemins relatifs à la racine du site.
const COMPTES = [
    {
        nom: 'la_lanterne_de_yuna',
        token: '.github/instagram-token.enc',
        variableToken: 'INSTAGRAM_TOKEN',
        images: 'Images/instagram',
        liste: 'instagram-posts.js',
        variableListe: 'INSTA_POSTS',
        epingles: 'instagram-epingles.json'
    },
    {
        nom: 'cleo1712_photographie',
        token: '.github/instagram-photo-token.enc',
        variableToken: 'INSTAGRAM_TOKEN_PHOTO',
        images: 'Images/instagram-photo',
        liste: 'instagram-photo-posts.js',
        variableListe: 'INSTA_POSTS_PHOTO',
        epingles: 'instagram-photo-epingles.json',
        facultatif: true // pas encore de token : on le saute sans erreur
    }
];

const API = (process.env.INSTAGRAM_API_BASE || 'https://graph.instagram.com/v24.0/').replace(/\/?$/, '/');
const API_REFRESH = process.env.INSTAGRAM_API_BASE
    ? API + 'refresh_access_token'
    : 'https://graph.instagram.com/refresh_access_token';
const RENOUVELER_APRES = 7 * 24 * 3600 * 1000; // 7 jours


// ---------- Token chiffré (AES-256-GCM, clé dérivée de la phrase secrète) ----------

function cle(phrase) {
    return scryptSync(phrase, 'e-portfolio-instagram', 32);
}

function chiffrer(objet, phrase) {
    const iv = randomBytes(12);
    const chiffreur = createCipheriv('aes-256-gcm', cle(phrase), iv);
    const donnees = Buffer.concat([chiffreur.update(JSON.stringify(objet), 'utf8'), chiffreur.final()]);
    return [iv, chiffreur.getAuthTag(), donnees].map((b) => b.toString('base64')).join('.') + '\n';
}

function dechiffrer(texte, phrase) {
    const [iv, tag, donnees] = texte.trim().split('.').map((p) => Buffer.from(p, 'base64'));
    const dechiffreur = createDecipheriv('aes-256-gcm', cle(phrase), iv);
    dechiffreur.setAuthTag(tag);
    return JSON.parse(Buffer.concat([dechiffreur.update(donnees), dechiffreur.final()]).toString('utf8'));
}

// Token du compte, ou null s'il n'en a pas encore.
function lireToken(compte, phrase) {
    const fichier = join(RACINE, compte.token);
    if (existsSync(fichier)) {
        try {
            return dechiffrer(readFileSync(fichier, 'utf8'), phrase);
        } catch {
            throw new Error('impossible de déchiffrer ' + compte.token + ' : INSTAGRAM_TOKEN_KEY a-t-il changé ?');
        }
    }
    const depart = (process.env[compte.variableToken] || '').trim();
    if (!depart) return null;
    // renouvele_le à 0 : le token de départ sera prolongé dès qu'il aura 24 h.
    return { access_token: depart, renouvele_le: 0 };
}

function enregistrerToken(compte, token, phrase) {
    const fichier = join(RACINE, compte.token);
    mkdirSync(dirname(fichier), { recursive: true });
    writeFileSync(fichier, chiffrer(token, phrase));
}

// ---------- API Instagram ----------

async function appelerApi(url) {
    const reponse = await fetch(url);
    const corps = await reponse.json().catch(() => ({}));
    if (!reponse.ok) {
        const detail = corps.error && corps.error.message ? corps.error.message : 'HTTP ' + reponse.status;
        throw new Error(detail);
    }
    return corps;
}

// Prolonge le token de 60 jours. Meta refuse tant qu'il a moins de 24 h :
// dans ce cas on garde l'ancien et on réessaiera au prochain passage.
async function renouvelerSiBesoin(token) {
    if (Date.now() - token.renouvele_le < RENOUVELER_APRES) return false;
    try {
        const r = await appelerApi(API_REFRESH + '?grant_type=ig_refresh_token&access_token=' + encodeURIComponent(token.access_token));
        if (!r.access_token) return false;
        token.access_token = r.access_token;
        token.renouvele_le = Date.now();
        console.log('Token renouvelé (valable ' + Math.round((r.expires_in || 0) / 86400) + ' jours).');
        return true;
    } catch (e) {
        console.log('Renouvellement du token reporté : ' + e.message);
        return false;
    }
}

// Toutes les publications, page par page (50 par page), de la plus récente
// à la plus ancienne.
async function toutesLesPublications(accessToken) {
    const champs = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
    let url = API + 'me/media?fields=' + champs + '&limit=50&access_token=' + encodeURIComponent(accessToken);
    const posts = [];
    for (let page = 0; url && page < 100; page++) {
        const r = await appelerApi(url);
        posts.push(...(r.data || []));
        url = r.paging && r.paging.next ? r.paging.next : null;
    }
    return posts;
}

// ---------- Images et fichier de la grille ----------

// Les vidéos n'ont pas d'image : on prend leur miniature.
function adresseImage(post) {
    return post.media_type === 'VIDEO' ? post.thumbnail_url || null : post.media_url || post.thumbnail_url || null;
}

function typePourGrille(mediaType) {
    if (mediaType === 'VIDEO') return 'video';
    if (mediaType === 'CAROUSEL_ALBUM') return 'carrousel';
    return 'image';
}

async function telechargerImages(compte, posts) {
    const dossier = join(RACINE, compte.images);
    mkdirSync(dossier, { recursive: true });
    const gardees = new Set();
    let nouvelles = 0;
    for (const post of posts) {
        const nom = post.id.replace(/[^\w-]/g, '') + '.jpg';
        const chemin = join(dossier, nom);
        if (!existsSync(chemin)) {
            const source = adresseImage(post);
            if (!source) continue;
            const reponse = await fetch(source);
            if (!reponse.ok) {
                console.log('Image ignorée (' + reponse.status + ') : ' + post.permalink);
                continue;
            }
            writeFileSync(chemin, Buffer.from(await reponse.arrayBuffer()));
            nouvelles++;
        }
        gardees.add(nom);
        post.imageLocale = compte.images + '/' + nom; // chemin vu depuis index.html
    }
    // Publication supprimée sur Instagram : on retire aussi son image.
    let supprimees = 0;
    for (const fichier of readdirSync(dossier)) {
        if (fichier.endsWith('.jpg') && !gardees.has(fichier)) {
            unlinkSync(join(dossier, fichier));
            supprimees++;
        }
    }
    return { nouvelles, supprimees };
}

// Code court d'un post ("DeJkqygjHkN") à partir de son lien, quel qu'il soit.
function codeDuPost(lien) {
    const m = String(lien || '').match(/\/(?:p|reel|tv)\/([\w-]+)/);
    return m ? m[1] : null;
}

// Rang d'épinglage (1, 2, 3) de chaque post listé dans le fichier d'épingles.
function lireEpingles(compte) {
    const fichier = join(RACINE, compte.epingles);
    if (!existsSync(fichier)) return new Map();
    try {
        const liste = JSON.parse(readFileSync(fichier, 'utf8')).epingles || [];
        return new Map(liste.map((lien, i) => [codeDuPost(lien), i + 1]).filter(([code]) => code));
    } catch (e) {
        console.log(compte.epingles + ' illisible, ignoré : ' + e.message);
        return new Map();
    }
}

function ecrireListe(compte, posts) {
    const fichier = join(RACINE, compte.liste);
    const epingles = lireEpingles(compte);
    const liste = posts
        .filter((p) => p.imageLocale && p.permalink)
        .map((p) => ({
            image: p.imageLocale,
            lien: p.permalink,
            legende: (p.caption || '').replace(/\s+/g, ' ').trim().slice(0, 200),
            type: typePourGrille(p.media_type),
            date: p.timestamp || undefined,
            epingle: epingles.get(codeDuPost(p.permalink)) || undefined
        }));
    const contenu =
        '// Fichier généré automatiquement par scripts/instagram-sync.mjs (GitHub Actions).\n' +
        '// Ne pas modifier à la main : il est réécrit à chaque nouvelle publication Instagram.\n' +
        'window.' + compte.variableListe + ' = ' + JSON.stringify(liste, null, 4) + ';\n';
    const avant = existsSync(fichier) ? readFileSync(fichier, 'utf8') : '';
    if (avant !== contenu) writeFileSync(fichier, contenu);
    return { total: liste.length, modifie: avant !== contenu };
}

// ---------- Programme ----------

async function synchroniser(compte, phrase) {
    const token = lireToken(compte, phrase);
    if (!token) {
        if (compte.facultatif) {
            console.log('@' + compte.nom + ' : pas encore de token (secret ' + compte.variableToken + '), compte sauté.');
            return;
        }
        throw new Error('aucun token : ajoute le secret ' + compte.variableToken + ' (voir plugins/insta-grille/README.md).');
    }
    const premierLancement = !existsSync(join(RACINE, compte.token));
    const renouvele = await renouvelerSiBesoin(token);
    if (premierLancement || renouvele) enregistrerToken(compte, token, phrase);

    let posts;
    try {
        posts = await toutesLesPublications(token.access_token);
    } catch (e) {
        throw new Error('Instagram a refusé la demande : ' + e.message);
    }

    const images = await telechargerImages(compte, posts);
    const liste = ecrireListe(compte, posts);
    console.log(
        '@' + compte.nom + ' : ' + liste.total + ' publication(s) — ' + images.nouvelles + ' nouvelle(s) image(s), ' +
        images.supprimees + ' supprimée(s)' + (liste.modifie ? ', liste mise à jour.' : ', aucun changement.')
    );
}

const phrase = (process.env.INSTAGRAM_TOKEN_KEY || '').trim();
if (phrase.length < 16) {
    console.error('Erreur : le secret INSTAGRAM_TOKEN_KEY doit faire au moins 16 caractères.');
    process.exit(1);
}

// Un compte en panne n'empêche pas de mettre les autres à jour.
let echecs = 0;
for (const compte of COMPTES) {
    try {
        await synchroniser(compte, phrase);
    } catch (e) {
        console.error('Erreur @' + compte.nom + ' : ' + e.message);
        echecs++;
    }
}
if (echecs) process.exit(1);
