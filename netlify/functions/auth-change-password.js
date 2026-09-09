// Change le code admin du back office, protégé par le code actuel.

const { checkAdmin, getStore, AUTH_STORE_NAME, AUTH_KEY, CORS_HEADERS } = require("./lib/auth");

exports.handler = async function (event) {
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers: CORS_HEADERS, body: "" };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Méthode non autorisée." }) };
    }

    const authError = await checkAdmin(event);
    if (authError) return authError;

    let payload;
    try {
        payload = JSON.parse(event.body || "{}");
    } catch (err) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Corps de requête invalide." }) };
    }

    const newPassword = String(payload.newPassword || "").trim();
    if (newPassword.length < 4) {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: "Le nouveau code doit contenir au moins 4 caractères." })
        };
    }

    const authStore = getStore(AUTH_STORE_NAME);
    await authStore.setJSON(AUTH_KEY, { password: newPassword });

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true }) };
};
