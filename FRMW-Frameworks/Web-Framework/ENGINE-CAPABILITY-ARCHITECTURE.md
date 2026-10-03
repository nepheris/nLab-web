# Web Framework — Engine/Capability Architecture

## Règle canonique

> **Studio = moteur spécialisé + interface de référence.**  
> **Framework Web = orchestration, thème, permissions, routage et intégration.**  
> **Application = composition des capacités nécessaires + logique métier.**

Une application nLab ne doit pas recopier une fonction déjà fournie par un moteur partagé ou un Studio de référence.

## Deux couches par Studio

```text
Studio
├── ENGINE / CORE
│   └── importable par le Framework et les applications
└── STUDIO UI
    └── interface complète de développement, démonstration, réglage et certification
```

## Convergence

```text
                         nLab
                          │
             ┌────────────┴────────────┐
             │                         │
          STUDIOS                 FRAMEWORK WEB
      UI de référence                orchestration
             │                         │
             └──────── engines ─────────┘
                          │
                 ┌────────┼────────┐
                 ↓        ↓        ↓
              CuisineX   RDC App   autres apps
```

## Capability Registry

Le fichier `capabilities.json` est la vue Framework des moteurs communs.  
Chaque module déclare des capacités atomiques, par exemple :

```json
{
  "id": "symbology-engine",
  "capabilities": [
    "qr.decode",
    "qr.encode",
    "qr.edit",
    "qr.export"
  ]
}
```

Une application exprime ses besoins par capacités plutôt que par copie de code.

## Contexte portable

Le contexte commun utilise `nlab-capability-context/v1` et peut transporter :

- `sourceApp`
- `sourceStudio`
- `targetStudio`
- `capability`
- `entityType`
- `entityId`
- `slot`
- `assetId`
- fichier / page / objets sélectionnés
- paramètres
- `returnTarget`
- `returnAction`
- historique

Exemple CuisineX :

```json
{
  "sourceApp": "CuisineX",
  "entityType": "recipe",
  "entityId": "REC-0042",
  "slot": "photos",
  "capability": "image.crop",
  "returnAction": "attach"
}
```

Le moteur ou le Studio spécialisé peut ainsi renvoyer le résultat exactement au bon endroit.

## Règle d'évolution

Quand une nouvelle fonction apparaît :

1. vérifier si une capability existe ;
2. sinon vérifier si elle est transverse ;
3. si transverse, enrichir le moteur partagé ;
4. le Studio spécialisé sert d'UI de référence et de banc de test ;
5. le Framework et les applications importent le moteur ;
6. ne pas réimplémenter la fonction dans une application métier.

## Migration

La consolidation reste en **V2**. Une V3 n'est pas justifiée pour la seule mutualisation interne tant que les contrats publics de Studio restent compatibles.
