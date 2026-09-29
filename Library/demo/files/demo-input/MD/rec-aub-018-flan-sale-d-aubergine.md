---
schema: cuisinex.recipe
schema_version: '1.0'
recipe_version: 1.0.0
id: REC-AUB-018
translation_key: rec-aub-018
type: recipe
status: candidate_validated_content
language: fr
locale: fr-FR
title: Flan salé d’aubergine
slug: flan-sale-d-aubergine
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
  mass_g: 450
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-OEUF
  name: Œuf entier
  mass_g: 200
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-LAIT
  name: Lait demi-écrémé 1,6 % MG
  mass_g: 200
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-CREME30
  name: Crème UHT 30 % MG
  mass_g: 100
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-PARMESAN
  name: Parmesan
  mass_g: 50
  brand: grand_public_generique
  state: selon fiche
  optional: false
nutrition_per_serving_estimate:
  kcal: 261
  protein_g: 14.3
  fat_g: 19.5
  carbs_g: 10.8
relations:
  variant_group: aubergine-pulpe
  related:
  - REC-AUB-001
  - REC-AUB-002
  - REC-AUB-003
  - REC-AUB-004
  - REC-AUB-005
---

# Flan salé d’aubergine

**Chef leader : 🥘 Cuisinix**  
**Création : 🧠 Recetix**  
**Validation nutritionnelle : 🥗 Nutritioneix**  
**Portions : 4**  
**Version recette : 1.0.0**

## Description

Flan salé souple, à servir chaud ou tiède.

## Ingrédients

| Ingrédient | Masse | % du mélange | Référence |
|---|---:|---:|---|
| Pulpe d’aubergine rôtie et égouttée | 450 g | 45.0 % | Référence grand public générique |
| Œuf entier | 200 g | 20.0 % | Référence grand public générique |
| Lait demi-écrémé 1,6 % MG | 200 g | 20.0 % | Référence grand public générique |
| Crème UHT 30 % MG | 100 g | 10.0 % | Référence grand public générique |
| Parmesan | 50 g | 5.0 % | Référence grand public générique |

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

1. Mixer la pulpe avec les œufs, le lait, la crème et le parmesan.
2. Verser dans 4 ramequins légèrement huilés.
3. Cuire au bain-marie 30 à 35 min à 170 °C jusqu’à prise du centre.

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

- Énergie : **261 kcal**
- Protéines : **14.3 g**
- Lipides : **19.5 g**
- Glucides : **10.8 g**

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
