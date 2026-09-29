---
schema: cuisinex.recipe
schema_version: '1.0'
recipe_version: 1.0.0
id: REC-AUB-005
translation_key: rec-aub-005
type: recipe
status: candidate_validated_content
language: fr
locale: fr-FR
title: Houmous aubergine–pois chiches
slug: houmous-aubergine-pois-chiches
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
  mass_g: 300
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-POIS_CHICHES
  name: Pois chiches cuits égouttés
  mass_g: 300
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-TAHINI
  name: Tahini
  mass_g: 50
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-CITRON_JUS
  name: Jus de citron
  mass_g: 30
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-HUILE_OLIVE
  name: Huile d’olive vierge extra
  mass_g: 20
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-AIL
  name: Ail frais
  mass_g: 5
  brand: grand_public_generique
  state: selon fiche
  optional: false
nutrition_per_serving_estimate:
  kcal: 271
  protein_g: 9.7
  fat_g: 15.6
  carbs_g: 28.6
relations:
  variant_group: aubergine-pulpe
  related:
  - REC-AUB-001
  - REC-AUB-002
  - REC-AUB-003
  - REC-AUB-004
  - REC-AUB-006
---

# Houmous aubergine–pois chiches

**Chef leader : 🥘 Cuisinix**  
**Création : 🧠 Recetix**  
**Validation nutritionnelle : 🥗 Nutritioneix**  
**Portions : 4**  
**Version recette : 1.0.0**

## Description

Houmous plus léger et végétal qu’une version 100 % pois chiches.

## Ingrédients

| Ingrédient | Masse | % du mélange | Référence |
|---|---:|---:|---|
| Pulpe d’aubergine rôtie et égouttée | 300 g | 42.6 % | Référence grand public générique |
| Pois chiches cuits égouttés | 300 g | 42.6 % | Référence grand public générique |
| Tahini | 50 g | 7.1 % | Référence grand public générique |
| Jus de citron | 30 g | 4.3 % | Référence grand public générique |
| Huile d’olive vierge extra | 20 g | 2.8 % | Référence grand public générique |
| Ail frais | 5 g | 0.7 % | Référence grand public générique |

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

1. Mixer pois chiches et pulpe d’aubergine jusqu’à obtenir une pâte homogène.
2. Ajouter tahini, citron et ail puis mixer de nouveau.
3. Détendre avec un peu d’eau froide si nécessaire et terminer par l’huile d’olive.

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

- Énergie : **271 kcal**
- Protéines : **9.7 g**
- Lipides : **15.6 g**
- Glucides : **28.6 g**

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
