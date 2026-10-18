# Studio Core Test Lab — TEST 0.2.0

Surface de diagnostic isolée : `APP-Applications/studio-core-test/`.

## Objectif
Vérifier le véritable Studio Core V2 partagé (Core 3.4.1 TEST) et préparer une propagation contrôlée à l'ensemble des Studios nLab, sans dupliquer le code du Core ni modifier les archives historiques.

## Périmètre couvert
- Header nLab / navigation, ruban, menus, réglages et commandes Core.
- Plein écran natif commun : `studio-v2/fullscreen-service.js` (écran entier).
- Mode application PWA commun : `studio-v2/application-mode-service.js` (affichage standalone, invitation d'installation uniquement si navigateur éligible).
- Raccourcis, responsive, sélection / inspecteur, historique Annuler / Rétablir, version Core.
- Contrôles techniques automatiques (diagnostic local) + checklist manuelle persistée localement.

## Important
Le mode application et le plein écran sont indépendants. La seule présence d'un manifeste n'assure pas une proposition d'installation : Chrome/Edge/Android imposent leurs propres critères, notamment icônes, origine sécurisée et comportement du navigateur. Aucun hors-ligne n'est garanti.

Un Studio V2 ayant migré vers le Core voit l'action `core.app-mode`. **Pour rendre chaque Studio réellement installable**, il faut en plus fournir à celui-ci un manifeste PWA dédié et les ressources appropriées, puis vérifier le prompt et le lancement standalone sur navigateur réel. L'ajout du bouton Core ne prouve pas la conformité PWA de tous les Studios.

## Isolation et diffusion
La surface TEST est volontairement absente des 15 Studios métier comptabilisés dans `studios/catalog.json`. Un lien est placé dans le Hub, rubrique « Validation & démonstration ». Les versions CURRENT et `versions/*` historiques sont inchangées.

## Plan de recette avant validation
1. Contrôles techniques : liste de résultats PASS affichée dans la page.
2. Desktop Chromium/Edge : entrée/sortie fullscreen, invite install ou message de fallback.
3. Réouvrir l'application installée et contrôler la fenêtre standalone.
4. Mobile Android : affichage et actions dans le ruban.
5. Retester un Studio V2 spécialisé ainsi que Responsive Test Studio CURRENT (non-régression).
6. Étendre l'installation PWA aux autres Studios via leurs manifestes dédiés ; ce chantier reste PARTIAL tant qu'il n'est pas audité.

## Passe 0.2.0
- Le module d'acquisition réel est `APP-Applications/_shared/studio-v2/input-picker.js`, déjà consommé par Scan et QR Barcode. Aucune seconde fenêtre d'import n'est introduite.
- Le Lab `coreFeatures.acquisition=true` active `core.acquire`; la fenêtre d'entrée sélectionne et renvoie les `File[]` au Lab.
- Barre Core repliable Historique / Propriétés + Fichiers opt-in ; préférence pour masquer le launcher Responsive.
- Explorateur de démos : toutes les entrées de manifests, dossier Icônes normal, preview valide ou fallback.
- L'historique 0.1.0 est conservé dans `versions/0.1.0/`.
- Audit de mutualisation : `../studios/STUDIO-CORE-V0.2-MUTUALIZATION-AUDIT.md`.
