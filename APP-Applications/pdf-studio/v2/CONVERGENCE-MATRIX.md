# PDF Studio V2 — Matrice de convergence

Référence de convergence : cumul fonctionnel le plus avancé des séries 0.9.x, 1.0.x et fonctions TEST/DEV validées.

| # | Domaine | Cible V2 | État 2.0.2 |
|---:|---|---|---|
| 0 | Configuration & espace personnel | préférences, identité, presets, espace personnel | PARTIEL / Core |
| 1 | Entrée | fichiers, dossiers, multi-fichiers, drag & drop, type-aware capabilities | TEST |
| 2 | Sortie & classement | save, save as, classement, collision, preview sortie | PARTIEL |
| 3 | Nommage | templates, préfixes, suffixes, variables | PARTIEL |
| 4 | Pages & portée | sélection, ajout, suppression, rotation, réorganisation | TEST |
| 5 | Tampons & 5 dates | tampons dynamiques, initiales, dates | DEV visible |
| 6 | Annotations & objets | texte, surligneur, stylo, image, gomme, objet actif | DEV visible |
| 7 | OCR | rapide + bascule OCR Studio | DEV / capability déclarée |
| 8 | Optimisation & compression | DPI/JPEG/gris + structural compression | DEV / capability déclarée |
| 9 | Traduction bilingue | rapide + Studio avancé | DEV / capability déclarée |
| 10 | Signature & espace personnel | manuscrite, initiales, P12/PFX | DEV visible |
| 11 | QR & code-barres | rapide + Code Studio | DEV / capability déclarée |
| 12 | En-tête · pied · recadrage | composeur, pagination, QR, crop | DEV visible |
| 13 | Conversions | Office/PDF/images, simple + avancée | DEV / capability déclarée |
| 14 | Formulaires PDF | lecture/remplissage/création/flatten | DEV visible |
| 15 | Caviardage | marquage + application irréversible | DEV visible |
| 16 | Comparaison PDF | visuel/pixel/texte | DEV visible |
| 17 | Traitements batch | PipelineService + presets | TEST |
| 18 | Sécurité & métadonnées | metadata/chiffrement/PDF-A | DEV visible |
| 19 | Historique & diagnostics | historique, récents, undo/redo, diagnostics | TEST |

## Socle Core 2.0.2

- CapabilityRegistry commun.
- StudioContext pour le passage d'un Studio à l'autre et le retour au contexte d'origine.
- PipelineService composable.
- Détection de capabilities selon le type de fichier.
- DocumentSession partagé.
- Lazy rendering des pages et vignettes.
- Auto-tests de capabilities.
- Palette globale de commandes (Ctrl/Cmd+K).
- Presets de workflow enregistrables.
- Bibliothèque SVG centrale.
- IDs UI et métadonnées d'aide technique.
- Personnalisation des groupes du ruban.
- Panneau gauche type classeur, redimensionnable et mémorisable.
- Toutes les sections repliables avec Tout plier / Tout déplier.
- Viewer multipage : page directe, première/dernière, zoom direct, nombre libre de pages par largeur.
- Preview légère réutilisant le même moteur de pages : sélection, ajout, suppression, drag & drop pour réordonner.

## Règle de promotion

Une fonction historique ne peut être considérée migrée que si sa capability est présente, sa surface UI est adressable par ID, son statut est explicite et son comportement principal a un test ou diagnostic associé. Une fonction non reconnectée reste visible en DEV au lieu de disparaître.
