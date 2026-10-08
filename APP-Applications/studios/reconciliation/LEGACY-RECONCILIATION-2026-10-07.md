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
| #49 | `test/core-input-launcher-3.2.1` | **RÉCUPÉRÉ DANS CORE 3.4** | Grand lanceur SVG `inputAcquire` et tuile de dépôt compacte repris sur le Core actuel. | Branche historique conservée jusqu’à la purge finale. |

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

## Avancement passe 2 — 2026-10-08

- Récupération #48/#49 : **FAIT** via PR #58, Core 3.4.0 TEST / Image Studio 2.7.0 TEST.
- Validations PR #58 : **3/3 workflows verts**.
- Inventaire URL : **FAIT** — 16 registres, 116 entrées de versions, 45 cibles distinctes.
- PDF Legacy physique : **18/18 routes 0.9.8→0.9.25 présentes** ; chaîne de dépendances 0.9.25 vérifiée présente.
- Cartographie détaillée : `URL-COMPATIBILITY-MAP-2026-10-08.md` + `URL-COMPATIBILITY-MAP-2026-10-08.json`.
- Règle de purge : **KEEP_REFERENCED** pour toute cible de registre ; un déplacement exige alias/redirect + test.
- PR #59 : fermée sans merge car supersédée par #58.
- `inputAcquire` : miroir ajouté à la bibliothèque iconographique canonique et à son manifest.

## Décision de passe

**GO pour clore la passe architecture / propagation / shell.**

**GO pour ouvrir la phase de récupération Legacy.**

**GO pour poursuivre la nouvelle base web sur le main post-#58.**

**NO-GO pour supprimer ou déplacer une URL encore référencée par un registre ; ces chemins restent derrière une couche de compatibilité jusqu’à mise en place d’aliases/redirects testés.**
