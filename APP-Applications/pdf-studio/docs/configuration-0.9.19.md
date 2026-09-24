# nLab PDF Studio — configuration Alpha 0.9.19 TEST

## Architecture de configuration

La 0.9.19 utilise deux niveaux seulement :

1. **Configuration globale de l’application** : \`config/app-config.v1.json\`.
   - syntaxe et formats des variables ;
   - bibliothèque de tampons fournie par l’application ;
   - paramètres OAuth Google publics ;
   - arborescence Drive cible ;
   - valeurs par défaut du workspace.
2. **Configuration personnelle** : \`nlab-pdf-studio-workspace.json\`.
   - identité/initiales ;
   - formats personnalisés ;
   - tampons personnels et surcharges ;
   - règles de préfixe/suffixe et de nommage ;
   - favoris ;
   - préférences d’édition ;
   - références des signatures/paraphes.

Les anciens JSON séparés placés dans \`appDataFolder\` ne sont plus la source active de la configuration. Ils restent uniquement compatibles avec les anciennes versions pour migration/retour arrière.

## Variables communes

La syntaxe canonique est la même dans les tampons, préfixes, suffixes, noms de fichiers, textes rapides et en-têtes/pieds :

\`\`\`text
{VARIABLE}
{VARIABLE:FORMAT}
\`\`\`

Exemples :

\`\`\`text
{STAMP_DATE:DD/MM/YYYY}
{DATE_B:YYYY-MM-DD}
{NOW:YYYYMMDD_HHmmss}
{TIMESTAMP}
{FILENAME}
{INITIALS}
\`\`\`

Tokens de format : \`YYYY\`, \`YY\`, \`MMMM\`, \`MMM\`, \`MM\`, \`M\`, \`DD\`, \`D\`, \`HH\`, \`H\`, \`mm\`, \`m\`, \`ss\`, \`s\`, \`SSS\`, \`Z\`, \`ZZ\`, \`X\`, \`x\`.

Les anciens alias \`{STAMP_DATE_FMT}\`, \`{DATE_A_FMT}\`, \`{DATE_B_FMT}\`, \`{DATE_C_FMT}\` et \`{DATE_D_FMT}\` restent acceptés.

## Cinq dates de tampon

Le générateur affiche explicitement :

- \`STAMP_DATE\` — date principale du tampon ;
- \`DATE_A\` ;
- \`DATE_B\` ;
- \`DATE_C\` ;
- \`DATE_D\`.

Chaque date possède son champ de date et son format personnel. Les cinq variables sont utilisables dans le texte du tampon et dans les règles de nommage.

## Google OAuth / espace personnel

Le bouton **Se connecter** du bandeau ouvre la sélection de compte Google. Après authentification, PDF Studio crée/utilise :

\`\`\`text
Mon Drive/
└── nLab/
    └── PDF Studio/
        ├── nlab-pdf-studio-workspace.json
        ├── Signatures/
        ├── Documents/
        └── Exports/
\`\`\`

Le scope utilisé est :

\`\`\`text
openid email profile https://www.googleapis.com/auth/drive.file
\`\`\`

### Client ID OAuth Web requis

Le Client ID est un identifiant public et peut être placé dans \`config/app-config.v1.json\`. **Ne jamais publier de client secret.**

Dans Google Cloud Console :

1. activer **Google Drive API** pour le projet ;
2. configurer l’écran de consentement OAuth ;
3. créer un identifiant **OAuth 2.0 Client ID — Web application** ;
4. ajouter l’origine JavaScript autorisée du site nLab Web (par exemple l’origine GitHub Pages utilisée pour le déploiement) ;
5. copier uniquement le \`client_id\` de la forme \`....apps.googleusercontent.com\` dans \`auth.google.clientId\`.

Tant que ce Client ID réel n’est pas renseigné, l’application conserve le mode local et affiche la configuration OAuth comme incomplète.

## Back-end APP13

L’espace personnel Drive n’a pas besoin d’un back-end serveur : l’accès se fait directement par Google Identity Services + Drive API.

APP13 reste un service séparé réservé aux fonctions de confiance (validation PAdES, Trusted Lists, OCSP/CRL, TSA, extension LT/LTA). Son authentification doit être indépendante de la simple connexion Drive et ne doit pas utiliser Google OAuth comme preuve d’identité eIDAS.
