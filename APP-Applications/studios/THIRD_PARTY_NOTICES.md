# nLab Studios — Third-party notices

This public Alpha/POC suite favors permissive open-source components.

- **bwip-js 4.11.4** — browser barcode / QR / Data Matrix renderer — MIT License.
- **qr-code-styling 1.9.2** — stylized QR renderer (dots, corners, gradients, logo/image) — MIT License.
- **Papa Parse 5.7.0** — CSV parser/unparser used by Data Studio — MIT License.
- **Ace / ace-builds 1.44.0** — browser code editor used by Code Studio — BSD-3-Clause License.
- **Tesseract.js 7.x** — browser OCR wrapper — Apache-2.0.
- **Tesseract OCR** — OCR engine used by Tesseract.js — Apache-2.0.
- **PDF Studio dependencies** remain documented with the existing PDF Studio package/version records.

The current QR & Barcode Studio, Data Studio, Code Studio and OCR Studio load their pinned browser libraries from jsDelivr. Future production hardening may vendor pinned copies locally so the public tools can run with fewer external runtime dependencies.

This notice is informational and does not replace the license files of the upstream projects.
