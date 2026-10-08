# Plan de migration physique / purge Legacy — 2026-10-08

## État

- Déploiement public : **Studio Core 3.4.0 TEST publié sur gh-pages**.
- Legacy utile #48 Viewer Core : **récupéré**.
- Legacy utile #49 Input Launcher : **récupéré**.
- Icon Library inputAcquire : **publiée avec manifeste**.
- PR historiques #1/#17/#23/#41/#48/#49/#59 : **fermées / réconciliées**.
- Branches totalement absorbées : **réalignées sur main**.
- Branches de travail fusionnées #50–#60 : anciens HEAD documentés puis refs réalignées sur main.

## CURRENT / TEST qui bloquent une purge physique immédiate

| Studio | CURRENT | Chemin CURRENT | TEST | Chemin TEST | Décision |
|---|---:|---|---:|---|---|
| PDF Studio | 0.9.10 | `app-0.9.10.html` | 2.11.0 | `v2/` | conserver le legacy PDF CURRENT tant qu’une promotion n’est pas décidée |
| Image Studio | 0.2.1 | `./` | 2.7.0 | `v2/` | racine legacy encore publique |
| OCR Studio | 0.1.0 | `./` | 2.3.0 | `v2/` | racine legacy encore publique |
| Code Studio | 0.2.0 | `./` | 2.4.0 | `v2/` | racine legacy encore publique |
| JSON Studio | 0.2.0 | `./` | 2.2.0 | `v2/` | racine legacy encore publique |
| Data Studio | 0.2.0 | `./` | 2.4.0 | `v2/` | racine legacy encore publique |
| QR & Barcode Studio | 0.2.0 | `app-0.2.0.html` | 2.4.1 | `v2/` | conserver ancienne page jusqu’à promotion |
| File Studio | 0.1.0 | `./` | 2.4.0 | `v2/` | racine legacy encore publique |
| Scan Studio | — | — | 0.4.0 | `v2/` | pas de CURRENT legacy |
| Markdown Studio | — | — | 2.3.0 | `v2/` | pas de CURRENT legacy |
| Dataset Generator | — | — | 2.3.0 | `v2/` | pas de CURRENT legacy |
| Document Studio | — | — | 1.3.0 | `v2/` | pas de CURRENT legacy |
| Spreadsheet Studio | — | — | 1.3.0 | `v2/` | pas de CURRENT legacy |
| PDF Sign | — | — | 0.3.0 | `v1/` | V1 est encore la TEST active, donc pas legacy supprimable |
| Merge Studio | — | — | 0.4.0 | `v1/` | V1 est encore la TEST active, donc pas legacy supprimable |

## Compatibilités à conserver

### `APP-Applications/studios-v2/`
Route dépréciée mais encore vérifiée par le pipeline Pages. Elle doit rester comme **stub / redirection de compatibilité** vers `APP-Applications/studios/`, pas comme nouvelle source canonique.

### `APP-Applications/_shared/studio-v1/`
Encore requis par PDF Studio V1 et certaines apps dérivées. **Non purgeable** tant que ces consommateurs ne sont pas migrés.

### PDF Studio `app-0.9.*` et `runtime09*`
Le workflow Pages vérifie encore explicitement 0.9.10 → 0.9.25. Une suppression physique nécessite d’abord :
1. promotion d’une cible moderne ;
2. création de stubs/redirections pour les URLs historiques importantes ;
3. simplification du workflow Pages ;
4. smoke test des anciennes URLs ;
5. suppression par lots.

## Ordre proposé pour la purge physique

### Vague P1 — Studios dont V2 est déjà fortement validée
1. Image Studio
2. Code Studio
3. JSON Studio
4. Data Studio
5. File Studio
6. OCR Studio
7. QR & Barcode Studio

Pour chacun :
- valider/promouvoir la V2 comme CURRENT ;
- conserver l’ancienne URL racine sous forme de redirection/stub ;
- déplacer les anciens fichiers non référencés vers archive temporaire ou les supprimer après audit de références ;
- tester CURRENT + ancienne URL.

### Vague P2 — Studios sans CURRENT legacy
- Scan
- Markdown
- Dataset Generator
- Document
- Spreadsheet

Ces Studios sont déjà structurellement plus simples : la purge porte surtout sur les branches/fichiers expérimentaux, pas sur une ancienne CURRENT publique.

### Vague P3 — PDF
PDF est traité séparément, car :
- CURRENT 0.9.10 est encore public ;
- de nombreuses URLs 0.9.x sont explicitement testées ;
- V1 portable et V2 coexistent ;
- les runtimes 09xx restent dans le contrat de publication.

La purge PDF doit être une migration dédiée avec matrice URL ancienne → stub/redirect → cible canonique.

## Gate de suppression

Un fichier/dossier Legacy ne peut être supprimé que si :
- aucune version CURRENT/TEST ne le référence ;
- aucune route publique critique n’en dépend sans redirection ;
- aucun import/runtime/test ne le référence ;
- le remplacement canonique est identifié ;
- smoke + fonctionnel + audit passent après suppression.

## Décision

**GO : récupération Legacy et nettoyage des branches.**

**GO : préparer la migration physique par familles.**

**NO-GO : suppression globale immédiate des racines Legacy encore utilisées par CURRENT.**

La prochaine action structurante est la promotion contrôlée des V2 validées vers CURRENT, famille par famille, avec stubs d’URL, puis purge physique des anciennes implémentations.


## Vague P1 engagée — promotion CURRENT sans rupture d’URL

Branche : `legacy-migration-p1-promote-v2-current`.

Principe appliqué :
- l’ancienne racine publique `APP-Applications/<studio>/` est conservée ;
- cette racine devient un stub de compatibilité vers `v2/?channel=current` ;
- `/v2/` sans paramètre reste le canal TEST ;
- le moteur V2 n’est pas dupliqué ;
- la version V2 précédemment TEST devient CURRENT ;
- un nouveau snapshot patch devient TEST pour poursuivre le développement.

Studios de la vague : Image, Code, JSON, Data, File, OCR, QR & Barcode.

La suppression des anciens fichiers métier hors `index.html` n’est pas incluse dans cette sous-passe : elle ne commencera qu’après validation de la route CURRENT/TEST et inventaire des références entrantes.


## Vague P2 engagée — fin des racines V1 hors PDF

Studios : Scan, Markdown, Dataset Generator, Document, Spreadsheet.

- leur V2 validée devient CURRENT ;
- un snapshot patch distinct reste TEST ;
- toutes les racines publiques deviennent des stubs vers `v2/?channel=current` ;
- les anciennes interfaces V1 de Markdown et Dataset Generator ne sont plus servies à la racine ;
- aucune suppression de fichier historique versionné n’est encore faite dans cette sous-passe.

Après validation de P2, **PDF Studio devient la seule famille conservant une CURRENT historique pré-V2**.
