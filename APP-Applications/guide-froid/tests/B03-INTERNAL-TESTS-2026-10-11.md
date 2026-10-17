# Guide Froid V2 — B03, campagne autonome 11 octobre 2026

## Développement
Ajout de l'étape conditionnelle **rideaux souples à lanières PVC** dans le sélecteur visuel de la chambre froide. Valeurs : oui, non, inconnu. Sélection non proposée pour les autres formes. Réinitialisation si changement de forme. Conservation dans l'objet appareil et donc dans le ZIP. Synchronisation de `main` vers `gh-pages/atelier-a11` ; site public principal inchangé.

## Contrôles
1. Définition des trois valeurs : PASS (vérification des structures).
2. Porte pleine imposée pour la chambre froide : PASS (fonction `accepted` exécutée).
3. Étape PVC conditionnée à la forme chambre : PASS (inspection).
4. Valeur PVC réinitialisée lorsque la forme change : PASS (inspection).
5. Résumé du choix PVC disponible : PASS (inspection).
6. Préservation des données legacy : PASS (inspection).
7. Présence distincte des champs volume net et brut : PASS (inspection).

**Attention :** 1 test de fonction exécuté et 6 vérifications de présence/invariant du code. Aucun navigateur visuel ni IndexedDB natif utilisé. B03 reste **PARTIAL** jusqu'aux recettes automatisées navigateur puis visuelles. B02 reste PARTIAL indépendant, notamment le parcours de bout en bout.
