# PDF Studio 1.0 — functional contract

Status vocabulary:
- IMPLEMENTED: code and UI exist.
- BROWSER-TESTED: automated Chromium interaction passed.
- EXTERNAL: requires a configured provider or account.
- PENDING: not yet accepted.

| Area | Function | Target |
|---|---|---|
| Branding | canonical nLab wordmark and design tokens | BROWSER-TESTED |
| Studio shell | common header/menu/ribbon/status | BROWSER-TESTED |
| Sidebar | resize, normal/compact/hidden, restore | BROWSER-TESTED |
| Configuration | section 0 before input | BROWSER-TESTED |
| Variables | named variables and five stamp dates | BROWSER-TESTED |
| Config JSON | import/export profile | IMPLEMENTED |
| Input | manual by default + Load | BROWSER-TESTED |
| Input | files, folders, ZIP | IMPLEMENTED |
| Input | persistent last folder handle | IMPLEMENTED |
| File queue | explorer, current file, select all/none, history | IMPLEMENTED |
| Output | manual root + persistent handle | IMPLEMENTED |
| Output | same source / treatment subfolder / date archive / download | IMPLEMENTED |
| Output | explicit Activate mode | BROWSER-TESTED |
| Output | PDF + ZIP | BROWSER-TESTED |
| Naming | prefix/template/suffix | IMPLEMENTED |
| Naming | OCR/DPI/JPEG/GRIS/ANNOT/FUSION suffixes | IMPLEMENTED |
| Pages | thumbnails with top-left checkbox | BROWSER-TESTED |
| Pages | current / checked / entire document scope | BROWSER-TESTED |
| Pages | all / none selection | BROWSER-TESTED |
| Viewer | horizontal thumbnail scrolling | BROWSER-TESTED |
| Viewer | thumbnail zoom | BROWSER-TESTED |
| Viewer | document zoom / width / page fit | IMPLEMENTED |
| Pages | rotate scope | BROWSER-TESTED |
| Pages | add blank / duplicate / delete / extract | IMPLEMENTED |
| Pages | merge checked PDFs | BROWSER-TESTED |
| Objects | text / highlight / pen / image | IMPLEMENTED |
| Stamps | presets + custom template + five dates | IMPLEMENTED |
| Stamps | apply to current/scope | BROWSER-TESTED |
| Stamps | import/export JSON | IMPLEMENTED |
| Signature | visual draw/import | IMPLEMENTED |
| Signature | Drive signature library | EXTERNAL |
| OCR | Tesseract scope OCR | IMPLEMENTED |
| Optimization | DPI/JPEG/grayscale scope | IMPLEMENTED |
| Translation | side-by-side / facing pages | IMPLEMENTED |
| Translation | Browser Translator API | EXTERNAL |
| Translation | HTTP provider | EXTERNAL |
| Google | OAuth Drive connection | EXTERNAL |
| Google | Documents / Signatures / Exports / Releases folders | EXTERNAL |
| Google | Picker for arbitrary Drive file | EXTERNAL |
| DSS | external PAdES endpoint connector | EXTERNAL |
| Diagnostics | visible runtime contract | IMPLEMENTED |
