// instagram-sync.mjs — synchronise les publications Instagram avec le site.
//
// Lancé toutes les heures par GitHub Actions (.github/workflows/instagram.yml),
// sans PHP ni service externe :
//   1. lit le token Instagram (chiffré dans .github/instagram-token.enc) ;
//   2. le renouvelle s'il a plus de 7 jours (il en dure 60) ;
//   3. récupère TOUTES les publications du compte via l'API Instagram ;
//   4. télécharge l'image de chaque nouvelle publication dans Images/instagram/
//      (les adresses d'images d'Instagram expirent, celles-ci non) ;
//   5. réécrit instagram-posts.js, lu par la grille (plugins/insta-grille).
//
// Variables d'environnement :
//   INSTAGRAM_TOKEN_KEY  phrase secrète qui chiffre le token (obligatoire)
//   INSTAGRAM_TOKEN      token de départ, utilisé seulement si le fichier
//                        chiffré n'existe pas encore (premier lancement)
//   INSTAGRAM_API_BASE   adresse de l'API (pour les tests uniquement)
//
// Node 18+ requis (fetch intégré). Aucune dépendance.

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const FICHIER_TOKEN = join(RACINE, '.github', 'instagram-token.enc');
const DOSSIER_IMAGES = join(RACINE, 'Images', 'instagram');
const FICHIER_POSTS = join(RACINE, 'instagram-posts.js');
const CHEMIN_IMAGES_SITE = 'Images/instagram/'; // chemin vu depuis index.html

const API = (process.env.INSTAGRAM_API_BASE || 'https://graph.instagram.com/v24.0/').replace(/\/?$/, '/');
const API_REFRESH = process.env.INSTAGRAM_API_BASE
    ? API + 'refresh_access_token'
    : 'https://graph.instagram.com/refresh_access_token';
const RENOUVELER_APRES = 7 * 24 * 3600 * 1000; // 7 jours

function arreter(message) {
    console.error('Erreur : ' + message);
    process.exit(1);
}

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

function lireToken(phrase) {
    if (existsSync(FICHIER_TOKEN)) {
        try {
            return dechiffrer(readFileSync(FICHIER_TOKEN, 'utf8'), phrase);
        } catch {
            arreter('impossible de déchiffrer .github/instagram-token.enc : INSTAGRAM_TOKEN_KEY a-t-il changé ?');
        }
    }
    const depart = (process.env.INSTAGRAM_TOKEN || '').trim();
    if (!depart) arreter('aucun token : ajoute le secret INSTAGRAM_TOKEN (voir plugins/insta-grille/README.md).');
    // renouvele_le à 0 : le token de départ sera prolongé dès qu'il aura 24 h.
    return { access_token: depart, renouvele_le: 0 };
}

function enregistrerToken(token, phrase) {
    mkdirSync(dirname(FICHIER_TOKEN), { recursive: true });
    writeFileSync(FICHIER_TOKEN, chiffrer(token, phrase));
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

async function telechargerImages(posts) {
    mkdirSync(DOSSIER_IMAGES, { recursive: true });
    const gardees = new Set();
    let nouvelles = 0;
    for (const post of posts) {
        const nom = post.id.replace(/[^\w-]/g, '') + '.jpg';
        const chemin = join(DOSSIER_IMAGES, nom);
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
        post.imageLocale = CHEMIN_IMAGES_SITE + nom;
    }
    // Publication supprimée sur Instagram : on retire aussi son image.
    let supprimees = 0;
    for (const fichier of readdirSync(DOSSIER_IMAGES)) {
        if (fichier.endsWith('.jpg') && !gardees.has(fichier)) {
            unlinkSync(join(DOSSIER_IMAGES, fichier));
            supprimees++;
        }
    }
    return { nouvelles, supprimees };
}

function ecrireListe(posts) {
    const liste = posts
        .filter((p) => p.imageLocale && p.permalink)
        .map((p) => ({
            image: p.imageLocale,
            lien: p.permalink,
            legende: (p.caption || '').replace(/\s+/g, ' ').trim().slice(0, 200),
            type: typePourGrille(p.media_type),
            date: p.timestamp || undefined
        }));
    const contenu =
        '// Fichier généré automatiquement par scripts/instagram-sync.mjs (GitHub Actions).\n' +
        '// Ne pas modifier à la main : il est réécrit à chaque nouvelle publication Instagram.\n' +
        'window.INSTA_POSTS = ' + JSON.stringify(liste, null, 4) + ';\n';
    const avant = existsSync(FICHIER_POSTS) ? readFileSync(FICHIER_POSTS, 'utf8') : '';
    if (avant !== contenu) writeFileSync(FICHIER_POSTS, contenu);
    return { total: liste.length, modifie: avant !== contenu };
}

// ---------- Programme ----------

const phrase = (process.env.INSTAGRAM_TOKEN_KEY || '').trim();
if (phrase.length < 16) arreter('le secret INSTAGRAM_TOKEN_KEY doit faire au moins 16 caractères.');

const token = lireToken(phrase);
const premierLancement = !existsSync(FICHIER_TOKEN);
const renouvele = await renouvelerSiBesoin(token);
if (premierLancement || renouvele) enregistrerToken(token, phrase);

let posts;
try {
    posts = await toutesLesPublications(token.access_token);
} catch (e) {
    arreter('Instagram a refusé la demande : ' + e.message);
}

const images = await telechargerImages(posts);
const liste = ecrireListe(posts);
console.log(
    liste.total + ' publication(s) — ' + images.nouvelles + ' nouvelle(s) image(s), ' +
    images.supprimees + ' supprimée(s)' + (liste.modifie ? ', liste mise à jour.' : ', aucun changement.')
);
