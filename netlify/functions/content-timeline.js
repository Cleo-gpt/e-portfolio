// Contenu "Formation", "Expérience professionnelle" et "Langues".
// GET  -> public, renvoie { formation, experience, languages }.
// POST -> protégé (back office), remplace tout le contenu (listes envoyées
// dans l'ordre final voulu — pas de fusion avec l'existant).

const { checkAdmin, getStore, CORS_HEADERS } = require("./lib/auth");

const STORE_NAME = "content";
const BLOB_KEY = "timeline";

const DEFAULT = { formation: [], experience: [], languages: [] };

function slugify(text, fallback) {
    const slug = String(text || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return slug || fallback;
}

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

        const formation = (Array.isArray(payload.formation) ? payload.formation : [])
            .map((item, i) => {
                const title = String(item.title || "").trim();
                if (!title) return null;
                return {
                    id: slugify(item.id || title, "formation-" + i),
                    title,
                    place: String(item.place || "").trim()
                };
            })
            .filter(Boolean);

        const experience = (Array.isArray(payload.experience) ? payload.experience : [])
            .map((item, i) => {
                const title = String(item.title || "").trim();
                if (!title) return null;
                return {
                    id: slugify(item.id || title, "experience-" + i),
                    title,
                    date: String(item.date || "").trim(),
                    place: String(item.place || "").trim(),
                    description: String(item.description || "").trim(),
                    extra: !!item.extra
                };
            })
            .filter(Boolean);

        const languages = (Array.isArray(payload.languages) ? payload.languages : [])
            .map((item) => {
                const name = String(item.name || "").trim();
                if (!name) return null;
                return { name, level: String(item.level || "").trim() };
            })
            .filter(Boolean);

        const cleaned = { formation, experience, languages };
        await store.setJSON(BLOB_KEY, cleaned);
        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(cleaned) };
    }

    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Méthode non autorisée." }) };
};
