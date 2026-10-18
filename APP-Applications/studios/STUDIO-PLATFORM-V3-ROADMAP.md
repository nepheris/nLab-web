## Chantier Core 3.5.0 TEST — Collection vignettes, zoom et rotations (18 octobre 2026)

**Branche :** `studio-core-3-5-collection-thumbnails-20261018` · **Produit :** Core TEST 3.5.0, Studio Core Test Lab **0.3.0 TEST**.

- CORE-211 **IMPLEMENTED TEST** — `collection-browser.js` opt-in `thumbnailTools:true`, zoom manuel −/+ (100–320 px), auto-ajustement par largeur, taille mémorisée par collection.
- CORE-212 **IMPLEMENTED TEST** — Rotation visuelle ±90° sur cartes de taille suffisante, événement `rotate`, sans altérer les octets du document ; historique undo/redo raccordé dans le laboratoire uniquement.
- CORE-213 **IMPLEMENTED TEST** — Collection Lab : import depuis le Picker partagé, import multi-fichiers natif, dropzone, Liste/Grille/Vignettes, tri, sélection totale et inversion, miniatures produites par `thumbnail-service.js`.
- CORE-214 **AUTOMATED TESTS ADDED / CI PENDING** — Scénarios desktop/mobile de zoom, auto, rotation, fichier multiple, sélection ; tests existants et CI non encore certifiés à la rédaction.
- CORE-215 **IMPLEMENTED TEST** — Snapshot historique Lab 0.2.0 isolé sous `versions/0.2.0/` ; 0.1.0 conservée ; CURRENT non modifié.
- CORE-216 **PLANNED** — Raccorder progressivement PDF/Image/File à la nouvelle option si et seulement si bénéfice UX et non-régression mesurée.
- CORE-217 **PLANNED** — Décliner maquette UX v0.5 : ruban regroupé, accordéons/panneaux dockables, nommage et sorties par templates, sélecteur couleur partagé, profils mobile/tablette/desktop. Ne pas confondre le laboratoire 0.3.0 avec l'intégralité de la maquette.
- CORE-218 **PLANNED** — Vérifier rotations réelles produites par moteurs PDF/image, prévisualisation et export séparément de la rotation visuelle.
 
**Gates :** tests Chrome desktop + mobile, snapshots, audit, déploiement `gh-pages`, recette manuelle du ruban, Android et PWA. Préserver la CI exhaustive Image Studio préexistante comme exception ouverte et non comme réussite.

---

# nLab Studio Platform V3 — implementation roadmap

## Chantier 3.4.1 TEST — Core Lab 0.2 et démos (18 octobre 2026)

**Branche / PR :** `studio-core-test-v0.2-acquisition-demos-audit-20261018` / [PR #84](https://github.com/nepheris/nLab-web/pull/84).
**Audit :** [STUDIO-CORE-V0.2-MUTUALIZATION-AUDIT.md](./STUDIO-CORE-V0.2-MUTUALIZATION-AUDIT.md).

- CORE-201 Audit statique des 15 Studios / Core vs service vs métier : **DONE**.
- CORE-202 Acquisition Core opt-in via `input-picker.js` existant, aucune copie du module : **IMPLEMENTED TEST**.
- CORE-203 Navigation rail Core repliable, Historique/Propriétés, réglage Responsive optionnel, icône plein écran : **IMPLEMENTED TEST**.
- CORE-204 Démos : dossier Icônes, tous fichiers filtrables, previews de repli, lien Lab : **IMPLEMENTED TEST**.
- CORE-205 Recette Chrome desktop/mobile + galerie : **CI**, PWA physique et UX utilisateur **TODO**.
- CORE-206 Migration progressive des surfaces PDF, Image, OCR et File vers l'entrée canonique : **PLANNED**.
- CORE-207 Standardiser nommage/export, métadonnées et progression sans forcer des conversions métier dans le Core : **PLANNED**.
- CORE-208 Multi-fenêtres dockées/flottantes, clavier et responsive sur 15 Studios : **PLANNED**.

**Gates :** ne pas considérer l'audit statique comme validation 15/15, ni une PR comme une publication. Conserver les historiques, contrôler CI et Pages avant promotion.

---


## Chantier — Studio Core Test Lab / mode application (18 octobre 2026)

| ID | Tâche | État sur branche TEST | Gate |
| --- | --- | --- | --- |
| STU-20261018-15 | Laboratoire isolé branché au vrai Studio Core V2, relié à la section Validation du Hub | **PUBLISHED TEST / TECH PASS** | Chrome desktop/mobile PASS ; recette utilisateur à faire |
| STU-20261018-16 | Exposer l'installation PWA via service + commande Core communs, sans confondre application et fullscreen | **PUBLISHED TEST / PARTIAL** | Installation manuelle Chrome/Edge/Android et état standalone à constater |
| STU-20261018-17 | Faire consommer le service PWA commun à Responsive CURRENT sans modifier ses historiques | **PUBLISHED TEST / TECH PASS** | Non-régression Responsive CURRENT 0.4.3 PASS |
| STU-20261018-18 | Configurer un manifeste PWA dédié pour chaque Studio spécialisé éligible (15/15 à auditer) | **PARTIAL / TODO** | Éviter les manifestes partagés avec start_url erroné |
| STU-20261018-19 | Valider interface Core et modes application + plein écran sur PC, tablette et Android | **TODO HUMAN VALIDATION** | Pas de validation présumée hors des navigateurs réellement testés |

**Intégration :** [PR #83](https://github.com/nepheris/nLab-web/pull/83) fusionnée (`17561c65`) ; les fichiers ont été vérifiés dans `main` et `gh-pages`. URL TEST : `APP-Applications/studio-core-test/`.
La page `APP-Applications/studio-core-test/` n'est pas un 16e Studio métier et ne touche pas aux versions CURRENT/historiques. Les tests techniques de la page ne remplacent pas les essais physiques PWA. CI Core Lab Chrome desktop/mobile **PASS**, audit Studios **PASS**, Responsive CURRENT **PASS**, PDF public **PASS**. L'exhaustive spécialisée conserve le timeout Image Studio déjà suivi dans STU-20261018-10 ; la validation PWA réelle reste ouverte.

---


## Point de situation — 18 octobre 2026 (synchronisation GitHub)

**Gouvernance des états.** `DONE` = code livré/fusionné ; `VALIDATED` = fonctionnalité approuvée et tests ciblés réussis (pas nécessairement publiée) ; `PARTIAL` = réalisation incomplète ; `BLOCKED` = gate de validation ou dépendance bloquante ; `TODO` = à réaliser. Ne pas assimiler `PASS` ciblé à une CI exhaustive verte.

**Périmètre :** 15 Studios catalogués, 3 applications dérivées (PDF Sign, Merge Studio, Guide Froid). Inventaire : `APP-Applications/studios/catalog.json`.

### Livraison du jour — Responsive Test Studio / identité Studio Core

| ID | Tâche atomique | Statut au 18/10 | Preuve / suite |
| --- | --- | --- | --- |
| STU-20261018-01 | 0.4.2 CURRENT et historique 0.4.1/0.4.0 | **DONE** | Fusion PR #79, version CURRENT publiée dans `main` avant la nouvelle passe. |
| STU-20261018-02 | Étendre la saisie « Modifier URL » à 780 px en restant responsive | **VALIDATED** | 0.4.3 TEST livrée par PR #80, acceptation de l'utilisateur, recette Chrome PASS ; promotion CURRENT en PR #81. |
| STU-20261018-03 | Promouvoir 0.4.3 CURRENT et geler sa version autonome | **DONE / VALIDATED** | `versions/0.4.3/`, registre et page CURRENT préparés, PR #81 fusionnée (`fcdeba13`), Pages `39109589863` PASS ; `main` et `gh-pages` identiques. |
| STU-20261018-04 | Logo nLab officiel cliquable sur Responsive CURRENT et page Versions | **DONE / VALIDATED** | Implémenté dans PR #81, audit Chrome logo/home PASS ; publication GitHub Pages confirmée. |
| STU-20261018-05 | Résoudre dans le Studio Core V2 les liens logo/home/navigation depuis n'importe quel Studio | **DONE / VALIDATED** | Résolution via `import.meta.url` dans `studio-v2/frame.js` ; couverture représentative Chrome + audit statique du catalogue PASS, fusionné et publié par PR #81. |
| STU-20261018-06 | Harmoniser la page d'accueil PDF Studio (cas non géré par le Core commun) | **DONE / VALIDATED** | Logo et destination nLab ajoutés, test Chrome PASS en PR #81 fusionnée, PDF legacy préservé. |
| STU-20261018-07 | Ajouter au Core la commande partagée « Test responsive » | **DONE / VALIDATED** | Ruban/registry + lancement URL source ; test navigateur PASS en PR #81 fusionnée, moteur unique conservé. |
| STU-20261018-08 | Exposer Responsive Test comme web app PC fixe/portable | **PARTIAL** | Manifeste web + bouton conditionnel `beforeinstallprompt`, syntaxe et navigation testées ; installation manuelle Chrome/Edge/OS et expérience hors navigateur non encore validées. |
| STU-20261018-09 | Audit du logo nLab sur les **15** Studios | **PARTIAL** | Inventaire et audit de raccordement au Core réalisés ; Chrome vérifié sur surfaces représentatives, pas de test E2E exhaustif 15/15 en desktop/mobile. |
| STU-20261018-10 | Stabiliser la CI exhaustive Image Studio | **BLOCKED** | Job `Exhaustive specialized V2` échoue encore sur `page.waitForFunction` (timeout 10 s), indépendamment des recettes Chrome ciblées PASS. Identifier la cause, corriger, relancer. |
| STU-20261018-11 | Valider GO/NO-GO et fusionner PR #81 puis contrôler GitHub Pages | **DONE / VALIDATED** | PR #81 fusionnée et Pages vérifié, Chrome/audit PASS. Suite exhaustive Image Studio toujours FAIL, tracée séparément STU-20261018-10. |
| STU-20261018-12 | Ajouter santé runtime/capacités consolidées aux cartes du Studio Hub | **TODO** | Report V3.4, ne pas complexifier le Core avant stabilisation. |
| STU-20261018-13 | Harmoniser les métadonnées de versions/build et le CSS sur toutes les familles | **PARTIAL** | Le Core et plusieurs manifests le supportent ; PDF legacy et certains points d'entrée conservent des exceptions isolées. |
| STU-20261018-14 | Factoriser entrée/sortie du plein écran dans le Core commun, même comportement dans tous les Studios V2 | **DONE / VALIDATED** | Module `studio-v2/fullscreen-service.js` + ruban et commande `core.fullscreen` dans `frame.js` ; Responsive CURRENT réutilise ce service tout en conservant le snapshot historique 0.4.3, recette Chrome desktop/mobile/Échap/commandes PASS et service Core publié. |

### Priorité et ordre d'exécution

1. **P0 — release gate** : analyser le timeout transversal Image Studio, déterminer s'il est préexistant sans effet fonctionnel ou s'il révèle une régression, et consigner la preuve.
2. **DONE — promotion** : PR #81 fusionnée, artefacts `main` et `gh-pages` vérifiés ; logo et Core plein écran publiés.
3. **P1 — couverture 15/15** : dérouler un contrôle navigateur individuel du lien nLab sur chaque CURRENT, desktop et mobile ; documenter explicitement les exceptions PDF legacy et redirections.
4. **P1 — application installable** : vérifier l'installation réelle dans Chrome/Edge sur Windows et Linux ; tester réouverture, navigation et viewport en fenêtre standalone ; ne pas annoncer de fonctionnement hors ligne non prouvé.
5. **P2 — mutualisation** : poursuivre V3.4 Hub (statut des capacités, état des moteurs et galerie), sans dupliquer le Core, puis V3.2 image-service.

### Contrat de présentation commun

Voir `APP-Applications/_shared/studio-v2/BRANDING-CONTRACT.md` (PR #81) : logo officiel `nlab-wordmark.svg`, lien vers l'accueil du site, styles hérités du Core V2 ; pages autonomes isolées et historique immuable.

**Références de validation finales :** PR #81 (`fcdeba13`), Chrome Responsive + fullscreen Core `39109430450` PASS, audit `39109430454` PASS, PDF V2 `39109430513` PASS, Pages `39109589863` PASS, CI exhaustive spécialisée `39109430437` FAIL (timeout Image Studio préexistant). **Publication confirmée :** `main` et `gh-pages` servent Responsive 0.4.3 CURRENT ; module Core plein écran partagé, historiques préservés. Exception connue : la suite exhaustive Image Studio conserve un timeout indépendant.

---


Status: **IMPLEMENTATION IN PROGRESS**  
Source of truth for public Studio inventory: `APP-Applications/studios/catalog.json`

## Revue opérationnelle — 18 octobre 2026

**Référence de pilotage atomique :** [STUDIOS-ROADMAP-STATUS-2026-10-18.json](./STUDIOS-ROADMAP-STATUS-2026-10-18.json).
Statuts recoupés avec les registres `versions.json`, le catalogue et les PR GitHub ; **une PR ouverte n'est pas assimilée à une livraison main/Pages**.

### Bilan quantifié

| Indicateur | Constat vérifié |
|---|---|
| Studios | **15** inscrits dans `studios/catalog.json` |
| Applications dérivées | **3** : PDF Sign, Merge Studio, Guide Froid |
| Studios avec CURRENT dans le registre | **15/15**, dont PDF Studio encore en CURRENT historique |
| Tâches auditées aujourd’hui | **28** : 6 validées, 15 partielles, 3 bloquées, 4 planifiées |
| Responsive Test Studio déployé sur main | **0.4.2 CURRENT** + **0.4.3 TEST** |
| Responsive 0.4.3 ergonomie | **Validée humainement**, tests Chrome OK |
| Passage Responsive 0.4.3 en CURRENT | **Code préparé dans PR #81, NON encore fusionné/publié** |
| Logo nLab/retour accueil et commande Core commune | **PR #81, implémentées ; non publiées sur main** |
| Contrôles Chrome (branche PR #81) | **PASS** |
| Audit du catalogue Studios | **PASS** |
| Exhaustive spécialisée V2 | **ÉCHEC préexistant**, timeout Image Studio, à isoler |

### État individuel des Studios (source : registres de `main`)

| Studio | CURRENT | TEST | Observations de pilotage |
|---|---:|---:|---|
| PDF | 0.9.10 | 2.11.0 | Migration V2 non validée ; préserver legacy CURRENT |
| Image | 2.7.0 | 2.7.1 | V2 CURRENT, TEST distinct |
| Scan | 0.4.0 | 0.4.1 | V2 CURRENT, TEST distinct |
| OCR | 2.3.0 | 2.3.1 | V2 CURRENT, TEST distinct |
| Code | 2.4.0 | 2.4.1 | V2 CURRENT, TEST distinct |
| JSON | 2.2.0 | 2.2.1 | V2 CURRENT, TEST distinct |
| Data | 2.4.0 | 2.4.1 | V2 CURRENT, TEST distinct |
| QR & Barcode | 2.4.1 | 2.4.2 | V2 CURRENT, TEST distinct |
| File | 2.4.0 | 2.4.1 | V2 CURRENT, TEST distinct |
| Markdown | 2.3.0 | 2.3.1 | V2 CURRENT, TEST distinct |
| Démo | 1.0.0 | — | Page catalogue/corpus |
| Dataset Generator | 2.3.0 | 2.3.1 | V2 CURRENT, TEST distinct |
| Document | 1.3.0 | 1.3.1 | V2 CURRENT, TEST distinct |
| Spreadsheet | 1.3.0 | 1.3.1 | V2 CURRENT, TEST distinct |
| Responsive Test | **0.4.2** | **0.4.3** | 0.4.3 validée utilisateur ; publication CURRENT conditionnée à PR #81 |

Applications dérivées : **PDF Sign 0.3.0 TEST**, **Merge Studio 0.4.0 TEST**, **Guide Froid au catalogue**.
Ne pas inférer un CURRENT dérivé à partir de la seule présence au catalogue.

### Livrables finalisés et validés

- [x] Création du Responsive Test Studio par `iframe`, profils PC/tablette/mobile, largeur CSS, orientation et zoom.
- [x] Vue double et commande plein écran avec modification de l’URL à l'intérieur du viewport.
- [x] Version 0.4.0 puis 0.4.1 et 0.4.2 validées, archivage autonome et 0.4.2 effectivement publiée comme CURRENT.
- [x] Interface 0.4.3 avec saisie d’URL élargie à 780 px : **validation humaine**, Chrome OK ; reste à promouvoir et publier.
- [x] État des 15 Studios et 3 applications dérivées recoupé avec le catalogue et les registres.
- [x] Audit nLab Studios et tests Chrome du chantier PR #81 réussis.

### Réalisé dans une PR, mais non terminé en production

- [ ] **PR #81** : promouvoir la 0.4.3 CURRENT, figer la version précédente ; contrôler le déploiement `gh-pages` et sa concordance avec `main`.
- [ ] **PR #81** : généraliser le logo SVG officiel cliquable et le retour à l’accueil nLab via **le Core V2 commun** ; certification des 15 Studios en navigateur à compléter.
- [ ] **PR #81** : raccorder le lancement du Responsive Test depuis le ruban/les commandes du Core, avec URL du Studio d'origine.
- [ ] **PR #81** : manifeste d’application Chrome/Edge, installation réelle PC fixe/portable et relancement à certifier. Pas d'application native promise.
- [ ] **PR #70 / #67** : finaliser la certification historique **128/128** et n'autoriser de suppression physique du legacy qu'après cette gate.
- [ ] **PR #71** : finaliser la validation autonome du Studio Core B02–B09 ; encore brouillon/non fusionnée.
- [ ] **PR #72** : réconcilier la PR ancienne avec le Responsive livré (éviter doublon et régression).

### Blocages et tâches transversales restantes

1. **P0 — CI exhaustive V2/Image Studio** : timeout persistant indépendant du Responsive, analyser et corriger ou isoler le scénario défaillant sans faux PASS.
2. **P0 — intégration fiable** : fusionner et publier #81 uniquement après passage des gates exigées, puis tester liens et logo en navigateur.
3. **P1 — Legacy** : ne pas purger sans preuves 128/128 et compatibilité des URLs CURRENT/TEST historiques.
4. **P1 — PDF** : pas de migration automatique de CURRENT 0.9.10 vers V2 2.11.0 TEST.
5. **P1 — QA** : enrichir le smoke Chrome à l'ensemble des 15 Studios, puis Firefox/WebKit et application installée en environnement réel.
6. **P2 — Hub / Cockpit** : projeter les statuts depuis le fichier de tâches sans recopier des chiffres à la main ; ajouter health/capability/engine metadata.
7. **P2 — capacités** : poursuivre mutualisation Input/Output/OCR/format, conversion documentaire, traitement d’image et grosses données selon `MUTUALIZATION-ROADMAP.json`.

**Règle GO/NO-GO :** code en PR ≠ code fusionné ≠ Pages déployées ≠ validation humaine. Chaque étape doit conserver sa preuve, et les historiques restent exécutables.

---

## Architectural rules

1. **Responsive by contract** — every Studio and derived app must support phone, tablet, desktop and wide desktop layouts from the shared Core.
2. **One engine, many consumers** — reusable processing lives in shared engines/services; Studios orchestrate it and provide the advanced UX.
3. **Quick capability + escalation** — business apps and other Studios may expose a simplified capability and route advanced work to the specialized Studio.
4. **Derived apps are capability subsets** — a mini-app such as PDF Sign must reuse the parent Studio engine/services, not fork them.
5. **No mutable release metadata in UI source** — version/channel/commit/date are resolved from the canonical registry and Git/build metadata.
6. **Read-only gallery** — Studio/asset/demo galleries are projections. Editable sources remain canonical files.
7. **Common assets** — typography, favicon, SVG/icon registry, windows, help, tooltips and states are Core assets.
8. **Responsive validation** — mobile/touch and desktop/mouse are both release gates.

## Current Studio fleet

### Published/catalogued Studios (inventaire historique V3 initial ; consulter la revue 2026-10-18 pour l’état actuel)
- PDF Studio
- Image Studio
- OCR Studio
- Scan Studio
- Responsive Test Studio
- Code Studio — developer/source code
- JSON Studio
- Data Studio
- QR & Barcode Studio — symbologies only
- File Studio
- Markdown Studio
- Demo Studio
- Dataset Generator Studio
- Document Studio
- Spreadsheet Studio

### Derived apps
- **nLab PDF Sign** — first derived mini-app from PDF Studio ; registre actuel : 0.3.0 TEST.
- **Merge Studio** — application de fusion PDF dérivée ; registre actuel : 0.4.0 TEST.
- **Guide Froid** — application métier dérivée inscrite au catalogue.

### Planned/development families
- Translation Studio
- Presentation Studio
- Markdown WYSIWYG
- Office high fidelity
- Google Workspace
- PDF visual compare
- PDF batch pipeline
- PAdES/DSS
- Image robust watermark
- Data large volume
- Audio Studio
- Video Studio
- Archive Studio
- Automation Studio
- Duo Studio
- Camp Studio / reserved future family
- Future Studio / incubation slot

## Core layers

```text
Studio Core
├── Responsive shell / theme / typography
├── Asset + icon registries
├── Window / contextual help / tooltips
├── Universal input / drop zones
├── Output / download / archive
├── History / session / recent locations
├── Template / variables
├── Version + Git build metadata
├── Capability + format registries
├── Personal profile / assets
├── Pipeline / workflow
└── Studio handoff / link resolver
```

## Shared engines

- PDF engine
- OCR engine family: Tesseract native, Tesseract.js, OCRmyPDF, optional/future adapters such as RapidOCR
- Image engine
- Symbology engine: QR, Data Matrix, Aztec, PDF417, Code128/39, EAN, UPC, ITF, Codabar
- Document/Office structural engine
- Tabular engine
- Markdown engine
- Signature services: visual signature, certificate signing, signature appearance, validation/trust backend

## Implementation sequence

### V3.0 — Core metadata + derived-app model
- [x] Git-linked build metadata resolver.
- [x] Derived-app catalog family.
- [x] PDF Sign initial TEST derivative.
- [ ] migrate all Studio manifests to declare `sourcePath`.
- [ ] eliminate UI hard-coded version/date strings.
- [ ] expose commit metadata consistently in About/footer/version views.

### V3.1 — Core responsive contract — IMPLEMENTED IN TEST
- [x] normalized breakpoints and touch targets;
- [x] responsive windows/panels/sidebar/ribbon;
- [x] coarse-pointer/touch controls and mobile-safe inputs;
- [x] acquisition hooks exercised by Scan Studio camera/photo inputs;
- [ ] extend the mobile regression matrix to every legacy Studio surface before CURRENT promotion.

### V3.2 — Shared engines adoption — IN PROGRESS
- [x] OCR shared service with multi-engine registry and browser execution adapter;
- [x] automatic FR/EN post-recognition language inference for the shared browser OCR path;
- [x] symbology registry shared by QR & Barcode Studio and PDF Studio;
- [x] document/tabular shared services used by Dataset Generator / Document / Spreadsheet flows;
- [ ] extract the remaining Image Studio canvas operations into a shared image engine service;
- [ ] route Scan/PDF image cleanup through that image engine once extracted.

### V3.3 — Studio refresh — IMPLEMENTED IN TEST
- [x] Image Studio 2.2: responsive Core inheritance, capability contract, dynamic runtime version metadata;
- [x] OCR Studio 2.1: engine selector, shared OCR registry, auto FR/EN inference and diagnostics;
- [x] QR & Barcode Studio 2.1: QR/Data Matrix/Aztec/PDF417/Code128/GS1/Code39/EAN/UPC/ITF/Codabar;
- [x] PDF Studio 2.8: shared symbology engine adoption + responsive Core;
- [x] Scan Studio 0.1: mobile/desktop capture, multipage organization, rotate/deskew/cleanup, OCR and PDF assembly;
- [x] Code Studio remains the developer/source-code product, distinct from QR & Barcode Studio.

### V3.4 — Studio Hub / launcher — PARTIALLY IMPLEMENTED
- [x] CURRENT / TEST / latest policy;
- [x] global policy + per-Studio override persisted locally;
- [x] derived apps remain a distinct family;
- [x] Scan Studio added to the canonical catalog;
- [x] read-only demo / catalog entry points retained;
- [ ] runtime health indicators;
- [ ] aggregated capability + engine status on Hub cards;
- [ ] full Assets/UX gallery link and capability browser.

## PDF Sign as architecture test

PDF Sign intentionally exposes only:
- PDF input or preloaded URL;
- page preview/navigation;
- signature/paraphe presets from the shared personal profile;
- drawn/imported signature assets;
- current/all page scope;
- simple position and size presets;
- PDF output;
- escalation to full PDF Studio.

It reuses the PDF engine and Studio Core. PAdES/DSS remains an advanced PDF Studio capability.


## V3.x — Dataset Generator Studio as fixture factory

### Dataset Generator 2.1 — implemented
- configurable tabular schemas: arbitrary column names + per-column synthetic type;
- deterministic seed + row count;
- synthetic business types: names, emails, phones, companies, city/postal, SKU, UUID, dates, prices, percentages;
- symbology test payloads: EAN-8, EAN-13, Code128, QR and Data Matrix;
- CSV / JSON / XLSX / Markdown exports;
- rich synthetic documents with H1/H2/H3, Lorem paragraphs, tables and demo illustrations;
- Markdown / HTML / DOCX / PDF document exports;
- structure-only cloning from CSV / JSON / XLSX: retain headers/schema, infer types, regenerate independent demo values.

### Dataset Generator 2.2 — implemented in TEST
- DOCX / ODT structural clone with heading hierarchy and table shape;
- PDF structural analysis from text layout/font-size heuristics;
- image/scanned-document ingestion with optional shared OCR service;
- OCR handoff remains available toward OCR Studio; no private Dataset Generator OCR fork;
- structure-only and structure+shape policies;
- XLSX format-profile preservation for debug fixtures: currency/accounting number format, percentage, date, decimals and column width;
- format profile contributes to semantic type inference, e.g. EUR currency → synthetic price values;
- generated XLSX reapplies compatible number formats without copying source values;
- rich clone output can be exported as Markdown / HTML / DOCX / PDF;
- RecipeX-oriented synthetic preset added as a reusable domain fixture profile.

### Dataset Generator 2.3 — next step
- presentation-aware replacement for forms, labels, merged cells, formulas and richer spreadsheet styling;
- multi-file fixture packs and ZIP manifests;
- reusable fixture-profile registry (recipes, invoices, product catalogs, logistics, CRM, etc.);
- coarse distribution constraints: ranges, null-rate, uniqueness, cardinality and relationship integrity;
- direct handoff to QR & Barcode Studio for rendered symbology fixtures;
- structural cloning of multi-sheet workbooks and relationships between tables;
- fixture minimization mode for bug reproduction: keep only the smallest synthetic structure required to reproduce a failure.

### Privacy invariant
Imported source values are not copied into generated fixtures by default. Structure-only mode may use field names and coarse type inference, but generated values are independent synthetic data.


## Historical TEST refresh batch (V3 initial snapshot; not current release pointers)

| Layer / Studio | TEST |
| --- | --- |
| Studio Core | 2.7.0 |
| Image Studio | 2.2.0 |
| OCR Studio | 2.1.0 |
| QR & Barcode Studio | 2.1.0 |
| PDF Studio | 2.8.0 |
| Dataset Generator Studio | 2.2.0 |
| Scan Studio | 0.1.0 |

CURRENT pointers are intentionally unchanged during this validation phase.
