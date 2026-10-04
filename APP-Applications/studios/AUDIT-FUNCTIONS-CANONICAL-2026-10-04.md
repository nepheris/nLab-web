# Audit global des fonctions — Studio Core, Studios et applications dérivées

Date : 2026-10-04  
Périmètre principal : `nepheris/nLab-web`  
Périmètre amont vérifié : `nepheris/nLab`, `nepheris/nLab-Web-Framework`

## 1. Règle d'architecture

Ordre de recherche avant toute nouvelle fonction :

1. Studio spécifique
2. Studio Core partagé
3. Domaine / BRK canonique
4. Framework Web
5. nLab Core

Une fonction n'est locale que si aucune brique supérieure ne fournit réellement la capacité.

Un Studio doit principalement :
- orchestrer ;
- afficher l'UI ;
- stocker son état métier spécifique ;
- appeler les moteurs partagés.

Il ne doit pas recopier :
- un moteur de transformation ;
- une primitive d'entrée/sortie ;
- un moteur de conversion ;
- un moteur de rendu déjà partagé ;
- une fonction de format/couleur/thumbnail déjà canonique.

## 2. Situation customDB

Aucune source nommée littéralement `customDB` n'est actuellement identifiée dans `nLab-web`.
La source de vérité équivalente est actuellement répartie entre :
- `APP-Applications/_shared/studio-v2/` ;
- les BRK de `nepheris/nLab/Build/BRK-Brick/` ;
- les capabilities et moteurs de `nepheris/nLab-Web-Framework`.

Tant qu'un registre `customDB` explicite n'existe pas, ces trois niveaux sont à traiter comme les sources canoniques.

---

# 3. Inventaire des API canoniques du Studio Core V2

## Archive
`archive-service.js`
- createZip
- openZip
- zipEntries

## Identité / manifest
`artifact-identity.js`
- generateArtifactId
- sha256
- buildArtifactManifest
- verifyArtifactManifest
- downloadManifest

## Assets
`asset-picker.js`
- mountAssetPicker
- AssetPicker

## Métadonnées build
`build-metadata-service.js`
- resolveBuildMetadata
- applyBuildMetadata

## Capabilities
`capability-registry.js`
- registerCapabilities
- findCapabilities
- listCapabilities
- getCapability
- capabilityForAction

`capability-tests.js`
- runCapabilitySelfTests

## Collections
`collection-browser.js`
- CollectionBrowser

## Couleurs
`color-control.js`
- hexToRgb
- rgbToHex
- rgbToHsl
- hslToRgb
- parseColor
- formatColor
- bindColorControl
- bindColorHexControl
- createColorPicker
- normalizeHex

## Dimensions / unités
`dimension-service.js`
- pxToUnit
- unitToPx
- convertDimension
- formatDimension
- DIMENSION_UNITS

## Documents Office structurels
`document-format-service.js`
- extractRtfText
- textFromOfficeXml
- readDocx
- readOdt
- writeDocx
- writeOdt
- textToHtml
- writeStructuredDocx

## Session documentaire
`document-session.js`
- DocumentSession

## Téléchargements
`download-service.js`
- downloadBlob
- downloadText
- downloadJson
- downloadCsv
- blobFromText

## Drive
`drive-service.js`
- DriveService
- GOOGLE_DRIVE_SCOPE

## Drop / tri
`drop-zone.js`
- collectDirectoryHandle
- mountDropZone
- mountSortableList

## Capacités fichier
`file-capabilities.js`
- detectFileCapabilities

## Preview texte / Markdown
`file-preview-service.js`
- markdownToSafeHtml
- renderMarkdownFilePreview
- renderPlainTextPreview

## Formats
`format-registry.js`
- formatInfo
- acceptedExtensions
- acceptAttribute
- isSupportedFile
- fileTypeLabel
- definitionsForFamily
- acceptForFamilies
- iconPathFor
- studioForFormat
- FORMAT_DEFINITIONS
- extensionOf

## Historique
`history.js`
- loadHistory
- recordHistory
- clearHistory
- toggleHistoryFavorite
- renderQuickHistory
- renderFullHistory
- mountHistoryUI
- StudioHistory

## Icônes
`icon-registry.js`
- registerIconTheme
- setIconTheme
- getIconTheme
- icon
- hasIcon
- iconThemeNames
- iconNames

## Input
`input-picker.js`
- openInputPicker
- mountInputPicker
- filesFromDrop

`input-service.js`
- normalizeFiles
- acceptedFiles
- readText
- readJson
- readBytes
- fileFromUrl
- describeInput

## Markdown
`markdown-engine.js`
- MarkdownEngine
  - splitFrontMatter
  - compose
  - parseYaml
  - dumpYaml
  - render
  - slug
  - headings
  - renderWithAnchors
  - wordCount
  - insertAt

## OCR
`ocr-service.js`
- detectLanguageFromText
- availableOcrEngines
- resolveOcrEngine
- recognizeImage
- runOcr
- ocrDiagnostics

## Output
`output-service.js`
- OutputService

## Pages
`page-viewer.js`
- StudioPageViewer

## Pipelines
`pipeline-service.js`
- registerPipelineHandler
- listPipelineHandlers
- runPipeline

## Profil personnel
`personal-profile-service.js`
- getPersonalProfileSecurityMode
- createDefaultPersonalProfile
- loadPersonalProfile
- savePersonalProfile
- updatePersonalProfile
- resetPersonalProfile
- listPersonalTemplates
- savePersonalTemplate
- removePersonalTemplate
- rememberRecentLocation
- listPersonalAssetRefs
- addPersonalAssetRef
- setDefaultPersonalAsset
- removePersonalAssetRef
- updatePersonalAssetRef
- movePersonalAssetRef
- profileTemplateValues
- capturePortableLocalSettings
- applyPortableLocalSettings
- putPersonalAsset
- getPersonalAsset
- listPersonalAssets
- deletePersonalAsset
- initializePersonalProfileSecurity
- setPersonalProfileSecurityMode
- clearPrivateSession
- exportPersonalProfileZip
- inspectPersonalProfileZip
- importPersonalProfileZip
- PERSONAL_VARIABLES

## Localisations récentes
`recent-locations-service.js`
- ensureHandlePermission
- listRecentLocations
- rememberLocation
- resolveRecentLocation
- forgetRecentLocation
- RecentLocationsService

## Settings
`settings.js`
- loadStudioSettings
- saveStudioSettings
- applyStudioSettings
- renderStudioSettingsPanel

## Clone structurel
`structural-clone-service.js`
- coarseTextShape
- detectHeadingLevelFromStyle
- structureFromDocxXml
- structureFromOdtXml
- readDocxStructure
- readOdtStructure
- readPdfStructure
- imageStructure
- analyzeRichStructure
- summarizeStructure

## Contexte inter-Studio
`studio-context.js`
- createStudioContext
- loadStudioContext
- updateStudioContext
- clearStudioContext
- contextReference
- openAdvancedStudio

## Résolution Studio
`studio-link-resolver.js`
- loadStudioCatalog
- resolveSpecializedStudio
- openSpecializedStudio
- resolveStudioLink
- openStudio
- StudioLinkResolver

## Symbologies
`symbology-service.js`
- symbologyInfo
- defaultPayload
- normalizePayload
- bwipOptions
- validatePayload
- SYMBOLOGIES

## Données synthétiques
`synthetic-data-service.js`
- seededRng
- fakeEan13
- fakeEan8
- lorem
- uuid
- inferType
- inferSchema
- generateValue
- generateDataset
- markdownTable
- generateDocumentModel
- documentToMarkdown
- documentToHtml
- syntheticDocumentFromStructure
- applyFormatProfileToSchema
- TYPE_OPTIONS

## Tableur / tabulaire
`tabular-service.js`
- rowsToObjects
- objectsToRows
- parseCsv
- toCsv
- filterRows
- sortRows
- workbookFromObjects
- workbookFromRows
- workbookToObjects
- workbookToRows
- readWorkbook
- workbookFromCsv
- workbookFromJson
- workbookBlob
- workbookStructureProfile
- workbookFromObjectsWithProfile

## Templates
`template-engine.js`
- TEMPLATE_VARIABLES
- TemplateEngine
- templateVariableHelp

## Miniatures
`thumbnail-service.js`
- lightweightThumbnail

## Versions
`version-service.js`
- resolveStudioVersions
- applyVersionDocumentMeta

## Fenêtres
`window-system.js`
- enhanceStudioWindow
- resetStudioWindows

## Workflow
`workflow-presets.js`
- saveWorkflowPreset
- removeWorkflowPreset
- runWorkflowPreset
- listWorkflowPresets

`workflow-ui.js`
- mountWorkflowUI

## Infrastructure UI
`bootstrap-specialized.js`
- bootstrapSpecializedStudioV2

`command-palette.js`
- mountCommandPalette

`core.js`
- setArchitectureMarkers
- architectureMarkersEnabled
- bindArchitectureMarkers
- setStatus
- openStudioSection
- bindStudioChrome
- applyRibbonGroups
- setRibbonGroupVisible
- qs
- qsa
- clamp
- STUDIO_V2

`frame.js`
- mountStudioV2

`help.js`
- featureMeta
- renderFeatureHelp
- findFeature
- listManifestFeatures
- searchManifestFeatures
- renderHelpCatalog
- contextualMeta
- renderContextualHelp

`legacy-bridge.js`
- mountStudioCoreV2Bridge

`personal-profile-ui.js`
- mountPersonalProfileUI

`plugins.js`
- createStudioPlugin
- StudioPluginRegistry

`stepped-preset-control.js`
- mountSteppedPresetControl
- SteppedPresetControl

---

# 4. Inventaire des fonctions locales des Studios actifs

## Image Studio V2
- fileToUrl
- addFiles
- renderList
- drawBase
- loadActive
- syncDimensions
- px
- commitCanvas
- transform
- point
- applyCropRect
- stats
- renderCal
- addDemo
- state

### Verdict
- UI / état : local acceptable.
- rotation / flip / crop / canvas export : **moteur transverse à promouvoir**.
- chevauchement avec Scan Studio.
- candidat naturel : service image navigateur commun + BRK114 pour runtime desktop/local.

## Code Studio V2
- modeFor
- setMode
- setDoc
- renderCodeFiles
- openCodeFile
- addCodeFiles
- stats

### Verdict
Principalement orchestration/UI autour d'Ace. Pas de duplication moteur majeure identifiée à ce stade.

## JSON Studio V2
- esc
- parse
- sorted
- analyze
- scalar
- node
- refresh
- load

### Verdict
- parse / tri / analyse JSON sont génériques.
- candidat à un `json-service.js` partagé si réutilisation dans Code/Data/File.
- UI arbre/rendu reste locale.

## Data Studio V2
- esc
- detect
- renderCell
- keys
- syncSelectors
- applyView
- render
- setRows
- renderDatasetFiles
- openDatasetFile
- addDatasetFiles
- load

### Verdict
Le moteur tabulaire est déjà correctement consommé via `tabular-service.js`.
Les fonctions restantes sont surtout UI/orchestration.

## File Studio V2
- split
- token
- target
- esc
- render
- load
- rows

### Verdict
Utilise déjà :
- TemplateEngine
- download-service
- tabular-service

Les helpers locaux sont surtout de présentation/transformation de nom.

## Spreadsheet Studio V2
- esc
- sheetRows
- render
- syncSheets
- openFile

### Verdict
Adoption correcte :
- tabular-service
- download-service

Pas de second moteur tableur détecté dans V2.

## Document Studio V2
- render
- openFile
- stem

### Verdict
Adoption correcte :
- document-format-service
- download-service

## OCR Studio V2
- use
- normalizedOcrInput
- run

### Verdict
Adoption correcte de `ocr-service.js`.

## QR & Barcode Studio V2
- common
- renderQR
- renderBar
- render
- addHist
- renderHistory
- scanImage

### Verdict
Le service partagé ne couvre aujourd'hui que :
- registre de symbologies ;
- validation ;
- normalisation ;
- options bwip.

Le rendu réel QR/barcode est encore local.
PDF Studio possède aussi sa propre génération.
=> **duplication confirmée**, étendre `symbology-service.js` avec génération/rendu/export.

## Markdown Studio V2
- setStatus
- setDirty
- syncPreview
- escapeHtml
- debounce
- syncYamlFromSource
- applyYaml
- insert
- prefixLine
- download
- saveMarkdown
- printPdf
- exportHtml
- switchMode
- syncScroll

### Verdict
- moteur Markdown : correctement partagé via `MarkdownEngine`.
- `download()` : duplication confirmée de `download-service.js`.
- `escapeHtml` : petit helper UI tolérable mais à centraliser si répété.
- export HTML / impression : orchestration locale acceptable.

## Dataset Generator Studio V2
- setSchema
- renderSchema
- applyPreset
- renderTable
- renderDocument
- generateTable
- generateDoc
- setMode
- generateCurrent
- isDocumentMode
- nameStem
- ensureTable
- exportJson
- exportCsv
- exportXlsx
- exportMd
- exportHtml
- exportDocx
- exportPdf
- parseClone
- nextPage

### Verdict
Adoption forte des moteurs partagés :
- tabular-service
- document-format-service
- synthetic-data-service
- structural-clone-service
- ocr-service
- download-service

Les fonctions locales sont surtout orchestration/presets/UI.

## Scan Studio V2
- fileToDataUrl
- addFiles
- renderList
- drawImageWithEffects
- renderActive
- mutate

### Verdict
- OCR et download déjà mutualisés.
- rotation / deskew / traitement canvas encore local.
- chevauchement direct avec Image Studio.
=> **moteur image transverse requis**.

## PDF Studio V2 — orchestration principale
Principales fonctions locales nommées :
- setValidatedButton
- renderDriveState
- migrateLegacyPdfConfig
- saveDriveConfig
- connectDrive
- fetchRemoteFile
- renderRecentLocationSelects
- renderNamingPresets
- escHtml
- todayValue
- allPersonalImageRefs
- renderObjectAssetSelectors
- renderStampPresets
- selectedStampTemplate
- normalizeStampItem
- fillStampEditor
- stampEditorItem
- refreshStampEditorPreview
- downloadJson
- syncStampDates
- stampSvgColor
- refreshStampSvgPreview
- saveGeneratedStampSvgAsset
- stampImageData
- refreshStampPreview
- activateObjectTool
- exportBytesWithObjects
- commitObjectsIfNeeded
- syncSession
- syncUndoRedo
- checkpoint
- undo
- redo
- loadPdfProfilePreferences
- savePdfProfilePreferences
- namingExtra
- outputName
- updateNamingPreview
- outputContext
- outputParts
- updateOutputPreview
- setOutputMode
- signatureTargetPages
- signatureRefs
- refreshSignatureAssets
- refreshSignaturePreview
- setSignatureMode
- applyVisualSignature
- bytesWithOptionalSignatureAppearance
- applyCryptographicSignature
- validateCurrentSignature
- qrDataUrl
- toolPages
- dpiMeaning
- jpegMeaning
- runOcrQuick
- runOptimizeQuick
- runTranslateQuick
- codeBlob
- refreshQrPreview
- applyQrQuick
- runQuickConversion
- protectCurrentPdf
- unlockSelectedPdf
- inspectSecurityAndMetadata
- loadPdfMetadataFields
- savePdfMetadataFields
- cleanPdfMetadata
- runCompare
- inspectFormsQuick
- flattenFormsQuick
- syncViewerMeta
- renderAll
- load
- loadArchiveWorkspace
- loadFiles
- assertPdfMutationAllowed
- markPdfModifiedAfterSignature
- rotate
- addPage
- duplicatePage
- deletePageNumber
- deletePages
- deleteSelected
- renderAssemblyList
- fillAssemblyFromSelection
- moveAssemblyItem
- mergeAssemblySelection
- insertAssemblyPdf
- extractSelectedPages
- currentBlob
- ensureOutputDirectory
- saveOutputBlob
- saveCurrent
- saveZip
- chooseInputDirectory
- goPage
- activateSidebarTab
- currentSidebarPane
- setCurrentPaneDetails
- setSidebarFloating
- bindHelpCatalogActions
- renderAllHelp
- showHelp
- renderFunctionSearch
- openToolSection
- showRibbonContext
- syncCtxColor

### Verdict
La plupart sont orchestration/UI autour des moteurs partagés.
Duplications confirmées :
- `downloadJson` → utiliser `download-service.js`.
- génération QR/code → à déplacer derrière `symbology-service.js`.
- conversion DOCX/ODT dans `document-conversion.js` → utiliser `document-format-service.js`.
- helpers couleurs locaux des couches d'objet → utiliser `color-control.js` lorsque compatible.

## PDF Engine canonique
`pdf-studio/v1/pdf-engine.js`

Fonctions/capacités confirmées :
- loadFile
- setBytes
- targetPages
- selectPage
- toggleSelected
- selectAll
- selectNone
- renderPage
- rotate
- addBlank
- movePage
- duplicate
- deletePages
- extractPages
- mergeFiles
- mergePdfBytes
- baseBytes
- conversion image -> PDF
- conversion texte -> PDF
- conversion DOCX/ODT/tableur -> PDF rapide

### Règle
Toute application dérivée PDF doit appeler ce moteur et ne jamais recréer ces opérations.

## PDF Object Layer
Fonctions locales :
- hexRgb
- blobDataUrl
- normalizedImageDataUrl
- miniSvg
- dataUrlBytes
- clamp
- uid
- up

Méthodes métier :
- add
- rotateSelected
- setSelectedRotation
- déplacement / redimensionnement / verrouillage / rendu objets

### Verdict
- géométrie objet = candidat P1 à moteur overlay partagé.
- `hexRgb` chevauche `color-control.js`.
- `miniSvg` doit converger vers l'Icon Registry.

## PDF document-conversion.js
- esc
- stem
- pdfPagesText
- docxParagraph
- makeDocx
- makeOdt
- DocumentConversion.pdfTo

### Verdict
`makeDocx` / `makeOdt` sont des doublons directs de `document-format-service.js`.
À supprimer après migration.

## PDF Sign
- render
- loadPdf
- loadSourceFromQuery
- refsFor
- refreshAssets
- chooseAsset
- saveAssetBlob
- applyAsset
- outputName
- savePdf

### Verdict
Application dérivée correcte si elle reste façade sur le moteur PDF/signature partagé.

## Merge Studio
- esc
- pageCount
- addFiles
- setText
- render
- previewSelected
- move
- bindUi

### Verdict
Le merge réel appelle `PDFEngine.mergePdfBytes` : correct.
Les fonctions locales sont UI/collection.

---

# 5. Duplications confirmées à corriger

## P0 — immédiat
1. Input Picker : ne pas générer lui-même les thumbnails.
   - utiliser `thumbnail-service.lightweightThumbnail`.

2. Input Picker : ne pas implémenter lui-même la rotation PDF.
   - utiliser `PDFEngine.rotate` ou une façade Core dédiée vers ce moteur.

3. PDF Studio : `downloadJson`.
   - utiliser `download-service.downloadJson`.

4. Markdown Studio : `download()`.
   - utiliser `download-service`.

5. PDF Studio `document-conversion.js` :
   - supprimer `makeDocx` / `makeOdt`;
   - utiliser `document-format-service.writeDocx/writeOdt`.

6. Icônes locales / SVG inline des objets :
   - converger vers `icon-registry.js` et `assets/icons/functions/`.

## P1 — moteur commun à compléter
7. Image Studio + Scan Studio + Input Picker :
   - créer/promouvoir un moteur image navigateur commun ;
   - rotation ±90 ;
   - flip X/Y ;
   - resize ;
   - crop ;
   - raster/export ;
   - deskew lorsque pertinent.
   - l'implémentation doit être alignée avec BRK114 pour le runtime local/desktop.

8. QR & Barcode Studio + PDF Studio :
   - étendre `symbology-service.js` pour couvrir génération réelle QR/barcode, preview et export ;
   - supprimer les moteurs locaux parallèles.

9. Overlay / objets :
   - PDF Object Layer / annotations ;
   - futur usage Image/Scan.
   - extraire géométrie commune : move, resize, rotate, lock, delete.

10. JSON :
   - envisager un `json-service.js` si Code/Data/File réutilisent parse/analyse/tri/arbre.

---

# 6. Points déjà correctement mutualisés

- Spreadsheet → tabular-service + download-service
- Data → tabular-service + download-service
- File → TemplateEngine + tabular-service + download-service
- Document → document-format-service + download-service
- OCR → ocr-service
- Dataset Generator → synthetic-data + tabular + document-format + OCR + structural clone + download
- Merge → PDFEngine.mergePdfBytes
- PDF V2 → nombreux services Core déjà consommés : thumbnail, format, drop-zone, template, output, session, pipeline, symbology validation, etc.

---

# 7. Écart détecté sur la branche Input Picker en cours

La branche `core-input-picker-previews` ne doit pas être fusionnée telle quelle tant que les duplications suivantes ne sont pas supprimées :
- thumbnail image local ;
- thumbnail PDF local ;
- chargement PDF.js local si le service thumbnail sait déjà le faire ;
- rotation PDF locale via PDFLib ;
- rotation image locale canvas.

La bonne cible :
- Input Picker = UI + état + intention ;
- ThumbnailService = miniature ;
- FormatRegistry = type / label / icône ;
- moteur image partagé = rotation image ;
- PDFEngine / façade PDF = rotation PDF.

---

# 8. Règle de validation avant toute nouvelle fonction

Avant merge d'une nouvelle fonction Studio :

- [ ] recherche dans `_shared/studio-v2`
- [ ] recherche dans BRK
- [ ] recherche dans Web Framework capabilities
- [ ] recherche dans moteurs des Studios existants
- [ ] si fonction déjà existante : import / façade
- [ ] si fonction utilisée par 2 Studios : promotion Core
- [ ] si fonction spécifique : rester locale
- [ ] aucun moteur parallèle créé pour simplifier une UI
- [ ] tests du moteur partagé
- [ ] tests de chaque consommateur
- [ ] documentation du propriétaire canonique de la fonction

## Conclusion

L'architecture est déjà largement orientée vers la mutualisation, mais plusieurs générations historiques coexistent encore.

Les principales anomalies actuelles sont :
1. conversion DOCX/ODT PDF encore dupliquée ;
2. génération QR réelle encore dupliquée ;
3. traitements image/canvas encore dupliqués entre Image et Scan ;
4. quelques primitives download encore locales ;
5. couche objets/overlay pas encore promue en moteur transverse ;
6. branche Input Picker en cours qui doit être refactorée avant fusion pour consommer les services canoniques existants.

La règle à appliquer désormais est stricte :
**pas de nouvelle fonction métier locale tant que l'inventaire canonique n'a pas été consulté.**
