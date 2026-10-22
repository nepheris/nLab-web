# Studio Core Test Lab — 0.8.0 TEST (Studio Core 3.10.0)

Le laboratoire `APP-Applications/studio-core-test/` vérifie les services **réels et partagés** du Studio Core. C'est une surface de validation isolée, **pas** un Studio métier ni une version CURRENT.

## Accès et versions

- Entrée TEST : `APP-Applications/studio-core-test/`.
- Registre canonique : `versions.json` (TEST = 0.8.0, CURRENT = aucun).
- Archives historiques : `versions/0.1.0/` à `versions/0.7.0/` ; ne pas les écraser, supprimer ou faire pointer vers les fichiers courants par inadvertance.
- Composants partagés : `APP-Applications/_shared/studio-v2/`; adoption **opt-in** uniquement. Les Studios métiers ne changent pas automatiquement.
- Source de vérité des versions du Core : `APP-Applications/_shared/studio-v2/version.json`.

## Fonctionnalités de la version 0.8.0

- Identité nLab, header, ruban, menus et fenêtre centrale conformes à la ligne graphique commune.
- Planche de travail responsive (auto, bureau, tablette, mobile), volets et fenêtres détachables, sidebar repliable, verrouillable et redimensionnable à la souris ou au clavier.
- Acquisition via le `input-picker` canonique ; collection de fichiers, miniatures, filtres et groupes par type/dossier/taille/nombre de pages.
- Sélection de fichiers, regroupement, tri, rotation visuelle de l'aperçu et annulation/rétablissement via les services partagés. **Les rotations ne modifient pas les octets source.**
- Historique partagé et favoris sans duplication de stockage ; thèmes clair/sombre/auto.
- Profil personnel local indépendant : variables typées, identité, dates A–D, export/import JSON (schéma version 1, clés autorisées, taille maximale 64 Ko, dates calendaires valides) ; aucun transfert distant.
- Formats de dates configurables visuellement et variables de nommage intégrées à « Enregistrer sous » ; export **de métadonnées uniquement** au format JSON, CSV ou TXT.
- Plein écran via `fullscreen-service.js` et mode application via `application-mode-service.js`.

## Vérifications automatiques

Le scénario Playwright `tests/studio-core-test-lab.mjs` couvre les trois profils bureau / tablette / mobile : disponibilité du Core, import de fichiers, Historique, panneaux, Undo/Redo, fenêtre Enregistrer sous, formats de dates, simulation responsive, import/export personnel, validation des dates (dont 29 février bissextile) et contraste sombre.

Workflow dédié : `.github/workflows/studio-core-test-lab.yml`.

Il faut distinguer :
- **CI ciblée Core / navigateur** : vérifie le code et les interactions simulées.
- **CI globale Studios métiers** : peut échouer indépendamment du Core, notamment sur le test exhaustif Image Studio préexistant ; ne pas masquer cet échec.
- **Recette sur matériel réel** : Chrome sous Linux et Chrome Android, entrée/sortie du plein écran, tactile, dossiers et fichiers, installation PWA quand éligible, historique et préférences conservées.

## Limitations et sécurité

- Le laboratoire n'édite pas les documents métiers : les exports concernent uniquement les métadonnées et la prévisualisation.
- La présence d'un manifeste ne garantit ni installation PWA, ni fonctionnement hors ligne. Un Studio doit fournir son propre manifeste/ressources et obtenir la validation du navigateur.
- Le plein écran natif et le mode PWA standalone sont **deux fonctions différentes**.
- Les chemins/dossiers sont soumis aux permissions navigateur ; les imports par URL tierce nécessitent une réponse CORS compatible.
- Les données du profil sont conservées dans le stockage local du navigateur ; l'export JSON personnel doit être stocké de manière privée.
- Ne promouvoir ni Core Lab vers CURRENT ni ses fonctions dans tous les Studios métiers avant la validation humaine et les contrôles de régression correspondants.

## Recette concrète et validation humaine

Le [protocole Core 3.10 C-01 à C-16](./ACCEPTANCE-CHECKLIST-3.10.md) est le **seul passage en GO/NO-GO réel** après les contrôles automatisés : PC Chrome/Linux et Android Chrome, plein écran, responsive tactile, sélection de fichiers, panneau détaché, profils, PWA et retour arrière.

Les correctifs du scénario global Image sont réconciliés dans la branche Core TEST depuis le 22/10/2026, à partir de la [PR Image #94](https://github.com/nepheris/nLab-web/pull/94) précédemment validée. Les résultats CI doivent être vérifiés sur le **dernier SHA de la PR Core #93** avant de déclarer le contrôle global réussi ; les résultats antérieurs de #94 ne s'y substituent pas.

## Décision de livraison

La PR 3.10 reste une version candidate TEST. Après CI ciblée, revue des erreurs globales, vérification des archives et validation réelle desktop/Android, planifier la propagation **par Studio et par capacité** sans duplication de code. Les anciennes versions CURRENT restent inchangées.
