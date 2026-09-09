// Authentification partagée du back office (email fixe + code modifiable),
// utilisée par tous les endpoints d'écriture (content-*.js).
// Préfixée "_" pour ne pas être exposée comme une fonction Netlify.
//
// Email : variable d'environnement ADMIN_EMAIL (repli codé en dur).
// Code : stocké dans Netlify Blobs, modifiable via auth-change-password.js.
// Tant qu'aucun changement n'a eu lieu, le repli est ADMIN_PASSWORD (env var).

const { getStore } = require("@netlify/blobs");

const AUTH_STORE_NAME = "admin-auth";
const AUTH_KEY = "credentials";
const FALLBACK_EMAIL = "cleoforclaz2007@gmail.com";

const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Email, X-Admin-Password"
};

async function expectedPassword() {
    const authStore = getStore(AUTH_STORE_NAME);
    let credentials = null;
    try {
        credentials = await authStore.get(AUTH_KEY, { type: "json" });
    } catch (err) {
        credentials = null;
    }
    return (credentials && credentials.password) || process.env.ADMIN_PASSWORD;
}

function providedCredentials(event) {
    const email = (event.headers["x-admin-email"] || "").trim().toLowerCase();
    const password = event.headers["x-admin-password"] || "";
    return { email, password };
}

// Retourne null si les identifiants sont valides, ou une réponse HTTP
// {statusCode, headers, body} à renvoyer immédiatement en cas d'échec.
async function checkAdmin(event) {
    const expectedEmail = (process.env.ADMIN_EMAIL || FALLBACK_EMAIL).toLowerCase();
    const password = await expectedPassword();

    if (!password) {
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: "Aucun code admin configuré sur le serveur." })
        };
    }

    const provided = providedCredentials(event);
    if (provided.email !== expectedEmail || provided.password !== password) {
        return {
            statusCode: 401,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: "Email ou code incorrect." })
        };
    }

    return null;
}

module.exports = { checkAdmin, getStore, AUTH_STORE_NAME, AUTH_KEY, CORS_HEADERS };
