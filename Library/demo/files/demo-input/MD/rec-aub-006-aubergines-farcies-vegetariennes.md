---
schema: cuisinex.recipe
schema_version: '1.0'
recipe_version: 1.0.0
id: REC-AUB-006
translation_key: rec-aub-006
type: recipe
status: candidate_validated_content
language: fr
locale: fr-FR
title: Aubergines farcies végétariennes
slug: aubergines-farcies-vegetariennes
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
- id: ING-OIGNON
  name: Oignon
  mass_g: 120
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-TOMATE
  name: Tomate concassée
  mass_g: 250
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-LENTILLES
  name: Lentilles cuites égouttées
  mass_g: 220
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-CHAPELURE
  name: Chapelure
  mass_g: 50
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-HUILE_OLIVE
  name: Huile d’olive vierge extra
  mass_g: 25
  brand: grand_public_generique
  state: selon fiche
  optional: false
nutrition_per_serving_estimate:
  kcal: 231
  protein_g: 8.6
  fat_g: 10.1
  carbs_g: 32.0
relations:
  variant_group: aubergine-pulpe
  related:
  - REC-AUB-001
  - REC-AUB-002
  - REC-AUB-003
  - REC-AUB-004
  - REC-AUB-005
---

# Aubergines farcies végétariennes

**Chef leader : 🥘 Cuisinix**  
**Création : 🧠 Recetix**  
**Validation nutritionnelle : 🥗 Nutritioneix**  
**Portions : 4**  
**Version recette : 1.0.0**

## Description

Farce végétale complète, adaptée aux coques d’aubergine.

## Ingrédients

| Ingrédient | Masse | % du mélange | Référence |
|---|---:|---:|---|
| Pulpe d’aubergine rôtie et égouttée | 450 g | 40.4 % | Référence grand public générique |
| Oignon | 120 g | 10.8 % | Référence grand public générique |
| Tomate concassée | 250 g | 22.4 % | Référence grand public générique |
| Lentilles cuites égouttées | 220 g | 19.7 % | Référence grand public générique |
| Chapelure | 50 g | 4.5 % | Référence grand public générique |
| Huile d’olive vierge extra | 25 g | 2.2 % | Référence grand public générique |

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

1. Faire revenir l’oignon dans l’huile 5 min à feu moyen.
2. Ajouter tomate, pulpe et lentilles. Cuire 10 min pour réduire l’humidité.
3. Ajouter la chapelure, garnir les coques d’aubergine et cuire 20 min à 190 °C.

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

- Énergie : **231 kcal**
- Protéines : **8.6 g**
- Lipides : **10.1 g**
- Glucides : **32.0 g**

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
