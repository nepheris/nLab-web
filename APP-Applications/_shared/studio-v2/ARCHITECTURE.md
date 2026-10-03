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


## Responsive contract

Studio Core is responsible for responsive behavior. Specialized Studios and derived apps must not create incompatible layout systems.

Required targets:
- phone / touch;
- tablet;
- desktop;
- wide desktop.

Shared controls must keep usable touch targets, keyboard focus, readable contextual help and predictable window/panel behavior at every target size.

Acquisition-oriented Studios may additionally use camera/mobile-photo capabilities, but remain the same web application across device classes.

## Derived applications

A derived app exposes a constrained capability subset of one or more canonical Studios.

Rules:
- reuse the canonical engine/service;
- reuse Studio Core UX and metadata;
- declare the parent Studio and consumed capabilities;
- keep advanced functionality in the parent Studio;
- provide an escalation action back to the specialized Studio;
- never fork a processing engine only to simplify the UI.

First reference implementation: `APP-Applications/pdf-sign/`, derived from PDF Studio.

## Release metadata contract

Mutable release information must not be hard-coded in Studio HTML/JS.

The Core resolves:
- semantic version and CURRENT/TEST channel from the version registry;
- commit SHA and commit date from a generated build manifest or Git metadata;
- source path from the Studio manifest.

All headers, footers, About views, version pages and Studio Hub cards must consume that shared metadata.
