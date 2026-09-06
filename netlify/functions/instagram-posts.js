// Fonction serverless Netlify : récupère les dernières publications du
// compte Instagram professionnel via Behold.so (https://behold.so), un
// service qui gère la connexion et le renouvellement du token Instagram
// à notre place — plus besoin de régénérer un token Meta tous les ~60
// jours.
//
// Configuration : variable d'environnement du site Netlify
// (Site settings > Environment variables) :
//   - BEHOLD_FEED_URL -> l'URL JSON de ton feed (Behold → ton feed →
//     "JSON Feed")
//
// Voir netlify/functions/README.md pour la procédure complète.

exports.handler = async function () {
    const { BEHOLD_FEED_URL } = process.env;

    if (!BEHOLD_FEED_URL) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Variable d'environnement BEHOLD_FEED_URL manquante."
            })
        };
    }

    try {
        const response = await fetch(BEHOLD_FEED_URL);
        const data = await response.json();

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: "Erreur en récupérant le feed Behold." })
            };
        }

        const posts = (data.posts || []).map((item) => ({
            id: item.id,
            url: item.permalink,
            image: item.sizes?.medium?.url || item.mediaUrl,
            caption: item.prunedCaption ? item.prunedCaption.slice(0, 120) : "",
            likes: item.likeCount ?? 0,
            comments: item.commentsCount ?? 0,
            // Behold ne fournit pas le nombre de vues des vidéos/reels.
            views: null
        }));

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=300"
            },
            body: JSON.stringify({ posts })
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Impossible de contacter le feed Behold." })
        };
    }
};
