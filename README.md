# nLab Web

Ce dépôt constitue l’espace web public du projet **nLab**.

> **Statut : projet en cours de développement.**

nLab est actuellement en phase de conception, de structuration et de stabilisation. Seuls les artefacts explicitement retenus pour une publication publique doivent apparaître ici.

## Site public

- Portail : **https://nepheris.github.io/nLab-web/**
- nLab Studios : `/APP-Applications/studios/`
- PDF Studio : `/APP-Applications/pdf-studio/`
- JSON Studio : `/APP-Applications/json-studio/`
- Code Studio : `/APP-Applications/code-studio/`
- Image Studio : `/APP-Applications/image-studio/`

> Les nouveaux Studios sont préparés sur une branche de revue avant promotion vers la branche publiée GitHub Pages.

## Architecture GitHub Pages

- `main` — source et organisation du dépôt public.
- `gh-pages` — branche de publication réellement servie par GitHub Pages.
- GitHub Pages doit être configuré sur **Deploy from a branch** → **gh-pages** → **/(root)**.

Le portail public utilise un `index.html` à la racine et un catalogue `tools.json`. Chaque outil public dispose ensuite d’une URL stable dans sa famille nLab.

### PDF / Scan Studio

Chemin actuellement publié dans ce dépôt :

`APP-Applications/pdf-studio/`

Dans le dépôt privé nLab, le produit canonique reste `APP07-scan-studio` : PDF Studio et OCR sont des capacités/sous-modules de Scan Studio.

La publication actuelle utilise un petit chargeur HTML, un manifeste `build.json` et un payload compressé/chunké. Cela permet de publier le standalone PDF Studio tout en gardant une URL stable et un contrôle d’intégrité du build.

## Principe de publication

Ce dépôt est destiné uniquement aux artefacts nLab explicitement rendus publics et publiés en version de production ou de test public assumé.

Les travaux privés, données personnelles, configurations personnelles, secrets, fichiers temporaires et éléments de bac à sable restent dans les espaces privés du projet nLab.

## Structure

- `APP-Applications/` — applications nLab publiques.
- `BRK-Briques/` — briques réutilisables publiques.
- `FRMW-Frameworks/` — frameworks nLab publics.
- `Library/` — bibliothèque publique mutualisée.
- `Info/` — informations générales complémentaires sur le projet public.
- `Sandbox-Public/` — expérimentations explicitement destinées à être publiques.

Les autres familles et ressources sont ajoutées uniquement lorsqu’elles sont définies et validées pour publication.
