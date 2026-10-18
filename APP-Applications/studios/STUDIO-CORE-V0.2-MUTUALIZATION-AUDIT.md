# Audit de mutualisation — Studio Core V2 / prochaine évolution

Date : 2026-10-18 · Canal : TEST · Périmètre : catalogue public de 15 Studios, applications dérivées, Demo Explorer.
Source de vérité : `APP-Applications/studios/catalog.json`. Une présence HTML ne constitue pas une validation fonctionnelle.

## Principes de séparation

- **CORE UX** : identité nLab, navigation, ruban, réglages, fenêtres et docks, raccourcis, historique, propriétés, imports, sélection, progression générique, Undo/Redo, export/download.
- **SERVICE transversal** : parseurs de formats, PDF/image/OCR, génération d'aperçus, symbologies, conversions. Ces services sont partagés mais ne sont pas des commandes métier globales.
- **STUDIO métier** : logique de transformation, édition, mesure, formats d'export pertinents, validation d'un résultat spécifique.
- **Exposition optionnelle** : une capacité n'apparaît que si elle existe dans le Studio ; `core.acquire` est proposée via `coreFeatures.acquisition` pour les surfaces migrées. Le test responsive peut être masqué dans les préférences.

## Résultat vérifié dans le code

| Surface | Fonctions observées / implémentation | Mutualisation proposée | Priorité / état |
|---|---|---|---|
| PDF Studio V2 | Sélection fichiers et dossiers, dépôt, collections, onglets Propriétés/Historique/Tâches/Recherche, export, vaste métier PDF | Migrer progressivement vers `input-picker.js`, `download-service.js`, rail/docks communs ; **ne pas déplacer l'édition PDF dans le Core** | P1 PARTIAL |
| Image Studio V2 | Input image multiple, demos et fonctions image (rotation, recadrage, mesures) | Input Picker et collection partagés ; pipeline image et calibration restent métier / `image-service.js` | P1 PARTIAL |
| Scan Studio V2 | `input-picker.js`, `ocr-service.js`, `download-service.js`, `image-service.js`, `undo-redo.js` déjà importés | Reprendre seulement le contrat et l'apparence, éviter une seconde implémentation | P1 EXISTING |
| OCR Studio V2 | Entrée fichier et `ocr-service.js`, Undo/Redo | Acquisition / historique Core ; paramètres OCR et moteur restent spécialisés | P1 PARTIAL |
| Code Studio V2 | Entrée fichier, édition, recherche, actions d'export | Sélection, fichiers récents, historique, download ; éditeur/langages restent spécialisés | P2 TO AUDIT |
| JSON Studio V2 | Fichier, édition arborescente/tableaux, format/validate/export | Acquisition/download/historique communs ; validation JSON, JSONPath et arbre restent métier | P2 PARTIAL |
| Data Studio V2 | Entrées tabulaires, conversion/exports | File Picker, download, propriété/métadonnées ; tableur/SQL restent services/métier | P2 PARTIAL |
| QR & Barcode Studio V2 | `input-picker.js`, `symbology-service.js`, `color-control.js`, `download-service.js` | Préserver la génération spécifique et étendre le contrat de sortie Core | P2 EXISTING |
| File Studio V2 | Fichiers + répertoires, inspecteur/gestion de lot/export | Brique de collection universelle et métadonnées ; traitements de fichiers restent métier | P1 PARTIAL |
| Markdown Studio V2 | Entrée texte, YAML, aperçu, export ; `download-service.js` dans le runtime | Import/export/undo/redo communs ; moteur Markdown et front matter restent métier | P2 PARTIAL |
| Demo Studio | Redirection vers `Library/demo/` et manifests | Explorateur, filtres, preview et catalogues : transversal, pas un moteur d'édition | P1 PARTIAL |
| Dataset Generator Studio V2 | Génération de jeux synthétiques, downloads, previews | Barre de sortie & acquisition réutilisable ; générateur et contraintes de fixtures métier | P2 PARTIAL |
| Document Studio V2 | `document-format-service.js`, `download-service.js`, Undo/Redo | Barre acquisition/export commune ; conversions DOCX/ODT spécifiques au service | P2 EXISTING |
| Spreadsheet Studio V2 | `tabular-service.js`, `download-service.js`, Undo/Redo | Barre entrée/export commune ; parseurs XLSX/ODS/CSV restent service | P2 EXISTING |
| Responsive Test Studio | Simulateur indépendant, full screen partagé, PWA standalone | Conserver moteur indépendant ; launcher Core facultatif (visible/masqué), pas de duplication de simulation | P1 EXISTING |

## Briques existantes : ne PAS dupliquer

| Brique | Source actuelle | Décision |
|---|---|---|
| Import / collection avancée | `APP-Applications/_shared/studio-v2/input-picker.js` | **Canonique** : fichiers, dossiers, glisser/déposer, URL CORS, vignettes, aperçu, tri, groupement, sélection, Undo/Redo |
| Détection des formats | `format-registry.js` et `input-service.js` | Garder un seul ensemble de définitions de formats |
| Téléchargements | `download-service.js` | Conserver ; ne pas créer de nouveau mécanisme de `Blob` ou `<a download>` |
| Historique | `history.js` | Ajouter accès fixe dans la barre Core, fenêtre complète dockable/flottante |
| Transactions | `undo-redo.js` | Garder le service, ne pas confondre avec historique d'activité |
| Propriétés | `property-inspector.js` | Même panneau, même contrat `studio-v2:selection-change` |
| Fenêtres / dock | `window-system.js` | Garder libre/dock/verrouillage/collapse ; améliorer navigation sans second gestionnaire |
| Plein écran | `fullscreen-service.js` | Icône « expand » sur `core.fullscreen` ; mode PWA reste séparé |
| PWA | `application-mode-service.js` | Dédié ; nécessite manifeste par application |
| Test responsive | `responsive-test-launcher.js` | Action Core facultative configurable |
| Moteurs | `ocr-service.js`, `image-service.js`, `document-format-service.js`, `tabular-service.js`, `symbology-service.js` | Services partagés, déclenchés uniquement par Studios ayant la capacité |

## Architecture UX proposée

1. **En-tête unique** : logo officiel cliquable, nom/version/status du Studio ; navigation globale allégée.
2. **Ruban contextualisé** : actions CORE obligatoires distinctes des commandes spécifiques. Les fonctions facultatives utilisent réglages et manifest ; 1/2 lignes, compact, icônes déjà pris en charge.
3. **Rail Core** : Historique, Propriétés, et Import pour Studios opt-in ; repliable, sans remplacer le rail métier du PDF.
4. **Panneaux existants** : historique/propriétés/aide peuvent être flottants ou dockés avec le gestionnaire de fenêtres unique. La stratégie de docking multi-écrans reste à recetter.
5. **Acquisition** : `core.acquire` appelle **le module input-picker canonique** sur les Studios ayant migré. Un résultat `File[]` est consommé par leur moteur propre, aucune conversion automatique.
6. **Exports** : Studio Core fournit le téléchargement, le nommage et les métadonnées ; chaque Studio doit déclarer ses formats de sortie. N'introduire aucun « Convertir tous formats » générique trompeur.
7. **Galerie** : les dossiers manifestés (y compris Icônes) restent affichables avec les références non publiées explicitement différenciées, recherche filtrée et previews valides/fallbacks.

## Roadmap atomique v0.2+

| ID | Tâche | Statut |
|---|---|---|
| CORE-201 | Audit transversal 15 Studios et classification Core/service/métier | DONE — audit statique |
| CORE-202 | Brancher Lab sur `input-picker.js`, sans duplication | IMPLEMENTED TEST |
| CORE-203 | Raccourci rail Historique/Propriétés et masquage optionnel Responsive | IMPLEMENTED TEST |
| CORE-204 | Démos : Icônes au même niveau que dossiers, filtres complets, previews fallback | IMPLEMENTED TEST |
| CORE-205 | Tests Chrome du Lab et explorateur, vérification PWA réelle | CI puis recette humaine |
| CORE-206 | Migrer la sélection PDF V2 et Image V2 sur le Picker canonique sans régression | TODO — PR séparées |
| CORE-207 | Harmoniser la sortie/export, erreurs/avancement, metadata de formats dans tous les Studios | TODO |
| CORE-208 | Audit des docks, gestion des fenêtres et clavier en responsive sur chaque Studio | TODO |
| CORE-209 | Consolider catalogue, pages démo et snapshots historiques | PARTIAL |
| CORE-210 | Généraliser les manifestes PWA et recette standalone à tous les Studios éligibles | TODO |

**Non-régression :** les CURRENT, les pipelines PDF/Images/OCR et les historiques gelés ne sont pas migrés en bloc. Toute promotion exige tests automatisés, recette utilisateur et gate de déploiement.
