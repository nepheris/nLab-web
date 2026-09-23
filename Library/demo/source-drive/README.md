# nLab DEMO — source Google Drive

Le dossier Google Drive suivant est la **source canonique éditable** du corpus de démonstration :

- Folder ID : `1zQb7Lyep6G0rOt-xv_vUcF-U1JvjtNIJ`
- Organisation : `demo-input/` + `demo-output/`

## Principe de publication

Le site public ne lit pas directement le Drive à l'exécution. Une synchronisation authentifiée sélectionne les fichiers approuvés, les transforme si nécessaire, puis le build GitHub Pages produit un miroir public autonome.

### Règles

1. Données personnelles / coordonnées tierces : **jamais publiées brutes** ; utiliser un dérivé masqué.
2. Données tierces : vérifier les droits/licences avant republication.
3. JSON métier nLab : publier de préférence des sous-ensembles de démonstration qui conservent la structure.
4. Le Drive reste la source de maintenance ; le dépôt public conserve les dérivés approuvés nécessaires au build reproductible.
