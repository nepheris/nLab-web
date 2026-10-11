# Guide Froid V2 — B02 · Continuité atelier → diagnostic

Date : 2026-10-11. Branche de développement : main.

## Développement réalisé

- L'atelier transmet via sessionStorage une enveloppe `nlab.guide-froid.handoff/2` avec la fiche appareil complète, la liste des visites et l'inventaire des documents.
- Le diagnostic accepte les enveloppes v1 (compatibilité) et v2 ; les nouvelles données sont accessibles via `window.guideFroidHandoffSummary`.
- Les originaux binaires des photos, notices et PDF **ne sont pas transférés** par ce canal. Ne pas afficher une promesse d'accès aux pièces jointes avant intégration d'un stockage temporaire local (IndexedDB ou autre) et tests.
- Aucune modification du site public principal gh-pages.

## Recette nécessaire
1. Dans l'atelier V2 de développement, importer un ZIP avec 2 visites et des documents.
2. Lancer le diagnostic et vérifier l'identité ainsi que les informations de la fiche.
3. Vérifier la présence des 2 visites et de la liste documentaire dans l'état de transfert.
4. Ajouter le transfert temporaire des pièces binaires, puis vérifier leur ouverture dans le diagnostic et leur retour au dossier sans perte.
5. Tester Chrome et Firefox, retour au dossier, expiration de transfert et anciennes enveloppes v1.

**État : B02 PARTIAL.** Le transfert des métadonnées existe ; le transfert des binaires et la recette graphique restent ouverts.

## Implémentation suivante — 11/10/2026
- Handoff v3 créé dans l'atelier : transfert fiche complète, visites, inventaire, référence temporaire UUID.
- Copies binaires déposées avant navigation dans IndexedDB (`nlab-guide-froid-handoff`, store `sessions`), sans serveur ; aucune donnée binaire placée dans sessionStorage.
- Le diagnostic accepte toujours v1 et v2 et sait accepter v3 ; un volet permet d'accéder aux fichiers binaires par un lien `Voir / télécharger`.
- Les transferts de plus de 4 heures sont refusés côté lecture. Cela n'implique pas une purge physique automatique des anciennes données IndexedDB ; purge et restauration du dossier côté atelier restent à construire.
- Contrôle de syntaxe du JS atelier et des scripts inline du diagnostic : PASS. **Aucune recette graphique navigateur pour B02 v3.**

**État B02 : PARTIAL avancé**. À prouver : ouvrir des images et PDF depuis le diagnostic, retour au dossier et comportement après réimport, contrôle Chrome/Firefox, absence de perte et nettoyage IndexedDB.

## Laboratoire web isolé B02 — 11/10/2026
Une recette navigateur est désormais accessible via `https://nepheris.github.io/nLab-web/APP-Applications/guide-froid/atelier-a11/` et `https://nepheris.github.io/nLab-web/APP-Applications/guide-froid/diagnostic-a11/`. Le code de l'atelier de recette a été synchronisé avec le transfert v3 d'`main` et redirige vers le diagnostic isolé. Ce diagnostic reçoit les références et relit les blobs depuis IndexedDB dans le même navigateur et la même origine. Contrôle de syntaxe des scripts : PASS. **Aucun test utilisateur réel B02 exécuté à ce stade.** Recette : importer ou créer appareil fictif, ajouter image et PDF, ouvrir diagnostic, vérifier boutons Voir/télécharger, revenir à atelier, confirmer dossier toujours réimportable et ZIP sauvegardé. Réserve : le retour au dossier exige encore un réimport ZIP ; pas de restauration automatique de session, ni purge IndexedDB.
