---
schema: cuisinex.recipe
schema_version: '1.0'
recipe_version: 1.0.0
id: REC-AUB-019
translation_key: rec-aub-019
type: recipe
status: candidate_validated_content
language: fr
locale: fr-FR
title: Quiche aubergine–feta
slug: quiche-aubergine-feta
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
  mass_g: 350
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-OEUF
  name: Œuf entier
  mass_g: 200
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-CREME30
  name: Crème UHT 30 % MG
  mass_g: 200
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-FETA
  name: Feta
  mass_g: 150
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-FARINE
  name: Farine de blé T55
  mass_g: 180
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-HUILE_OLIVE
  name: Huile d’olive vierge extra
  mass_g: 50
  brand: grand_public_generique
  state: selon fiche
  optional: false
nutrition_per_serving_estimate:
  kcal: 621
  protein_g: 18.1
  fat_g: 42.9
  carbs_g: 42.9
relations:
  variant_group: aubergine-pulpe
  related:
  - REC-AUB-001
  - REC-AUB-002
  - REC-AUB-003
  - REC-AUB-004
  - REC-AUB-005
---

# Quiche aubergine–feta

**Chef leader : 🥘 Cuisinix**  
**Création : 🧠 Recetix**  
**Validation nutritionnelle : 🥗 Nutritioneix**  
**Portions : 4**  
**Version recette : 1.0.0**

## Description

Quiche complète utilisant la pulpe comme composant principal de l’appareil.

## Ingrédients

| Ingrédient | Masse | % du mélange | Référence |
|---|---:|---:|---|
| Pulpe d’aubergine rôtie et égouttée | 350 g | 31.0 % | Référence grand public générique |
| Œuf entier | 200 g | 17.7 % | Référence grand public générique |
| Crème UHT 30 % MG | 200 g | 17.7 % | Référence grand public générique |
| Feta | 150 g | 13.3 % | Référence grand public générique |
| Farine de blé T55 | 180 g | 15.9 % | Référence grand public générique |
| Huile d’olive vierge extra | 50 g | 4.4 % | Référence grand public générique |

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

1. Préparer une pâte avec farine, 40 g d’huile, environ 70 g d’eau et une pincée de sel ; foncer un moule.
2. Mélanger pulpe, œufs, crème et feta émiettée.
3. Verser sur le fond de tarte et cuire 35 à 40 min à 180 °C.

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

- Énergie : **621 kcal**
- Protéines : **18.1 g**
- Lipides : **42.9 g**
- Glucides : **42.9 g**

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
