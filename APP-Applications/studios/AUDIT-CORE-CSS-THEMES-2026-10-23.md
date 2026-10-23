# Audit de parité fonctionnelle et de cohérence CSS — Studio Core / Studios

**Date :** 2026-10-23 · **Nature :** audit de code (non recette navigateur) · **Priorité :** P0.
**Périmètre :** `nepheris/nLab-web` et contrat privé `nepheris/nLab/Build/FRM-Framework/contracts/STUDIOS-FOCUS-CORE-IMAGE-PDF-2026-10-23.md`.
**Règle :** document de preuve uniquement ; aucune nouvelle TSK, pas de jalon, pas de promotion CURRENT/TEST. Identifier les TSK existantes via STU-S0-02 avant de programmer des travaux.

## Verdict

**NON CONFORME à la cible « un Core, une seule identité visuelle et un seul système de thème » en l'état du code lu.** La factorisation des services métier et de l'ossature existe partiellement, mais elle ne garantit pas encore une interface uniforme. Aucune des fonctions inventoriées ci-dessous ne peut recevoir une mention « PASS navigateur » sans essai réel sur les canaux/version ciblés.

- Core partagé : `APP-Applications/_shared/studio-v2/` : `frame.js` (ruban, header, menus, rail), `settings.js`, `window-system.js`, `input-picker.js`, `workspace-layout.js`, `viewer-control.js`, `undo-redo.js`, `fullscreen-service.js`, etc. **PRÉSENT EN SOURCE, fonctionnement non recetté.**
- Core TEST : `version.json` indique **3.9.0 TEST** ; Core Test Lab `versions.json` indique **0.7.0 TEST**. Aucune promotion autorisée par cet audit.
- **Prototype VNext** : `studio-core-test/vnext/index.html` importe **uniquement `./studio.css`** ; `vnext/app.js` précise que le pont fonctionnel vers les services Core existants n'est pas implémenté. Son header, ruban, rail, panneaux, variables et thème sont indépendants. **P0 : le prototype ne peut servir de Core de remplacement ni constituer une recette fonctionnelle complète.**
- **Thèmes concurrents** : `settings.js` possède `theme: system/light/dark` et `.themeDark`; `workspace-theme.js` possédait un second stockage `nlab:workspace-theme:v1`, une seconde écoute système et le sélecteur du Lab utilisait `nlab:core-lab:ux-theme`. Le CSS partagé juxtapose `studio.css`, `workspace-layout.css` et `workspace-theme.css` avec des couleurs codées en dur et plusieurs `!important`.
- **Accent non personnalisable dans le Core de base** : palette de tokens `studio-v1/tokens.css` (`--nlab-brand`, `--nlab-accent`) et `workspace-theme.css` (`--ux-accent`) mais aucun choix d'accent dans `settings.js` avant la présente branche. Les variables existaient, pas la politique unique.
- **Styles locaux** : 12 pages `*/v2/index.html` contrôlées chargent `_shared/studio-v2/studio.css` ; **10 de ces 12 possèdent aussi un bloc `<style>` local**. Certains sont légitimes (surface métier), d'autres fixent globalement fonds/bordures et empêchent l'héritage du thème. Il faut classifier propriété par propriété avant suppression.
- Les racines de plusieurs Studios redirigent vers `v2/?channel=current` ; ne pas conclure à l'absence de ruban à partir de leur HTML d'aiguillage. `pdf-studio/index.html` est une page d'accueil/versions distincte, `responsive-test-studio/index.html` charge des CSS locaux d'une ancienne version, `merge-studio` et `pdf-sign` ciblent leur `v1/`. Couverture transversale **NON acquise**.
- Sept applications spécialisées inspectées en profondeur (`ocr`, `qr-barcode`, `scan`, `dataset-generator`, `document`, `spreadsheet`, `markdown`) appellent effectivement `mountStudioV2` depuis leur runtime, malgré l'absence du bootstrapping dans leurs HTML. Présence de l'API =/= preuve du rendu et des commandes.

## Matrice d'audit des fonctionnalités Core — 86 points

**Légende :** SOURCE = composant ou commande repéré dans le dépôt ; PARTIEL = implémentation présente, parité non établie ; P0 = absence/régression visible rapportée ; TEST = comportement non vérifié. Chacun des 86 sous-points de la checklist canonique ci-dessous nécessite ensuite un résultat PASS/FAIL par scénario, plateforme, version et preuve.

| Famille (nombre) | Éléments attendus | État de l'audit de code | Gate |
|---|---|---|---|
| En-tête / ruban (11) | logo, identité/version, navigation, ruban, Fichier, Édition, Affichage, Réglages, contextes, icônes/infobulles, états | SOURCE : `frame.js` génère header, menu, ruban et contrôles. **P0 : VNext reconstruit un ruban réduit** ; l'existence des 4 onglets dépend des manifests et n'est pas prouvée partout. | Parité de toutes les commandes par onglet, notamment Affichage dans le ruban |
| Barre latérale (10) | montrer/cacher, verrouiller, largeur, ancrage, Tâches, Travail, Propriétés, Sélection, Historique, Aide | SOURCE : `frame.js`, `workspace-layout.js`, `settings.js` ; PARTIEL : plusieurs couches de rails et volets coexistent, VNext en recrée un. | Une API et un état unique de panneau |
| Fenêtres (10) | ouvrir/fermer, déplacer, redimensionner, minimiser/restaurer, ancrer, focus/z-index, confinement, scroll, apparence, reset | SOURCE : `window-system.js` et `studio.css`. PARTIEL : consommation systématique par toutes les fenêtres non démontrée. | Uniformiser tous les dialogs et panneaux ; clavier/tactile |
| Prévisualisation / Affichage (12) | preview, zoom +/−, fit width, fit window, plein écran, desktop/tablette/mobile, orientation, tailles personnalisées, densité, refresh | SOURCE : Lab `ux-lab.js` propose aperçu et simulation ; `viewer-control.js`, `fullscreen-service.js`. **P0 : aperçu signalé disparu dans version utilisateur ; VNext ne prouve pas la parité.** | Réouvrir l'URL TEST avec aperçu permanent et scénarios responsive |
| Fichiers / acquisition (10) | fichier, dossier, plusieurs fichiers, drag-drop, navigation, suppression, vider, caméra, URL/texte, formats | SOURCE : `input-picker.js`, `collection-browser.js`, `input-service.js`. PARTIEL : consommations différentes entre Studios et VNext. | Tester chaque entrée, feedback erreur, export |
| Édition / propriétés (11) | sélection simple/multiple, propriétés, modification, appliquer, enregistrer, undo, redo, reset, clavier, parité ruban/panneau | SOURCE : `context-selection.js`, `property-inspector.js`, `undo-redo.js`, `command-registry.js`. PARTIEL : commandes non garanties communes. | Égalité ruban ↔ fenêtre Propriétés |
| Réglages (10) | thème, affichage, unités, dates, préférences, profils, modèles, variables, stockage, reset | SOURCE : `settings.js`, `dimension-service.js`, `template-ux.js`. **P0 : deux mémoires de thème et pas d'accent personnalisable** au départ. | Un modèle thème global : automatique/clair/sombre + accent |
| Services / qualité (12) | historique, entrées/sorties, export, formats, capacités, handoff, build/version, diagnostics, Chrome Linux, Chrome Android, clavier/tactile, tests | SOURCE : services présents dans `studio-v2`, mais tests navigateur **NOT_RUN**. | Tests fonctionnels automatisés + preuve appareils réels |

## Matrice de propagation par consommateur

| Consommateurs contrôlés en source | Feuille `studio-v2/studio.css` | Style métier local | État |
|---|---|---|---|
| Image, OCR, Code, JSON, Data, QR & Barcode, Scan, Dataset Generator, Document, Spreadsheet — `v2/index.html` | Oui (10/10) | Oui (10/10) | PARTIEL : séparer classes métier et règles de design communes ; harmoniser couleurs et panneaux |
| File, Markdown — `v2/index.html` | Oui (2/2) | Pas de bloc `<style>` dans les pages lues | SOURCE : vérifier ressources CSS importées ailleurs |
| PDF Studio `v2/index.html` | Oui | Barre latérale et prévisualisation dédiées | PARTIEL : parité V1/CURRENT et adoption des fenêtres/tokens à tester |
| Studio Core Test Lab `index.html` | Oui + `workspace-layout.css` + `workspace-theme.css` | `ux-parity.css`, `template-controls.css`, styles inline | PARTIEL : plusieurs couches d'apparence ; doit devenir référence unique |
| Studio Core VNext | **Non** | `vnext/studio.css` autonome | **P0 / NON CONFORME** |
| Responsive Test Studio CURRENT | Pas dans `index.html` lu | CSS dédiés provenant de la version 0.4.3 + `studio-application.css` | PARTIEL : préserver version validée puis préparer adaptateur CSS |
| Merge / PDF Sign / Demo / autres pages historiques | Non garanti | `v1/` ou galerie externe | Hors migration immédiate ; ne pas altérer CURRENT |

## Cible d'architecture obligatoirement commune

1. **Shell** : un seul `frame.js` ou son successeur partagé pour logo/header, navigation, menus, ruban, rail, status et gestion d'affichage. Les manifests déclarent seulement les actions métier. Aucune copie HTML du shell dans les Studios.
2. **Fenêtres** : service `window-system.js` unique (déplacement, ancrage, minimisation, resize, focus, restauration, responsive). Tout panneau et dialogue doit utiliser ce contrat, sans CSS de positionnement divergent.
3. **Thème** : **source de préférence unique** `nlab-studio-v2-settings` avec `system`, `light`, `dark`, et une valeur `accentColor` globale. `system` suit `prefers-color-scheme` à chaud. Chaque mode applique un jeu de tokens sémantiques (fond, surface, texte, texte atténué, bordure, entrée, focus, accent, accent-soft, contraste, danger, succès, panneau, aperçu).
4. **Couleurs** : sélection de la couleur dominante HEX ou palette, prévisualisée dans les deux modes ; calcul de contraste lisible ; les Studios héritent du CSS et des tokens, **sans recopier une palette**. Leurs CSS locaux couvrent uniquement géométries et widgets métier. Pas de `#fff`/fonds forcés pour les panneaux génériques ni de `!important` d'apparence inutile.
5. **Synchronisation** : modifier le thème dans le Core, le Lab ou un Studio consommateur doit avoir le même effet après navigation/rafraîchissement (origine navigateur commune), sans contredire préférences personnelles métier.
6. **Accessibilité** : contraste WCAG AA sur texte principal/contrôles, focus visible, `prefers-reduced-motion`, tactile et zoom. Tester les palettes en clair, sombre et automatique ; pas de supposition de conformité à partir des couleurs.
7. **Compatibilité** : passage incrémental par Studio, chaque fonctionnalité métier conservée, anciennes URLs et canaux préservés, aucun changement CURRENT/TEST sans GO HUMAN00.

## Lot de correction préparé dans la branche d'audit (NON LIVRÉ)

La branche `audit/core-unified-theme-20261023` apporte un **premier lot expérimental de factorisation**, sans activation en production :

- nouveau `studio-v2/theme-service.js` : choix d'accent et résolution clair/sombre/système, contrastes pour commandes principales, tokens globaux `--nlab-*` / `--ux-*` ;
- `settings.js` : palette/couleur choisie, préférence commune et réévaluation du mode système ;
- `workspace-theme.js` : façade vers les réglages communs au lieu d'un second localStorage ;
- `studio-core-test/ux-lab.js` : suppression de la préférence de thème propre au laboratoire ;
- `studio.css` : contrôles palette et boutons primaires utilisant l'accent partagé ;
- `test-theme-service.mjs` : tests unitaires proposés, **NON EXÉCUTÉS** lors de l'écriture connecteur.

**Ce lot ne clôt pas l'audit** : CSS hardcodés et `!important` non entièrement migrés, VNext non connecté au vrai Core, 86 points non recettés, tests de navigateur et parité per-Studio non réalisés.

## Ordre de validation sans doublonner les TSK

1. **P0 — Baseline et accès** : fournir une URL de version TEST du vrai Lab/Core et noter SHA/version ; capturer les régressions sur Chrome Linux puis Chrome Android. Le VNext incomplet ne doit pas remplacer le Core réel.
2. **P0 — Architecture visuelle** : restaurer ruban/onglet Affichage, rail, volet, aperçu ; rassembler tous les panneaux sous services communs ; retirer les copies VNext avant de l'utiliser comme référence.
3. **P0 — Design tokens** : revue/test du lot de thèmes proposé, migration des couleurs génériques de `studio.css`, `workspace-layout.css` et `workspace-theme.css` puis harmonisation des styles métier.
4. **P1 — Déploiement par vagues** : Core Lab → Image → PDF → OCR/Scan → autres V2 → applications dérivées ; matrice consommateur, contrôle de régression et captures à chaque vague.
5. **Gate de sortie** : chaque point attendu PASS ou exception HUMAN00 documentée, tests automatisés et réels Linux/Android, aucune fonction legacy perdue, build SHA, rollback, validation finale avant promotion.

**Conservation des preuves :** joindre les résultats à la roadmap Studios et aux tâches canoniques déjà réconciliées ; ne pas créer une deuxième liste de TSK ni de statut runtime.
