# Studio Core VNext — audit de parité fonctionnelle et responsive
Date : 2026-10-24 · Périmètre : `APP-Applications/studio-core-test/vnext/` · Statut : **prototype isolé / NO-GO CURRENT**

## Références vérifiées dans GitHub
- Référence visuelle retenue : `APP-Applications/responsive-test-studio/versions/0.4.2/index.html`, `studio.css` et `site-shell.css`.
- Core TEST actuel : `APP-Applications/studio-core-test/` (0.7.0 TEST) et `APP-Applications/_shared/studio-v2/` (3.9.0 TEST).
- VNext : `index.html`, `app.js`, `studio.css`; partage via `APP-Applications/_shared/nlab-share-menu.js`.
- Rappel : présence dans le code != test navigateur PASS. Aucun passage Android/Chrome réel n'est déclaré ici.

## Fonctionnalités comparées

| Domaine | Core TEST existant / services sources | VNext au 24/10 | Action avant migration |
|---|---|---|---|
| Header nLab et navigation | `frame.js`, Responsive 0.4.2 | Prototype construit | Revue HUMAN00 et parité multi-Studio |
| Menu compact Partager | `nlab-page-actions.js` sur le site : PDF, lien, QR séparés | **Implémenté en TEST** : un menu de trois choix | Test clavier, tactile, partage natif et Clipboard API |
| QR code | Charge QRCode.js distant | **Implémenté avec repli lien** | Vérifier CDN, politique CSP et mode hors ligne |
| Imprimer/PDF | Fonction `window.print` du site | **Implémenté** par dialogue navigateur | Tester pagination et styles impression (pas d'édition PDF métier) |
| Thème auto/clair/sombre | Réglages Core / workspace-theme | **Partiel** : état partagé header/panneau et localStorage | Tester modes et aligner avec moteur commun |
| Responsive mobile | `responsive-test-launcher.js`, Lab et Responsive Test Studio | **CSS première passe** : header, onglets, ruban défilable et panneaux empilés | Tests tactiles Android Chrome, portrait/paysage, zoom et clavier virtuel |
| Menu Fichier complet | Core acquisition, services d'entrée/sortie | **Partiel** : import input et export JSON de démonstration | Brancher commandes canonisées Fichier |
| Import multi-fichiers et dossier | `input-picker.js`, `input-service.js` | **Partiel** : sélection native multiple | Brancher picker canonique, dossier, glisser-déposer, validation |
| Gestion réelle des fichiers | `collection-browser.js` | **Manquant** : noms simples | Sélection active, vignettes, liste/grille, tri, regroupement |
| Prévisualisation et zoom | `file-preview-service.js`, `thumbnail-service.js`, `viewer-control.js` | **Manquant** | Adapter le visualiseur canonique |
| Rotations / transformations | Collections et `object-transform-service.js` | **Manquant** | Raccorder les transformations et tests |
| Enregistrer/enregistrer sous/export | `output-service.js`, `download-service.js`, `template-engine.js` | **Démo uniquement** : métadonnées JSON | Véritable sauvegarde, noms, formats et provenance |
| Planche de travail visible/masquée | Layout Test Lab | **Implémenté en prototype**, état mémorisé | Recette desktop/mobile et synchronisation avec Core commun |
| Onglets Outils/Fichiers/Propriétés | `workspace-layout.js`, `property-inspector.js` | **Partiel** : panneaux communs, contenu factice | Rebrancher inspecteurs et outils métier |
| Historique complet | `history.js`, `history-sidebar.js` | **Manquant** : libellé statique | Timeline, filtres, favoris, recherches et détails |
| Annuler/Rétablir | `undo-redo.js` | **Manquant** | Branchement avec événements et historique réel |
| Fenêtres | `window-system.js`, `panel-registry.js` | **Démo uniquement** : fermeture et minimisation visuelle | Fenêtre unique canonique, glisser, ancrer, verrouiller, restaurer, mémoriser |
| Volets redimensionnables | `workspace-layout.js` | **Partiel** : barre desktop, verrouillage et mémorisation | Contrôle mobile, état et accessibilité |
| Ruban personnalisable | `core.js` + `frame.js` (groupes) | **Partiel** : montrer/masquer toutes les commandes | Groupes/commandes sélectionnables, ordre, visibilité, même source de vérité |
| Paramètres Core avancés | `settings.js` | **Manquant** | Réutiliser options Core et supprimer les fenêtres parallèles |
| Profil personnel | `personal-profile-service.js`, `personal-profile-ui.js` | **Manquant** | Réutiliser stockage/profil canonique |
| Modèles et variables | `template-engine.js`, `template-ux.js` | **Manquant** | Réinstaller variables date/dossier/nom et aide contextuelle |
| Recherche et palette de commandes | `command-palette.js` | **Manquant** | Palette Ctrl+K, index et raccourcis |
| Plein écran | `fullscreen-service.js` | **Manquant** | Rebrancher fonction commune |
| Mode application / PWA | `application-mode-service.js` | **Manquant** | Manifeste, compatibilité Chrome/Android, tests standalone |
| Aide contextuelle et diagnostics | `help.js`, `capability-tests.js` | **Manquant** | Raccorder aide et état des capacités |
| Parité des autres Studios | Core / Image Studio / PDF Studio | **Non commencée** | Tests régression avant toute propagation |

## Architecture cible
1. Une **bibliothèque de composants visuels Core** : header, menus, boutons, panneaux, accordéons, fenêtres et dialogues partagent la même feuille de styles tokenisée.
2. Un **registre de commandes unique** : un identifiant canonique par fonction ; menus, ruban, planche et panneaux invoquent la même commande.
3. Un **magasin unique de préférences** : visibilité, disposition, verrouillage, thèmes et autres options synchronisés quel que soit l'accès.
4. Un **gestionnaire de fenêtres unique** : mêmes commandes minimiser/restaurer/ancrer/déplacer/verrouiller pour chaque fenêtre.
5. Des **adaptateurs métier** : Image Studio et PDF Studio ne changent ni l'identité graphique ni les primitives UI communes.

## Priorités des prochaines passes
- **P0** : connecter import/sauvegarde réels, collection/aperçu, dispatcher des commandes, gestion des fenêtres. Recette Core 0.7.0 de non-régression.
- **P0 mobile** : à 320/360/390/412 px et tablette, vérifier débordement horizontal, actions tactile, menus, panneaux, clavier et portrait/paysage.
- **P1** : historique/annuler/refaire, paramètres/profil, templates, onglets et ruban complet.
- **P2** : command palette, contextual help, plein écran, PWA, compatibilité métier Image/PDF.

## Tests
Suite ajoutée : `tests/studio-core-vnext.mjs`. Elle couvre structure, thème, partage, commande imprimer, ouverture QR, état de planche et débordement horizontal sur 4 écrans. **Non exécutée dans cette passe : il faut un serveur HTTP local et Playwright Chromium dans l'environnement CI ou développeur.** Elle ne remplace pas la validation HUMAN00 Android et Chrome desktop.

## Décision release
**NO-GO** pour promouvoir VNext au rang de Core CURRENT, ou pour faire migrer Image Studio / PDF Studio. Continuer le développement en `vnext/` sans modifier les archives et versions CURRENT.


## Reprise autonome — 26 octobre 2026 (mise à jour des preuves)

Livrables réellement ajoutés dans \`vnext/\` :
- \`core-adapter.js\` : adaptateur aux **services existants**, dont \`CollectionBrowser\`, \`thumbnailFor\`, \`OutputService\`, \`recordHistory\` et \`loadHistory\`. Import de fichiers locaux, liste/cartes/vignettes, tri, sélection, aperçu image/texte/PDF, retrait de la sélection et enregistrement d'un fichier non modifié.
- \`app.js\` : répartit les commandes du ruban et des panneaux vers **un même dispatcher** ; le gestionnaire \`window-system.js\` partagé contrôle les fenêtres flottantes (minimiser, ancrer, verrouiller, déplacer et restaurer). Le volet Fichiers, l'Historique et les Propriétés utilisent les données du même adaptateur.
- \`index.html\` et \`studio.css\` : planche de travail, collection, aperçu, glisser-déposer, dialogue Enregistrer sous, habillage homogène du gestionnaire Core, responsive tactile et thèmes ; plein écran utilise \`fullscreen-service.js\`.
- \`tests/studio-core-vnext.mjs\` : tests de l'import/aperçu, de la sauvegarde réelle, de l'historique, des fenêtres, du partage et des six formats d'écran. Le pipeline GitHub Actions a été configuré pour les exécuter avant l'ancien Lab.

**Limites :** l'enregistrement réexporte les octets du fichier actif, pas une édition de contenu ; l'import est actuellement natif (sélecteur et glisser-déposer) et ne couvre pas encore la totalité du picker Core (dossiers, ZIP, URL). L'historique est réel mais limité à une liste d'activité, sans favoris et sans annuler/rétablir. Les fonctionnalités métier Image/PDF ne sont pas migrées.

**État de validation au dépôt du présent rapport :** inspection de syntaxe de \`app.js\` réussie ; au moins une exécution de CI VNext a signalé une erreur d'initialisation JavaScript dans la synchronisation du thème. Un correctif a été enregistré en commit \`c3a03ab997d455d9f10fdc6a98a8cc820348eef5\` et un nouveau run a été déclenché. **Ne pas déduire PASS tant que le run corrigé n'est pas conclu et la recette humaine validée.**

**Gate HUMAN00, inchangé : NO-GO CURRENT**, aucune migration automatique Image Studio / PDF Studio.


## État technique vérifié — 26 octobre 2026, fin de la passe

- **CI PASS** : [Actions run 40298016082](https://github.com/nepheris/nLab-web/actions/runs/40298016082), exécution du 26/10/2026, suite `chrome-core-lab` complète **success**.
- **Core VNext PASS (6 viewports)** : desktop 1366 px, tablette 768 px, smartphones 320/360/412 px et orientation paysage 844 px. Scénarios Chromium : partage/QR/impression, thèmes, import de fichier réel, aperçu texte, historique, propriétés, enregistrement direct et sous un autre nom, gestionnaire canonique de fenêtres avec verrouillage/ancrage/minimisation, visibilité de la planche et absence de scroll horizontal.
- **Test Lab existant 0.7.0 PASS** : correction des commandes initialement écartées par un regroupement de paramètres (`ux-lab.js`) ; test adapté aux sections repliables (`tests/studio-core-test-lab.mjs`). Trois scénarios bureau/tablette/mobile.
- **Démos PASS** : suite `tests/demo-explorer-folders.mjs` également exécutée.
- Cette validation est automatisée **dans Chrome sur runner Linux avec viewports simulés**, et non sur un téléphone Android physique ou Safari/Windows.
- **NO-GO pour promotion CURRENT et migration Image/PDF** : les 86 contrôles de parité Core, les fonctionnalités avancées (édition, annuler/rétablir, personnalisation détaillée) et le contrôle de design HUMAN00 restent à valider.

La présente section remplace l'état CI provisoire noté dans la section « Reprise autonome » ci-dessus ; elle n'emporte aucune clôture de TSK canonique.

## Politique « zéro duplication » — intégration du 26/10/2026

Instruction HUMAN00 : **VNext est une nouvelle interface sur le Core existant ; ne jamais créer un second moteur pour une fonction déjà implémentée.** Une action unique peut être exposée à plusieurs endroits ; tous invoquent la même commande/module.

| Fonctionnalité | Module canonique réutilisé | Point d'entrée dans VNext | Intégration |
|---|---|---|---|
| Sélection/import fichiers, dossiers, URL, ZIP | `studio-v2/input-picker.js` | Ruban et panneau « Importer » | **Raccordé**, gestion de fichiers Core |
| Collection, grille, vignettes, sélection | `studio-v2/collection-browser.js` + `thumbnail-service.js` | Planche de travail | **Raccordé**, pas de navigateur de fichiers réécrit |
| Historique, recherche, favoris et regroupement | `studio-v2/history-sidebar.js` + `history.js` | Onglet Historique | **Raccordé**, instance DOM unique déplacée entre les vues |
| Annuler / Rétablir | `studio-v2/undo-redo.js` | Ruban et historique | **Raccordé**, transactions de collection branchées sur la pile commune |
| Registre des commandes | `studio-v2/command-registry.js` | Ruban, panneaux et raccourcis | **Raccordé**, action `core-vnext.*` exécutée par le registre existant |
| Palette de commandes | `studio-v2/command-palette.js` | Bouton Commandes et Ctrl+K | **Raccordé**, UI canonique montée directement |
| Enregistrement de fichier brut | `studio-v2/output-service.js` | Ruban et panneau Fichiers | **Raccordé** pour la sortie sans conversion |
| Fenêtres flottantes | `studio-v2/window-system.js` | Gestionnaire Fenêtres et détachement | **Raccordé** pour contrôles de base |
| Plein écran | `studio-v2/fullscreen-service.js` | Ruban | **Raccordé** |
| Partager lien / QR / imprimer | `_shared/nlab-share-menu.js` | Menu Partager du header | **Commun** ; extraction récente à harmoniser avec les autres pages |

### Encore à raccorder — ne pas réécrire
- `studio-v2/settings.js` : paramètres avancés du Core, préférences ruban et disposition.
- `studio-v2/personal-profile-service.js` et `personal-profile-ui.js` : profil personnel.
- `studio-v2/template-engine.js` et `template-ux.js` : noms, dates, variables, modèles et choix de sortie.
- `studio-v2/context-selection.js`, `property-inspector.js` et `context-menu.js` : propriétés et commandes contextuelles.
- `studio-v2/viewer-control.js` et `file-preview-service.js` : zoom/navigation/aperçus enrichis.
- `studio-v2/workspace-layout.js`, `workspace-theme.js` : état commun du panneau et des thèmes (la préférence VNext reste actuellement locale).
- `studio-v2/application-mode-service.js` : mode application / PWA.
- Tests de parité, accessibilité et intégration métiers Image/PDF, puis **validation HUMAN00** avant CURRENT.

**Vérification :** la CI exige l'ouverture réelle de l'InputPicker existant, l'appel Annuler/Rétablir de la pile commune, le filtre de l'Historique partagé, la découverte des commandes dans la palette, et les tests mobiles. Aucun module CURRENT n'est réécrit et aucune version CURRENT n'est promue.

## Contrat transversal Core VNext → Studios spécialisés — 26/10/2026

**Directive HUMAN00 :** la VNext est uniquement la façade graphique du socle commun nLab. Les Studios spécialisés ajoutent des modules métier, pas de nouveaux moteurs de fenêtres, préférences, sélection, visualisation, historique, commandes ou icônes.

### Intégrations vérifiables dans le code

| Domaine commun | Source canonique | Raccordement VNext |
|---|---|---|
| Thèmes clair/sombre/système, police, densité, responsive, largeur, verrouillage, modes du ruban | `studio-v2/settings.js` | Le panneau « Réglages » monte `renderStudioSettingsPanel`. Header et panneaux partagent `load/save/applyStudioSettings`, synchronisation via `syncStudioSettingsPanel`. Plus de second état thème/largeur/verrouillage. |
| Iconographie et variantes graphiques | `studio-v2/icon-registry.js` | Icônes communes dans header, rail et ruban, régénérées lors du changement de thème d'icônes. |
| Imports fichiers/dossiers/URL/ZIP | `studio-v2/input-picker.js` | Import du ruban/panneau vers `openInputPicker`. |
| Collection et aperçus miniatures | `studio-v2/collection-browser.js`, `thumbnail-service.js` | Adaptateur Core VNext, mêmes sources et sélection active. |
| Aperçus texte et Markdown | `studio-v2/file-preview-service.js` | Fonctions `renderPlainTextPreview` et `renderMarkdownFilePreview` utilisées, sans parseur parallèle. |
| Zoom, ajustement | `studio-v2/viewer-control.js` | Barre canonique dans la zone d'aperçu ; événements ViewerControl consommés par le conteneur. |
| Propriétés et sélection contextuelle | `studio-v2/context-selection.js`, `property-inspector.js` | L'adaptateur publie les fichiers actifs et sélectionnés ; l'onglet Propriétés ouvre l'inspecteur unique. |
| Historique / favoris / recherche / Annuler-Rétablir | `history-sidebar.js`, `history.js`, `undo-redo.js` | Historique natif monté une seule fois et transactions d'import/suppression enregistrées. |
| Registre et palette de commandes | `command-registry.js`, `command-palette.js` | Boutons ruban et panneaux appelant le même registre ; palette Core accessible via Ctrl+K. |
| Fenêtres | `window-system.js` | Fenêtres déplaçables, ancrables, verrouillables, réductibles et restaurables. |
| Plein écran | `fullscreen-service.js` | Contrôleur Core unique. |
| Profil personnel, variables, ressources | `personal-profile-ui.js` / `personal-profile-service.js` | Section « Profil personnel nLab » du panneau Core chargée à l'ouverture, sans UI dupliquée. |
| Sauvegarde brute | `output-service.js` | Enregistrement simple et Enregistrer sous ; éditeurs métier non migrés. |

### Limites explicites et prochaines intégrations

- La VNext est toujours **un laboratoire isolé**, pas encore un shell partagé injecté dans chaque Studio. Factoriser le conteneur graphique commun seulement après validation visuelle HUMAN00.
- Restent à raccorder : `template-engine.js`, `template-ux.js` (modèles et variables de sortie), `workspace-layout.js` (docking/disposition complète), `application-mode-service.js` et manifeste PWA, palette d'aide contextuelle, visualisations/éditeurs métiers Image/PDF.
- Les vignettes et contrôles partagés ont été intégrés ; les modes de rendu PDF avancés, rotations et conversions doivent toujours être branchés aux modules spécialisés existants, **sans duplication**.
- Les essais de viewport Chrome en CI ne valent pas validation tactile Android physique, ni recette des **86 contrôles**.
- Le CSS Core existant est importé en couche de compatibilité ; les surcharges VNext ne doivent définir que l'agencement du nouveau shell et les variables de thème. La suppression des styles historiques doit être progressive et précédée de tests multi-Studio.
- **NO-GO** pour promouvoir VNext en CURRENT et pour basculer Image Studio/PDF Studio sans validation HUMAN00.

## Revue ergonomique HUMAN00 — 26 octobre 2026 : ruban et volets partagés

Référence reçue : la fenêtre commune « Choisir une entrée » (mêmes pictogrammes verrouiller/déverrouiller, plier/déplier, réduire et restaurer), et souhait d'un **ruban d'icônes à groupes de commandes proche d'Office 365**. Le Core TEST actuel ne doit perdre aucune fonctionnalité : les commandes redondantes sont regroupées graphiquement, les opérations restent confiées aux services Core.

### Développements

- `studio-v2/window-system.js` expose `studioWindowControlIcon` : **une seule source d'icônes de verrouillage et repli** pour fenêtres flottantes et volet latéral.
- `studio-v2/sidebar-controller.js` (nouveau composant partagé) : replier, déplier, verrouiller, adapter la largeur au pointeur ou aux flèches clavier, conserver largeur/verrouillage/visibilité par `settings.js`. VNext n'exécute plus son ancien contrôleur local.
- `studio-v2/core.js` expose `mountStudioRibbonTabs` : contrôleur générique d'onglets de ruban. Un Studio spécialisé pourra déclarer des groupes supplémentaires **sans recopier la gestion des onglets ni celle des commandes**.
- `studio-v2/workspace-chrome.css` : CSS du volet et du ruban mutualisé ; VNext le charge après sa feuille de thème. Les tokens héritent du thème clair/sombre du Core.
- **Ruban VNext** : Accueil / Fichier / Édition / Affichage / Outils. Groupes AFFICHAGE, FICHIERS, HISTORIQUE, PANNEAUX, FENÊTRES ET OUTILS. Le ruban n'est pas remplacé par un simple menu ; il reste visible et présente les actions avec icônes et labels.
- Les commandes de l'onglet PANNEAUX (« Réglages », « Propriétés ») passent par le même registre de commandes et ouvrent les panneaux **déjà existants**, sans nouveau formulaire ni doublon. « 👁 Affichage » est placé dans le ruban.
- Tests Playwright ajoutés : tabulation des groupes, navigation clavier, unicité des commandes, repli/déploiement de volet, verrou, égalité des icônes fenêtre/volet, glisser et clavier pour la largeur, persistance du paramètre Core.

### Traçabilité et périmètre

CI pré-factorisation du CSS : [run 40316364357](https://github.com/nepheris/nLab-web/actions/runs/40316364357), `success`, suite Chrome VNext + Core Lab historique + démos. Nouvelle CI en cours après extraction du CSS, à ne pas déclarer PASS sans résultat réel.

**Garde-fous :** aucune version CURRENT modifiée, aucune suppression de service Core historique, aucun GO HUMAN00. Restent la parité complète des 86 contrôles, les modèles de sortie, les intégrations spécialisées, le comportement tactile sur Android réel et la vérification esthétique.

## Mise à jour 26/10 — Profil personnel indépendant et cadenas du volet

- Entrée **Profil nLab** autonome dans le rail de gauche, immédiatement avant **Réglages**, avec une icône `profile` provenant du registre commun `studio-v2/icon-registry.js`. Le profil n'est plus injecté dans la fenêtre Réglages.
- Le panneau monte à la demande **l'unique composant existant** `personal-profile-ui.js` ; il conserve l'identité, les tampons, signatures, logos, variables, import/export ZIP et modes de stockage locaux du Core. Aucun moteur parallèle, aucune donnée personnelle mise dans les fichiers publics du dépôt.
- Un même contrôleur `sidebar-controller.js` gère la largeur du panneau, son repli et le **verrouillage réel**. Le cadenas fermé désactive la poignée et empêche le redimensionnement ; le cadenas ouvert restaure glisser-déposer et clavier. L'état est partagé avec `settings.js` et mémorisé. L'icône verrouillée est visuellement active.
- Le rail met en surbrillance l'onglet actuellement sélectionné pour tous les panneaux. Les styles du profil reprennent les tokens Core clair/sombre.
- **CI Chrome [run 40322449396](https://github.com/nepheris/nLab-web/actions/runs/40322449396) : success** après changements et rechargement des feuilles CSS. Les tests vérifient la présence et la position de l'icône, l'unicité du profil, son ZIP, la synchronisation du cadenas, l'impossibilité de déplacer le panneau verrouillé, le déverrouillage et les suites de non-régression sur 6 viewports.
- **NO-GO CURRENT** : validation visuelle HUMAN00 et contrôle sur matériel mobile réel toujours en attente.

## Enregistrement avancé partagé — raccordement 26/10/2026

Directive HUMAN00 : intégrer les **fonctions d'enregistrement avancé existantes**, sans dupliquer ni le moteur de modèles ni les variables du profil personnel. Ajout en TEST au Core VNext :

- Ruban **Fichier → Enregistrement avancé**, également disponible depuis le panneau **Fichiers**. L'enregistrement simple et « Enregistrer sous » restent inchangés.
- Fenêtre commune fournie par `studio-v2/advanced-output-ui.js` + `advanced-output.css` ; c'est uniquement un **adaptateur graphique**.
- `TemplateEngine` pour résoudre `{FILENAME}`, `{DATE:YYYY-MM-DD}`, `{YEAR}`, `{MONTH}`, `{CLIENT}`, `{PROJECT}`, `{FIRST_NAME}`, `{INITIALS}`, etc. Préfixe, modèle de nom, suffixe, extension source préservée et aperçu du nom.
- **Modèles personnels de renommage et de classement** issus de `personal-profile-service.js` ; ils peuvent être sélectionnés, personnalisés et sauvegardés dans le profil nLab (donc exportables via le ZIP existant). Sélecteur de variables `template-ux.js` directement monté, familles et formats de dates conservés.
- **Destination** via `OutputService.chooseDirectory()` et `loadLastDirectory()`; les sous-dossiers sont réellement créés par `OutputService.targetDir(parts)`. Le chemin calculé est affiché avant enregistrement ; seul le **fichier sélectionné** est écrit, sans modification des octets.
- **Repli explicite** : sans accès natif au répertoire, un téléchargement simple reste possible **sans sous-dossiers**. Si un modèle demande une arborescence sans dossier choisi, l'enregistrement est bloqué avec explication au lieu de prétendre créer le dossier.
- Le choix de dossier est soumis aux permissions du navigateur (File System Access API, notamment Chrome/Chromium). Les modèles restent locaux, les poignées de dossier sont mémorisées par le service existant dans IndexedDB ; aucune sauvegarde dans GitHub.
- Extension/dossiers sécurisés par les fonctions existantes du Core et normalisation des segments de dossier dans l'adaptateur ; pas de réécriture du module spécialisé PDF Studio.

**Validation Chrome CI : [run 40325299018](https://github.com/nepheris/nLab-web/actions/runs/40325299018), success.** Scénarios : ouverture par ruban, sélection d'un modèle personnel, prévisualisation d'un chemin année/mois/nom, sélection des variables, refus de créer un sous-dossier sans destination, API dossier simulée avec création des niveaux et écriture du **contenu original identique**, mémorisation d'un modèle, téléchargement simple et non-régression sur les six viewports plus l'ancien Core Lab.

**Gates ouvertes :** recette HUMAN00 de l'UX, autorisations de dossier sur poste réel, tests Android physique, compatibilité des modèles et des destinations avec les Studios Image/PDF. **NO-GO CURRENT.**

## 26/10/2026 — Vues universelles, aperçu, contrôles communs et classement

**Instruction HUMAN00 :** un seul langage visuel SVG pour les modes Liste / Icônes / Vignettes / Tableau dans les Studios et leurs sélecteurs ; masquer/réafficher l'aperçu ; mêmes composants couleurs, dates et dépôt fichiers/dossiers ; « Enregistrer et classer » avec variables, préréglages et destination dans le dossier source ou une arborescence.

### Raccordements livrés dans `nLab-web` (TEST)

| Périmètre | Réutilisation / source unique | Comportement |
|---|---|---|
| Icônes des vues | `studio-v2/view-modes.js` et `icon-registry.js` | 4 boutons SVG Liste, Icônes, Vignettes, Tableau ; mêmes SVG dans le sélecteur d'entrée du Core et dans VNext. |
| Collection | `studio-v2/collection-browser.js` | Quatrième vue `table` avec colonnes Nom/Type/Taille/Dossier ; tri, sélection et préférences conservés. |
| Prévisualisation | `studio-core-test/vnext/app.js` | Un état `preview` mémorisé, commandé depuis ruban, barre des fichiers et Affichage. Aucune destruction du fichier actif lorsque l'aperçu est masqué. |
| Sélecteur couleur | `studio-v2/color-control.js` | Reprise du contrôle HEX/RGB/HSL existant, montré dans « Outils » VNext ; tokens CSS communs. |
| Sélecteur date | `studio-v2/date-control.js` avec `template-engine.js` | Même icône SVG Calendrier et même champ date natif ; contrôle visible dans « Outils » et date A utilisée dans le modèle de sauvegarde `{DATE_A}`. |
| Glisser-déposer | `studio-v2/drop-zone.js` | Zone de dépôt VNext branchée sur le service existant, prenant en charge fichiers et dossiers récursifs lorsqu'exposés par le navigateur. |
| Enregistrer et classer | `advanced-output-ui.js`, `template-engine.js`, `template-ux.js`, `personal-profile-service.js`, `output-service.js` | Préréglages de renommage et classement, insertion de variables, aperçu du chemin, destination explicite, sous-dossiers réels et conservation des octets source. |
| Dossier source | `OutputService.chooseSourceDirectory(file)` | L'utilisateur autorise explicitement le dossier source ; le service vérifie nom et taille du fichier. Écrasement direct interdit si le nom reste identique sans sous-dossier. |
| Modèles de classification | `personal-profile-service.js` | Préréglages supplémentaires année/mois/semaine et client/projet/année, réutilisables par les Studios. |

**Limites :** le navigateur ne livre pas automatiquement de permission d'écriture dans le dossier d'un fichier importé ; la sélection manuelle est obligatoire. Comparer le nom et la taille vérifie une correspondance apparente et ne constitue pas une preuve cryptographique d'identité. Le téléchargement simple ne crée pas de sous-dossiers. Une refonte de tous les Studios vers ces contrôles partagés demande une migration distincte : le code commun est prêt, mais Image/PDF CURRENT n'ont pas été basculés.

**Preuve GitHub Actions :** [run 40354224272](https://github.com/nepheris/nLab-web/actions/runs/40354224272) : **SUCCESS**. VNext testé sur six viewports Chrome (1366, 768, 320, 360, 412, 844 px), avec contrôles du sélecteur 4 vues, du mode Tableau, de l'aperçu masquable, des champs couleur/date, du modèle `DATE_A`, des dossiers simulés (dont source autorisée), de l'interdiction d'écraser l'original et des non-régressions anciennes. Ce PASS navigateur n'est **pas** une validation physique Android ni une décision HUMAN00.

**Statut : PARTIAL / TEST — NO-GO CURRENT.**
