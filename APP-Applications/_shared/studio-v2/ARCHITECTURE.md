# nLab Studio Core V2

## Règle fondamentale

Il existe un seul corps d'interface physique : `APP-Applications/_shared/studio-v2/`.

Un Studio V2 ne recopie jamais le header, les menus, le ruban, la barre contextuelle, la barre d'état, le système de pliage, la gestion de versions ou les repères d'architecture.

Chaque Studio fournit uniquement :
- un manifest déclaratif ;
- son moteur métier ;
- ses sections et paramètres spécifiques.

## Statuts fonctionnels

- Fonction validée/testée : rendu normal.
- Fonction présente mais non recettée, jeune ou partielle : `status: "development"`, rendu jaune.
- Fonction non implémentée : ne doit pas être présentée comme opérationnelle.

## Repères temporaires de développement

Chaque élément du manifest peut déclarer :
- `scope: "core"`
- `scope: "studio"`

Quand « Repères architecture » est activé :
- CORE = bleu + soulignement + badge CORE ;
- STUDIO = violet + soulignement + badge STUDIO ;
- DEV reste jaune et conserve le trait de scope.

Ce mode est un outil de développement et pourra être désactivé sans modifier les Studios.
