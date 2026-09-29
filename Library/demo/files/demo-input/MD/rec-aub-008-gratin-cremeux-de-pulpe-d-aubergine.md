---
schema: cuisinex.recipe
schema_version: '1.0'
recipe_version: 1.0.0
id: REC-AUB-008
translation_key: rec-aub-008
type: recipe
status: candidate_validated_content
language: fr
locale: fr-FR
title: Gratin crémeux de pulpe d’aubergine
slug: gratin-cremeux-de-pulpe-d-aubergine
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
- id: ING-CREME30
  name: Crème UHT 30 % MG
  mass_g: 180
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-MOZZARELLA
  name: Mozzarella
  mass_g: 150
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-PARMESAN
  name: Parmesan
  mass_g: 40
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-CHAPELURE
  name: Chapelure
  mass_g: 40
  brand: grand_public_generique
  state: selon fiche
  optional: false
nutrition_per_serving_estimate:
  kcal: 363
  protein_g: 17.8
  fat_g: 26.4
  carbs_g: 17.7
relations:
  variant_group: aubergine-pulpe
  related:
  - REC-AUB-001
  - REC-AUB-002
  - REC-AUB-003
  - REC-AUB-004
  - REC-AUB-005
---

# Gratin crémeux de pulpe d’aubergine

**Chef leader : 🥘 Cuisinix**  
**Création : 🧠 Recetix**  
**Validation nutritionnelle : 🥗 Nutritioneix**  
**Portions : 4**  
**Version recette : 1.0.0**

## Description

Gratin fondant avec croûte croustillante.

## Ingrédients

| Ingrédient | Masse | % du mélange | Référence |
|---|---:|---:|---|
| Pulpe d’aubergine rôtie et égouttée | 500 g | 54.9 % | Référence grand public générique |
| Crème UHT 30 % MG | 180 g | 19.8 % | Référence grand public générique |
| Mozzarella | 150 g | 16.5 % | Référence grand public générique |
| Parmesan | 40 g | 4.4 % | Référence grand public générique |
| Chapelure | 40 g | 4.4 % | Référence grand public générique |

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

1. Mélanger la pulpe avec la crème, la moitié de la mozzarella et le parmesan.
2. Verser dans un plat à gratin, couvrir du reste de mozzarella et de chapelure.
3. Cuire 25 min à 190 °C puis gratiner 3 à 5 min sous le gril.

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

- Énergie : **363 kcal**
- Protéines : **17.8 g**
- Lipides : **26.4 g**
- Glucides : **17.7 g**

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
