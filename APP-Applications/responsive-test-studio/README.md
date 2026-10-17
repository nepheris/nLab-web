# Responsive Test Studio — 0.3.1 TEST

Studio de prévisualisation web rapide, indépendant du Core Lab, accessible via le catalogue nLab Studios.

## Usage

1. Coller une URL HTTP(S), relative ou absolue, puis **Afficher**.
2. Choisir le profil ordinateur, tablette, téléphone ou petit téléphone. Pour **ordinateur**, le menu **Résolution écran** propose 21 formats standards : VGA/SVGA/XGA (4:3), SXGA (5:4), WXGA/16:10, HD/Full HD/QHD/4K (16:9), ultra-wide/cinéma. Valeur ordinateur par défaut **1280 × 800 (16:10)**. Dimensions personnalisées autorisées de 240 à 4096 px.
3. Tourner entre portrait et paysage ; l'iframe applique les dimensions CSS de l'écran, sans changer l'User-Agent ni les permissions du système.
4. Utiliser **Vue double** pour comparer la même URL dans deux iframes côte à côte (dimensions inversées portrait/paysage). Leurs navigations deviennent indépendantes après leur chargement initial ; une nouvelle URL recharge les deux.
5. Utiliser **Ajuster** pour visualiser les écrans entiers ; le zoom visuel ne change pas la résolution CSS.
6. Dans la palette flottante **Réglages d’écran**, choisir directement **Auto | Clair | Sombre**, à côté des commandes d’orientation. Le header conserve le **sélecteur de thème nLab standard**. Ces commandes utilisent la même préférence partagée et restent synchronisées (palette → header et header → palette). La préférence est partagée avec les autres pages nLab via le shell existant. Cela change le Studio hôte ; le thème du site distant dépend du site et de ses propres préférences.
7. L'option **Recharger le site au changement de format** est activée initialement pour les sites qui n'évaluent le responsive qu'au démarrage. Désactiver pour tester les événements de redimensionnement en conservant l'état du site.

8. **Zoom précis (5–300 %)** : curseur progressif, boutons +5 / −5 points, valeur numérique éditable. **★ Sauver zoom** mémorise l'échelle préférée dans le navigateur. Le menu conserve les valeurs Ajuster / 100 / 75 / 50 / 25 / Sur mesure.
9. **⛶ Plein écran** : seul l'atelier contenant les iframes et la palette de réglages passe en plein écran via l'API native du navigateur. Bouton **⚙ Réglages** utilisable directement en plein écran ; cliquer de nouveau sur ⛶ (ou utiliser Échap) pour en sortir. Une permission navigateur peut être requise.

**Précision :** dans un iframe, les media queries CSS, innerWidth, innerHeight et les événements resize suivent bien les dimensions de l'iframe. L'User-Agent, les permissions Android, l'émulation tactile et les capteurs ne sont pas simulés par un iframe. Un site tiers peut refuser le chargement (CSP frame-ancestors / X-Frame-Options). Aucun contournement n'est prévu.

## Versions et stabilité

- **0.3.1 TEST** : header et CSS nLab standard restaurés ; les boutons de thème Auto/Clair/Sombre sont déplacés dans la palette « Réglages d’écran », synchronisés avec la sélection du header. Toutes les fonctions de 0.3.0 restent disponibles.
- **0.3.0 historique** : version native autonome avec ses boutons de thème dans le header, préservée sous versions/0.3.0/.
- **0.2.0 historique** : version native autonome sous versions/0.2.0/ (moteur CSS, shell, runtime et UI figés).
- **0.1.0 historique** : instantané natif autonome sous versions/0.1.0/ (JS/CSS copiés) ; pas de dépendance au nouveau moteur.
- Aucune version CURRENT n'est sélectionnée. Les autres Studios et leurs versions historiques restent inchangés.

## Tests

Workflow GitHub Actions Responsive Test Studio TEST Acceptance : Chromium/Chrome Linux, bureau et viewport étroit, simulation tactile de contrôles, double vue, rotation/reload, changement de thème et métriques CSS same-origin.

Un test sur téléphone Android réel reste nécessaire pour les API/permissions natives, caméra, clavier tactile et navigateur mobile.
