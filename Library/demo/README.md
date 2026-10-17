# nLab DEMO CORPUS — bibliothèque partagée

- [Galerie publique](https://nepheris.github.io/nLab-web/Library/demo/)
- [Index des manifestes](./manifests/index.json)
- [Index machine de tous les fichiers](./manifests/catalogue-complet.json) (régénéré automatiquement)
- [Audit des sources Drive](./manifests/audit-sources.json)
- [Jeu Scan2D dans Images](./files/demo-input/Images/Scan2D/)
- [Image Studio V2](../../APP-Applications/image-studio/v2/)
- [Scan Studio V2](../../APP-Applications/scan-studio/v2/)

## Maintenance

Les fichiers du dépôt web appartiennent uniquement à la bibliothèque publique de démo. Les originaux Scan2D et leurs SHA-256 restent dans le dépôt APP17 de `nepheris/nLab`. Les copies publiques byte-identiques sont sous `files/demo-input/Images/Scan2D`.

Ajouter d'abord un fichier local de démonstration autorisé, puis une ligne dans le manifeste concerné (`manifests/image.json`, `office.json`, etc.). Ne pas changer les vieux cas de régression. La CI reconstruit `catalogue-complet.json` et actualise les compteurs de `manifests/index.json`. En local : `python3 Library/demo/rebuild_demo_index.py`.

`storage=local` signifie que le fichier **doit exister** dans le miroir nLab-web. `storage=reference-only` est une référence **non téléchargeable** et ne crée pas de lien public. Une source Drive brute n'est pas approuvée automatiquement, surtout pour photos personnelles et datasets tiers.

La feuille de route technique Maker est dans `nepheris/nLab-Maker-Framework/docs/project/SCAN2D_MAKER_STUDIOS_ROADMAP.md`.
