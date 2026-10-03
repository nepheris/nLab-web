# Audit de flotte des Studios — 2026-10-03

## Verdict

La flotte V2 est désormais couverte par quatre niveaux de contrôle : contrats statiques, smoke navigateur, recette fonctionnelle réelle, round-trip et tests exhaustifs des fonctions internes.

Références vertes :
- Specialized Studios V2 : run 37101673070 — SUCCESS.
- PDF Studio : run 37103397000 — SUCCESS.

Aucune promotion TEST -> CURRENT n'est effectuée par cet audit.

## Versions

| Studio | CURRENT | TEST |
|---|---:|---:|
| PDF Studio | 0.9.10 | 2.5.0 |
| Image Studio | 0.2.1 | 2.0.0 |
| OCR Studio | 0.1.0 | 2.0.0 |
| Code Studio | 0.2.0 | 2.0.0 |
| JSON Studio | 0.2.0 | 2.0.0 |
| Data Studio | 0.2.0 | 2.0.0 |
| File Studio | 0.1.0 | 2.0.0 |
| QR & Barcode Studio | 0.2.0 | 2.0.0 |
| Markdown Studio | — | 2.0.0 |
| Dataset Generator | — | 2.0.0 |

## Statut par Studio

### Image Studio — TEST 2.0.0
- Couvert : ouverture réelle, démos, rotation, flip X/Y, resize, export, calibration X/Y, mesure et undo.
- Les IDs ratio, ky, dy, cal et msg sont des sorties/états, pas des commandes indépendantes.
- Statut : couvert.

### OCR Studio — TEST 2.0.0
- Couvert : ouverture image, langues, démos, OCR Tesseract réel, vérité terrain synthétique, sortie texte, export TXT.
- Correctifs : chemins de démo, diagnostic OCR, normalisation canvas avant Tesseract.
- Statut : couvert.

### Code Studio — TEST 2.0.0
- Couvert : ouverture réelle, Ace, modes, format JSON, recherche, thèmes, position curseur, stats, sauvegarde relue.
- Statut : couvert.

### JSON Studio — TEST 2.0.0
- Couvert : ouverture, validation, format, minify, tri, arbre, stats, query, export relu avec JSON.parse.
- Les IDs treePane, statsPane, topKeys et queryPane sont des conteneurs d'affichage.
- Statut : couvert.

### Data Studio — TEST 2.0.0
- Couvert : CSV/JSON, parsing, profilage, typage, résumé, table, export JSON relu.
- Correctif : chemins datasets.
- Statut : couvert.

### File Studio — TEST 2.0.0
- Couvert : fichiers, dossier, démo, préfixe/suffixe, find/replace, compteur, variables date, aperçu, export CSV.
- Correctif : compatibilité manifest demoNames/files et fallback local.
- Statut : couvert.

### QR & Barcode Studio — TEST 2.0.0
- Couvert : QR, Data Matrix, Code128, GS1-128, EAN13, EAN8, taille, marge, ECC, dots, transparence, gradient, couleurs, PNG, SVG, scanner HID, historique, scan image.
- Partiel : logo personnalisé et quelques contrôles purement décoratifs ne disposent pas chacun d'un scénario autonome.
- Statut : métier couvert, décoratif secondaire partiel.

### Markdown Studio — TEST 2.0.0
- Couvert : ouverture, édition, tableaux, citation, code, YAML/front matter, sync metadata, TOC, image, stats, export MD/YAML/HTML.
- Correctifs : élément status restauré et js-yaml corrigé vers une version CDN valide.
- Statut : métier couvert ; certains états visuels de panes restent non testés isolément.

### Dataset Generator — TEST 2.0.0
- Couvert : presets generic/people/finance/catalog, rows, seed, déterminisme, randomize, JSON/CSV/XLSX/Markdown, validation schéma.
- Statut : couvert.

## PDF Studio — TEST 2.5.0

### Entrées / sorties
- Couvert : fichier local, dossier, URL HTTP/CORS, workspace ZIP, ZIP modifié, téléchargement, ZIP de sortie, classement, nommage, rechargement.
- Partiel/externe : Google Drive réel, même dossier source et extraction dossier dépendent d'un environnement navigateur/compte réel.

### Pages / assemblage
- Couvert : navigation, zoom, Fit width, Fit page, rotation, ajout, duplication, suppression, undo/redo, extraction, crop, merge, insertion PDF.

### Objets / tampons / signatures visuelles
- Couvert : objets, tampons, édition/copie/import/export JSON, règles de nommage, QR comme objet, commit objets, signature dessinée et placement visuel.

### OCR / optimisation / traduction
- Couvert interne : pipeline OCR PDF, optimisation réelle, traduction bilingue avec Translator API mockée.
- Externe : provider traduction réel ; OCR Tesseract réel validé séparément dans OCR Studio.

### Conversion
- Couvert : PDF -> TXT, DOCX, ODT, PNG/JPEG ZIP et export PDF courant.
- Limite assumée : DOCX/ODT en fidélité texte/structure, pas haute fidélité Office.

### Formulaires
- Couvert : ajout champ, inspection, remplissage JSON, flatten.

### Caviardage
- Couvert : création zone et application rasterisée réelle.

### Comparaison
- Couvert : comparaison textuelle A/B.
- Non implémenté : comparaison visuelle/pixel avancée.

### Métadonnées / sécurité
- Couvert : lecture, écriture, nettoyage, inspection, AES-256 qpdf, protection et déverrouillage.

### Signature crypto
- Couvert : garde d'erreur en absence de certificat.
- Externe : DSS/PAdES réel nécessite serveur et certificat réels.

### Historique / diagnostics / migration
- Couvert : historique, undo/redo, export JSON, diagnostics, migration JSON historique principale, profil portable.

### Batch
- Couvert : nettoyage métadonnées multi-PDF -> ZIP.
- Second temps : pipeline batch multi-opérations/presets complets.

## Régressions découvertes et corrigées

1. PDF Studio : crash runtime au démarrage à cause de sélecteurs mono-élément utilisés avec forEach.
2. Core V2 : canvas pouvant intercepter les clics du sidebar.
3. OCR Studio : chemins de démo obsolètes.
4. OCR Studio : source Tesseract non robuste ; normalisation canvas.
5. JSON Studio : manifests/chemins obsolètes et fixtures incorrectes.
6. Data Studio : chemins datasets obsolètes.
7. File Studio : incompatibilité nouveau schéma de manifest.
8. Markdown Studio : élément status absent.
9. Markdown Studio : js-yaml CDN invalide.
10. CI : couverture trop superficielle ; ajout des gates fonctionnels, round-trip et exhaustifs.

## Couverture restante volontairement non certifiée

- Google Drive OAuth / Picker / upload / sélection dossier réels.
- DSS / PAdES avec certificat et serveur réels.
- Traduction avec provider distant réel.
- File System Access API selon navigateur.
- Firefox et Safari/WebKit.
- Charge extrême : centaines de pages / très gros ZIP.
- Comparaison visuelle/pixel PDF : non implémentée.
- Haute fidélité Office : non implémentée.

## Conclusion

À la date de cet audit, toutes les fonctions métier internes déclarées actives dans les Studios V2 disposent soit d'une recette navigateur verte, soit d'une validation statique lorsqu'il s'agit d'un état non actionnable, soit d'un statut explicite PARTIEL/EXTERNE lorsqu'un service réel est nécessaire.

Le statut TEST reste approprié. La promotion en CURRENT doit rester une décision explicite après revue opérateur.