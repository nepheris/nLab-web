# PDF Studio 1.0 — Master Rebuild Checklist

This document is the canonical scope for the 1.0 rewrite. A feature is not considered done merely because code exists.

Status levels:
- SPEC: requirement captured.
- IMPLEMENTED: UI + code exist in the 1.0 tree.
- BROWSER-TESTED: automated Chromium acceptance passed.
- EXTERNAL: requires account/provider/credential outside the public repository.
- PENDING: not yet accepted.

## 1. Common nLab Studio framework
- [x] Dedicated reusable folder `APP-Applications/_shared/studio-v1/`.
- [x] Canonical nLab design tokens.
- [x] Canonical nLab wordmark with n blue / Lab grey.
- [x] Common header, menu bar, ribbon, status bar.
- [x] Shared SVG/icon registry.
- [x] Reusable left sidebar layout.
- [x] Sidebar resize by mouse.
- [x] Sidebar normal / compact / hidden / restore.
- [x] Reusable section expand / collapse controls.
- [x] Reusable file/folder/ZIP workspace.
- [x] Reusable persistent File System Access handles.
- [x] Reusable variable engine.
- [x] Reusable Google Drive/OAuth service.
- [x] Reusable output writer.
- [ ] Migrate other Studios to studio-v1 after PDF Studio 1.0 acceptance.

## 2. Branding and navigation
- [x] Real nLab wordmark visible in PDF Studio.
- [x] nLab colors respected through shared tokens.
- [x] Link to nLab Web root.
- [x] Link to Studios.
- [x] Link to PDF Studio versions.
- [x] Version label 1.0.0 TEST.
- [x] No dependency on any `runtime09xx`.

## 3. Configuration / personal space
- [x] Section 0 shown before Input.
- [x] Named variables quick reference.
- [x] Five global dates: STAMP_DATE, DATE_A, DATE_B, DATE_C, DATE_D.
- [x] Operator initials.
- [x] Import config JSON.
- [x] Export config JSON.
- [x] OAuth Client ID field.
- [x] Google Picker API key/App ID fields.
- [x] Connect / disconnect controls.
- [x] Visible local/Drive state.
- [ ] Browser acceptance for imported naming profile (current active defect).
- [ ] Real OAuth acceptance with production Client ID. EXTERNAL.

## 4. Input
- [x] Manual mode is default.
- [x] Explicit Load button for remembered source.
- [x] Open files.
- [x] Open folder.
- [x] Open ZIP as virtual workspace.
- [x] PDF input.
- [x] Image input.
- [x] DOCX input.
- [x] Remember last source handle.
- [x] File explorer/queue.
- [x] Current file selection.
- [x] Select all files.
- [x] Select no files.
- [x] File-load history.
- [x] Google Drive Documents entry point. EXTERNAL for live account.
- [x] Google Picker support. EXTERNAL for configured API key/App ID.

## 5. Output / classification
- [x] Manual destination is default.
- [x] Explicit Load button for remembered destination.
- [x] Choose output folder.
- [x] Remember last destination handle.
- [x] Output mode: beside source.
- [x] Output mode: treatment subfolder.
- [x] Output mode: archive by date.
- [x] Output mode: browser download fallback.
- [x] Explicit Activate mode button.
- [x] Same-source mode reuses input directory when available.
- [x] Save PDF.
- [x] Export result ZIP.
- [x] Copy result to Drive / Exports. EXTERNAL for live account.
- [ ] Build and publish major portable ZIP `nLab-PDF-Studio-1.0.0-PORTABLE.zip`.
- [ ] Copy major portable ZIP to Google Drive / nLab / PDF Studio / Releases.

## 6. Naming
- [x] Prefix.
- [x] Template.
- [x] Suffix.
- [x] Named variables in prefix/template/suffix.
- [x] OCR suffix.
- [x] DPI suffix.
- [x] JPEG suffix.
- [x] GRIS suffix.
- [x] ANNOT suffix.
- [x] FUSION suffix.
- [x] Live filename preview.
- [ ] Browser acceptance for config-import -> naming preview (current first failing gate).

## 7. Page thumbnails / selection
- [x] Horizontal thumbnail strip.
- [x] Checkbox in top-left corner of every thumbnail.
- [x] Current page state.
- [x] Checked pages state.
- [x] Entire document scope.
- [x] Select all pages.
- [x] Select no pages.
- [x] Horizontal previous/next navigation.
- [x] Thumbnail zoom slider.
- [x] Thumbnail zoom +/-.
- [x] Current page indicator.
- [x] Page count / checked count.

## 8. Page operations
- [x] Rotate left over selected scope.
- [x] Rotate right over selected scope.
- [x] Add blank page.
- [x] Duplicate page.
- [x] Delete selected scope.
- [x] Extract selected scope.
- [x] Merge selected PDF files.
- [x] PDF -> PNG.
- [x] PDF -> JPG.
- [x] PDF -> PNG ZIP.
- [x] PDF -> JPG ZIP.
- [x] Crop page scope.
- [x] Header/footer templates with variables.

## 9. Viewer
- [x] PDF canvas.
- [x] Native selectable text layer.
- [x] Annotation layer.
- [x] Previous/next/first/last page.
- [x] Document zoom slider.
- [x] Zoom +/-.
- [x] Fit width.
- [x] Fit page.
- [x] Free available width when sidebar hidden.

## 10. Objects / annotations
- [x] Select tool.
- [x] Text object.
- [x] Highlight.
- [x] Freehand pen.
- [x] Image object.
- [x] Visual signature object.
- [x] Delete selected object.
- [x] Object history.
- [x] ANNOT output flag.

## 11. Stamps
- [x] Stamp preset library.
- [x] Custom stamp template.
- [x] Five global dates usable as variables.
- [x] Initials variable.
- [x] Position X/Y.
- [x] Add stamp to current page.
- [x] Add stamp to selected/current/all scope.
- [x] Import stamps JSON.
- [x] Export stamps JSON.
- [x] STAMP operation flag.

## 12. Signature / security
- [x] Draw visual signature.
- [x] Import signature image.
- [x] Place signature object.
- [x] Save/load signature library through Drive service. EXTERNAL for live account.
- [x] External DSS/PAdES endpoint connector.
- [x] DSS bearer token kept in session/UI, not repository.
- [x] Signature-structure inspection.
- [x] Metadata cleanup.
- [x] Redaction workflow.
- [ ] Real DSS provider acceptance. EXTERNAL.

## 13. OCR / optimization
- [x] OCR scope.
- [x] Tesseract languages FR/EN/DE/ES.
- [x] OCR result textarea.
- [x] Optimization DPI.
- [x] JPEG quality.
- [x] Grayscale.
- [x] Operation variables updated after optimization.
- [ ] Full browser acceptance after current earlier gates pass.

## 14. Translation
- [x] FR/EN/DE/ES source/target.
- [x] Side-by-side 50/50.
- [x] Original 1/3 / translation 2/3.
- [x] Original 2/3 / translation 1/3.
- [x] Facing-pages layout.
- [x] Browser Translator API path.
- [x] Configurable HTTP endpoint path.
- [x] Bilingual PDF output.
- [ ] Real translation provider acceptance. EXTERNAL.

## 15. QR / barcode / forms / batch
- [x] QR generation.
- [x] Barcode generation.
- [x] PDF form field inspection.
- [x] Add form field.
- [x] Fill form values.
- [x] Flatten form.
- [x] Compare PDFs.
- [x] Batch metadata cleanup.
- [x] ZIP output for batch.

## 16. Google Drive
Target structure:
```
My Drive/
└── nLab/
    └── PDF Studio/
        ├── Documents/
        ├── Signatures/
        ├── Exports/
        └── Releases/
```
- [x] OAuth service implemented.
- [x] drive.file scope design.
- [x] Folder creation/service.
- [x] Documents list/download.
- [x] Signatures list/upload/download.
- [x] Exports upload.
- [x] Releases folder model.
- [ ] Live Google OAuth acceptance. EXTERNAL.
- [ ] Upload 1.0 portable ZIP to Releases after green acceptance.

## 17. Release gates
A 1.0 feature is accepted only when:
1. requirement is in this checklist;
2. UI control exists;
3. implementation exists without 0.9 runtime dependency;
4. static validation passes;
5. Chromium interaction passes when locally testable;
6. external items are clearly marked EXTERNAL;
7. portable package builds;
8. release ZIP is published to site and Drive;
9. only then 1.0 may replace the 0.9.x TEST entry.
