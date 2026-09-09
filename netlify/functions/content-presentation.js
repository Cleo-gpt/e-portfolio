// Contenu de la section "À propos de moi".
// GET  -> public, renvoie { photo, paragraphs }.
// POST -> protégé (back office), remplace le contenu.

const { checkAdmin, getStore, CORS_HEADERS } = require("./lib/auth");

const STORE_NAME = "content";
const BLOB_KEY = "presentation";

const DEFAULT = { photo: "Images/Photo Cléo.jpeg", paragraphs: [] };

exports.handler = async function (event) {
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers: CORS_HEADERS, body: "" };
    }

    const store = getStore(STORE_NAME);

    if (event.httpMethod === "GET") {
        try {
            const saved = await store.get(BLOB_KEY, { type: "json" });
            return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(saved || DEFAULT) };
        } catch (err) {
            return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(DEFAULT) };
        }
    }

    if (event.httpMethod === "POST") {
        const authError = await checkAdmin(event);
        if (authError) return authError;

        let payload;
        try {
            payload = JSON.parse(event.body || "{}");
        } catch (err) {
            return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Corps de requête invalide." }) };
        }

        const photo = String(payload.photo || "").trim();
        const paragraphs = Array.isArray(payload.paragraphs)
            ? payload.paragraphs.map((p) => String(p).trim()).filter((p) => p !== "")
            : [];

        if (!photo || paragraphs.length === 0) {
            return {
                statusCode: 400,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: "La photo et au moins un paragraphe sont requis." })
            };
        }

        const cleaned = { photo, paragraphs };
        await store.setJSON(BLOB_KEY, cleaned);
        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(cleaned) };
    }

    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Méthode non autorisée." }) };
};
