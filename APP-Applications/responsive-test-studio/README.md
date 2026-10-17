# Responsive Test Studio — v0.1.0 TEST

Studio autonome de développement web et de vérification des interfaces responsive. **Distinct du Studio Core Lab**, mais réutilisable pour tester ce Lab et les autres Studios.

## Utiliser
- L'interface est une **page de test à part entière** : barre URL, iframe centré dans un cadre de dimensions précises et palette de réglages flottante, réductible et déplaçable sur ordinateur. La palette est repliée par défaut sur les écrans étroits.
- Changer de format, largeur, hauteur ou orientation ne remplace pas l'URL ouverte, ni ne recharge la page testée : seuls les dimensions du cadre changent. Le zoom « Ajuster » ne modifie pas le viewport CSS.
- Ouvrir `APP-Applications/responsive-test-studio/` depuis un serveur HTTP du dépôt (ou une publication TEST validée).
- Saisir l'URL à tester puis **Charger dans l'iframe**. Exemples directs : Hub Studios, PDF Studio, Image Studio, Scan Studio. La page conserve les mêmes données et règles que son URL originale ; aucun code métier n'est recopié.
- Profils : ordinateur 1440×900 paysage, tablette 768×1024 portrait / 1024×768 paysage, téléphone 393×852 portrait / 852×393 paysage, petit téléphone 360×800 portrait / 800×360 paysage.
- **Personnalisé** : largeur et hauteur entières entre 240 et 2560 pixels, plus permutation portrait/paysage.
- Échelle Ajuster / 100 % / 75 % / 50 % / 25 % : agit uniquement sur la taille *visuelle de la maquette*. L'iframe conserve son viewport CSS réglé.
- **★ Par défaut** : mémorise taille, profil et orientation dans le stockage local de ce navigateur. Pas de synchronisation serveur.
- **Ouvrir dans un onglet** : utile lorsque l'iframe est bloquée par l'URL cible.

## Installation rapide sous Ubuntu

```bash
git clone --depth 1 --branch responsive-test-studio-2026-10-17 https://github.com/nepheris/nLab-web.git
cd nLab-web
python3 -m http.server 8770 --bind 127.0.0.1
```

Puis ouvrir `http://127.0.0.1:8770/APP-Applications/responsive-test-studio/` dans Chrome.

Cette URL locale sert les fichiers du checkout TEST. **La version n'est pas encore déployée sur GitHub Pages.**

## Limites techniques et sécurité
- L'iframe agit sur les **dimensions CSS**, pas sur l'OS, le moteur de rendu Android, les sensors, les permissions, l'User-Agent, les capacités tactile ni le clavier virtuel.
- Les sites externes peuvent refuser l'intégration via `Content-Security-Policy: frame-ancestors` ou `X-Frame-Options`. Le Studio ne contourne pas ces protections ; la page externe ne peut pas être inspectée par du JavaScript de même origine.
- Les pages de test restent sous le contrôle du site cible ; ne pas coller des URLs sensibles avec des jetons d'authentification sur un poste partagé.
- Aucun fichier choisi pour un test n'est transmis par le **simulateur** lui-même. Le comportement de l'application affichée dépend de cette application.
- Il s'agit d'une **version TEST** isolée : le canal CURRENT et les versions historiques des Studios ne sont pas modifiés.

## Évolutions prévues : couche Android simulée — version distincte

1. Émulation Playwright via Chromium : `isMobile`, `hasTouch`, `deviceScaleFactor`, rotation et touch events, tests des zones tactiles ≥44×44 et débordements CSS. **L'application frontend ne peut pas produire cette simulation par CSS/iframe seul**.
2. Diagnostics de navigateur **same-origin uniquement** : `visualViewport`, réduction pour clavier simulé, métriques d'overflow, orientation, zoom CSS, interactions tactiles.
3. Captures et rapports par résolution enregistrés comme artefacts CI.
4. **Recette terminal Android réel** pour permissions fichier/photo/caméra, partage, clavier système, téléchargement et gestures. Aucune émulation ne remplace B10.

Le lot Android sera développé sans copier le moteur des Studios ni demander une nouvelle application métier. Les données restent en lecture seule tant qu'une action explicite de l'utilisateur n'intervient pas.
