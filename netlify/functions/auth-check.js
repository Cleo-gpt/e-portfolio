// Vérifie les identifiants (email + code) du back office, sans rien écrire.
// Utilisé par l'écran de login de back-office.html.

const { checkAdmin, CORS_HEADERS } = require("./lib/auth");

exports.handler = async function (event) {
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 204, headers: CORS_HEADERS, body: "" };
    }

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: "Méthode non autorisée." }) };
    }

    const authError = await checkAdmin(event);
    if (authError) return authError;

    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ ok: true }) };
};
