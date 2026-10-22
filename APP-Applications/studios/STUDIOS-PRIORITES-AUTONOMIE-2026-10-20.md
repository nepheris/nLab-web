# nLab Studios — priorités, dépendances et travaux autonomes
_Décision de pilotage au 20 octobre 2026 — document de suivi sur la branche **TEST**, aucun changement de CURRENT._

## Principes non négociables
1. **Core d'abord** : figer et accepter Core 3.10 / Lab 0.8 avant toute adoption transversale du nouveau shell. L'apparence de référence reste la maquette UX 0.5 et l'identité graphique nLab.
2. **Deux circuits distincts** : (a) composants/UI communs adoptés **opt-in** et (b) moteurs métier Image/PDF/OCR/QR. Ne pas confondre leurs résultats CI.
3. **Pas de promotion automatique** : PR ouverte, CI PASS ciblée, branche « mergeable », ou viewport simulé ne constituent pas une recette Chrome Linux + Android. Conserver CURRENT et chaque URL historique.
4. **Traçabilité** : chaque tâche = responsable/périmètre, preuve test, dépendances, statut réel, canal TEST, décision GO/NO-GO. Les migrations sont réversibles.

## File priorisée — piste A : Core (priorité absolue)

| ID | Ordre | Chantier | État vérifié | Autonome maintenant | Porte de sortie |
| --- | --- | --- | --- | --- | --- |
| STU-A01 | P0 | Core 3.10 TEST, Lab 0.8 : profil, nommage, dates, ruban, historique, volet, fenêtres, responsive et plein écran partagés | **PATCHED TEST**, [PR #93](https://github.com/nepheris/nLab-web/pull/93) ouverte | Oui : corriger bugs CI, UX, sécurité, tests sans modifier CURRENT | CI Chrome desktop/tablette/mobile + audit + PDF pilote |
| STU-A02 | P0 | Validation imports URL : HTTP 404, corps vide, HTML trompeur, refus réseau/CORS, taille, format ; ne jamais déposer de fichier en cas d'échec | **TESTS AJOUTÉS** à #93 ; scénario tiers réel absent | Oui pour tests simulés ; non pour autorisation CORS d'un site tiers | Erreurs lisibles, sélection préservée, cas réel documenté |
| STU-A03 | P0 | Fenêtres, rail et affichage sous 700/820/1440 px, clavier, thème et persistance locale | **CI Core ciblée PASS** sur #93, correctif CSS tablette | Oui : automatiser régressions, captures, tests focus | Revue visuelle + recette sur appareils |
| STU-A04 | P0 | Intégrité des archives Lab 0.1–0.7 et rollback | **7/7 smoke HTTP+JS PASS**, comportement de chaque ancienne version non exhaustivement validé | Oui : enrichir les scénarios d'archives ; ne pas réécrire les snapshots | Liens/version-service et fonctions essentielles intacts |
| STU-A05 | P0 | GO/NO-GO Core : Chrome Linux et Android réels, PWA installée/standalone, permissions dossiers, plein écran et clavier/tactile | **PENDING HUMAN** | Préparer matrice, protocole, collecte d'anomalies | Approbation explicite après tests réels |
| STU-A06 | P1 | Revue de factorisation (CSS, fenêtres, fullscreen, profile, manifests) : retirer les doublons uniquement après comparaison des consommateurs | **À AUDITER** | Oui en lecture et tests ; refactoring séparé | API du Core stable et non-régression par Studio |

## File priorisée — piste B : indépendante du gel UI Core

| ID | Ordre | Chantier | État vérifié | Autonome maintenant | Porte de sortie |
| --- | --- | --- | --- | --- | --- |
| STU-B01 | P0 | Image Studio : diagnostic suite V2 exhaustive, calibration réelle du canvas `#kx/#dx` | Timeout récurrent à `tests/studios-v2-exhaustive.mjs:20` ; [PR #94](https://github.com/nepheris/nLab-web/pull/94) **DRAFT** (attente de décodage, vrais clics, diagnostic) | **Oui**, branche indépendante de #93 | CI exhaustive réellement déclenchée et PASS ; sinon corriger runtime dans lot indépendant |
| STU-B02 | P1 | Workflow CI : exécuter les tests lorsque seule leur implémentation change dans une PR | **CORRIGÉ dans PR #94** : `pull_request.paths` élargis aux tests V2 | Oui | GitHub Actions démarre sur PR tests-only |
| STU-B03 | P1 | Legacy/historiques : reconciler [PR #70](https://github.com/nepheris/nLab-web/pull/70) et [PR #67](https://github.com/nepheris/nLab-web/pull/67) | PR ouvertes et non fusionnables avec `main` au 20/10 ; #70 annonce 130 versions dans sa branche | Oui : inventorier conflits, tester registres, compiler preuves ; pas de purge | Conflits réglés, 100 % des URLs canoniques validées, retour arrière connu |
| STU-B04 | P1 | Responsive Test Studio : comparer [PR #72](https://github.com/nepheris/nLab-web/pull/72) à Responsive CURRENT 0.4.3 | PR ancienne non fusionnable ; fonctionnalités déjà présentes dans CURRENT à ne pas dupliquer | Oui : revue de différences, tests simulateur/iframe | Conserver CURRENT ; reprendre seulement les fonctions réellement inédites |
| STU-B05 | P1 | Studio Hub : inventaire des versions/status/capacités, indicateurs de santé fondés sur preuves | Roadmap ouverte | Oui : audit en lecture, tests des manifestes et propositions d'UI isolées | Pas d'indicateur « PASS » sans test ou donnée réelle |
| STU-B06 | P1 | PDF 2.12 UX : détecter régressions de lecture/enregistrement réel et contrat de partage Core | Pilote TEST et CI ciblée PASS | Oui pour contrôles moteur/version ; **migration UI différée** | Core GO + PR opt-in propre au PDF |
| STU-B07 | P2 | OCR : variantes de moteur/langues FR-EN, erreurs explicites, fixtures synthétiques | Capacités partagées présentes | Oui : tests de non-régression et diagnostics isolés | Résultats OCR reproductibles et limites documentées |
| STU-B08 | P2 | QR/Barcode : couverture formats, scan image, erreurs de validation et symbologies partagées | Service commun existant | Oui : scénarios synthétiques indépendants | Tests multi-formats sans régression UI |
| STU-B09 | P2 | PWA par Studio : manifestes, `start_url`, icônes, offline explicite, installation | Couverture partielle | Oui en **audit statique** ; installation effective sur appareil réel à valider | Manifestes par Studio + test Chrome/Android individuel |

## Réconciliation technique des PR historiques (audit des fichiers du 20/10)

L'inventaire des fichiers modifiés révèle des collisions **avant fusion**. Ces nombres sont des chevauchements de chemins GitHub, pas une preuve de conflits textuels identiques ; GitHub indique néanmoins les PR #67, #70, #71 et #72 **non fusionnables** avec `main` à la date de l'audit.

| PR en collision | Chemins communs | Décision technique |
| --- | ---: | --- |
| #70 ↔ #71 | **13** fichiers | Extraire les tests Core B02–B09 utiles, supprimer la duplication des composants `color-picker`, `input-picker`, `viewer-control`; ne pas fusionner deux versions divergentes du Core |
| #70 ↔ #93 | **2** (`input-picker.js`, `studio.css`) | Préférer le Core 3.10 stabilisé comme base ; reporter et tester uniquement les correctifs manquants |
| #71 ↔ #93 | **2** (mêmes modules Core) | Rejouer les scénarios de #71 contre #93 ; ne pas restaurer l'ancien CSS ou écraser le nouveau picker |
| #67 ↔ #70 | **1** (`tests/studio-version-history.mjs`) | Canoniser la gate d'archives sur la matrice la plus récente sans supprimer les 128 historiques du lot antérieur |
| #70 ↔ #72 | **1** (validateur du registre) | Revalider la cohérence du catalogue après résolution |
| #71 ↔ #72 | **3** (validateurs Guide Froid, features et registres) | Ne pas cherry-pick des validateurs obsolètes isolément |

Les branches #67/#70/#71/#72 ont divergé de `main`; **aucune fusion en bloc**. Pour chaque candidat à la reprise : base actuelle → copie minimale des changements utiles → tests spécifiques → CI globale → décision explicite. La PR #94 est séparée et ne partage aucun fichier avec #93.

## Point d'avancement vérifié — 22 octobre 2026

Cette section complète la baseline du 20 octobre. **Seules les branches TEST/DRAFT ont été modifiées.** Les validations ci-dessous sont des résultats CI datés, pas des GO utilisateurs.

| ID / chantier | Fait pendant les passes autonomes | Preuve / statut |
|---|---|---|
| STU-A01 Core 3.10 | Renforcement des tests réels du composant de couleurs **déjà canonique** `color-control.js` : HEX/RGB/HSL et UI Chrome ; aucun ancien color-picker concurrent importé de #71. Préparation du protocole C-01 à C-16 pour Desktop/Android. | [PR #93](https://github.com/nepheris/nLab-web/pull/93) : Core Chrome [PASS](https://github.com/nepheris/nLab-web/actions/runs/39758839693), PDF pilote et audit PASS ; recette sur appareils encore PENDING. |
| STU-A02 Imports | HTTP 404, réponse vide, protocole erroné, HTML trompeur, refus réseau/CORS et profil JSON impossible, tous couverts en TEST. | PR #93, tests Chrome ciblés PASS. |
| STU-A04 Archives / Legacy | Nouvel audit réutilisable des registres, plus test Chromium des URL réellement versionnées. Remplacement de l'attente fragile de 250 ms par contrôle asynchrone d'identité et du statut HISTORICAL, sans toucher aux snapshots. | [PR #95](https://github.com/nepheris/nLab-web/pull/95) : **140/140 URL PASS**, 18 Studios/apps, 108 historiques, 0 incohérence statique ; [preuves CI](https://github.com/nepheris/nLab-web/actions/runs/39759282780). |
| STU-B01 Image Studio | Le test de calibration attend le redécodage après rotation/miroir, clique sur le vrai canvas et dispose de diagnostics. La CI reconnaît les PR qui ne modifient que les tests. | [PR #94](https://github.com/nepheris/nLab-web/pull/94) : 2 exécutions complètes spécialisées PASS ; DRAFT non fusionnée. |
| STU-B03 Legacy | Inspection des chevauchements des PR anciennes #67/#70/#71/#72. Les branchements divergents restent incompatibles avec la base moderne. | #95 fournit une nouvelle gate indépendante ; aucune purge ni fusion en bloc. |
| STU-B04 Responsive | La version 0.4.3 CURRENT est plus avancée que les sources de #72 (simulateur partagé contemporain, plein écran et URL modifiable). | Préserver CURRENT ; reprendre seulement les tests réellement manquants de #72, après comparaison API. |
| STU-B05 Studio Hub | Nouvelle page `APP-Applications/studios/health.html` à l'identité nLab, recherche/filtres et navigation ; génération JSON/Markdown + captures sans écriture sur CURRENT. | [PR #95](https://github.com/nepheris/nLab-web/pull/95) : tests Desktop/Mobile PASS ; page non publiée tant que DRAFT non fusionnée. |
| STU-B06 PDF | Contrôle pilote métier toujours isolé des éditions du Core. | PR #93 pilote PDF CI PASS, migration UI métiers BLOQUÉE par GO Core. |
| STU-B07/B08 OCR et QR | Les moteurs spécialisés sont inclus dans le run exhaustive V2 passé intégralement sur #94, sans modifier leurs runtimes. | Tests existants PASS sur #94 ; étendre fixtures ultérieurement sans dupliquer le Core. |
| STU-B09 PWA | Scan initial des manifestes à la racine : 1 présent parmi 18 Studio/apps. Un manifeste peut être rangé dans un snapshot ou une autre route. | Audit statique uniquement ; recette HTTPS/Chrome Android toujours PENDING. |

**Gates restantes :** validateur spécialisé de #93 peut échouer tant que la correction test-only de #94 n'est pas intégrée à sa base. Ne pas assimiler cet échec au succès ciblé Core et ne pas le masquer. Réconciliation contrôlée de #94 en premier, puis branche Core #93, recette réelle du Core, décision GO/NO-GO ; adoption opt-in ultérieure des Studios métiers. La CI du Hub #95 n'est pas la preuve de production publique du nouveau tableau.

---

## Dépendances et ordre de livraison
```text
[A] Core 3.10 TEST — CI, correction, recette humaine
    └── GO explicite sur Core
        ├── PDF UX opt-in / Image UX opt-in / OCR UX opt-in (une PR par Studio)
        └── généralisation des services de fenêtres, profils, thème, ruban, PWA

[B] Pendant [A], sans adoption du shell :
    ├── Image CI #94 (validation spécialisée)
    ├── preflight et réconciliation Legacy #70/#67
    ├── comparaison Responsive #72 vs CURRENT 0.4.3
    ├── tests des moteurs OCR / QR / PDF
    └── audit santé Hub et manifestes
```

## Tableau de décision GO / NO-GO
- **Core CI PASS ciblée** : autorise le maintien du candidat TEST, pas sa promotion.
- **CI spécialisée Image FAIL** : affecte la gate globale ; ne jamais désactiver, ignorer ou retarder artificiellement le test. Un échec hors Core n'efface pas les PASS Core, mais interdit d'annoncer un PASS global.
- **Archives** : aucune suppression/redirect non réversible, aucun alias CURRENT déplacé.
- **Core recette réelle PENDING** : pas de migration des interfaces métiers avant acceptation.
- **PR #70/#71/#72 conflictuelles** : inventorier et cherry-pick proprement, ne pas fusionner en bloc sur `main`.

Sources : `STUDIO-PLATFORM-V3-ROADMAP.md`, catalogues et `versions.json` canoniques, GitHub Actions des PR citées. Ce fichier décrit des statuts contrôlés au 20 octobre, non des réussites futures.
