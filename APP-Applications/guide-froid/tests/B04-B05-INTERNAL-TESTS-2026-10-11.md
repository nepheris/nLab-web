# Guide Froid V2 — Passe B, B04/B05 · Tests autonomes

Date : 11 octobre 2026.

## Correctif B05
L'import de fichiers dans un dossier actif écrasait silencieusement le contenu précédent si le même nom existait dans `docs` (Map). Correctif sur `main` et dans `gh-pages/atelier-a11` : attribution de suffixes `-2`, `-3`, etc. avant extension, sans écraser l'existant.

## Tests de fonctions réelles exécutées en JS isolé

1. Le fichier `photo.jpg` existant est conservé : **PASS**.
2. Un nouveau `photo.jpg` est enregistré comme `photo-2.jpg` : **PASS**.
3. Un autre `photo.jpg` devient `photo-3.jpg` : **PASS**.
4. Un nouveau `notice.pdf` est importé : **PASS**.
5. Le dossier est marqué comme ayant des modifications non exportées : **PASS**.
6. `normalizeImportedDevice()` conserve séparément `volumeNet`, `volumeBrut` (B04) et `rideauxLaniere` (B03) : **PASS**.

Ces tests portent sur les vraies fonctions `appendDeviceFiles` et `normalizeImportedDevice` extraites du script de l'atelier et exécutées avec des dépendances simulées. Ils ne prouvent pas encore les interactions DOM, les fichiers volumineux ni la compatibilité Firefox/Chrome.

## Suivi
B02 : PARTIAL (parcours IndexedDB natif encore ouvert). B03 : PARTIAL (visuel à confirmer). B04 : code et normalisation contrôlés, ZIP/UI à confirmer. B05 : collision de noms corrigée, intégration Universal Input complète à poursuivre.
