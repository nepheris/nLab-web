# nLab PDF Studio — Configuration Alpha 0.9.12

> Alpha 0.9.12 est une version TEST / RC. La CURRENT reste 0.9.10 jusqu'à validation.

## 1. Classement chronologique programmable

Le modèle de chemin accepte du texte libre, des séparateurs `/` et les variables suivantes :

| Variable | Exemple |
|---|---|
| `{YYYY}` | 2026 |
| `{YY}` | 26 |
| `{MM}` | 09 |
| `{M}` | 9 |
| `{MMM}` | sept. |
| `{MMMM}` | septembre |
| `{DD}` | 18 |
| `{D}` | 18 |
| `{WW}` | 38 |
| `{W}` | 38 |
| `{WEEK}` | S38 |
| `{WEEK_YEAR}` | 2026 |
| `{Q}` | trimestre |

Exemples :
- `{YYYY}/{MM} - {MMMM}`
- `{YYYY}/S{WW}`
- `{YYYY}/{MM}/S{WW}`
- `Archives/{YYYY}/{MMMM}`

## 2. JSON de configuration

Les exemples publics sont :
- `config/user-config.example.json` — profil opérateur, sortie, modèle de classement et formats de dates.
- `config/stamps-v3.example.json` — bibliothèque de tampons.
- `config/google-auth.example.json` — paramètres Google OAuth sans secret.

Dans le ZIP portable, les équivalents sont sous `config/`.

## 3. Tampons

Variables principales :
- `{INITIALS}`
- `{STAMP_DATE}` / `{STAMP_DATE_FMT}`
- `{DATE_A}`, `{DATE_B}`, `{DATE_C}`
- `{DATE_A_FMT}`, `{DATE_B_FMT}`, `{DATE_C_FMT}`

Un format ponctuel peut être demandé :
- `{DATE_A:YYYY-MM-DD}`
- `{DATE_B|D MMMM YYYY}`

Formats de date disponibles : `YYYY`, `YY`, `MM`, `M`, `DD`, `D`, `MMMM`, `MMM`, `WW`, `W`, `WEEK`, `WEEK_YEAR`, `Q`.

Les retours à la ligne sont autorisés dans un modèle. Exemple :

```
AFFICHÉ - {INITIALS}
À afficher jusqu’au {DATE_B_FMT}
```

Chaque tampon peut aussi définir :
- un préfixe de nom de fichier ;
- un suffixe de nom de fichier ;
- un préfixe de texte ;
- un suffixe de texte.

Exemples : `_AF`, `_NC`, `_NCF`, ou `VAL_`.

## 4. Google et signatures

Sur la publication publique, les signatures/paraphes personnels restent verrouillés tant qu'un compte Google n'est pas connecté.

Scope prévu : `https://www.googleapis.com/auth/drive.appdata`.

Le Client ID OAuth Web peut être public ; **aucun client secret ne doit être embarqué dans le site statique**.

Le fichier P12/PFX et son mot de passe restent en mémoire locale et ne sont pas stockés dans Google Drive.

## 5. Sécurité et caviardage

**Nettoyer métadonnées** efface les champs descriptifs courants (titre, auteur, sujet, mots-clés, etc.). Ce n'est pas une purge forensique complète de tous les objets PDF.

**Caviardage destructif** rasterise les pages concernées après application des zones noires. Cela supprime la couche texte native sous ces zones, mais la page perd sa qualité vectorielle et sa couche texte. Toujours conserver l'original.

Le chiffrement AES-256 / qpdf-WASM reste en développement.
