# Réconciliation Legacy nLab Web — 2026-10-07

## Règle

- `main` = source canonique de développement validé.
- `gh-pages` = branche générée de publication ; ne pas la réconcilier manuellement.
- Les branches historiques restent conservées tant que la récupération Legacy n’est pas terminée.
- Une PR fermée n’implique pas la suppression de sa branche.
- Toute récupération Legacy se fera sur une nouvelle branche issue de `main`, capacité par capacité, avec tests.

## PR historiques ouvertes au début de la passe

| PR | Branche | Décision | Motif | Action de récupération |
|---|---|---|---|---|
| #1 | `feat/nlab-studios-suite-v0.1` | **SUPERSÉDÉE** | Première vague JSON/Code/Image largement remplacée par les Studios V2, le catalogue et le shell actuels. | Conserver la branche uniquement comme historique. |
| #17 | `pdf-studio-0.9.19-runtime-fix` | **SUPERSÉDÉE** | Correctifs PDF 0.9.19 antérieurs au pipeline PDF V1/V2 et aux tests actuels. | Conserver la branche comme archive PDF historique. |
| #23 | `feat/pdf-studio-0.9.25-ui-rebuild` | **SUPERSÉDÉE** | Reconstruction PDF 0.9.25 remplacée par les versions et contrats PDF plus récents. | Conserver la branche comme archive PDF historique. |
| #41 | `audit-functions-canonical-2026-10-04` | **ARCHIVÉE / RÉCUPÉRÉE** | Audit utile mais daté ; son contenu est récupéré dans le dépôt sans le rendre canonique. | Voir `AUDIT-FUNCTIONS-CANONICAL-2026-10-04-ARCHIVE.md`. |
| #48 | `test/core-viewer-3.3` | **RÉCUPÉRÉ DANS CORE 3.4** | Viewer Core repris sur le Core actuel : zoom +/−, %, Ajuster, 100 %, presets, événements et état. | Branche historique conservée jusqu’à la purge finale. |
| #49 | `test/core-input-launcher-3.2.1` | **RÉCUPÉRÉ DANS CORE 3.4** | Grand lanceur SVG `inputAcquire`, tuile de dépôt compacte et asset de l’Icon Library repris sur le Core actuel. | Branche historique conservée jusqu’à la purge finale. |

## Points déjà validés et à considérer clos

- Studio Core 3.3.1 : Command Core, Context/Selection, Undo/Redo et montage des bridges.
- Propagation transactionnelle : Image, Merge, Code, Data, File, Scan, OCR, Markdown, Document, Spreadsheet.
- Famille acquisition documentaire : validée.
- Famille édition documentaire : validée.
- Shell public partagé : validé.
- Portail nLab Web dynamique : validé.
- Hub nLab Studios : validé.
- Thème header partagé `Auto / Clair / Sombre` : validé dans `nLab-web`.
- Tests shell public, Studios spécialisés et PDF : verts au moment de la validation.
- `gh-pages` : publication générée uniquement ; ne pas utiliser comme source de merge.

## Dette upstream connue

Le contrôle de thème du header est préparé côté `nLab-Web-Framework` dans la PR #159.
La PR Framework n’est pas fusionnée car sa CI de gouvernance échoue sur des erreurs préexistantes hors périmètre du contrôle de thème.
Le miroir public de `nLab-web` conserve explicitement cette provenance.

## Gate avant migration physique / purge Legacy

Avant tout déplacement ou suppression :

1. inventorier les URLs publiques critiques ;
2. inventorier les références entrantes vers les chemins candidats ;
3. classifier chaque candidat : canonique / historique utile / legacy référencé / legacy remplaçable / obsolète prouvé ;
4. vérifier que les capacités Legacy utiles récupérées (#48 Viewer, #49 Input launcher) restent vertes en CI ;
5. créer la table ancienne URL → URL canonique → compatibilité → test ;
6. exécuter les tests de non-régression ;
7. seulement ensuite supprimer ou déplacer par petits lots.

## Décision de passe

**GO pour clore la passe architecture / propagation / shell.**

**GO pour ouvrir la phase de récupération Legacy.**

**NO-GO pour une purge destructive ou une migration physique globale tant que les gates ci-dessus ne sont pas satisfaites.**

## Complément récupération Legacy 1

- `inputAcquire` est maintenant présent à la fois dans le registre runtime, `assets/icons/functions/` et la bibliothèque canonique `Library/demo/Images/nLab-Studio/Icon-Library/function-icons/`.
- La PR #59 est considérée supersédée par la récupération fusionnée #58 + ce complément Icon Library.


## Avancement passe 2 — 2026-10-08

- Récupération #48/#49 : **FAIT** via PR #58, Core 3.4.0 TEST / Image Studio 2.7.0 TEST.
- Complément Icon Library : **FAIT** via PR #60.
- Validations PR #58 : **3/3 workflows verts**.
- Inventaire URL : **FAIT** — 16 registres, 116 entrées de versions, 45 cibles distinctes.
- PDF Legacy physique : **18/18 routes 0.9.8→0.9.25 présentes** ; chaîne de dépendances 0.9.25 vérifiée présente.
- Cartographie détaillée : `URL-COMPATIBILITY-MAP-2026-10-08.md` + `URL-COMPATIBILITY-MAP-2026-10-08.json`.
- Règle de purge : **KEEP_REFERENCED** pour toute cible de registre ; un déplacement exige alias/redirect + test.
- PR #59 : fermée sans merge car supersédée par #58 + #60.

**GO pour poursuivre la nouvelle base web sur le main post-#58/#60.**

**NO-GO pour supprimer ou déplacer une URL encore référencée par un registre ; ces chemins restent derrière une couche de compatibilité jusqu’à mise en place d’aliases/redirects testés.**

## Retrait des branches de travail — 2026-10-08

Les branches ci-dessous ont leur contenu validé, fusionné ou récupéré. Leur ancien HEAD est conservé ici avant réalignement sur `main`.

| Branche | Ancien HEAD | Statut |
|---|---|---|
| `studio-core-3.3-command-context-undo` | `7a4c9580cbdb254565bf3410170302aafdb35904` | PR #50 fusionnée |
| `studio-core-3.4-transactional-studios` | `7a25138ee79f863ec2c01c2ec354e7067bd35dd8` | PR #51 fusionnée |
| `studio-core-3.5-code-data-file-transactions` | `091edcb0c9dca8400716a3e306b6d740e1c04dce` | PR #52 fusionnée |
| `studio-core-3.6-acquisition-family` | `2028ff275b207facfc94c0b660761ef708f3f845` | PR #53 fusionnée |
| `studio-core-3.7-document-editing-family-v2` | `945ecc4784f252665884c513ef739b70c684a2b5` | PR #54 fusionnée |
| `site-refactor-1-shared-shell-dynamic-portal` | `6b502104b1129677b813075e104766bcdb299b41` | PR #55 fusionnée |
| `site-refactor-2-header-theme-control` | `709120a1cfec8d751b1dc88b5522ee94e48a437d` | PR #56 fusionnée |
| `reconcile-legacy-validation-2026-10-07` | `d4c3586336872331c645d853759410723ccae8c2` | PR #57 fusionnée |
| `legacy-recovery-1-viewer-input-launcher` | `ba663714d23583657bf5769a5f19004e4e50d9b2` | PR #58 fusionnée |
| `legacy-recovery-base-2026-10-08` | `05fbe43def120d6d334fcb6e7e0a5edfb2094fb2` | PR #59 supersédée par #58 + #60 |
| `legacy-recovery-1-icon-library-complete` | `676d51fa31be0f225f9c26c92e6cb46a342f1e0c` | PR #60 fusionnée |
| `audit-functions-canonical-2026-10-04` | `a58a034b05637bfc8e86b634053320984d956e39` | PR #41 archivée dans le dépôt |
| `test/core-viewer-3.3` | `eceeeba9c2a2d5b364db0e9fcf9a5f1f9adc9de8` | Legacy #48 récupéré dans Core 3.4 |
| `test/core-input-launcher-3.2.1` | `d258e6f2d8c8041b6b3a5b3e2a52ab02a02dbfbd` | Legacy #49 récupéré dans Core 3.4 |

Règle : ces refs peuvent être réalignées sur `main` sans perdre de capacité fonctionnelle ; les anciennes versions restent traçables par les SHA ci-dessus et les PR GitHub.


## Compatibilité historique conservée — P2

La vague `legacy-migration-p2-isolate-history` est fusionnée dans `main` et publiée sur `gh-pages`.

### Garanties

- les versions CURRENT/TEST modernes restent sur le runtime partagé ;
- les versions V2 historiques utilisent `channel=historical` avec identité de version explicite ;
- les versions pré-Core/Alpha sont isolées sous `history/<version>/` ;
- la provenance des snapshots est conservée dans `HISTORY-SNAPSHOT-PROVENANCE-2026-10-08.json` ;
- la gate `Historical version URLs` valide l'ensemble des URLs de versions déclarées ;
- la gate `Historical version compatibility` valide les snapshots et runtimes historiques migrés ;
- PDF 0.9.10 reste CURRENT natif et compatible ; PDF 0.9.9 conserve son snapshot natif mais utilise le runtime V2 de compatibilité comme lien officiel.

### Assets Legacy à conserver

Ces fichiers ne sont plus considérés comme dette à purger immédiatement : ils deviennent **couche de compatibilité historique** tant qu'un snapshot les référence.

- `APP-Applications/_shared/studio.css`
- `APP-Applications/_shared/studio-shell.js`
- `APP-Applications/_shared/studio-v1/`
- `APP-Applications/qr-barcode-studio/qr-barcode.js` tant que les pages historiques QR l'utilisent
- runtimes PDF 0.9.x explicitement couverts par les tests de publication

Règle : un asset de cette liste ne pourra être supprimé qu'après migration de tous ses consommateurs historiques et passage vert des deux gates historiques.
