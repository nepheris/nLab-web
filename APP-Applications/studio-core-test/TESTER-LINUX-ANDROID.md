# Kit autonome — validation de Studio Core 3.10 TEST / Lab 0.8

Le kit est un export **exact du commit GitHub vérifié par la CI**. Il conserve les dépendances nécessaires, le corpus synthétique, les historiques et l'identité graphique nLab, mais **ne modifie ni CURRENT ni le site en ligne**.

## 1. Sur un ordinateur Ubuntu/Linux avec Chrome

1. Dans la [PR #93](https://github.com/nepheris/nLab-web/pull/93), ouvrir le dernier contrôle réussi **Studio Core Test Lab Acceptance** puis télécharger l'artifact `nlab-core-3.10-test-kit`.
2. Décompresser l'archive GitHub (une fois), puis décompresser `core-test-kit.zip`. Entrer dans le dossier `nlab-core-3.10-test`.
3. Lancer dans un terminal :

```bash
python3 scripts/run-core-test-preview.py --check
python3 scripts/run-core-test-preview.py
```

Le navigateur ouvre automatiquement `http://localhost:8765/APP-Applications/studio-core-test/`. S'il ne s'ouvre pas, recopier cette adresse dans Chrome. Pour arrêter, presser `Ctrl+C` dans le terminal.

**Important :** ne pas ouvrir `index.html` en `file://` : les imports de modules, les `fetch` et certains services ne fonctionneraient pas.

## 2. Test Android sur le même réseau Wi‑Fi

Exécuter le serveur sur le PC avec :

```bash
python3 scripts/run-core-test-preview.py --lan
hostname -I
```

Sur Android, remplacer `IP_LOCALE_DU_PC` par l'IP IPv4 réellement fournie :

```text
http://IP_LOCALE_DU_PC:8765/APP-Applications/studio-core-test/
```

Le PC et le téléphone doivent être sur le même réseau et le pare-feu doit autoriser le port 8765. Attention : `--lan` publie ce dossier sur le réseau local en **HTTP non authentifié**. Ne pas l'activer sur un réseau public ; l'arrêter après les tests.

Cette approche permet de tester le **rendu, la navigation, les fichiers, les panneaux et les interactions tactiles**, mais elle **ne valide pas l'installation PWA Android ni les API réservées à un contexte HTTPS sécurisé**. Une recette PWA sur URL HTTPS sera nécessaire séparément.

## 3. Scénarios de recette

Consulter `APP-Applications/studio-core-test/ACCEPTANCE-CHECKLIST-3.10.md`. Dérouler C-01 à C-16 en notant PASS / FAIL / BLOCKED, le modèle d'appareil, la version de Chrome et une capture pour chaque problème.

Ordre conseillé : identité visuelle/rail/ruban → fenêtres → collection/vignettes → profil/date/noms → historique et thème → responsive → plein écran/PWA.

Le profil et les préférences sont **locaux au navigateur**. Employer des valeurs fictives pour les tests. Les rotations visuelles et l'export du laboratoire ne modifient pas les fichiers métiers.

## 4. Historique / limites du kit

- Les liens `0.1.0` à `0.7.0` restent disponibles dans le kit ; il s'agit de vérifications de non-régression, pas de promotions.
- Le kit contient aussi les fichiers du site et du corpus commun : il **n'a pas vocation à être publié comme site accessible sur Internet**.
- La CI confirme l'exécution Chrome Linux en environnement automatisé. Elle ne remplace pas un essai tactile sur Android réel.
- **La promotion du Core vers CURRENT est soumise à validation explicite.**
