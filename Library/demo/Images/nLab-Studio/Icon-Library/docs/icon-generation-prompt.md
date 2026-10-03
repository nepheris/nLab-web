# Prompt nLab — Générer ou auditer une icône SVG

Utiliser ce prompt comme référence lors de toute création ou revue d’icône.

## Contexte
Tu travailles dans la librairie iconographique nLab. L’icône doit appartenir visuellement à la même famille que les icônes existantes.

## Entrées à fournir
- Nom / ID :
- Famille : studio-icons | function-icons | filetype-icons | ui-icons | symbology-icons
- Fonction représentée :
- Usages prévus :
- Variantes liées éventuelles :
- Statut : active | planned

## Règles obligatoires
1. SVG mono-couleur, fond transparent.
2. `stroke="currentColor"`.
3. `fill="none"` sauf texte/minuscule détail nécessitant explicitement `fill="currentColor"`.
4. Aucun code couleur hex/rgb/hsl.
5. `stroke-linecap="round"` et `stroke-linejoin="round"`.
6. Studio icon : viewBox `0 0 64 64`, stroke-width `3`.
7. Toutes les autres familles : viewBox `0 0 24 24`, stroke-width `1.7`.
8. Géométrie simple et reconnaissable à petite taille.
9. Éviter les détails de moins de 1.5 px visuels.
10. Si une icône proche existe, créer une variante cohérente plutôt qu’une nouvelle métaphore.

## Sortie attendue
- SVG complet.
- ID canonique.
- Nom de fichier kebab-case.
- Label FR.
- Description courte.
- Tags.
- Aliases.
- Usages.
- Statut.
- Justification en une phrase de la cohérence avec la famille.

## Audit d’homogénéité
Vérifier :
- grille ;
- stroke-width ;
- currentColor ;
- cap/join ;
- équilibre des marges ;
- poids visuel ;
- cohérence avec variantes ;
- lisibilité sur fond clair/sombre ;
- lisibilité aux tailles 16/24/32/64 px.

Ne pas modifier les icônes existantes sans nécessité fonctionnelle ; privilégier la continuité visuelle.
