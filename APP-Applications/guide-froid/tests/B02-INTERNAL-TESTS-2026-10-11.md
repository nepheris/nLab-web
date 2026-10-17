# Guide Froid V2 — B02 · Batterie de contrôles internes

Date : 2026-10-11 ; source : `main`. Vérification du code téléchargé directement via connecteur GitHub.

## Tests d'exécution du moteur JS (isolation des fonctions réelles)

Les fonctions `zip`, `unzip`, `crc32`, `normalizeImportedDevice` de `dossiers/app.js` ont été extraites du code `main` et exécutées en environnement V8 avec polyfills minimalistes de Blob et TextEncoder/TextDecoder :

| Test | Résultat |
|---|---|
| Projection d'un appareil V1 imbriqué vers V2 | PASS |
| Conservation d'un champ historique et d'une visite | PASS |
| ZIP STORE → décompression, deux visites et pièce jointe | PASS |
| CRC : altération d'un octet du contenu puis import | PASS — ZIP rejeté avec « Contrôle CRC invalide pour test.txt » |

**Incidence sur le harnais :** une première corruption placée sur une séquence détectée heuristiquement a produit un faux FAIL de test ; le scénario a été corrigé en visant directement l'octet des données après l'en-tête local ZIP. Le moteur a alors rejeté le fichier.

## Contrôles statiques du contrat B02

| Invariant | Résultat |
|---|---|
| Enveloppe v3 et blobs en IndexedDB | PASS |
| Restauration de l'appareil et ajout à l'historique | PASS |
| Identifiant de diagnostic stable et garde anti-doublon | PASS |
| Redirection vers le dossier après diagnostic | PASS |
| Fiche ZIP et visites antérieures affichées | PASS |
| Export ZIP n'affirme pas que le téléchargement est terminé | PASS |
| Les binaires ne sont pas sérialisés dans sessionStorage | PASS |
| Transfert expiré refusé à la lecture | PASS |

**Limites :** les huit contrôles B02 sont une revue statique ciblée du code, pas une simulation complète d'IndexedDB/DOM. La validation des ZIP historiques réels, de DEFLATE, de gros dossiers, de l'interface graphique, de la restauration effectivement persistée et de la purge IndexedDB n'est **pas** démontrée par cette campagne. Aucun déploiement public final n'est autorisé sur cette seule base.

## Décision

B02 = **PARTIAL** : moteur ZIP STORE et invariants principaux contrôlés ; restent tests navigateur sur IndexedDB, enregistrement d'un diagnostic, conservation après ZIP et purge du stockage temporaire. Privilégier l'automatisation par harnais Node/Playwright ou navigateur sans nouvelles demandes de validation manuelle tant que des tests peuvent être automatisés.
