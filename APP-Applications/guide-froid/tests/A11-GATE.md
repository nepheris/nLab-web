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

## Retour Chrome + Firefox — 11/10/2026
- Les deux navigateurs ont affiché PASS pour ZIP STORE, conservation et rejet CRC.
- Firefox 157.0 : FAIL en section 5 avec `Ce ZIP ne contient pas d’entrée DEFLATE (méthode 8)`.
- Vérification indépendante du pack de référence : `A11_reference_DEFLATE.zip` utilise bien la méthode 8 pour ses quatre entrées ; `A11_reference_STORE.zip` utilise la méthode 0. Le fichier effectivement sélectionné dans Firefox n'a pas été communiqué. **Cause probable, non prouvée : mauvais ZIP choisi.**
- Le labo public a été modifié pour afficher le nom du fichier et indiquer le ZIP attendu. **A07 DEFLATE navigateur reste NON VALIDÉ** ; refaire les tests ciblés Chrome et Firefox.

## Recette A11 DEFLATE — 11 octobre 2026, après correction
Retour utilisateur : **Chrome PASS ; Firefox FAIL**. Aucun message détaillé fourni pour Firefox. Ne pas inférer la cause. A07 DEFLATE est **PARTIAL / cross-browser FAIL**, Firefox à diagnostiquer avec nom du fichier, message exact, méthode ZIP et version du navigateur. Chrome PASS déclaré. A11 reste **NO-GO**. Préparer une preview de l'atelier V2 pour recette A10 UI sans remplacer l'application publique.

## Recette atelier V2 — 11/10/2026
Résultat utilisateur : **PARTIAL**, observations : aucune précision. Il n'est pas possible d'attribuer ce PARTIAL à une panne précise. Les correctifs de suivi des photos et d'isolation des pièces de visite sont intégrés sur main et la page labo. Rejouer uniquement les contrôles A10 encore non prouvés : création appareil + une photo + document, visite, export, réimport et comptage. En cas d'erreur, relever **étape, message affiché, navigateur**, sans données privées. A11 demeure **NO-GO** ; Firefox DEFLATE demeure **FAIL déclaré** sans diagnostic détaillé.

## Recette complémentaire demandée — fichiers, visites et index autonome
Demandes intégrées sur `main` et `gh-pages/APP-Applications/guide-froid/atelier-a11` :
- Prévisualisation des images dans la liste ; bouton d'aperçu PDF intégré ; lien Voir pour les autres documents.
- Import multiple, dossiers et glisser-déposer via Universal Input avec repli ; bouton de remise à zéro confirmé.
- Numérotation séquentielle des visites `VIS-0001`, `VIS-0002`, etc., calculée à partir de l'historique déjà chargé, y compris sans numéro explicite. Les pièces jointes des visites ne remplacent plus les homonymes d'une sélection en attente.
- Export ZIP : `index.html` liste les documents, conserve des liens relatifs après extraction, et inclut les images jusqu'à 2 Mo pour leur aperçu et l'impression PDF ; les autres fichiers restent accessibles sous forme de liens.
- Les SVG sont explicitement annoncés comme schématiques/génériques ; les silhouettes restent à faire valider visuellement.

**Tests à faire avant DONE :** importer au moins deux images, un PDF et un autre fichier ; ouvrir/retirer/vider/réimporter ; créer trois visites successives (même jour et jours distincts) avec pièces jointes homonymes ; ZIP → réimport ; extraire et ouvrir le `index.html` ; imprimer en PDF et vérifier les images et la liste documentaire. Évaluer Chrome et Firefox. A11 reste **NO-GO** jusqu'aux contrôles de compatibilité obligatoires, notamment Firefox DEFLATE.

## A07 — nouveau test Firefox sans sélection de fichier (11/10/2026)
La page isolée `guide-froid/labo-a11/` contient désormais un ZIP DEFLATE témoin intégré (371 octets, deux entrées, méthode 8) et deux actions : **Télécharger ZIP DEFLATE vérifié** et **Tester DEFLATE automatiquement**. Le script de la page a passé un contrôle syntaxique ; pas encore de retour navigateur réel. Exécuter le bouton automatique dans Firefox et relever le message complet. Le résultat doit être interprété comme suit : PASS => compatibilité DEFLATE du moteur isolé confirmée ; FAIL => diagnostiquer `DecompressionStream('deflate-raw')` et prévoir un décompresseur de repli compatible, sans modifier les anciens ZIP. Ne pas ouvrir B avant la recette de l'atelier et la décision A11.

## Incident Firefox : navigateur « ne répond pas » — capture utilisateur 11/10/2026
Capture montrant la boîte de dialogue native Firefox **avant toute sortie du test DEFLATE**. Il s'agit d'un gel du processus/onglet ; ce n'est ni un PASS ni un FAIL du décodeur et sa cause reste inconnue. Le ZIP DEFLATE interne a été contrôlé indépendamment : 371 octets, deux fichiers, méthode 8, extraction valide en Python. Mesure préventive appliquée au labo gh-pages : bornage de la recherche de l'annuaire ZIP à la fenêtre maximale de commentaire ZIP (65557 octets) et refus des fichiers >30 Mo. Ces protections ne démontrent pas la résolution du gel. Demander de relancer Firefox en onglet neuf, sans attendre si le navigateur reste figé ; tester le bouton automatique et communiquer le résultat. A07/A11 encore bloqués.

## Firefox 157 — A07 DEFLATE automatique PASS (retour utilisateur, 11/10/2026)
L'utilisateur fournit la sortie explicite `PASS · DEFLATE automatique, CRC et deux fichiers vérifiés` et l'agent utilisateur `Firefox/157.0` (Ubuntu). **A07 DEFLATE navigateur Firefox : PASS sur fixture intégrée**, sans dépendance au téléchargement ni sélection du fichier. Les tests STORE et CRC précédemment réussis restent acquis. **Réserve :** captures antérieures de téléchargements ZIP échoués dans Firefox ; le téléchargement et le cycle export/réimport A10 via interface entière restent à contrôler. Le total documents affiché lors de ce dernier essai STORE est de 1 pour l'archive sélectionnée ; il ne faut pas l'assimiler au test des deux documents du ZIP STORE initial. A11 reste NO-GO jusqu'à preuve A10 interface et téléchargement Firefox.

## Recette A10 — Firefox : anomalie export ZIP + ergonomie (11/10/2026)
Retour utilisateur : dans l'atelier isolé, sélection de fichiers, export JSON et impression de la fiche appareil fonctionnent ; **Exporter le ZIP complet ne fonctionne pas** ; glisser-déposer absent ou non opérant. Les demandes associées portent sur : regroupement des denrées Fruits et légumes et Protidiques (viande, poisson, plats cuisinés), choix multiples ; distinction des portes avant/arrière des chambres froides ; porte pleine et option future de rideaux à lanières PVC, sans options vitrage inadaptées.
Correctifs appliqués sur `main` et sur `gh-pages/.../atelier-a11/app.js` : ancre de téléchargement insérée au DOM + délai de libération de l'URL 120 s ; message « téléchargement demandé » sans prétendre que le fichier a été enregistré ; regroupement catégories avec migration en mémoire des anciens choix ; gestion explicite de dragenter/dragover/drop ; dessin générique de chambre froide avec porte avant et porte arrière quand ≥2 portes, vitrage restreint à plein. Contrôle syntaxe JavaScript **PASS** ; exécution Firefox et fonctionnement réel **non vérifiés**.
**Gates** : A10 PARTIAL/ZIP téléchargement Firefox FAIL signalé ; A11 NO-GO. Prochain contrôle : un seul ZIP exporté sur Firefox avec vérification du gestionnaire, de son contenu et du réimport. Reste à traiter dans les tâches B/C : rideaux à lanières PVC, drag-and-drop de dossiers complets et cohérence globale de l'Input Core commun dans tous les écrans.

## Mise à jour gate — 11 octobre 2026 : recette navigateur achevée
**Confirmation utilisateur explicite :** toutes les fonctionnalités ont été testées et validées dans **Firefox et Google Chrome** ; le **réimport ZIP fonctionne**. L'export ZIP Firefox et le glisser-déposer avaient reçu un PASS explicite ; la décompression DEFLATE automatique Firefox 157 avait également reçu un PASS explicite.
**A10 = PASS sur l'atelier isolé et les deux navigateurs**. **A07 navigateur = PASS** sur les scénarios rapportés. Le précédent FAIL Firefox et l'ancien A10 PARTIAL sont clos par les contrôles ultérieurs.
**A11 = validation utilisateur PASS pour la recette fonctionnelle de l'atelier isolé**. Réserve documentaire indépendante : un import d'archive historique réelle et une vérification exhaustive des liens/documentation hors démo ne sont pas accompagnés de pièces de preuve individuelles ; ne pas les déclarer attestés. Ne pas assimiler l'atelier isolé à une validation de la totalité du site public ni déclencher sa publication automatiquement. La passe B peut continuer sur la base de la validation utilisateur de la passe A, avec ces réserves tracées.

## Décision de pilotage — 11 octobre 2026 : démarrage passe B
Le responsable confirme explicitement : « tous les points de la partie A sont validés, on peut passer à la passe B ». **Décision opérationnelle : GO B** ; A01–A11 sont acceptés par le responsable pour poursuivre le projet, notamment recette utilisateur Chrome/Firefox de l'atelier isolé avec export et réimport ZIP. Les réserves de preuve historique réelle et de publication finale demeurent consignées et ne doivent pas être masquées ou transformées en tests exécutés. Le site principal gh-pages n'est pas remplacé avant la passe E.
Première tâche B : auditer B01–B09 existants et terminer les fonctions incomplètes, en priorisant B02 (transfert du dossier complet vers le diagnostic), Input commun et cohérence de l'historique.
