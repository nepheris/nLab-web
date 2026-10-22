# Studio Core 3.10 TEST · Core Test Lab 0.8 — protocole de recette réelle
_Status : guide prêt, **recette humaine NON exécutée**. Aucun GO CURRENT sans preuves._

## Environnement et règle de sécurité

- Version candidate : [PR #93](https://github.com/nepheris/nLab-web/pull/93), chemin `APP-Applications/studio-core-test/`, canal TEST uniquement ; ne pas confondre avec le Core 3.9 intégré à `main`.
- Navigateur PC : Chrome sur Linux, taille réelle et émulations bureau/tablette/mobile séparées.
- Navigateur téléphone : Chrome Android réel, portrait puis paysage. Si possible vérifier sur un écran étroit et une tablette.
- URL : employer un aperçu de la branche TEST servi en HTTPS pour les fonctions PWA. Un site HTTP sur le réseau local ne fournit pas toujours les prérequis d'installation ; `localhost` du téléphone ne pointe pas vers le PC.
- Ne pas importer de fichiers confidentiels. Pour les profils personnels, employer des valeurs fictives et conserver le JSON exporté en privé.
- Aucune modification CURRENT, aucun effacement d'anciennes versions, aucun déploiement métier pendant cette recette.

## Matrice de vérification manuelle

Cocher `PASS`, `FAIL`, `BLOCKED` ou `N/A` pour **chaque** environnement ; joindre au minimum une capture par anomalie, l'URL et les dimensions de l'écran.

| ID | Vérification concrète | Résultat attendu |
| --- | --- | --- |
| C-01 | Logo, header, ruban, rail, panneau central | Identité nLab conservée ; aucune commande masquée ou hors écran |
| C-02 | Bureau/tablette/mobile, rotation écran Android | Navigation, texte et boutons accessibles sans chevauchement ni défilement latéral forcé |
| C-03 | Replier/déplier le rail, le verrouiller, régler sa largeur | Verrouillage effectif ; dimensions restaurées après rechargement |
| C-04 | Détacher un panneau, changer d'onglet, rattacher | Fenêtre visible, rail cliquable, contenu non perdu ; pas de doublon |
| C-05 | Fichiers multiples, un dossier, sélection, désélection, filtres | La sélection et la collection restent cohérentes avec le panneau Fichiers et l'aperçu |
| C-06 | Miniatures Auto, tailles −/+, tri, groupes dossier/type/pages/poids | Changements visuels et préférences mémorisées |
| C-07 | Tourner les vignettes ±90°, Annuler puis Rétablir | Rotation de l'aperçu réversible ; **octets source inchangés** |
| C-08 | Personnel : dates A–D, identité, masque de date, sauvegarde | Aperçu/nommage cohérents et réglages persistants |
| C-09 | Import JSON personnel valide et date impossible (30 février) | Acceptation du valide et rejet atomique de l'invalide, sans modifier le profil existant |
| C-10 | Import par URL HTTP/HTTPS d'un fichier CORS autorisé puis URL refusée | Fichier autorisé importé ; erreur explicite pour URL refusée/HTML/404/vide, sans collection contaminée |
| C-11 | Affichage clair/sombre/auto, réglages et menus au clavier | Contraste lisible, focus identifiable, navigation possible sans souris |
| C-12 | Historique, favoris, recherche, retour au panneau principal | Filtres fonctionnels, panneaux synchronisés |
| C-13 | « Enregistrer sous », variables dossier/date, export métadonnées | Nom et destination annoncés correctement ; aucune promesse d'édition du document métier |
| C-14 | Bouton plein écran, touche Échap | Entrée puis sortie du plein écran natif ; positionnement restauré |
| C-15 | Manifeste, installation PWA si éligible, lancement depuis icône | État navigateur/installable/standalone explicite. L'absence de proposition doit être diagnostiquée, pas masquée |
| C-16 | Versions historiques 0.1 à 0.7 depuis la page des versions | Liens ouvrables et interface distincte ; contrôler au moins une fonction emblématique de chaque archive |

## Formulaire compact de preuve

Pour chaque environnement, consigner :

```yaml
candidate: "Core 3.10 TEST / Lab 0.8"
branch_or_commit: ""
device: "PC Linux Chrome | Android Chrome"
browser_version: ""
screen_px: ""
orientation: "portrait | paysage"
url: ""
date_fr: ""
cases:
  C-01: "PASS | FAIL | BLOCKED | N/A"
  C-02: "PASS | FAIL | BLOCKED | N/A"
  # C-03 ... C-16
failures:
  - id: ""
    reproduction: ""
    observed: ""
    expected: ""
    screenshot_or_log: ""
decision: "GO TEST | NO-GO | GO CURRENT explicitement autorisé"
reviewed_by: ""
```

## Critères de décision

- **GO TEST :** CI Core ciblée PASS, revue visuelle sans régression P0, scénarios C-01 à C-16 documentés, anomalies connues isolées et non trompeuses.
- **NO-GO :** version non identifiable, panne import/fichier, régression fenêtre/tablette, perte d'état, rupture d'archives ou sécurité insuffisante.
- **GO CURRENT :** décision distincte et explicite après acceptation réelle. Ni la fusion de PR ni la présence du manifeste ne constituent ce GO.
- La suite exhaustive spécialisée Image doit rester visible : [PR #94](https://github.com/nepheris/nLab-web/pull/94) corrige son scénario CI sur une branche indépendante. Elle ne prouve pas une validation matérielle du Core.

## Plan de retour arrière

Ne jamais déplacer le pointeur CURRENT avant décision de promotion ; figer la révision candidate, conserver le registre canonique et les snapshots versionnés. Toute adoption par un Studio métier se fait en **PR isolée opt-in**, avec sa propre suite et son chemin historique. En cas de régression, revenir au dernier pointeur CURRENT et désactiver uniquement l'option Core nouvellement adoptée ; ne pas supprimer les archives.
