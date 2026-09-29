---
schema: cuisinex.recipe
schema_version: '1.0'
recipe_version: 1.0.0
id: REC-AUB-002
translation_key: rec-aub-002
type: recipe
status: candidate_validated_content
language: fr
locale: fr-FR
title: Baba ganoush
slug: baba-ganoush
servings: 4
serving_unit: portion
chef_lead: cuisinix
contributors:
- recetix
- nutritioneix
category:
- aubergine
- pulpe-aubergine
tags:
- anti-gaspi
- grand-public
- vegetable-forward
compatibility:
  cuisinex_authoring: true
  markdown_yaml: true
  runtime_json_compilable: true
ingredient_reference_policy: grand_public_generique
brand_validation_status: a_confirmer_si_produit_critique
ingredients:
- id: ING-AUBERGINE_PULPE
  name: Pulpe d’aubergine rôtie et égouttée
  mass_g: 500
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-TAHINI
  name: Tahini
  mass_g: 70
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-CITRON_JUS
  name: Jus de citron
  mass_g: 35
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-AIL
  name: Ail frais
  mass_g: 6
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-HUILE_OLIVE
  name: Huile d’olive vierge extra
  mass_g: 20
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-CUMIN
  name: Cumin moulu
  mass_g: 2
  brand: grand_public_generique
  state: selon fiche
  optional: false
nutrition_per_serving_estimate:
  kcal: 198
  protein_g: 4.4
  fat_g: 17.7
  carbs_g: 12.5
relations:
  variant_group: aubergine-pulpe
  related:
  - REC-AUB-001
  - REC-AUB-003
  - REC-AUB-004
  - REC-AUB-005
  - REC-AUB-006
---

# Baba ganoush

**Chef leader : 🥘 Cuisinix**  
**Création : 🧠 Recetix**  
**Validation nutritionnelle : 🥗 Nutritioneix**  
**Portions : 4**  
**Version recette : 1.0.0**

## Description

Version plus crémeuse et plus corsée grâce au tahini.

## Ingrédients

| Ingrédient | Masse | % du mélange | Référence |
|---|---:|---:|---|
| Pulpe d’aubergine rôtie et égouttée | 500 g | 79.0 % | Référence grand public générique |
| Tahini | 70 g | 11.1 % | Référence grand public générique |
| Jus de citron | 35 g | 5.5 % | Référence grand public générique |
| Ail frais | 6 g | 0.9 % | Référence grand public générique |
| Huile d’olive vierge extra | 20 g | 3.2 % | Référence grand public générique |
| Cumin moulu | 2 g | 0.3 % | Référence grand public générique |

> Sel, poivre et herbes fraîches : ajustement gustatif raisonnable.  
> Les masses du front matter constituent la donnée structurée de référence CuisineX.

## Matériel

- Balance de cuisine
- Couteau et planche
- Saladier
- Spatule ou cuillère
- Poêle, casserole ou plat de cuisson selon la recette
- Mixeur plongeant ou blender lorsque la texture le nécessite
- Thermomètre de cuisine recommandé pour les préparations contenant œufs, viande ou produits laitiers

## Procédé technique

1. Mixer grossièrement la pulpe avec le tahini, le citron, l’ail et le cumin.
2. Ajouter l’huile d’olive progressivement pour obtenir une texture crémeuse.
3. Rectifier l’assaisonnement et laisser maturer 30 min au froid.

## Points critiques

- Utiliser une pulpe d’aubergine **cuite, égouttée et pesée après cuisson**.
- Si la pulpe est très humide, l’égoutter 10 à 20 min avant incorporation.
- Pour toute préparation contenant œufs ou viande, éviter les attentes prolongées à température ambiante.
- Refroidir rapidement les préparations destinées à être conservées et les placer à **≤ 4 °C**.
- Les quantités sont définies pour des ingrédients grand public génériques ; une marque/type précis peut nécessiter un ajustement de texture.

## Conservation

- Préparations froides : 2 à 3 jours à ≤ 4 °C.
- Préparations cuites : 2 à 3 jours à ≤ 4 °C après refroidissement rapide.
- Réchauffer les plats chauds à cœur avant service.

## Nutrition estimative par portion

- Énergie : **198 kcal**
- Protéines : **4.4 g**
- Lipides : **17.7 g**
- Glucides : **12.5 g**

> Valeurs estimatives calculées à partir de tables génériques. Elles sont destinées à l’affichage CuisineX et doivent être recalculées avec le référentiel nutritionnel canonique lors de la compilation finale.

## Variantes et relations

- Groupe de variantes : `aubergine-pulpe`
- Peut être reliée aux autres recettes du même groupe via `relations.variant_group`.
- La version française est la **version maître/canonique** ; les traductions EN et autres langues doivent conserver le même `translation_key`.

## Validation Projet Cuisine

- Créativité : 🧠 Recetix
- Validation technique : 🥘 Cuisinix
- Nutrition : 🥗 Nutritioneix
- Statut : **candidate_validated_content**
- Référence ingrédients : **grand public générique**
