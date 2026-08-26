// Fonction serverless Netlify : récupère les 9 dernières publications
// du compte Instagram professionnel via l'API Instagram Graph.
//
// Le token n'est jamais exposé au navigateur : il est lu depuis les variables
// d'environnement du site Netlify (Site settings > Environment variables) :
//   - IG_USER_ID          -> l'ID Instagram Business du compte
//   - IG_ACCESS_TOKEN     -> le token longue durée généré via Meta for Developers
//
// Voir netlify/functions/README.md pour la procédure complète.

exports.handler = async function () {
    const { IG_USER_ID, IG_ACCESS_TOKEN } = process.env;

    if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Variables d'environnement IG_USER_ID / IG_ACCESS_TOKEN manquantes."
            })
        };
    }

    const fields = [
        "id",
        "caption",
        "media_type",
        "media_url",
        "thumbnail_url",
        "permalink",
        "like_count",
        "comments_count"
    ].join(",");

    const url = `https://graph.instagram.com/v21.0/${IG_USER_ID}/media?fields=${fields}&limit=9&access_token=${IG_ACCESS_TOKEN}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: data.error || "Erreur API Instagram" })
            };
        }

        const posts = await Promise.all(
            (data.data || []).map(async (item) => {
                let views = null;

                // Les vues (plays) ne sont disponibles que pour les Reels/vidéos,
                // via l'endpoint insights dédié.
                if (item.media_type === "VIDEO" || item.media_type === "REELS") {
                    try {
                        const insightsUrl = `https://graph.instagram.com/v21.0/${item.id}/insights?metric=plays&access_token=${IG_ACCESS_TOKEN}`;
                        const insightsRes = await fetch(insightsUrl);
                        const insightsData = await insightsRes.json();
                        views = insightsData?.data?.[0]?.values?.[0]?.value ?? null;
                    } catch {
                        views = null;
                    }
                }

                return {
                    id: item.id,
                    url: item.permalink,
                    image: item.thumbnail_url || item.media_url,
                    caption: item.caption ? item.caption.slice(0, 120) : "",
                    likes: item.like_count ?? 0,
                    comments: item.comments_count ?? 0,
                    views
                };
            })
        );

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
            body: JSON.stringify({ error: "Impossible de contacter l'API Instagram." })
        };
    }
};
