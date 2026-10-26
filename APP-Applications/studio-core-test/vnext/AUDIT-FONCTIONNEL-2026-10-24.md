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
