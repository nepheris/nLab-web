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

## Retour PARTIAL utilisateur et correction — 11 octobre 2026
L'utilisateur indique « je n'ai pas l'impression que le dossier est mis à jour ». Diagnostic : le transfert existant était unidirectionnel (atelier → diagnostic) et ne restaurait pas l'état au retour. Correctif sur `main` et atelier `gh-pages/atelier-a11` : IndexedDB stocke désormais une copie de la fiche appareil en plus des fichiers ; bouton explicite **Restaurer le dossier après diagnostic** (confirmation avant remplacement de l'état courant), recharge la fiche, les visites et les pièces jointes, puis exige un export ZIP pour sauvegarde durable. Contrôle de syntaxe JS des deux ateliers : PASS ; test navigateur non encore effectué. **Important : les observations nouvelles saisies dans le diagnostic ne sont pas encore réinjectées dans une visite.** Cette synchronisation bidirectionnelle du résultat du diagnostic appartient à la suite B02/C ; la présente correction ne doit pas être présentée comme un enregistrement du diagnostic. État B02 : PARTIAL ; recette ciblée retour et restauration à effectuer, puis intégration du résultat de diagnostic.

## Validation restauration et progression diagnostic — 11 octobre 2026
L'utilisateur confirme **PASS** pour la restauration du dossier après diagnostic (sans détail supplémentaire). Ce critère B02 est validé par la recette utilisateur.
Développement suivant sur main et dans le laboratoire gh-pages : bouton de préparation du diagnostic depuis le diagnostic guidé, écriture locale d'un enregistrement en attente identifié par transfert ; à la restauration confirmée, création d'une **nouvelle visite de type diagnostic** numérotée, sans modifier les visites précédentes, puis export ZIP manuel nécessaire. Protection anti-doublon par identifiant et suppression de l'enregistrement en attente après intégration. Aucun document binaire du formulaire de diagnostic n'est encore ajouté à cet enregistrement ; les pièces déjà associées à l'appareil sont restaurées. Vérification de syntaxe JS PASS dans les deux pages labo ; **recette navigateur de l'ajout diagnostic encore à faire**. Statut B02 : PARTIAL jusqu'au test de non-duplication, retour, ZIP et pièces liées au diagnostic.

## Recette PARTIAL — informations du ZIP non visibles dans le diagnostic (11/10/2026)
Retour utilisateur répété « quand je charge le diagnostic je perds de l'info du ZIP qui est chargée ». Le handoff transporte déjà l'objet appareil complet, mais le diagnostic ne présentait qu'un sous-ensemble de champs (site, fabricant, modèle, etc.) ; l'historique des visites était invisible hors état JavaScript. Correctif dans `main` et `gh-pages/diagnostic-a11` : section visible « Dossier appareil chargé depuis le ZIP », fiche récapitulative complète et historique des visites antérieures. Correctif dans `main` et `gh-pages/atelier-a11` : bouton Restaurer le dossier déplacé hors de la zone masquée `workspace` pour permettre la récupération immédiatement au retour du diagnostic. Contrôle syntaxique scripts diagnostic : PASS. **B02 = PARTIAL, recette navigateur nécessaire** : vérifier les champs et visites visibles, ajout du diagnostic, retour et export ZIP, sans altérer les données d'origine. La suppression physique des sessions temporaires expirées IndexedDB et l'intégration binaire des nouvelles pièces de diagnostic restent ouvertes.
