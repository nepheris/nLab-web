# Studio Core Lab — test isolé Chrome et Android (PR #71)

Cette page est un **Studio de test dédié exclusivement aux composants partagés du Core**. Ce n'est pas un nouveau moteur PDF, ni une copie des composants : elle importe les modules partagés existants depuis `APP-Applications/_shared/studio-v2/`.

## Ce qu'on peut tester visuellement

1. **Input Picker** : fichier(s), dossier, photo (si prise en charge par le navigateur), collection, sélection, retrait, annulation et confirmation. L'exemple génère un fichier texte synthétique local.
2. **Viewer** : zoom ±, pourcentage, préréglages, Ajuster et 100 %, reflétés sur le document de démonstration.
3. **Color Picker** : édition HEX, RGB, HSL et palette du navigateur, mise à jour de l'aperçu.
4. **Annuler/Rétablir** : restauration de la couleur, raccourcis Ctrl+Z/Y sur desktop, boutons tactiles sur mobile.
5. **Fenêtres** : ouvrir, déplacer (desktop), masquer, restaurer, réinitialiser la position.
6. **Responsive** : modes Automatique, Bureau et Compact/mobile, préférences mémorisées sur l'appareil.

Les fichiers sélectionnés restent dans le navigateur et ne sont pas téléversés. Par prudence, utiliser **des fichiers non confidentiels** pendant cette phase d'essai.

## Lancer sur un PC Linux / Ubuntu

```bash
git clone --depth 1 --branch studio-core-validation-2026-10-17 https://github.com/nepheris/nLab-web.git
cd nLab-web
bash scripts/run-studio-core-lab.sh
```

Le script imprime l'URL Chrome locale (`http://127.0.0.1:8770/APP-Applications/studio-core-lab/`) et, lorsqu'il détecte l'adresse réseau du PC, une URL Android accessible **sur le même Wi-Fi de confiance**. Ouvrir cette URL dans Chrome Android. Si aucun lien Android ne s'affiche, vérifier l'IP locale du PC (`hostname -I`) et le pare-feu Ubuntu. Le script ne démarre qu'un serveur statique provisoire avec les fichiers nécessaires ; fermer avec Ctrl+C.

**Attention :** ni un téléchargement GitHub brut ni l'ouverture directe de `index.html` en `file://` ne garantissent l'exécution des modules ES. Un serveur HTTP est nécessaire.

## Tests automatisés

- [Workflow Studio Core Acceptance](https://github.com/nepheris/nLab-web/actions/workflows/studio-core-acceptance.yml) sur la branche PR #71.
- La commande `node tests/studio-core-lab-acceptance.mjs` exécute l'acceptation desktop et la simulation tactile dans Playwright **après installation de Chrome et lancement du serveur**.
- Les captures PNG et `results.json` sont téléchargeables dans **Artifacts → studio-core-lab-linux-chrome** sur le run GitHub Actions.
- **Une simulation tactile Linux/Chrome n'est pas une validation sur téléphone Android réel** ; B10 reste ouvert jusqu'à recette sur appareil.

## Recette Android manuelle

Sur un téléphone sous Chrome Android (même Wi-Fi que Linux) :

- Ouvrir le Lab ; changer l'affichage en Compact puis revenir en Automatique.
- Importer un fichier via le sélecteur système ; essayer « Photo » et, si possible, un dossier.
- Vérifier le retour du fichier dans la collection et les actions Ajouter/Tout sélectionner/Effacer.
- Changer la couleur puis Annuler/Rétablir depuis la barre mobile.
- Vérifier le zoom, le menu Options et l'ouverture/restauration de la fenêtre Core.
- Passer portrait ↔ paysage ; vérifier l'absence de défilement horizontal de toute la page, la lisibilité, les commandes de 44 px et le clavier virtuel.

Remonter : modèle du téléphone, version Android, version Chrome, URL utilisée et captures/anomalies. Ne pas déclarer B10 PASS avant la preuve sur appareil réel.

## Séparation des environnements

- Branche `studio-core-validation-2026-10-17` / PR [#71](https://github.com/nepheris/nLab-web/pull/71) : Lab et tests.
- P028 : roadmap et sous-plan B10.
- **CURRENT, Legacy, PR #70 et environnement P005 déployé restent inchangés.** Pas de mise en production ni de fusion automatique.

## Responsive Test Studio — application séparée

Le simulateur universel d’écrans ne fait **pas partie du Core Lab**. Il dispose d'une [application TEST distincte](https://github.com/nepheris/nLab-web/tree/responsive-test-studio-2026-10-17/APP-Applications/responsive-test-studio), enregistrée dans le catalogue nLab via la [PR #72](https://github.com/nepheris/nLab-web/pull/72). Elle teste une URL en iframe avec des profils ordinateurs, tablettes et téléphones en portrait/paysage, ainsi que des tailles personnalisées.

Le Core Lab reste limité aux **cinq modules partagés du Core** et à la recette fonctionnelle Chrome / Android. Ni l'un ni l'autre ne sont encore publiés dans CURRENT ; accéder aux deux outils indépendamment via leurs branches TEST.
