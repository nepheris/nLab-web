# nLab Studio Core — contrat d'identité et navigation

## En-tête canonique

Tous les Studios **actifs** affichent le même bloc d'identité nLab, sans refaire leur propre header.

- Logo SVG officiel : `assets/branding/nlab-wordmark.svg`.
- Le **logo entier** est placé dans un lien HTML accessible, libellé `Retour à l’accueil nLab`.
- Destination du lien : **racine du site nLab**, pas la liste des Studios, ni la page d'une autre application.
- Le nom et la description du Studio suivent le logo, puis les commandes et la navigation.
- La présentation est **responsive** : logo réduit mais toujours visible et cliquable sur mobile.
- Une page de versions active conserve la même identité que son Studio.
- Aucun lien factice ni bouton sans comportement.
- La navigation des anciennes versions gelées n'est pas modifiée par une évolution CURRENT.

## Implémentation commune : Studio Core V2

Le code de référence unique réside dans `APP-Applications/_shared/studio-v2/frame.js`.

Les chemins du logo et de l'accueil sont résolus à partir de `import.meta.url` (emplacement du module Core), et non depuis `location.href` : tous les Studios peuvent disposer d'un `<base>` ou de profondeurs de répertoires différentes sans casser leur navigation.

Ne pas recopier le header dans les HTML de chaque Studio spécialisé. `mountStudioV2` génère le logo, l'identité et le ruban à partir du manifest. Le bouton **Test responsive** du Core commun ouvre `APP-Applications/responsive-test-studio/` avec l'URL courante.

## Page métier avec en-tête autonome

Pour les rares pages non gérées par Studio Core V2 (portail PDF Studio, Responsive Test Studio, Guide Froid ou galerie de démos), conserver leur CSS existant et insérer :

```html
<a class="nlab-home-link" href="../../" aria-label="Retour à l’accueil nLab" title="Accueil nLab">
  <img src="../../assets/branding/nlab-wordmark.svg" alt="nLab">
</a>
```

Adapter les chemins relatifs à la **position réelle** du document. Pour une application autonome, privilégier des liens vers la racine de publication et des feuilles de style à portée locale. Les versions historiques et les URL de redirection restent isolées, sans refonte visuelle forcée.

## Vérification de non-régression

1. Ouvrir le CURRENT de chaque Studio, pas uniquement les redirections `index.html`.
2. Vérifier la présence du logo officiel dans l'en-tête, ainsi que sa destination sur la racine nLab.
3. Vérifier le même comportement sur Desktop, tablette et mobile.
4. Tester une page à `<base href="../">` et une page sans base.
5. Vérifier le retour à l'accueil dans une fenêtre d'application installée.
6. Ne pas modifier le HTML du legacy uniquement pour le rendre visuellement identique si cela compromet son fonctionnement ; les exceptions doivent être consignées.

## Conditions d'installation desktop

Le Responsive Test Studio fournit un manifeste de web app `manifest.webmanifest` et un bouton conditionnel `Installer sur cet ordinateur` qui apparaît seulement après réception de `beforeinstallprompt`. Le site demeure accessible dans un navigateur traditionnel si l'installation n'est pas proposée. Aucun fonctionnement hors connexion n'est promis.
