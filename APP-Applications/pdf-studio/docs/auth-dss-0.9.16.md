# nLab PDF Studio — Authentification, espace personnel et passerelle DSS

## État cible

La publication GitHub Pages reste un client statique et public. Les fonctions privées sont séparées en deux niveaux :

1. **Espace personnel Google Drive** : stockage applicatif privé des signatures/paraphes et du JSON de tampons dans `drive.appdata`.
2. **Service nLab DSS privé** : validation/extension PAdES, Trusted Lists, OCSP/CRL, TSA et traitements de confiance qui ne doivent pas être exécutés comme une simple logique statique GitHub Pages.

La connexion Google permet d'autoriser l'accès à l'espace applicatif Drive. Elle ne constitue pas, à elle seule, une identité de signature eIDAS.

## JSON personnel de tampons

Fichier applicatif :

`nlab-pdf-studio-stamps-v4.json`

Schéma minimal :

```json
{
  "schema": "nlab-pdf-stamps/v4",
  "updatedAt": "2026-09-24T00:00:00.000Z",
  "dateFormats": {
    "STAMP": "DD/MM/YYYY",
    "A": "DD/MM/YYYY",
    "B": "D MMMM YYYY",
    "C": "YYYY-MM-DD",
    "D": "DD/MM/YYYY"
  },
  "stamps": []
}
```

Les variables de tampon sont partagées par le texte et les règles de nommage :

- `{STAMP_DATE}`, `{STAMP_DATE_FMT}`
- `{DATE_A}`, `{DATE_A_FMT}`
- `{DATE_B}`, `{DATE_B_FMT}`
- `{DATE_C}`, `{DATE_C_FMT}`
- `{DATE_D}`, `{DATE_D_FMT}`
- formats ponctuels comme `{DATE_D:YYYYMMDD}`
- `{INITIALS}`, `{FILENAME}`

## Service nLab DSS

Le frontend 0.9.16 attend un adaptateur nLab devant DSS. Il ne suppose pas que DSS expose directement ces URLs.

### GET /api/v1/health

Réponse JSON indicative :

```json
{
  "service": "nlab-signature-service",
  "status": "ok",
  "dssVersion": "6.5",
  "trustedLists": "ready"
}
```

### POST /api/v1/validate

`multipart/form-data`

- `document` : PDF à valider.

Réponse JSON : résumé de validation + informations de signature/certificats/horodatage. Les rapports DSS complets peuvent être exposés séparément.

### POST /api/v1/pades/extend

`multipart/form-data`

- `document` : PDF signé.
- `level` : `PAdES_BASELINE_T`, `PAdES_BASELINE_LT` ou `PAdES_BASELINE_LTA`.

Réponse attendue : `application/pdf` avec la nouvelle révision si l'extension est possible.

## Règles de sécurité

- Aucun client secret OAuth, mot de passe P12/PFX, clé privée ou secret TSA dans `nLab-web`.
- Le P12/PFX et son mot de passe restent en mémoire locale lorsque la signature navigateur est utilisée.
- Un service DSS doit être authentifié, journalisé et isolé de la publication statique.
- Les clés privées serveur doivent utiliser un stockage adapté (PKCS#11/HSM/KMS ou équivalent) si un jour le serveur signe lui-même.
- Les contrôles eIDAS/Trusted Lists/OCSP/CRL/TSA sont des fonctions de validation de confiance et ne doivent pas être remplacés par un simple contrôle `ByteRange`.
- L'interface doit distinguer : signature visuelle, signature cryptographique, validation de certificat, niveau PAdES et statut de confiance.

## Version DSS visée

Le socle cible est DSS 6.5, avec Java 17+ et les modules nécessaires à PAdES/validation. Le backend doit suivre les évolutions des Trusted Lists européennes.
