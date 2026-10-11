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
