---
schema: cuisinex.recipe
schema_version: '1.0'
recipe_version: 1.0.0
id: REC-AUB-021
translation_key: rec-aub-021
type: recipe
status: candidate_validated_content
language: fr
locale: fr-FR
title: Sauce aubergine–tomate pour pizza
slug: sauce-aubergine-tomate-pour-pizza
servings: 4
serving_unit: portion
chef_lead: roberto
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
  mass_g: 300
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-TOMATE
  name: Tomate concassée
  mass_g: 400
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-AIL
  name: Ail frais
  mass_g: 5
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-HUILE_OLIVE
  name: Huile d’olive vierge extra
  mass_g: 20
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-BASILIC
  name: Basilic frais
  mass_g: 20
  brand: grand_public_generique
  state: selon fiche
  optional: false
nutrition_per_serving_estimate:
  kcal: 91
  protein_g: 1.9
  fat_g: 7.1
  carbs_g: 8.9
relations:
  variant_group: aubergine-pulpe
  related:
  - REC-AUB-001
  - REC-AUB-002
  - REC-AUB-003
  - REC-AUB-004
  - REC-AUB-005
---

# Sauce aubergine–tomate pour pizza

**Chef leader : 🍝 Roberto**  
**Création : 🧠 Recetix**  
**Validation nutritionnelle : 🥗 Nutritioneix**  
**Portions : 4**  
**Version recette : 1.0.0**

## Description

Base de pizza plus dense et plus végétale qu’une sauce tomate seule.

## Ingrédients

| Ingrédient | Masse | % du mélange | Référence |
|---|---:|---:|---|
| Pulpe d’aubergine rôtie et égouttée | 300 g | 40.3 % | Référence grand public générique |
| Tomate concassée | 400 g | 53.7 % | Référence grand public générique |
| Ail frais | 5 g | 0.7 % | Référence grand public générique |
| Huile d’olive vierge extra | 20 g | 2.7 % | Référence grand public générique |
| Basilic frais | 20 g | 2.7 % | Référence grand public générique |

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

1. Faire réduire la tomate avec l’ail 12 à 15 min.
2. Ajouter la pulpe et cuire encore 5 min.
3. Mixer partiellement, ajouter le basilic hors du feu et refroidir avant utilisation sur pizza.

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

- Énergie : **91 kcal**
- Protéines : **1.9 g**
- Lipides : **7.1 g**
- Glucides : **8.9 g**

> Valeurs estimatives calculées à partir de tables génériques. Elles sont destinées à l’affichage CuisineX et doivent être recalculées avec le référentiel nutritionnel canonique lors de la compilation finale.

## Variantes et relations

- Groupe de variantes : `aubergine-pulpe`
- Peut être reliée aux autres recettes du même groupe via `relations.variant_group`.
- La version française est la **version maître/canonique** ; les traductions EN et autres langues doivent conserver le même `translation_key`.

## Validation Projet Cuisine

- Créativité : 🧠 Recetix
- Validation technique : 🍝 Roberto
- Nutrition : 🥗 Nutritioneix
- Statut : **candidate_validated_content**
- Référence ingrédients : **grand public générique**
