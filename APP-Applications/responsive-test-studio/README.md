# Responsive Test Studio — 0.4.3 CURRENT

Studio de prévisualisation web rapide, indépendant du Core Lab, accessible via le catalogue nLab Studios. La **0.4.3 est CURRENT**, après validation de son interface et du champ de saisie URL élargi. La 0.4.2 reste utilisable en historique isolé. La version web dispose d’un manifeste d’application pour Chrome/Edge, d’un logo nLab cliquable, et d’une commande partagée par Studio Core V2.ns/0.4.2/`). Les versions 0.4.1 et 0.4.0 restent accessibles dans leurs historiques autonomes. 0.4.3 TEST propose uniquement un agrandissement de la fenêtre « Modifier URL » (520 → 780 px maximum, avec adaptation sur mobile), sans modifier le CURRENT 0.4.2.

## Usage

1. La présentation se trouve dans le **header nLab standard**. En **CURRENT 0.4.2**, l'URL et les boutons Modifier URL, Actualiser, Onglet, Vue double, Réglages et Plein écran sont regroupés dans **une seule barre du viewport**. Sur ordinateur, la zone URL occupe **au moins 50 % de la largeur de la barre** ; sur téléphone, elle s'adapte à l'écran. « Modifier URL » ouvre un champ superposé, même en plein écran ; Afficher valide l'URL et referme le champ.
2. Dans la palette, choisir directement le **type d'écran par pictogramme SVG** : **Ordinateur** (21 formats VGA/4:3/5:4, HD/16:9, 16:10 et ultra-large/4K), **Tablette** (6 résolutions, compacte à XL), **Mobile** (9 résolutions de mini 320×568 à grand 480×960), ou **Sur mesure** (240–4096 px). Le menu Résolution n'affiche que les formats du type sélectionné. Profil PC initial : **1280 × 800 (16:10)**. Les orientations portrait/paysage restent indépendantes du choix du format.
3. Tourner entre portrait et paysage ; l'iframe applique les dimensions CSS de l'écran, sans changer l'User-Agent ni les permissions du système.
4. Utiliser **Vue double** pour comparer la même URL dans deux iframes côte à côte (dimensions inversées portrait/paysage). Leurs navigations deviennent indépendantes après leur chargement initial ; une nouvelle URL recharge les deux.
5. Utiliser **Ajuster** pour visualiser les écrans entiers ; le zoom visuel ne change pas la résolution CSS.
6. Dans la palette flottante **Réglages d’écran**, choisir directement **Auto | Clair | Sombre**, à côté des commandes d’orientation. Le header conserve le **sélecteur de thème nLab standard**. Ces commandes utilisent la même préférence partagée et restent synchronisées (palette → header et header → palette). La préférence est partagée avec les autres pages nLab via le shell existant. Cela change le Studio hôte ; le thème du site distant dépend du site et de ses propres préférences.
7. L'option **Recharger le site au changement de format** est activée initialement pour les sites qui n'évaluent le responsive qu'au démarrage. Désactiver pour tester les événements de redimensionnement en conservant l'état du site.

8. **Zoom précis (5–300 %)** : curseur progressif, boutons +5 / −5 points, valeur numérique éditable. **★ Sauver zoom** mémorise l'échelle préférée dans le navigateur. Le menu conserve les valeurs Ajuster / 100 / 75 / 50 / 25 / Sur mesure.
9. **⛶ Plein écran** : seul l'atelier contenant les iframes et la palette de réglages passe en plein écran via l'API native du navigateur. Bouton **⚙ Réglages** utilisable directement en plein écran ; cliquer de nouveau sur ⛶ (ou utiliser Échap) pour en sortir. Une permission navigateur peut être requise.

**Précision :** dans un iframe, les media queries CSS, innerWidth, innerHeight et les événements resize suivent bien les dimensions de l'iframe. L'User-Agent, les permissions Android, l'émulation tactile et les capteurs ne sont pas simulés par un iframe. Un site tiers peut refuser le chargement (CSP frame-ancestors / X-Frame-Options). Aucun contournement n'est prévu.

## Versions et stabilité

- **0.4.3 CURRENT** : zone Modifier URL de 780 px, lancement depuis le Core commun, manifeste d'application PC, logo et lien nLab.
- **0.4.2 historique** : barre URL étendue à au moins 50 % sur ordinateur, avec commandes regroupées dans le viewport, édition en plein écran ; CSS/simulateur gelés sous `./versions/0.4.2/`.
- **0.4.1 historique** : première version de la barre unifiée, préservée sous `./versions/0.4.1/`.
- **0.4.0 historique** : précédent CURRENT, avec barre URL séparée, préservé sous `./versions/0.4.0/`.
- **0.3.1 historique** : version native autonome préservée sous versions/0.3.1/.
- **0.3.0 historique** : version native autonome avec ses boutons de thème dans le header, préservée sous versions/0.3.0/.
- **0.2.0 historique** : version native autonome sous versions/0.2.0/ (moteur CSS, shell, runtime et UI figés).
- **0.1.0 historique** : instantané natif autonome sous versions/0.1.0/ (JS/CSS copiés) ; pas de dépendance au nouveau moteur.
- CURRENT = 0.4.3 ; TEST = aucun. Ancien lien TEST redirigé vers l’historique 0.4.3. Les autres Studios et leurs versions historiques restent inchangés.

## Tests

Workflow GitHub Actions Responsive Test Studio TEST Acceptance : Chromium/Chrome Linux, bureau et viewport étroit, simulation tactile de contrôles, double vue, rotation/reload, changement de thème et métriques CSS same-origin.

Un test sur téléphone Android réel reste nécessaire pour les API/permissions natives, caméra, clavier tactile et navigateur mobile.

## Application web sur ordinateur et Studio Core

- Ouvrir le Studio à l’adresse habituelle sur Chrome ou Edge (Windows, Linux, macOS). Le manifeste permet au navigateur de proposer, lorsqu’il la prend en charge, une installation comme application dans sa propre fenêtre. Sinon, créer un raccourci web reste possible. La page fonctionne aussi directement dans le navigateur ; aucune installation native n’est nécessaire.
- L’action commune **Test responsive** du Studio Core V2 (ruban et palette de commandes Ctrl+K) ouvre cette application avec l’URL du Studio source dans le champ de test, sans dupliquer son moteur.
- Le logo nLab dans l’en-tête renvoie au portail nLab. La navigation et les ressources des versions historiques restent isolées.
- L’application ne garantit pas un fonctionnement hors connexion et les sites tiers peuvent refuser l’affichage en iframe.
