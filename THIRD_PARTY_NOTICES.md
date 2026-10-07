# nLab Studios — Third-party notices

Copyright © 2026 nLab contributors.

nLab Studios uses third-party open-source software. Those components **retain their original licenses and copyright notices** and are not relicensed under the nLab Studios license.

The nLab-owned Studio code is distributed under the **PolyForm Noncommercial License 1.0.0**. See `LICENSE`.

This notice is the human-readable GitHub view of the structured registry in `THIRD_PARTY_COMPONENTS.json`. The public Web view is available from `Info/licenses.html`.

## Third-party components

| Component | Version used | Author / project | Official source | License | Used by |
|---|---:|---|---|---|---|
| pdf-lib | 1.17.1 | Andrew Dillon / pdf-lib contributors | https://github.com/Hopding/pdf-lib | MIT | PDF Studio, PDF Sign, Merge Studio |
| PDF.js | 3.11.174 | Mozilla and contributors | https://github.com/mozilla/pdf.js | Apache-2.0 | PDF Studio, PDF Sign, Merge Studio |
| Mammoth.js | 1.8.0 | Michael Williamson / contributors | https://github.com/mwilliamson/mammoth.js | BSD-2-Clause | PDF Studio / document conversion paths |
| JSZip | 3.10.1 | Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso / contributors | https://github.com/Stuk/jszip | MIT OR GPL-3.0 | PDF Studio |
| SheetJS CE (xlsx) | 0.18.5 | SheetJS | https://git.sheetjs.com/SheetJS/sheetjs | Apache-2.0 | PDF Studio, Data Studio, Spreadsheet Studio |
| Tesseract.js | 7.x (OCR Studio), 5.x path in PDF Studio | Project Naptha / contributors | https://github.com/naptha/tesseract.js | Apache-2.0 | OCR Studio, PDF Studio, Scan/OCR paths |
| Tesseract OCR | engine used by Tesseract.js | Tesseract OCR contributors | https://github.com/tesseract-ocr/tesseract | Apache-2.0 | OCR functions |
| qr-code-styling | 1.9.2 | Denys Kozak | https://github.com/kozakdenys/qr-code-styling | MIT | QR & Barcode Studio, PDF Studio |
| bwip-js | 4.11.4 | Mark Warren / contributors | https://github.com/metafloor/bwip-js | MIT | QR & Barcode Studio, PDF Studio |
| html5-qrcode | 2.3.8 | Minhaz / contributors | https://github.com/mebjas/html5-qrcode | Apache-2.0 | QR & Barcode Studio |
| Ace / ace-builds | 1.44.0 | Ajax.org B.V. / Ace contributors | https://github.com/ajaxorg/ace | BSD-3-Clause | Code Studio |
| Papa Parse | 5.7.0 | Matthew Holt / contributors | https://github.com/mholt/PapaParse | MIT | Data Studio |
| Marked | 18.0.6 | MarkedJS contributors | https://github.com/markedjs/marked | MIT | Markdown Studio |
| DOMPurify | 3.4.16 | Cure53 / contributors | https://github.com/cure53/DOMPurify | Apache-2.0 OR MPL-2.0 | Markdown Studio |
| js-yaml | 4.1.0 | nodeca / contributors | https://github.com/nodeca/js-yaml | MIT | Markdown Studio |
| pdfstudio | 0.4.0 | Fayaz Ahmed / contributors | https://github.com/fayazara/pdfstudio | Apache-2.0 | PDF Studio security functions |
| qpdf | WebAssembly dependency through pdfstudio | qpdf contributors | https://github.com/qpdf/qpdf | Apache-2.0 | PDF Studio security functions |

## Runtime CDN locations observed in the Studios

The current Studio code loads some libraries directly from public CDNs, notably **jsDelivr**, **cdnjs** and **unpkg**. The exact URLs observed during the Studio audit are recorded in `THIRD_PARTY_COMPONENTS.json`.

Using a CDN does not replace or override the upstream license. Each component continues to be governed by its upstream terms.

## Attribution principle

nLab credits the upstream authors and projects because their work is used by the Studios. Inclusion in this notice does not imply endorsement of nLab by those authors or projects.

## Audit scope

This notice currently covers the nLab **Studios family** and the dependencies identified in the current/test Studio implementation. It is intended to be maintained whenever a dependency is added, removed or materially upgraded.

The broader nLab ecosystem (Briques, Frameworks and other families) is intentionally outside this first licensing scope and can be audited separately before the licensing model is extended.

## Important

This file summarizes third-party licensing information for practical attribution and compliance tracking. The original upstream license text and copyright notices remain authoritative.
