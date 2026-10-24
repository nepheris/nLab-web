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
