#!/bin/bash
# configurer-ftp.sh — enregistre les accès FTP du site dans les secrets GitHub,
# puis lance une mise en ligne complète du site par le robot GitHub Actions.
#
# À lancer une seule fois, depuis le dossier du projet :
#     bash scripts/configurer-ftp.sh
#
# Le mot de passe est tapé ici (il ne s'affiche pas) et part directement dans
# les secrets GitHub : il n'est écrit dans aucun fichier.

set -e
DEPOT="Cleo-gpt/e-portfolio"
SERVEUR="eleves.mediamatique.ch"
UTILISATEUR="cforclaz"

if ! gh auth status >/dev/null 2>&1; then
    echo "Connecte-toi d'abord à GitHub : gh auth login"
    exit 1
fi

echo "Serveur FTP : $SERVEUR   Utilisateur : $UTILISATEUR"
echo
echo "Dossier du site sur le serveur : c'est le chemin affiché à droite dans"
echo "FileZilla quand tu ouvres le dossier qui contient index.html (ex : /e-portfolio)."
read -r -p "Dossier du site (Entrée = dossier de connexion) : " DOSSIER
read -r -s -p "Mot de passe FTP de $UTILISATEUR : " MOT_DE_PASSE
echo

if [ -z "$MOT_DE_PASSE" ]; then
    echo "Mot de passe vide : rien n'a été enregistré."
    exit 1
fi

# Vérifie les accès avant de les enregistrer (liste le dossier, ne modifie rien).
if ! curl -s --max-time 30 --ssl -u "$UTILISATEUR:$MOT_DE_PASSE" "ftp://$SERVEUR/${DOSSIER#/}/" -o /dev/null; then
    echo "Connexion FTP refusée (mot de passe ou dossier incorrect) : rien n'a été enregistré."
    exit 1
fi
echo "Connexion FTP vérifiée."

printf '%s' "$SERVEUR" | gh secret set FTP_SERVEUR --repo "$DEPOT"
printf '%s' "$UTILISATEUR" | gh secret set FTP_UTILISATEUR --repo "$DEPOT"
printf '%s' "$MOT_DE_PASSE" | gh secret set FTP_MOT_DE_PASSE --repo "$DEPOT"
printf '%s' "$DOSSIER" | gh secret set FTP_DOSSIER --repo "$DEPOT"
unset MOT_DE_PASSE
echo "Secrets FTP enregistrés sur GitHub."

gh workflow run instagram.yml --repo "$DEPOT" -f tout_envoyer=true
echo
echo "Mise en ligne complète lancée. Suivi : onglet Actions du dépôt GitHub,"
echo "ou dans le Terminal : gh run watch --repo $DEPOT"
