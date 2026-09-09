// Contenu des projets CPNV-Médiamatique (cartes + détail + galerie +
// documents + vidéos).
// GET  -> public, renvoie { projects }.
// POST -> protégé (back office), remplace toute la liste de projets
// (envoyée dans l'ordre final voulu — pas de fusion avec l'existant).

const { checkAdmin, getStore, CORS_HEADERS } = require("./lib/auth");

const STORE_NAME = "content";
const BLOB_KEY = "cpnv";

const DEFAULT = { projects: [] };

function slugify(text, fallback) {
    const slug = String(text || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    return slug || fallback;
}

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

        const projects = (Array.isArray(payload.projects) ? payload.projects : [])
            .map((p, pi) => {
                const title = str(p.title);
                if (!title) return null;

                const gallery = (Array.isArray(p.gallery) ? p.gallery : [])
                    .map((g) => {
                        const image = str(g.image);
                        if (!image) return null;
                        return { image, alt: str(g.alt) };
                    })
                    .filter(Boolean);

                const documents = (Array.isArray(p.documents) ? p.documents : [])
                    .map((d) => {
                        const file = str(d.file);
                        if (!file) return null;
                        return { label: str(d.label) || "Voir le document (PDF)", file };
                    })
                    .filter(Boolean);

                const videos = (Array.isArray(p.videos) ? p.videos : [])
                    .map((v) => {
                        const url = str(v.url);
                        if (!url) return null;
                        return {
                            url,
                            thumbnail: str(v.thumbnail),
                            alt: str(v.alt),
                            title: str(v.title),
                            short: !!v.short
                        };
                    })
                    .filter(Boolean);

                const project = {
                    id: slugify(p.id || title, "projet-" + pi),
                    category: str(p.category) || "design",
                    categoryLabel: str(p.categoryLabel),
                    title,
                    cardImage: str(p.cardImage),
                    cardImageAlt: str(p.cardImageAlt) || title,
                    cardDescription: str(p.cardDescription),
                    detailText: str(p.detailText),
                    gallery,
                    documents,
                    videos
                };

                if (p.coverDocument && typeof p.coverDocument === "object") {
                    const coverImage = str(p.coverDocument.image);
                    const coverFile = str(p.coverDocument.file);
                    if (coverImage && coverFile) {
                        project.coverDocument = {
                            image: coverImage,
                            imageAlt: str(p.coverDocument.imageAlt) || title,
                            file: coverFile
                        };
                    }
                }

                return project;
            })
            .filter(Boolean);

        const cleaned = { projects };
        await store.setJSON(BLOB_KEY, cleaned);
        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(cleaned) };
    }

    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Méthode non autorisée." }) };
};
