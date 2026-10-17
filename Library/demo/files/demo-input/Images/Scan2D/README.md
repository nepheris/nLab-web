# Démonstrations Scan2D V1 — Image Studio / nLab DEMO CORPUS

Les sept PNG de ce dossier sont **des copies binaires exactes** du corpus de validation APP17 :

https://github.com/nepheris/nLab/tree/main/Build/APP-Application/APP17-image-studio/tests/scan2d/v1

Ce sous-dossier est public pour fonctionner directement dans :
- https://nepheris.github.io/nLab-web/Library/demo/
- https://nepheris.github.io/nLab-web/APP-Applications/image-studio/v2/

Le jeu comporte 01 référence correcte, puis 02 rotation, 03 déformation d'échelle, 04 perspective, 05 flou/bruit, 06 gradient/masquage et 07 cisaillement.

Les dimensions connues sont dans `00_manifest_tests.json`. La géométrie nominale en millimètres est dans `00_geometrie_reference_mm.svg`. Vérification avec `sha256sum -c SHA256SUMS.txt`.

**Règle pour les prochains tests :** ajouter le nouveau PNG ici et dans APP17, documenter paramètres/attendus dans les deux manifestes, générer l'empreinte SHA256 et incrémenter les compteurs/index de la galerie. Conserver le nom explicite `NN_image_de_test_OK_*.png` ou `NN_image_de_test_ERREUR_*.png`.

Les algorithmes de calibration ne sont pas validés par la présence des images de test.
