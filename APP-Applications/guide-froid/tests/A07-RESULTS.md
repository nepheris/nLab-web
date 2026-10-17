# Guide Froid V2 — A07 — contrôles techniques du 11 octobre 2026

## Référence
Code testé : `APP-Applications/guide-froid/dossiers/app.js` sur `main`, fonctions `zip` et `unzip`.

## Résultats d'exécution
Environnement : harness JavaScript avec implémentations de `TextEncoder`, `TextDecoder`, `Blob`, lecture `arrayBuffer()` simulées, code applicatif réel extrait du dépôt.

| Essai | Résultat |
|---|---|
| ZIP STORE / création et relecture de deux fichiers | PASS |
| Document UTF-8 préservé | PASS |
| Modification des données / CRC32 invalide | PASS (rejet) |
| Archive tronquée | PASS (rejet) |
| ZIP DEFLATE / méthode 8 | NON TESTÉ |
| Navigateurs réels | NON TESTÉ |
| Duplication d'entrée | Code présent ; essai non exécuté |

## Décision
A07 = PARTIAL. Les tests STORE / CRC / archive tronquée ont réussi, mais DEFLATE et les navigateurs réels restent obligatoires avant validation. A10 et A11 ne sont pas clos.

## Prochain ordre
1. Créer une archive DEFLATE de référence puis la tester avec `DecompressionStream('deflate-raw')` dans les navigateurs ciblés.
2. Vérifier l'intégrité, la duplication de noms, les caractères UTF-8, les sous-dossiers et la non-perte.
3. Exécuter A10 complet : export → import → modification → pièces jointes → export → réimport.
4. Décider A11 GO/NO-GO avec preuves.

## Complément — 11/10/2026, DEFLATE
- Fixtures ZIP générées avec Python `zipfile`, modes `ZIP_DEFLATED` et `ZIP_STORED`, fichiers `appareil.json` et `documents/témoin.txt`.
- Fonctions `unzip` et `crc32` reprises du code `main`, exécutées avec API Web Streams natives de Node.js v22 (`DecompressionStream('deflate-raw')`).
- Résultats : **DEFLATE PASS (2/2 fichiers)**, **STORE PASS (2/2 fichiers)** ; caractères accentués préservés.
- Un lancement de Chromium headless a expiré dans l’environnement. **Ce test ne prouve pas la compatibilité navigateur réelle.**
- Décision : A07 **PARTIAL**, pending tests Chromium/Firefox réels et essais d'intégration utilisateur.
