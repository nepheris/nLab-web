# Google OAuth — PDF Studio 0.9.18

PDF Studio utilise Google Identity Services dans le navigateur.

## Client OAuth à créer

Type : **Web application**.

Origine JavaScript autorisée :

- `https://nepheris.github.io`

Aucun client secret ne doit être ajouté à `nLab-web`.

Le Client ID public obtenu a la forme :

`xxxxxxxx.apps.googleusercontent.com`

Il peut être saisi dans **Espace personnel nLab → Client ID OAuth Web Google nLab**.

## Scopes demandés

- `openid`
- `email`
- `profile`
- `https://www.googleapis.com/auth/drive.file`

Le scope `drive.file` limite l'application aux fichiers qu'elle crée ou que l'utilisateur lui ouvre explicitement.

## Dossier créé

Après la première connexion :

```text
Mon Drive/
└── nLab/
    └── PDF Studio/
        ├── nlab-pdf-studio-workspace.json
        ├── Signatures/
        ├── Documents/
        └── Exports/
```

Le workspace JSON est la source unique de configuration. Les images de signature/paraphe restent des fichiers séparés et le workspace les référence par leur ID Drive.

## Sélection du compte

La connexion appelle Google Identity Services avec `prompt: select_account`, pour laisser choisir explicitement le compte Google.

## À ne jamais publier

- client secret OAuth ;
- mot de passe P12/PFX ;
- clé privée ;
- secret TSA ;
- jeton d'accès OAuth.
