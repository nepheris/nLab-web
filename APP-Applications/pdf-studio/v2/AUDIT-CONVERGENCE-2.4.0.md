# PDF Studio — Audit de convergence 2.4.0

Date: 2026-10-01

## Versions en cours

- CURRENT: 0.9.10
- TEST: 2.4.0
- Référence historique de convergence: 0.9.8 → 0.9.25, 1.0.0 → 1.0.3, 2.0.0 → 2.4.0

La promotion de 2.4.0 en CURRENT reste interdite tant que les écarts historiques marqués PARTIEL ou EXTERNE ci-dessous ne sont pas arbitrés/testés.

## Parité fonctionnelle

| Domaine | Origines historiques | État 2.4.0 | Notes |
|---|---|---|---|
| Entrées locales / multi-fichiers / dossiers | 0.9.x, 1.0.x | COMPLET TEST | Core V2 + collection browser |
| Workspace ZIP local | 0.9.21, 1.0.0 | PARTIEL | ZIP de sortie actif, workspace ZIP éditable historique à reprendre si toujours utile |
| Google Drive / OAuth / Picker | 0.9.18–0.9.25, 1.0.x | INCOMPLET | bloc majeur restant |
| Sortie navigateur / dossier local / ZIP | 0.9.x, 1.0.x | COMPLET TEST | OutputService V2 |
| Sortie même dossier source | 0.9.21–0.9.25 | PARTIEL | dépend des handles réellement disponibles |
| Nommage / variables / classement | 0.9.14+, 1.0.x | COMPLET TEST | TemplateEngine commun |
| Pages / sélection / rotation / extraction / fusion | 0.9.x, 1.x, 2.1.4 | COMPLET TEST | rotation libre de page reste extension DEV |
| Tampons / 5 dates | 0.9.14–0.9.19 | COMPLET TEST | usage + éditeur séparés en 2.4 |
| Éditeur de tampons | 0.9.16–0.9.19 | COMPLET TEST | catégories, exemples, préfixe/suffixe, édition/copie/suppression |
| JSON tampons historique | 0.9.16–0.9.19 | COMPLET TEST | import/fusion + export JSON |
| Règles nommage liées aux tampons | 0.9.14–0.9.17 | COMPLET TEST | activation explicite dans l’usage du tampon |
| Annotations / objets | 0.9.x, 1.x | COMPLET TEST | texte, surlignage, stylo, image, tampon, manipulation objet |
| OCR | 1.0.x / historique | COMPLET TEST | moteur quick + Studio spécialisé |
| Optimisation | 0.9.21, 1.x | COMPLET TEST | DPI/JPEG/gris |
| Traduction bilingue | 0.9.22+, 1.x | COMPLET TEST | endpoint configurable |
| Signature visuelle | 0.9.x, 1.x | COMPLET TEST | image + dessin local |
| PAdES / DSS | 0.9.16+, 1.x | EXTERNE | runtime actif, validation finale nécessite DSS réel |
| QR / Data Matrix / Code128 / GS1 / EAN | 0.9.12+, 1.x | COMPLET TEST | moteur partagé |
| En-tête / pied / QR variable | 1.0.0 | COMPLET TEST | QR restauré en 2.4 |
| Recadrage | 1.x | COMPLET TEST | CropBox |
| PDF → TXT/PNG/JPEG | 1.x | COMPLET TEST | |
| PDF → DOCX/ODT | 1.0.0 | COMPLET TEST | fidélité texte/structure |
| Office/image/texte → PDF | 1.x / 2.x | COMPLET TEST | selon formats pris en charge par le loader |
| Formulaires | 0.9.11+, 1.x | COMPLET TEST pour le périmètre historique principal | inspection, texte, remplissage JSON, flatten |
| Caviardage | 0.9.14+, 1.x | COMPLET TEST | rasterisation finale |
| Comparaison texte | 0.9.12+, 1.x | COMPLET TEST | |
| Comparaison visuelle/pixel | cible 1.x/2.x | PARTIEL | second temps |
| Batch nettoyage métadonnées | 1.0.0 | COMPLET TEST | ZIP |
| Pipeline batch multi-opérations | Core V2 | PARTIEL | second temps |
| Sécurité AES-256 | 2.x | COMPLET TEST | qpdf WASM |
| Métadonnées | 1.x/2.x | COMPLET TEST | lire/modifier/nettoyer |
| Historique persistant | 1.x/2.x | COMPLET TEST | export JSON restauré |
| Fit largeur / Fit page | historique viewer | COMPLET TEST | Fit page restauré 2.4 |
| Profil personnel portable | 0.9.17+, 2.1.x | COMPLET TEST | ZIP + assets + préférences |

## Passe rapide 2.4.0 réalisée

- restauration PDF → DOCX et ODT;
- batch nettoyage métadonnées en ZIP;
- Fit page;
- export JSON de l’historique;
- signature dessinée;
- QR variable dans en-tête/pied;
- formulaires et batch reclassés TEST lorsqu’ils ont des handlers réels;
- séparation Tampons en « Utiliser » et « Éditeur »;
- éditeur avec création, modification, copie, suppression;
- catégories de tampons;
- exemples historiques rapides;
- préfixe/suffixe de fichier liés au tampon;
- import/export JSON de bibliothèque de tampons;
- compatibilité des principaux champs JSON historiques.

## Second temps recommandé

1. Google Drive/OAuth/Picker et workspace Drive complet.
2. Sortie « même dossier que la source » avec stratégie de handles fiable.
3. Workspace ZIP réellement éditable si cette fonction reste nécessaire.
4. Comparaison visuelle/pixel.
5. Pipeline batch multi-opérations et presets.
6. Compatibilité de migration de toute ancienne configuration JSON au-delà des tampons.
7. Tests live DSS/PAdES.
8. Conversion Office haute fidélité via moteur externe si requise.

## Règle de validation

Une fonction n’est considérée COMPLETE que si:
- son UI est présente;
- un handler/runtime réel est raccordé;
- elle n’est pas désactivée/placeholder;
- son contrat statique passe;
- un test navigateur couvre le scénario principal lorsque réalisable localement.

Les fonctions EXTERNES peuvent être validées contractuellement localement mais nécessitent un test avec le service réel avant promotion CURRENT.
