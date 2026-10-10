# Guide Froid — démonstrateur Studio (V0.3)

Application web autonome et générique, sans organisation nommée, prévue pour un hébergement HTTP/SharePoint compatible ou un usage local.

## Lancer

Ouvrir `index.html` dans un navigateur récent. Pas de serveur nécessaire. Un serveur statique local est préférable pour les tests multi-navigateurs : `python -m http.server 8000`.

## Fonctions

- Étapes de navigation avant/arrière et navigation directe ; sections de tests repliables, commandes globales déplier/replier.
- Identification de l'appareil, contrôle daté, symptômes, contexte d'usage, vérifications indicatives, observations libres.
- Glisser-déposer, sélection de fichiers **et de dossiers** sur les étapes appareil, symptôme, historique, tests et documents divers.
- Annuaire par fabricant et liens de recherche de notices. Toujours vérifier le modèle exact et la langue de la notice.
- Rapport imprimable en PDF via le navigateur ; photographies intégrées sous forme d'annexes visuelles.
- Les PDF téléchargés **ne sont pas automatiquement fusionnés dans le PDF généré par le navigateur**. Outil indépendant `tools/fusionner_pdf.py` pour les fusionner après export (`pypdf` requis).
- Aucune donnée envoyée à un serveur. Les fichiers restent en mémoire pendant la session. Sauvegarder avant fermeture.

## Fusion du rapport et de relevés PDF

1. Dans l'application, cliquer sur `Enregistrer en PDF` puis choisir l'imprimante PDF.
2. Conserver localement les documents PDF ajoutés au formulaire.
3. Lancer `python tools/fusionner_pdf.py rapport.pdf releves.pdf -o dossier_global.pdf`.

Le fichier PDF final rassemble alors le rapport (y compris ses images) et les annexes PDF, dans cet ordre. L'outil ne prend pas en charge les DOCX : les convertir auparavant en PDF.

## Limites et sécurité

Le contenu est destiné à l'observation et à la pédagogie, jamais au diagnostic technique professionnel. Ne pas démonter et ne pas intervenir sur les circuits électriques ou frigorifiques. En cas de température anormale ou d'incident affectant des denrées, suivre les procédures d'hygiène en vigueur, non détaillées ici.

## SharePoint et nLab

Le stockage dans un dossier OneDrive ne constitue pas un hébergement web. Vérifier les capacités de publication HTML et les droits propres au tenant SharePoint. Le prototype est isolé et doit être évalué avant intégration dans un Studio commun.

## Indépendance de ce MVP

Ce dossier est autonome : il ne charge aucun fichier du Studio Hub ou d'un
autre Studio nLab. Il peut être copié vers un autre emplacement ou un
hébergement statique compatible, sous réserve de ses règles de sécurité.

La sortie PDF utilise l'impression du navigateur avec photos intégrées.
La fusion automatisée des pièces PDF dans un unique PDF reste à intégrer.
Les fichiers restent dans le navigateur jusqu'à l'export.


## Documentation UML et évolution documentaire

- [`docs/UML.md`](docs/UML.md) : parcours, modèle simplifié, composants, dossier appareil, documents, critères de validation et limites.
- [`docs/exemple-donnees.json`](docs/exemple-donnees.json) : données fictives et conventions de catégories.
- Les trois liens web facultatifs fabricant / modèle / notice sont intégrés à l'identification du diagnostic ; la fiche persistante et la bibliothèque filtrable sont documentées mais restent à développer.

## Version 0.6 — préparation publication

Liens constructeur, modèle et notice ajoutés au formulaire et au rapport. Documentation HTML accessible depuis le guide. L’inventaire fictif persistant et la fusion des PDF annexes sont hors périmètre de cette V0.6.