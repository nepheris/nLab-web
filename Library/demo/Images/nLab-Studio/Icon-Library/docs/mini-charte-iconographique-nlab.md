# Mini-charte iconographique nLab

## Objectif
Garantir une famille visuelle homogène entre Studio Core, Studios spécialisés, types de fichiers, contrôles UI et symbologies.

## Principes communs
- SVG mono-couleur, fond transparent.
- Couleur pilotée par `currentColor`.
- Aucun `stroke="#..."` ou `fill="#..."` codé en dur, sauf `fill="none"`.
- `stroke-linecap="round"` et `stroke-linejoin="round"`.
- Formes simples, peu de détails, lisibles à petite taille.
- Une même fonction conserve le même ID et la même icône dans tous les Studios.
- Les variantes d’état doivent rester visuellement apparentées : ouvert/fermé, actif/inactif, lock/unlock, expand/collapse.

## Grilles
### Studio icons
- viewBox : `0 0 64 64`
- stroke-width : `3`
- Usage : identité d’un Studio ou d’un Studio planifié.

### Function / Filetype / UI / Symbology icons
- viewBox : `0 0 24 24`
- stroke-width : `1.7`

## Nommage
- Fichiers : kebab-case.
- IDs techniques existants conservés quand ils sont déjà utilisés par le Core.
- Aliases documentés dans les manifests.
- Les icônes futures utilisent `status: planned`.

## États
Préférer une paire cohérente plutôt qu’une nouvelle métaphore :
- lock / unlock
- folder-open / folder-closed
- eye / eye-off
- active / inactive
- toggle-on / toggle-off
- expand / collapse
- sort-asc / sort-desc

## Types de fichiers
Les icônes filetype indiquent d’abord la famille générique puis le format précis :
- generic-document -> DOC/DOCX/ODT/TXT
- generic-spreadsheet -> XLS/XLSX/ODS/CSV/TSV
- generic-presentation -> PPT/PPTX/ODP
- generic-image -> JPG/PNG/WEBP/BMP/GIF/SVG
- generic-audio -> MP3/WAV/FLAC
- generic-video -> MP4/WEBM/MOV
- generic-archive -> ZIP/7Z/TAR
- generic-code -> HTML/JSON/XML/YAML

## Validation
Toute nouvelle icône doit :
1. respecter la grille de sa famille ;
2. utiliser `currentColor` ;
3. être ajoutée au manifest de famille et à l’index global ;
4. contenir description, usages, tags, statut et aliases ;
5. être vérifiée à 16 px, 24 px, 32 px et 64 px ;
6. être testée sur fond clair et fond sombre.
