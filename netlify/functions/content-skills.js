// Contenu "Maîtrise des logiciels" (catégories + niveaux) et
// "Outils & logiciels" (catégories + listes de puces).
// GET  -> public, renvoie { categories, tools }.
// POST -> protégé (back office), remplace tout le contenu.

const { checkAdmin, getStore, CORS_HEADERS } = require("./lib/auth");

const STORE_NAME = "content";
const BLOB_KEY = "skills";

const DEFAULT = { categories: [], tools: [] };

function slugify(text, fallback) {
    const slug = String(text || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return slug || fallback;
}

function clampLevel(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(10, Math.round(n)));
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

        const categories = (Array.isArray(payload.categories) ? payload.categories : [])
            .map((cat, ci) => {
                const label = String(cat.label || "").trim();
                if (!label) return null;
                const catId = slugify(cat.id || label, "categorie-" + ci);
                const skills = (Array.isArray(cat.skills) ? cat.skills : [])
                    .map((skill, si) => {
                        const skillLabel = String(skill.label || "").trim();
                        if (!skillLabel) return null;
                        return {
                            id: slugify(skill.id || skillLabel, catId + "-" + si),
                            label: skillLabel,
                            level: clampLevel(skill.level)
                        };
                    })
                    .filter(Boolean);
                return { id: catId, label, skills };
            })
            .filter(Boolean);

        const tools = (Array.isArray(payload.tools) ? payload.tools : [])
            .map((tool, ti) => {
                const label = String(tool.label || "").trim();
                if (!label) return null;
                const items = (Array.isArray(tool.items) ? tool.items : [])
                    .map((item) => String(item).trim())
                    .filter((item) => item !== "");
                return { id: slugify(tool.id || label, "outils-" + ti), label, items };
            })
            .filter(Boolean);

        const cleaned = { categories, tools };
        await store.setJSON(BLOB_KEY, cleaned);
        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(cleaned) };
    }

    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Méthode non autorisée." }) };
};
