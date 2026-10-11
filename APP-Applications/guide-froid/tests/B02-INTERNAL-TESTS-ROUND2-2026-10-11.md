# Guide Froid V2 — Campagne autonome B02, série 2

Date : 11 octobre 2026 — branche `main`.

## Contrôles réellement exécutés en moteur JS isolé

| Scénario | Résultat |
|---|---|
| Import du format V1 imbriqué et projection des propriétés | PASS |
| Champs historiques et source V1 conservés | PASS |
| ZIP STORE aller-retour : visite ancienne + diagnostic | PASS |
| ZIP STORE aller-retour : deux pièces jointes | PASS |
| ZIP altéré : rejet CRC | PASS |
| ZIP tronqué : rejet | PASS |

Le scénario de décompression d'une archive valide à une seule entrée a aussi été vérifié ; ce n'est pas un test de rejet d'entrées ZIP dupliquées, qui demeure à implémenter séparément.

## Invariants vérifiés par inspection du code

| Invariant | Résultat |
|---|---|
| Purge IndexedDB des sessions expirées intégrée au transfert | Présent dans le code |
| Identifiant du diagnostic stable par transfert | Présent |
| Garde anti-doublon au réimport | Présent |
| Suppression de l'enregistrement en attente après ajout | Présent |
| Vue de la fiche complète et historique dans le diagnostic | Présent |
| Fenêtre d'expiration de quatre heures | Présente |

Ces invariants **ne sont pas des tests IndexedDB ou DOM exécutés**.

## Correctif

`storeHandoffDocuments` purge désormais, dans la même transaction IndexedDB, les sessions expirées ou invalides avant d'enregistrer un nouveau transfert. Appliqué sur `main` et sur l'atelier de test isolé (`gh-pages/atelier-a11`). Les sessions ne sont pas purgées sans nouveau transfert.

## Restant ouvert

- Test du véritable IndexedDB : transaction, blobs, expiration, restauration et nettoyage.
- Test navigateur automatique complet : Chrome/Firefox, déclenchement du diagnostic et mise à jour de l'historique.
- Vérification des ZIP DEFLATE de grande taille et noms de fichiers Unicode.
- Nettoyage manuel des données temporaires, intégration des nouvelles pièces jointes du diagnostic.
- Tests de non-régression des trois visites et du fonctionnement hors ligne.

**Décision : B02 PARTIAL** tant que ces contrôles d'intégration ne sont pas exécutés.
