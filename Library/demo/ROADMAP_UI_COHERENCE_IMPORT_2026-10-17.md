# Étude et feuille de route — Galerie démo, nLab Shell et import Image Studio

**Date :** 17 octobre 2026 · **Périmètre :** `nepheris/nLab-web` · **Référence fonctionnelle :** nLab Image Studio V2 + corpus Scan2D V1.

## Décision de séquencement

**Exécuter en parallèle, avec dépendances explicites :**
- **P0 — Couloir Core / import (bloquant)** : stabiliser le passage `InputPicker → application spécialisée → collection → canvas`, les états d'erreur et les tests automatisés. Ne pas modifier le contrat des événements entre Studios sans non-régression.
- **P1 — Couloir galerie / thème (non bloquant)** : faire évoluer `Library/demo` vers un explorateur par manifestes et reprendre le même site shell/header, sans attendre le moteur de calibration.
- **P2 — Uniformisation de toutes les pages (après P0/P1)** : inventaire d'environ 107 documents HTML dans le dépôt (incluant versions historiques). Ne pas remaquiller en masse les snapshots d'historique ou les moteurs spécialisés ; prioriser les routes publiques actives.

**Gate de passage :** l'import d'une image via fichier local puis via un exemple Scan2D doit créer un `File`, valider la sélection, déclencher l'événement `studio-v2:input-picked`, afficher une entrée dans `#imageList` et afficher la **bonne** image dans `#cv`. La galerie et le Core peuvent avancer indépendamment une fois ce contrat protégé par CI.

## Sources et points d'intégration observés

- Skin principal : `APP-Applications/_shared/site-shell.css` (tokens `--nlab-*`, header `nlab-header`, navigation et composants).
- Compatibilité visuelle : `APP-Applications/_shared/nlab-unified-pages.css`, `assets/css/nlab-page-coherence.css`.
- Paramètres et comportement du header : `FRMW-Frameworks/Web-Framework/runtime/application-shell-runtime.js`.
- Runtime spécialisé V2 : `APP-Applications/_shared/studio-v2/frame.js` et `bootstrap-specialized.js`.
- Import partagé : `APP-Applications/_shared/studio-v2/input-picker.js`.
- Galerie : `Library/demo/index.html`, `demo-explorer.css`, `manifests/index.json`, manifestes par catégorie, index transversal.
- Icônes : `Library/demo/Images/nLab-Studio/Icon-Library/gallery/index.html`.
- Traitement Images : `APP-Applications/image-studio/v2/index.html`.
- Tests Playwright : `tests/demo-image-import-flow.mjs` et workflow `validate-studios-v2.yml`.

## Diagnostic du raccordement import/aperçu

```text
Bouton Ajouter / ruban Ouvrir
→ action 'open' dans bootstrap-specialized
→ openInputPicker(options)
→ état state.files / state.selected (aperçu visuel indépendant)
→ Utiliser la sélection (selectedFiles + matérialisation rotations)
→ 'studio-v2:input-picked' {files, studio:'image-studio'}
→ addFiles(files)
→ items[], renderList(), loadActive()
→ décodage <img>, canvas #cv et status utilisateur
```

L'aperçu du picker utilise ses propres miniatures ; il **ne prouve pas à lui seul** que le fichier est présent dans `items[]` ni affiché dans le canvas.

Défauts repérés puis corrigés dans APP Image Studio V2 :
- La nouvelle image n'était pas automatiquement activée si une autre était déjà ouverte.
- Les fichiers dont le type MIME est absent pouvaient être ignorés silencieusement.
- Un décodage qui échoue n'affichait pas de message d'erreur clair.
- L'action du ruban `Démo` pouvait viser seulement le sélecteur, sans déclencher le chargement.
- Un lien de galerie ne rechargeait pas directement le test demandé. Utiliser `?demo=SCAN2D-V1-01` à `-07` après lecture du manifeste.

Le comportement de la popup reste volontairement `cases cochées = sélection à utiliser`, distinct de la miniature active. Cela mérite un test utilisateur et une formulation d'aide plus claire.

## Réalisé dans le code (CI navigateur encore à confirmer)

- [x] **UI-01** — Conserver le shell nLab et ses tokens comme source des styles partagés.
- [x] **UI-02** — Ajouter le CSS `demo-explorer.css`, limité à `Library/demo/`.
- [x] **UI-03** — Ajouter un explorateur par manifestes avec recherche, dossiers et fichiers locaux.
- [x] **UI-04** — Afficher vignettes/iconographie et état `référence non publiée`.
- [x] **UI-05** — Conserver un accès direct à la vraie galerie des icônes.
- [x] **UI-06** — Aligner le header de la bibliothèque iconographique sur le shell nLab.
- [x] **UI-07** — Enlever les liens ZIP publics pointant vers des archives non présentes.
- [x] **UI-08** — Ajouter `Tester dans Image Studio` sur les 7 cas Scan2D.
- [x] **IMP-01** — Activer la première nouvelle image importée.
- [x] **IMP-02** — Fallback du type image sur extension connue.
- [x] **IMP-03** — Status import et erreur décodage/événement.
- [x] **IMP-04** — Raccorder l'action ruban `Démo` au chargement réel.
- [x] **IMP-05** — Permettre l'autochargement d'un exemple autorisé par ID du manifeste.
- [x] **QA-01** — Ajouter un test navigateur Playwright galerie → démo → Image Studio → import Core.
- [x] **QA-02** — Raccorder ce test au workflow CI V2 sur modifications galerie/studio.

## À faire (atomique et vérifiable)

- [ ] **QA-03** — Vérifier que le nouveau test Playwright passe en CI GitHub sur Chromium.
- [ ] **QA-04** — Tester manuellement la sélection unique, la sélection multiple et l'annulation du picker.
- [ ] **QA-05** — Tester erreurs format, fichier vide et image corrompue ; confirmer que l'utilisateur comprend le retour.
- [ ] **QA-06** — Tester un import de 7 PNG Scan2D (dont cas bruité volumineux), comparer noms et dimensions.
- [ ] **QA-07** — Vérifier le comportement tablette/mobile et sur fond sombre, notamment le picker et la galerie.
- [ ] **QA-08** — Valider les URL finales servies par GitHub Pages (distinctes des fichiers en dépôt).
- [ ] **CORE-01** — Définir les états normés `selected → accepted → loaded → decoded → active` avec messages.
- [ ] **CORE-02** — Harmoniser le traitement des types MIME/extensions entre Picker et Studio.
- [ ] **CORE-03** — Ajouter un accusé de réception documenté à l'événement `input-picked` (compatible avec les autres Studios).
- [ ] **CORE-04** — Ajouter diagnostics d'import sans données de fichier privées ni télémétrie implicite.
- [ ] **GALLERY-01** — Permettre l'ouverture d'une véritable arborescence hiérarchique à partir des chemins de manifestes ; la version actuelle parcourt les catégories/Studios.
- [ ] **GALLERY-02** — Ajouter un filtre par extension et badges de statut de publication sans masquer les références non publiques.
- [ ] **GALLERY-03** — Ajouter un compteur d'intégrité et validation automatique des liens de manifestes.
- [ ] **GALLERY-04** — Faire passer les exemples pertinents vers d'autres Studios via IDs validés, sans ouvrir de fichiers arbitraires.
- [ ] **GALLERY-05** — Mettre en place un processus d'approbation/licence pour les éléments Google Drive non publiés.
- [ ] **STYLE-01** — Recenser par route active la présence de `nlab-header`, `site-shell.css`, actions et runtime thème.
- [ ] **STYLE-02** — Distinguer pages CURRENT/TEST, pages d'information, galeries et versions historiques figées.
- [ ] **STYLE-03** — Migrer les pages publiques actives manquantes par vagues, avec tests visuels.
- [ ] **STYLE-04** — Vérifier thèmes clair/sombre, clavier, contraste, responsive et print.
- [ ] **STYLE-05** — Documenter les variantes autorisées d'interface propres à chaque logiciel, sans déroger au shell.

## Critères d'acceptation

**Galerie :** catégories visibles, recherche fonctionnelle, vignettes des PNG, aucun lien vers des ZIP absents, statut clair des références non publiées ; headers équivalents galerie / iconographie.

**Image Studio :** sélection manuelle dans le Core et sélection depuis la galerie produisent chacune un chargement effectif sur le canvas, le nom de l'image active est correct, les dimensions sont affichées et une erreur utilisateur est visible en cas de fichier non décodable.

**Architecture :** source unique des tokens/header, scripts métier conservés dans chaque Studio, catalogues et manifestes sources de vérité pour les démos, pas de duplication des droits/politiques Drive.

## Liens

- Galerie : https://nepheris.github.io/nLab-web/Library/demo/
- Image Studio : https://nepheris.github.io/nLab-web/APP-Applications/image-studio/v2/
- Icônes : https://nepheris.github.io/nLab-web/Library/demo/Images/nLab-Studio/Icon-Library/gallery/
- Roadmap Scan2D Maker : https://github.com/nepheris/nLab-Maker-Framework/blob/main/docs/project/SCAN2D_MAKER_STUDIOS_ROADMAP.md
