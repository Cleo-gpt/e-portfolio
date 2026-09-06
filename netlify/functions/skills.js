// Fonction serverless Netlify : lit et écrit les niveaux de maîtrise des
// logiciels ("Maîtrise des logiciels" sur l'E-portefolio) dans un store
// Netlify Blobs, partagé par tous les visiteurs du site.
//
// GET  -> public, renvoie les niveaux actuels (ou les valeurs par défaut).
// POST -> protégé par email + code, met à jour les niveaux (ou le code).
//
// L'email admin est lu depuis la variable d'environnement du site Netlify
// (Site settings > Environment variables) :
//   - ADMIN_EMAIL -> l'adresse exigée pour se connecter (repli codé en dur
//     si non configurée)
//
// Le code admin est stocké dans Netlify Blobs et modifiable depuis
// admin.html (action __changePassword). Au tout premier lancement, avant
// tout changement, le code de repli est lu depuis la variable
// d'environnement ADMIN_PASSWORD si elle existe.

const { getStore } = require("@netlify/blobs");

const STORE_NAME = "skill-levels";
const BLOB_KEY = "levels";
const AUTH_STORE_NAME = "admin-auth";
const AUTH_KEY = "credentials";
const FALLBACK_EMAIL = "cleoforclaz2007@gmail.com";

const DEFAULT_SKILLS = {
    "adobe-illustrator": 8,
    "adobe-photoshop": 7,
    "adobe-indesign": 8,
    "google-slides": 0,
    "google-sheets": 0,
    "google-docs": 0,
    "microsoft-powerpoint": 0,
    "microsoft-excel": 0,
    "microsoft-word": 0,
    "developpement-web": 8,
    "procreate": 0
};

function clampLevel(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(10, Math.round(n)));
}

exports.handler = async function (event) {
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers, body: "" };
    }

    const store = getStore(STORE_NAME);

    if (event.httpMethod === "GET") {
        try {
            const saved = await store.get(BLOB_KEY, { type: "json" });
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ skills: Object.assign({}, DEFAULT_SKILLS, saved || {}) })
            };
        } catch (err) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ skills: DEFAULT_SKILLS })
            };
        }
    }

    if (event.httpMethod === "POST") {
        const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
        const authStore = getStore(AUTH_STORE_NAME);

        let credentials;
        try {
            credentials = await authStore.get(AUTH_KEY, { type: "json" });
        } catch (err) {
            credentials = null;
        }

        const expectedEmail = (ADMIN_EMAIL || FALLBACK_EMAIL).toLowerCase();
        const expectedPassword = (credentials && credentials.password) || ADMIN_PASSWORD;

        if (!expectedPassword) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: "Aucun code admin configuré sur le serveur." })
            };
        }

        const providedEmail = (event.headers["x-admin-email"] || "").trim().toLowerCase();
        const providedPassword = event.headers["x-admin-password"] || "";

        if (providedEmail !== expectedEmail || providedPassword !== expectedPassword) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: "Email ou code incorrect." })
            };
        }

        let payload;
        try {
            payload = JSON.parse(event.body || "{}");
        } catch (err) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: "Corps de requête invalide." })
            };
        }

        // Utilisé par la page admin pour vérifier email + code sans rien écrire.
        if (payload.__checkOnly) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ ok: true })
            };
        }

        // Permet de changer le code admin depuis admin.html.
        if (payload.__changePassword) {
            const newPassword = String(payload.newPassword || "").trim();
            if (!newPassword || newPassword.length < 4) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: "Le nouveau code doit contenir au moins 4 caractères." })
                };
            }
            await authStore.setJSON(AUTH_KEY, { password: newPassword });
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ ok: true })
            };
        }

        const incoming = payload.skills || {};
        const cleaned = {};
        Object.keys(DEFAULT_SKILLS).forEach(function (key) {
            cleaned[key] = clampLevel(incoming[key] !== undefined ? incoming[key] : DEFAULT_SKILLS[key]);
        });

        await store.setJSON(BLOB_KEY, cleaned);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ skills: cleaned })
        };
    }

    return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: "Méthode non autorisée." })
    };
};
