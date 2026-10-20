#!/bin/bash
# Ouvrir en local.command — double-clic pour voir le portfolio en local dans
# Safari, avec le favicon (Safari ne l'affiche pas pour un fichier ouvert
# directement, adresse file://).
# Lance un petit serveur sur http://127.0.0.1:8000 s'il ne tourne pas déjà,
# puis ouvre la page. Fermer cette fenêtre du Terminal arrête le serveur.

cd "$(dirname "$0")" || exit 1
ADRESSE="http://127.0.0.1:8000/index.html"

if curl -s -o /dev/null "$ADRESSE"; then
    open -a Safari "$ADRESSE"
    exit 0
fi

python3 -m http.server 8000 --bind 127.0.0.1 >/dev/null 2>&1 &
SERVEUR=$!
trap 'kill $SERVEUR 2>/dev/null' EXIT
for i in 1 2 3 4 5 6 7 8 9 10; do
    curl -s -o /dev/null "$ADRESSE" && break
    sleep 0.3
done
open -a Safari "$ADRESSE"
echo "Portfolio en local : $ADRESSE"
echo "Laisse cette fenêtre ouverte ; ferme-la pour arrêter le serveur."
wait $SERVEUR
