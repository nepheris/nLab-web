# Audit de mutualisation fonctionnelle des Studios — 2026-10-03

## Mise à jour opérationnelle P0 / P1 / P2

La feuille de route vivante est désormais également maintenue dans `MUTUALIZATION-ROADMAP.json`.

### P0 — en cours de mutualisation
- **Entrées** : `input-service.js` créé.
- **Téléchargements** : `download-service.js` créé ; Document Studio et File Studio migrés.
- **ZIP** : `archive-service.js` créé.
- **Documents structurés** : `document-format-service.js` créé ; Document Studio migré ; PDF Studio reste à migrer.
- **Tabulaire** : `tabular-service.js` créé ; File Studio l'utilise pour son CSV ; Data/Spreadsheet/Dataset restent à migrer.
- **Variables communes** : TemplateEngine enrichi avec `COUNTER`, `MIME`, `FORMAT`, `FILE_FAMILY`, `ARTIFACT_ID`, `SHA256` ; File Studio migré.
- **Formats communs** : FormatRegistry enrichi avec accept par famille, icône filetype et routage Studio.
- **Color Picker** : `color-control.js` devient bidirectionnel **visuel ↔ code**, avec HEX par défaut et modes RGB/HSL.

### P1 — immédiatement après P0
- **Overlay/Object engine partagé** : placement, déplacement, redimensionnement, rotation, verrouillage et suppression pour texte, image, tampon, signature, highlight et zone de caviardage.
  - Le placement de la zone de caviardage est commun.
  - L'application sécurisée du caviardage (rasterisation/aplatissement irréversible) reste spécifique au moteur PDF.
- OCR partagé.
- QR / Data Matrix / codes-barres partagés.
- Recherche / filtre / tri partagé.
- Normalisation image/canvas commune.
- Métadonnées communes quand le format le permet.
- Progression / annulation / job status communs.

### P2 — maintenu en développement
Presentation Studio, Office haute fidélité, Google Workspace natif, comparaison visuelle pixel, stéganographie robuste, gros volumes Data, batch complexe, PAdES/DSS, certification cross-browser et tests lourds.


## Objectif

Auditer les fonctions de la flotte Studio V2 avant la passe finale d'uniformisation UI/icônes, afin de distinguer :
- les fonctions métier propres à un Studio ;
- les fonctions communes déjà correctement mutualisées ;
- les fonctions dupliquées qui doivent devenir des moteurs partagés ;
- les fonctions candidates à mutualisation ultérieure, mais trop sensibles pour être refactorisées juste avant validation humaine.

## Principe d'architecture cible

```text
Studio Core V2
├── Infrastructure partagée
│   ├── fichiers / formats
│   ├── entrée / sortie
│   ├── historique
│   ├── identité / hash / manifest
│   ├── templates / variables
│   ├── aide / icônes
│   └── pipeline / presets
│
├── Moteurs métier partagés
│   ├── document / Office structurel
│   ├── tabulaire
│   ├── OCR
│   ├── symbologies
│   ├── image
│   └── conversion
│
└── Studios spécialisés
    ├── File Studio
    ├── Document Studio
    ├── Spreadsheet Studio
    ├── PDF Studio
    ├── Image Studio
    ├── OCR Studio
    └── ...
```

Le Studio spécialisé doit principalement orchestrer le moteur partagé et présenter son UI. Il ne doit pas recopier une fonction transverse déjà disponible ailleurs.

## Mutualisations déjà en place

| Brique | Service partagé | Studios concernés | État |
|---|---|---|---|
| Versions | `version-service.js` | tous | ✅ |
| Historique | `history.js` | Core / Studios | ✅ |
| Aide contextuelle | `help.js` + Core | tous | ✅ |
| Icônes | `icon-registry.js` + Icon Library | tous | ✅ |
| Format registry | `format-registry.js` | partiel | 🟡 adoption à généraliser |
| Drop zones | `drop-zone.js` | partiel | 🟡 adoption à généraliser |
| Output filesystem | `output-service.js` | PDF principalement | 🟡 adoption à généraliser |
| Variables / templates | `template-engine.js` | PDF principalement | 🟡 adoption à généraliser |
| Identité / SHA-256 | `artifact-identity.js` | PDF / Image / File | ✅ moteur commun |
| Pipeline | `pipeline-service.js` | Core | ✅ socle présent |
| Assets | `asset-picker.js` | partiel | ✅ socle présent |
| Markdown | `markdown-engine.js` | Markdown | ✅ moteur partagé disponible |
| Sessions | `document-session.js` | PDF / Core | ✅ |
| Drive | `drive-service.js` | PDF | 🟡 futur transverse |

## Matrice de mutualisation

| Fonction | Implémentations actuelles | Candidat commun | Priorité | Risque |
|---|---|---|---:|---:|
| Télécharger Blob / texte / JSON | Image, OCR, Data, File, Dataset, Document, Spreadsheet, PDF | `download-service.js` ou extension `OutputService` | P0 | faible |
| Formats / accept / familles | nombreux `accept=` locaux | `format-registry.js` | P0 | faible |
| Variables nommage/date | File local + PDF TemplateEngine | `template-engine.js` | P0 | faible |
| DOCX/ODT structurel | Document Studio + PDF `document-conversion.js` | `document-conversion-service.js` | P0 | faible-moyen |
| CSV / TSV / JSON tabulaire | Data + Spreadsheet + Dataset | `tabular-service.js` | P0 | faible-moyen |
| Recherche / filtre / tri | Data + Spreadsheet + File | `collection-query-service.js` | P1 | faible |
| CSV UTF-8 / séparateur / BOM | Data + Spreadsheet + Dataset | `tabular-service.js` | P0 | faible |
| XLSX / ODS exports | Data + Spreadsheet + Dataset | `tabular-service.js` | P1 | moyen |
| OCR Tesseract | OCR Studio + PDF Studio | `ocr-service.js` | P1 | moyen |
| QR generation | QR Studio + PDF Studio | `symbology-service.js` | P1 | moyen |
| Color HEX/RGB/HSL | QR local + `color-control.js` | enrichir `color-control.js` | P1 | faible |
| Image canvas/export | Image + PDF raster operations | `image-service.js` | P2 | moyen |
| Markdown preview | MarkdownEngine + preview simplifié | unifier sur `markdown-engine.js` | P1 | faible |
| Démo / chemins corpus | plusieurs chemins codés localement | `demo-corpus.js` | P0 | faible |
| Google Drive | PDF uniquement | `drive-service.js` transverse | P2 | externe |
| Signature / PAdES | PDF | reste PDF / service signature | — | spécifique |
| Sécurité PDF | PDF | reste PDF | — | spécifique |
| Formulaires PDF | PDF | reste PDF | — | spécifique |
| Bates / watermark PDF | PDF | moteur PDF | — | spécifique |
| Caviardage PDF | PDF | moteur PDF | — | spécifique |

## P0 — Mutualisations recommandées avant la passe UI finale

### 1. Download / save service

Constat : de nombreux Studios recréent :

```js
const a=document.createElement('a')
a.href=URL.createObjectURL(blob)
a.download=name
a.click()
```

Cible :
- `downloadBlob(blob,name)`
- `downloadText(text,name,mime)`
- `downloadJson(data,name)`
- `downloadCsv(text,name,{bom})`

Puis `OutputService.saveBlob` peut appeler la même primitive quand aucun dossier File System Access n'est actif.

Bénéfice : suppression d'au moins 7 implémentations locales et correction uniforme de la révocation des Object URLs.

### 2. Office structural service

Deux moteurs génèrent déjà DOCX/ODT :
- PDF Studio : `v2/document-conversion.js`
- Document Studio : `makeDocx()`, `makeOdt()`

Cible :
`_shared/studio-v2/document-format-service.js`

API proposée :
- `readDocx(file)`
- `readOdt(file)`
- `writeDocx(blocks|text)`
- `writeOdt(blocks|text)`
- `extractRtfText(text)`
- `documentToHtml()`

PDF Studio fournirait simplement ses pages sous forme de blocs ; Document Studio utiliserait le même moteur.

### 3. Tabular service

Doublons actuels :
- Data Studio : PapaParse + XLSX
- Spreadsheet Studio : XLSX + CSV local
- Dataset Generator : génération CSV locale

Cible :
`_shared/studio-v2/tabular-service.js`

API :
- `parseCsv(text,{delimiter})`
- `toCsv(rows,{delimiter,bom})`
- `parseJsonTable(value)`
- `sortRows(rows,column,direction)`
- `filterRows(rows,{query,column,value})`
- `toXlsx(rows)`
- `toOds(rows)`

Data Studio et Spreadsheet Studio gardent leurs interfaces différentes mais consomment le même moteur.

### 4. Format registry partout

Document / Data / Spreadsheet / OCR / Image ont encore des listes `accept` locales.

Le registre partagé connaît déjà :
- PDF
- image
- text
- document
- spreadsheet
- presentation
- archive

Il doit devenir la source canonique pour :
- accept HTML ;
- icône filetype ;
- label type ;
- routage vers Studio ;
- capabilities de conversion.

### 5. TemplateEngine dans File Studio

File Studio possède encore son propre mini-moteur :
- `{DATE}`
- `{YEAR}`
- `{MONTH}`
- `{COUNTER}`

Le Core possède déjà un TemplateEngine beaucoup plus riche.

Cible : supprimer les règles locales, conserver `COUNTER` comme extra runtime et utiliser le même vocabulaire de variables dans File, PDF, Image watermark et futurs Studios.

## P1 — Très pertinent, après sécurisation P0

### OCR partagé

OCR Studio et PDF Studio doivent utiliser le même moteur :
`ocr-service.js`

Responsabilités :
- normaliser Canvas/Image/Blob ;
- créer/fermer worker Tesseract ;
- langue ;
- progression ;
- résultat texte ;
- erreurs normalisées.

OCR Studio devient l'interface spécialisée du moteur ; PDF Studio le consomme pour ses pages rasterisées.

### Symbology service

QR Studio et PDF Studio génèrent chacun des QR.

Cible :
`symbology-service.js`

Responsabilités :
- QR → SVG/PNG/DataURL
- Data Matrix
- Code128 / GS1 / EAN
- options communes
- validation valeurs
- éventuellement scan dans une interface distincte.

### Query/filter service

Les recherches, tris et filtres de Data/Spreadsheet peuvent être mutualisés sans lier leurs UI.

### Color service

QR Studio contient ses conversions HEX → RGB → HSL alors que le Core a déjà `color-control.js`.

Étendre cette brique évite un nouveau mini-moteur local.

## P2 — Après validation humaine

- image pipeline générique ;
- conversion Office haute fidélité ;
- Presentation Studio ;
- Google Workspace natif ;
- Drive transverse ;
- gros volumes Data ;
- comparaison visuelle PDF/image ;
- watermark robuste ;
- batch multi-opérations.

## Rôle des Studios Files & Office

### File Studio
Gestion du **fichier en tant qu'objet** :
- renommage ;
- chemins ;
- hash ;
- manifest ;
- classement ;
- lots ;
- routage vers le Studio adapté.

### Document Studio
Gestion du **contenu documentaire** :
- DOCX / ODT / TXT / Markdown / HTML / RTF ;
- lecture ;
- édition ;
- conversion structurelle.

### Spreadsheet Studio
Gestion du **contenu tabulaire** :
- XLS / XLSX / ODS / CSV / TSV / JSON tabulaire ;
- feuilles ;
- filtres ;
- tris ;
- conversions.

### Presentation Studio — DÉVELOPPEMENT
Gestion du contenu de présentation :
- PPT / PPTX / ODP.

Ces Studios appartiennent à la même famille, mais ne doivent pas être fusionnés. File Studio peut devenir le point d'entrée/router sans absorber les moteurs Document/Spreadsheet/Presentation.

## Architecture cible proposée

```text
_shared/studio-v2/
├── artifact-identity.js
├── download-service.js               [P0 nouveau]
├── document-format-service.js        [P0 nouveau]
├── tabular-service.js                [P0 nouveau]
├── collection-query-service.js       [P1]
├── ocr-service.js                    [P1]
├── symbology-service.js              [P1]
├── color-control.js                  [P1 enrichir]
├── format-registry.js
├── template-engine.js
├── output-service.js
├── markdown-engine.js
├── history.js
├── help.js
└── ...
```

## Séquence recommandée

1. P0 : download-service.
2. P0 : document-format-service et migration Document/PDF.
3. P0 : tabular-service et migration Data/Spreadsheet/Dataset.
4. P0 : FormatRegistry + TemplateEngine dans les Studios restants.
5. Relancer tous les tests.
6. P1 : OCR service.
7. P1 : symbology service.
8. P1 : query/color/markdown consolidation.
9. Relancer tous les tests.
10. Seulement ensuite : passe finale d'icônes/UI.

## Critère de réussite

Une fonction transverse est considérée mutualisée quand :
- un seul moteur fait le traitement ;
- les Studios ne contiennent plus qu'orchestration/UI ;
- les tests du moteur existent ;
- au moins deux Studios consomment réellement le moteur lorsqu'ils partagent la fonction ;
- aucune régression navigateur n'est constatée.

