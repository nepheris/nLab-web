# PDF Studio — baseline 2.0.2

Reference frozen before the 2.1.0 convergence pass.

- Baseline version: **2.0.2 TEST**
- Baseline repository commit: `0970bfa7dd4f10ac2fbecb139c12eb3e45fc5b14`
- Date: 2026-09-30
- CURRENT remains: **0.9.10**
- TEST path remains: `APP-Applications/pdf-studio/v2/`

## Scope of the next base

The 2.1.0 pass is explicitly cumulative. It must preserve the 2.0.2 Core architecture while restoring useful V1/0.9.x behaviour that had disappeared:

- file collection navigation, sorting, grouping and lightweight thumbnails;
- richer file-format registry;
- compact page-organisation toolbar and thumbnail zoom;
- per-page actions and add-page tile;
- common undo/redo/history UX;
- output/classification and naming/template preview;
- full ribbon/tool inventory with canonical SVG icons;
- sidebar mouse resizing with persistent width;
- layout/ribbon visibility controls;
- unified Studios hub;
- demo corpus expansion for conversion/preview/regression tests.

Historical source of truth:
- `APP-Applications/pdf-studio/v1/FUNCTIONAL-CONTRACT.md`
- `APP-Applications/pdf-studio/v1/MASTER-REBUILD-CHECKLIST.md`
- `APP-Applications/_shared/studio-v1/icons.js`
- `APP-Applications/_shared/studio-v1/file-io.js`
- `APP-Applications/_shared/studio-v1/variables.js`

This file records the baseline only. Git history remains the authoritative snapshot of 2.0.2.
