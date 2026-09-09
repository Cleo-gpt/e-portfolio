// Contenu du footer : nom, téléphone, réseaux sociaux, mail.
// GET  -> public.
// POST -> protégé (back office), remplace le contenu.

const { checkAdmin, getStore, CORS_HEADERS } = require("./lib/auth");

const STORE_NAME = "content";
const BLOB_KEY = "social";

const DEFAULT = {
    name: "",
    phone: "",
    phoneDisplay: "",
    instagramPortfolio: "",
    instagramLanterne: "",
    linkedin: "",
    email: ""
};

function str(v) {
    return String(v || "").trim();
}

exports.handler = async function (event) {
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers: CORS_HEADERS, body: "" };
    }

    const store = getStore(STORE_NAME);

    if (event.httpMethod === "GET") {
        try {
            const saved = await store.get(BLOB_KEY, { type: "json" });
            return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(Object.assign({}, DEFAULT, saved || {})) };
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

        const cleaned = {
            name: str(payload.name),
            phone: str(payload.phone),
            phoneDisplay: str(payload.phoneDisplay),
            instagramPortfolio: str(payload.instagramPortfolio),
            instagramLanterne: str(payload.instagramLanterne),
            linkedin: str(payload.linkedin),
            email: str(payload.email)
        };

        await store.setJSON(BLOB_KEY, cleaned);
        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(cleaned) };
    }

    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Méthode non autorisée." }) };
};
