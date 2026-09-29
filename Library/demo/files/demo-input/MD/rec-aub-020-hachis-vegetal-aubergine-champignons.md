---
schema: cuisinex.recipe
schema_version: '1.0'
recipe_version: 1.0.0
id: REC-AUB-020
translation_key: rec-aub-020
type: recipe
status: candidate_validated_content
language: fr
locale: fr-FR
title: Hachis végétal aubergine–champignons
slug: hachis-vegetal-aubergine-champignons
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
  mass_g: 400
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-CHAMPIGNON
  name: Champignons de Paris
  mass_g: 300
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-OIGNON
  name: Oignon
  mass_g: 100
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-TOMATE
  name: Tomate concassée
  mass_g: 250
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-POMME_TERRE
  name: Pomme de terre cuite
  mass_g: 600
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
  kcal: 258
  protein_g: 7.0
  fat_g: 9.3
  carbs_g: 43.4
relations:
  variant_group: aubergine-pulpe
  related:
  - REC-AUB-001
  - REC-AUB-002
  - REC-AUB-003
  - REC-AUB-004
  - REC-AUB-005
---

# Hachis végétal aubergine–champignons

**Chef leader : 🥘 Cuisinix**  
**Création : 🧠 Recetix**  
**Validation nutritionnelle : 🥗 Nutritioneix**  
**Portions : 4**  
**Version recette : 1.0.0**

## Description

Alternative végétale au hachis parmentier.

## Ingrédients

| Ingrédient | Masse | % du mélange | Référence |
|---|---:|---:|---|
| Pulpe d’aubergine rôtie et égouttée | 400 g | 23.9 % | Référence grand public générique |
| Champignons de Paris | 300 g | 17.9 % | Référence grand public générique |
| Oignon | 100 g | 6.0 % | Référence grand public générique |
| Tomate concassée | 250 g | 14.9 % | Référence grand public générique |
| Pomme de terre cuite | 600 g | 35.8 % | Référence grand public générique |
| Huile d’olive vierge extra | 25 g | 1.5 % | Référence grand public générique |

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

1. Faire revenir oignon et champignons jusqu’à évaporation de leur eau.
2. Ajouter tomate et pulpe, puis réduire 10 min.
3. Verser dans un plat, couvrir de purée de pomme de terre et gratiner 25 min à 190 °C.

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

- Énergie : **258 kcal**
- Protéines : **7.0 g**
- Lipides : **9.3 g**
- Glucides : **43.4 g**

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
