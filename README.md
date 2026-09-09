# nLab Web

`nLab-web` est le **portail public web de nLab**.

Il héberge uniquement les applications, modules et ressources explicitement sélectionnés pour une publication publique. Les données privées, secrets, configurations personnelles, travaux non validés et environnements internes restent dans les espaces privés de nLab.

## Portail web

La racine du dépôt contient un `index.html` servant de catalogue public. Les outils publiés sont déclarés dans `tools.json` puis ouverts depuis leur répertoire d’application.

### Outil actuellement publié

- **APP07 — nLab Scan Studio / nLab PDF Studio** — Alpha 0.9.6, application PDF local-first utilisable dans le navigateur.

## Structure

- `index.html` — accueil nLab Web.
- `tools.json` — registre des outils visibles sur le portail.
- `APP-Applications/` — applications publiques.
- `BRK-Briques/` — briques réutilisables publiques.
- `FRMW-Frameworks/` — frameworks publics.
- `Library/` — bibliothèque publique mutualisée.
- `Info/` — informations publiques complémentaires.
- `Sandbox-Public/` — espace de test explicitement public.

## Règle de publication

Une ressource n’est publiée ici que lorsqu’elle a été explicitement retenue pour le web public. La présence d’un artefact dans le dépôt privé `nLab` ou dans Google Drive ne vaut pas autorisation automatique de publication.

## GitHub Pages

Le dépôt est conçu pour être servi comme site statique depuis la branche `main`, dossier racine `/`.
