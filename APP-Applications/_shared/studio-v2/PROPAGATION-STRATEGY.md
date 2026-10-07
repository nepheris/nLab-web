# Studio Core — stratégie de propagation par familles

## Principe

Le Studio Core est propagé progressivement. Une capacité transversale n'est considérée comme réutilisable qu'après validation dans plusieurs familles d'usage différentes.

Ordre de propagation :

1. Core partagé
2. un Studio pilote
3. une seconde surface de nature différente
4. tests fonctionnels + audit
5. promotion du pattern
6. propagation à la famille suivante
7. promotion TEST → CURRENT seulement après stabilité fonctionnelle

## Gates obligatoires

Pour chaque vague :

- registre de versions cohérent ;
- contrat de fonctionnalités aligné ;
- Context / Selection publié ;
- Command Core utilisé lorsque l'action est exposée au Ruban, à Ctrl+K ou au menu contextuel ;
- Undo / Redo Core utilisé pour les mutations réversibles ;
- historique local toléré uniquement comme compatibilité transitoire ;
- tests navigateur smoke ;
- roundtrip / intégrité ;
- tests exhaustifs ;
- scénarios fonctionnels explicites Undo → Redo ;
- audit complet Studio ;
- fusion seulement si la CI est verte.

## Matrice de propagation

| Famille | Studios | État |
|---|---|---|
| PDF / composition | PDF Studio, Merge Studio, PDF Sign | Core partagé en place ; Merge validé transactionnel |
| Image / visuel | Image Studio | transactionnel Core validé |
| Code / données / fichiers | Code Studio, Data Studio, File Studio | transactionnel Core validé |
| Acquisition documentaire | Scan Studio, OCR Studio | propagée et validée |
| Édition documentaire | Markdown Studio, Document Studio, Spreadsheet Studio | vague en cours |
| Génération / symbologie | Dataset Generator, QR & Barcode | à propager après édition documentaire |
| Apps dérivées | PDF Sign et futures mini-apps | héritage par sous-ensemble de capacités |
| Média / archives | Audio, Video, Archive | développement ultérieur |

## Famille acquisition documentaire

### Scan Studio
Doit utiliser :
- Input Core ;
- Context / Selection Core ;
- Undo / Redo Core pour pages, ordre, sélection et corrections image ;
- OCR Core ;
- Job / Progress Core à terme pour OCR document et PDF recherchable.

### OCR Studio
Doit utiliser :
- Context / Selection Core ;
- Command Core ;
- Undo / Redo Core pour résultat et édition du texte OCR ;
- OCR Core pour moteurs/langues/diagnostics ;
- Job / Progress Core à terme pour les opérations longues.

## Critère de promotion

Une famille est marquée **propagée** lorsque deux surfaces au moins démontrent le même mécanisme Core sur des mutations métier réelles et que la CI complète passe.

Une version TEST n'est pas automatiquement promue CURRENT. La promotion reste une décision distincte après non-régression et validation d'usage.
