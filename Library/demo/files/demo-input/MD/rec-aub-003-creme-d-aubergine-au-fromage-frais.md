---
schema: cuisinex.recipe
schema_version: '1.0'
recipe_version: 1.0.0
id: REC-AUB-003
translation_key: rec-aub-003
type: recipe
status: candidate_validated_content
language: fr
locale: fr-FR
title: Crème d’aubergine au fromage frais
slug: creme-d-aubergine-au-fromage-frais
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
- id: ING-FROMAGE_FRAIS
  name: Fromage frais nature
  mass_g: 180
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-CITRON_JUS
  name: Jus de citron
  mass_g: 20
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-HUILE_OLIVE
  name: Huile d’olive vierge extra
  mass_g: 15
  brand: grand_public_generique
  state: selon fiche
  optional: false
- id: ING-AIL
  name: Ail frais
  mass_g: 4
  brand: grand_public_generique
  state: selon fiche
  optional: false
nutrition_per_serving_estimate:
  kcal: 179
  protein_g: 3.8
  fat_g: 16.6
  carbs_g: 8.5
relations:
  variant_group: aubergine-pulpe
  related:
  - REC-AUB-001
  - REC-AUB-002
  - REC-AUB-004
  - REC-AUB-005
  - REC-AUB-006
---

# Crème d’aubergine au fromage frais

**Chef leader : 🥘 Cuisinix**  
**Création : 🧠 Recetix**  
**Validation nutritionnelle : 🥗 Nutritioneix**  
**Portions : 4**  
**Version recette : 1.0.0**

## Description

Tartinade douce pour pain, wraps ou crudités.

## Ingrédients

| Ingrédient | Masse | % du mélange | Référence |
|---|---:|---:|---|
| Pulpe d’aubergine rôtie et égouttée | 400 g | 64.6 % | Référence grand public générique |
| Fromage frais nature | 180 g | 29.1 % | Référence grand public générique |
| Jus de citron | 20 g | 3.2 % | Référence grand public générique |
| Huile d’olive vierge extra | 15 g | 2.4 % | Référence grand public générique |
| Ail frais | 4 g | 0.6 % | Référence grand public générique |

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

1. Mixer la pulpe froide avec le fromage frais.
2. Ajouter citron, ail et huile d’olive. Mixer jusqu’à texture homogène.
3. Réserver 30 min à 4 °C avant utilisation.

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

- Énergie : **179 kcal**
- Protéines : **3.8 g**
- Lipides : **16.6 g**
- Glucides : **8.5 g**

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
