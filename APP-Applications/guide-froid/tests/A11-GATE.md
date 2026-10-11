# Guide Froid V2 — Gate A11 (11 octobre 2026)

## Décision : NO-GO pour clôturer la passe A
La passe B comporte déjà des développements sur main, mais son avancement ne constitue pas une validation rétroactive de la passe A.

| Critère | Preuve disponible | Décision |
|---|---|---|
| A06 — conversion V1/V2 | 5 tests unitaires sur fonction extraite, script de test GitHub | PARTIAL : vrais fichiers historiques non recettés dans l'interface |
| A07 — ZIP STORE | round-trip technique et intégrité CRC, archives tronquées rejetées | PASS technique |
| A07 — ZIP DEFLATE | exécution Node 22 Web Streams rapportée dans A07-RESULTS.md | PASS technique, navigateur restant |
| A07 — Chromium/Firefox | aucune preuve de recette sur version main | BLOCKED |
| A10 — ZIP avec visites / pièces jointes | contrôle moteur avec simulation Blob, 2 visites et pièces jointes préservées | PASS technique, interface restante |
| A10 — ZIP historique réel → import UI → modification → réexport → réimport | aucune preuve vérifiable | BLOCKED |
| Confidentialité | mode local conçu ; contrôle navigateur et absence de requêtes non attendues non effectué | NON VALIDÉ |

## Tests manuels pour obtenir le GO
1. Exécuter une version de preview **isolée de main** ; ne pas modifier gh-pages.
2. Dans Chromium : créer appareil, compléter ID/site/froid/forme, ajouter les 3 photos et 1 PDF, enregistrer une visite avec une pièce jointe, exporter le ZIP.
3. Recharger l'atelier, importer le ZIP, confirmer identité, site, volumes, photos, notice, visite et fichier ; modifier, réexporter et réimporter une deuxième fois.
4. Charger un ancien ZIP réel de référence, confirmer la non-perte des champs inconnus et des visites.
5. Importer un ZIP DEFLATE de référence, puis répéter dans Firefox ; tester également CRC incorrect, ZIP tronqué et chemins dangereux.
6. Consigner navigateur/version, archive, entrée testée, résultat PASS/FAIL et capture ou journal. Aucune donnée personnelle réelle dans les artefacts publics.

## Actions après tests
- En cas de FAIL : créer une tâche corrective A06/A07/A10 et recommencer les scénarios concernés.
- En cas de PASS documentés pour tous les critères : A11 GO, reprendre validation B01 → B09.
- Tant qu'une preuve obligatoire manque : A11 NO-GO ; aucun déploiement de la V2 sur gh-pages.

## Retour utilisateur — 11 octobre 2026 — laboratoire A11
Résultat déclaré : **PASS**. Import STORE : `POS-ARM-001`, 2 visites, 2 documents, champ historique `SENTINEL-42`. Tests automatiques : `PASS · ZIP STORE et documents`, `PASS · Conservation des champs et visites`, `PASS · ZIP corrompu rejeté` avec erreur CRC sur `documents/visites/VIS-001/temoin.txt`.
**Portée :** validation utilisateur du laboratoire ZIP STORE et des contrôles automatiques affichés. **Ne prouve pas** DEFLATE dans le navigateur, l'interface atelier intégrale, ni la compatibilité d'un ancien ZIP réel. La passe A reste partielle et son gate final reste NO-GO tant que ces critères ne sont pas exécutés.

## Retour Chromium DEFLATE déclaré — 11 octobre 2026
- L'utilisateur signale **PASS** sur Chromium pour le test DEFLATE.
- Le texte transmis contient `IMPORT OK` pour l'appareil `POS-ARM-001`, une visite, deux documents, `SENTINEL-42`, et les trois lignes PASS des tests STORE/conservation/CRC.
- **Limite de preuve :** le texte fourni ne contient pas la sortie attendue de la section 5, à savoir `PASS · DEFLATE décompressé, CRC vérifié`, ni le détail du fichier DEFLATE sélectionné. Conserver l'état **PASS déclaré / preuve spécifique DEFLATE à compléter**, pas PASS attesté.
- Firefox et le parcours complet de l'atelier restent non validés. A11 demeure NO-GO pour clôture globale.
