# Cartographie de compatibilité URL / Legacy — 2026-10-08

## Objet

Cette cartographie est le gate de sécurité avant toute migration physique ou purge Legacy de `nLab-web`.
Elle est construite depuis le catalogue public et les registres `versions.json` sur le `main` issu de la récupération Legacy #58.

**Règle : une route déclarée par un registre de versions reste publique et n'est pas supprimable tant qu'un alias/redirect compatible et son test de non-régression ne sont pas en place.**

## Base validée

- Base : `2b56b4bfc4e4748fa99b71bdf80053cfcd0e88b8`.
- Récupération Legacy : PR #58 fusionnée.
- Studio Core : **3.4.0 TEST**.
- Image Studio : **2.7.0 TEST**.
- CI de #58 : **Audit all Studios = SUCCESS**, **Validate PDF Studio public = SUCCESS**, **Validate specialized Studios V2 = SUCCESS**.
- PR #59 : fermée sans merge, supersédée par #58.

## Inventaire des registres

- 16 registres (Studios + apps dérivées).
- 116 entrées de version.
- 45 cibles de route distinctes.
- **18 routes PDF 0.9.x physiques** (`0.9.8` à `0.9.25`) explicitement vérifiées présentes.

| Surface | CURRENT | TEST | Cibles publiques déclarées | Décision |
|---|---:|---:|---|---|
| PDF Studio | 0.9.10 | 2.11.0 | 2.11.0…2.0.0 → `/nLab-web/APP-Applications/pdf-studio/v2/`<br>1.0.3…1.0.0 → `/nLab-web/APP-Applications/pdf-studio/v1/`<br>0.9.25 → `/nLab-web/APP-Applications/pdf-studio/app-0.9.25.html`<br>0.9.24 → `/nLab-web/APP-Applications/pdf-studio/app-0.9.24.html`<br>0.9.23 → `/nLab-web/APP-Applications/pdf-studio/app-0.9.23.html`<br>0.9.22 → `/nLab-web/APP-Applications/pdf-studio/app-0.9.22.html`<br>0.9.21 → `/nLab-web/APP-Applications/pdf-studio/app-0.9.21.html`<br>0.9.20 → `/nLab-web/APP-Applications/pdf-studio/app-0.9.20.html`<br>0.9.19 → `/nLab-web/APP-Applications/pdf-studio/app-0.9.19.html`<br>0.9.18 → `/nLab-web/APP-Applications/pdf-studio/app-0.9.18.html`<br>0.9.17 → `/nLab-web/APP-Applications/pdf-studio/app-0.9.17.html`<br>0.9.16 → `/nLab-web/APP-Applications/pdf-studio/app-0.9.16.html`<br>0.9.15 → `/nLab-web/APP-Applications/pdf-studio/app-0.9.15.html`<br>0.9.14 → `/nLab-web/APP-Applications/pdf-studio/app-0.9.14.html`<br>0.9.13 → `/nLab-web/APP-Applications/pdf-studio/app-0.9.13.html`<br>0.9.12 → `/nLab-web/APP-Applications/pdf-studio/app-0.9.12.html`<br>0.9.11 → `/nLab-web/APP-Applications/pdf-studio/app-0.9.11.html`<br>0.9.10 → `/nLab-web/APP-Applications/pdf-studio/app-0.9.10.html`<br>0.9.9 → `/nLab-web/APP-Applications/pdf-studio/app-0.9.9.html`<br>0.9.8 → `/nLab-web/APP-Applications/pdf-studio/app-0.9.8.html` | KEEP — 0.9.x physique référencé + v1/v2 partagés |
| Image Studio | 0.2.1 | 2.7.0 | 2.7.0…2.0.0 → `/nLab-web/APP-Applications/image-studio/v2/`<br>0.2.1…0.2.0 → `/nLab-web/APP-Applications/image-studio/` | KEEP — routes de registre |
| Scan Studio | — | 0.4.0 | 0.4.0…0.1.0 → `/nLab-web/APP-Applications/scan-studio/v2/` | KEEP — routes de registre |
| OCR Studio | 0.1.0 | 2.3.0 | 2.3.0…2.0.0 → `/nLab-web/APP-Applications/ocr-studio/v2/`<br>0.1.0 → `/nLab-web/APP-Applications/ocr-studio/` | KEEP — routes de registre |
| Code Studio | 0.2.0 | 2.4.0 | 2.4.0…2.0.0 → `/nLab-web/APP-Applications/code-studio/v2/`<br>0.2.0 → `/nLab-web/APP-Applications/code-studio/` | KEEP — routes de registre |
| JSON Studio | 0.2.0 | 2.2.0 | 2.2.0…2.0.0 → `/nLab-web/APP-Applications/json-studio/v2/`<br>0.2.0 → `/nLab-web/APP-Applications/json-studio/` | KEEP — routes de registre |
| Data Studio | 0.2.0 | 2.4.0 | 2.4.0…2.0.0 → `/nLab-web/APP-Applications/data-studio/v2/`<br>0.2.0 → `/nLab-web/APP-Applications/data-studio/` | KEEP — routes de registre |
| QR & Barcode Studio | 0.2.0 | 2.4.1 | 2.4.1…2.0.0 → `/nLab-web/APP-Applications/qr-barcode-studio/v2/`<br>0.3.0 → `/nLab-web/APP-Applications/qr-barcode-studio/`<br>0.2.0 → `/nLab-web/APP-Applications/qr-barcode-studio/app-0.2.0.html` | KEEP — routes de registre |
| File Studio | 0.1.0 | 2.4.0 | 2.4.0…2.0.0 → `/nLab-web/APP-Applications/file-studio/v2/`<br>0.1.0 → `/nLab-web/APP-Applications/file-studio/` | KEEP — routes de registre |
| Markdown Studio | — | 2.3.0 | 2.3.0…2.0.0 → `/nLab-web/APP-Applications/markdown-studio/v2/`<br>1.0.0 → `/nLab-web/APP-Applications/markdown-studio/` | KEEP — routes de registre |
| Demo Studio | 1.0.0 | — | 1.0.0 → `/nLab-web/Library/demo/` | KEEP — routes de registre |
| Dataset Generator Studio | — | 2.3.0 | 2.3.0…2.0.0 → `/nLab-web/APP-Applications/dataset-generator-studio/v2/`<br>0.2.0…0.1.0 → `/nLab-web/APP-Applications/dataset-generator-studio/` | KEEP — routes de registre |
| Document Studio | — | 1.3.0 | 1.3.0…1.0.0 → `/nLab-web/APP-Applications/document-studio/v2/` | KEEP — routes de registre |
| Spreadsheet Studio | — | 1.3.0 | 1.3.0…1.0.0 → `/nLab-web/APP-Applications/spreadsheet-studio/v2/` | KEEP — routes de registre |
| nLab PDF Sign | — | 0.3.0 | 0.3.0…0.1.0 → `/nLab-web/APP-Applications/pdf-sign/v1/` | KEEP — routes de registre |
| nLab Merge Studio | — | 0.4.0 | 0.4.0…0.1.0 → `/nLab-web/APP-Applications/merge-studio/v1/` | KEEP — routes de registre |

Le détail machine complet de chaque version et de chaque cible est dans `URL-COMPATIBILITY-MAP-2026-10-08.json`.

## PDF Studio : zone Legacy physique

Les pages `app-0.9.8.html` à `app-0.9.25.html` existent toutes et restent déclarées dans `APP-Applications/pdf-studio/versions.json`.

La chaîne 0.9.25 charge encore réellement :
- la base `app-0.9.12.html` ;
- les six fragments `runtime0914/app0914.part01..06.txt` et `rc2-patch.js` ;
- les patches 0.9.15, 0.9.16, 0.9.17, 0.9.18, 0.9.19, 0.9.20, 0.9.21, 0.9.22, 0.9.24 et 0.9.25 ;
- les briques partagées `selection-scope.js` et `archive-workspace.js`.

**Décision : KEEP_REFERENCED.** Fermer les anciennes PR #17/#23 ne signifie pas supprimer ces fichiers de `main` : ils servent encore les URLs historiques.

## Classification de la récupération Legacy

| Élément | État | Décision |
|---|---|---|
| PR #1 | supersédée | branche = provenance historique |
| PR #17 | supersédée | branche = provenance ; runtimes publics référencés = KEEP |
| PR #23 | supersédée | branche = provenance ; `app-0.9.25.html` = KEEP |
| PR #41 | récupérée/archivée | aucune promotion canonique supplémentaire |
| PR #48 | récupérée | Viewer Core intégré dans Core 3.4 |
| PR #49 | récupérée | launcher `inputAcquire` + drop tile intégrés dans Core 3.4 |
| PR #59 | doublon de récupération | fermée, supersédée par #58 |
| `gh-pages` | publication générée | ne jamais réconcilier/purger manuellement |

## Gates de migration / purge

1. **URLs publiques critiques : FAIT** via catalogue + registres.
2. **Références entrantes : FAIT pour les registres et la chaîne runtime PDF 0.9.x.** Les backlinks externes ne sont pas prouvables depuis le dépôt ; par sécurité les anciennes URLs restent stables.
3. **Classification des candidats : FAIT** pour les PR Legacy identifiées et les routes publiques.
4. **Récupération #48/#49 : FAIT** dans #58 / Core 3.4.
5. **Ancienne URL → cible canonique/compatible : FAIT** dans le JSON associé.
6. **Non-régression récupération : FAIT** — trois workflows #58 verts.
7. **Purge destructive globale : NO-GO.** Une suppression de route publique référencée nécessite d'abord un alias/redirect testé.

## Ce qui peut être nettoyé sans casser le web

Peuvent être traités dans une passe de housekeeping séparée : branches de travail supersédées après décision d'archivage, fichiers qui n'existent déjà plus dans `main`, métadonnées/notes de PR devenues redondantes. Cela ne doit jamais inclure une cible encore déclarée dans un registre.

## Prochaine base physique

La prochaine migration doit donc partir du **main post-#58**, considérer les chemins CURRENT/TEST comme canoniques, et traiter les anciens chemins uniquement par compatibilité. Le déplacement physique global n'est plus un préalable à la nouvelle base web : la base web peut évoluer maintenant, tandis que le Legacy référencé reste derrière une couche de compatibilité stable.
