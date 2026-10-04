# nLab Icon Sets

## Contract

Le code fonctionnel manipule des identifiants stables d'icônes.  
Un jeu d'icônes remplace uniquement le dessin.

Chaque jeu doit conserver exactement les mêmes chemins relatifs et noms de fichiers :

- `functions/save.svg`
- `functions/stamp.svg`
- `functions/color-picker.svg`
- `ui/collapse.svg`
- `ui/expand.svg`
- `ui/chevron-down.svg`
- etc.

Le jeu par défaut est `nlab-line`.

## Ajouter un nouveau jeu

Copier `sets/nlab-line/` vers par exemple `sets/nlab-solid/`, remplacer les SVG sans renommer les fichiers, puis ajouter le jeu à `sets/index.json`.

Les SVG monochromes doivent privilégier `currentColor` afin de rester compatibles avec les thèmes et le color picker.
