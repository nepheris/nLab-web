# Guide Froid V2 — A10 : essai de conservation ZIP

Date : 2026-10-11. Branche : `main`.

## Méthode
Extraction depuis `dossiers/app.js` des fonctions `zip`, `unzip` et `normalizeImportedDevice` ; exécution avec environnement JavaScript simulant TextEncoder/TextDecoder/Blob.

## Scénario et résultat
1. Appareil `POS-ARM-001` avec site, froid positif, configuration, champ inconnu `customLegacy`, ancienne visite et photo.
2. ZIP contenant `appareil.json`, `manifest.json`, photo binaire et notice.
3. Décompression du ZIP puis normalisation de la fiche.
4. Ajout d'une nouvelle visite et d'un nouveau document texte.
5. Réexport et réimport.

**PASS :** ID inchangé, champ inconnu `customLegacy.x=7` préservé, 2 visites présentes, ancienne photo et nouvelle pièce jointe préservées, notice présente.

Entrées finales : `appareil.json`, `manifest.json`, `documents/visites/VIS-OLD/photo.png`, `documents/notice.pdf`, `documents/visites/VIS-NEW/document.txt`.

## Limites
Test technique ciblé et reproductible sur les fonctions du moteur ; non équivalent à une recette du DOM réel, des sélecteurs, de l'export téléchargé ni à des essais navigateur visuels. Les scénarios DEFLATE navigateur, ZIP historique réel, photos UI et parcours démo restent à jouer.

## Décision
A10 = PARTIAL. A11 = NO-GO tant que la recette de navigateur et les scénarios de non-régression ne sont pas achevés. Ne pas déployer `gh-pages`.
