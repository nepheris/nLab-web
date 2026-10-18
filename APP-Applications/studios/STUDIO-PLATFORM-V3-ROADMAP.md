# nLab Studio Platform V3 — implementation roadmap

## Point de situation — 18 octobre 2026 (synchronisation GitHub)

**Gouvernance des états.** `DONE` = code livré/fusionné ; `VALIDATED` = fonctionnalité approuvée et tests ciblés réussis (pas nécessairement publiée) ; `PARTIAL` = réalisation incomplète ; `BLOCKED` = gate de validation ou dépendance bloquante ; `TODO` = à réaliser. Ne pas assimiler `PASS` ciblé à une CI exhaustive verte.

**Périmètre :** 15 Studios catalogués, 3 applications dérivées (PDF Sign, Merge Studio, Guide Froid). Inventaire : `APP-Applications/studios/catalog.json`.

### Livraison du jour — Responsive Test Studio / identité Studio Core

| ID | Tâche atomique | Statut au 18/10 | Preuve / suite |
| --- | --- | --- | --- |
| STU-20261018-01 | 0.4.2 CURRENT et historique 0.4.1/0.4.0 | **DONE** | Fusion PR #79, version CURRENT publiée dans `main` avant la nouvelle passe. |
| STU-20261018-02 | Étendre la saisie « Modifier URL » à 780 px en restant responsive | **VALIDATED** | 0.4.3 TEST livrée par PR #80, acceptation de l'utilisateur, recette Chrome PASS ; promotion CURRENT en PR #81. |
| STU-20261018-03 | Promouvoir 0.4.3 CURRENT et geler sa version autonome | **VALIDATED / RELEASE PENDING** | `versions/0.4.3/`, registre et page CURRENT préparés, PR #81 ouverte ; fusion/déploiement à vérifier. |
| STU-20261018-04 | Logo nLab officiel cliquable sur Responsive CURRENT et page Versions | **VALIDATED / RELEASE PENDING** | Implémenté dans PR #81, audit Chrome logo/home PASS ; publication à confirmer. |
| STU-20261018-05 | Résoudre dans le Studio Core V2 les liens logo/home/navigation depuis n'importe quel Studio | **VALIDATED / RELEASE PENDING** | Résolution via `import.meta.url` dans `studio-v2/frame.js` ; couverture représentative Chrome + audit statique du catalogue PASS dans PR #81. |
| STU-20261018-06 | Harmoniser la page d'accueil PDF Studio (cas non géré par le Core commun) | **VALIDATED / RELEASE PENDING** | Logo et destination nLab ajoutés, test Chrome PASS en PR #81 ; runtime PDF legacy préservé. |
| STU-20261018-07 | Ajouter au Core la commande partagée « Test responsive » | **VALIDATED / RELEASE PENDING** | Ruban/registry + lancement URL source ; test navigateur PASS en PR #81, aucune duplication de moteur. |
| STU-20261018-08 | Exposer Responsive Test comme web app PC fixe/portable | **PARTIAL** | Manifeste web + bouton conditionnel `beforeinstallprompt`, syntaxe et navigation testées ; installation manuelle Chrome/Edge/OS et expérience hors navigateur non encore validées. |
| STU-20261018-09 | Audit du logo nLab sur les **15** Studios | **PARTIAL** | Inventaire et audit de raccordement au Core réalisés ; Chrome vérifié sur surfaces représentatives, pas de test E2E exhaustif 15/15 en desktop/mobile. |
| STU-20261018-10 | Stabiliser la CI exhaustive Image Studio | **BLOCKED** | Job `Exhaustive specialized V2` échoue encore sur `page.waitForFunction` (timeout 10 s), indépendamment des recettes Chrome ciblées PASS. Identifier la cause, corriger, relancer. |
| STU-20261018-11 | Valider GO/NO-GO et fusionner PR #81 puis contrôler GitHub Pages | **TODO** | Gate ciblé PASS, audit PASS, gate exhaustive FAIL ; arbitrage nécessaire après investigation, aucun déploiement définitif 0.4.3 affirmé. |
| STU-20261018-12 | Ajouter santé runtime/capacités consolidées aux cartes du Studio Hub | **TODO** | Report V3.4, ne pas complexifier le Core avant stabilisation. |
| STU-20261018-13 | Harmoniser les métadonnées de versions/build et le CSS sur toutes les familles | **PARTIAL** | Le Core et plusieurs manifests le supportent ; PDF legacy et certains points d'entrée conservent des exceptions isolées. |
| STU-20261018-14 | Factoriser entrée/sortie du plein écran dans le Core commun, même comportement dans tous les Studios V2 | **VALIDATION EN COURS** | Module `studio-v2/fullscreen-service.js` + ruban et commande `core.fullscreen` dans `frame.js` ; Responsive CURRENT réutilise ce service tout en conservant le snapshot historique 0.4.3, recette Chrome desktop/mobile/Échap/commandes ajoutée. |

### Priorité et ordre d'exécution

1. **P0 — release gate** : analyser le timeout transversal Image Studio, déterminer s'il est préexistant sans effet fonctionnel ou s'il révèle une régression, et consigner la preuve.
2. **P0 — promotion** : finaliser la PR #81, fusionner puis vérifier `main`, GitHub Pages et le chemin réel du logo dans les Studios Core.
3. **P1 — couverture 15/15** : dérouler un contrôle navigateur individuel du lien nLab sur chaque CURRENT, desktop et mobile ; documenter explicitement les exceptions PDF legacy et redirections.
4. **P1 — application installable** : vérifier l'installation réelle dans Chrome/Edge sur Windows et Linux ; tester réouverture, navigation et viewport en fenêtre standalone ; ne pas annoncer de fonctionnement hors ligne non prouvé.
5. **P2 — mutualisation** : poursuivre V3.4 Hub (statut des capacités, état des moteurs et galerie), sans dupliquer le Core, puis V3.2 image-service.

### Contrat de présentation commun

Voir `APP-Applications/_shared/studio-v2/BRANDING-CONTRACT.md` (PR #81) : logo officiel `nlab-wordmark.svg`, lien vers l'accueil du site, styles hérités du Core V2 ; pages autonomes isolées et historique immuable.

**Références de validation du jour :** PR #81, workflows Chrome `39108135649` et `39108132487` PASS, audit `39108135672` PASS, CI exhaustive `39108135654` FAIL (timeout Image Studio). **État de publication au pointage :** `main` affiche encore Responsive 0.4.2 CURRENT et 0.4.3 TEST ; la promotion préparée dans la branche ne constitue pas une livraison en production.

---


Status: **IMPLEMENTATION IN PROGRESS**  
Source of truth for public Studio inventory: `APP-Applications/studios/catalog.json`

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

### Published/catalogued Studios
- PDF Studio
- Image Studio
- OCR Studio
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
- **nLab PDF Sign** — first derived mini-app from PDF Studio; TEST 0.1.0.

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


## Current TEST refresh batch

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
