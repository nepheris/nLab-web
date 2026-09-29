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
- [x] Imported naming profile applies variables and naming controls; covered by Chromium acceptance.
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
- [x] ODT input.
- [x] TXT input.
- [x] Explicit Local / Google Drive source selector.
- [x] Common “Selected files” summary module.
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
- [x] Separate destination provider from classification structure.
- [x] Output structures: root / treatment / year-month / year-month-week / treatment-date / custom template.
- [x] Variable-driven nested output paths on local/source and Google Drive.
- [x] Folder naming/classification uses the same code-template language, with resolved path preview.
- [x] Folder handling is safe-copy/classification by default; source directories are not destructively renamed.
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
- [x] Classic prefix/template/suffix mode.
- [x] Full “code” template mode.
- [x] Naming presets.
- [x] Batch rename preview for selected files.
- [x] Safe renamed copies to configured output.
- [x] ZIP of renamed copies.
- [x] Config import updates naming preview; covered by Chromium acceptance.

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
- [x] Header left/center/right and footer left/center/right.
- [x] PAGE/PAGES variables per page.
- [x] QR code in header/footer driven by a variable template.

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
- [x] Stamp preset may define linked filename prefix/suffix.
- [x] Linked filename rule is applied when the stamp is actually used.

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

## 13. OCR
- [x] OCR is a separate workflow from optimization.
- [x] OCR scope.
- [x] Tesseract languages FR/EN/DE/ES.
- [x] OCR result textarea.
- [x] OCR_LANG global/runtime variable.

## 13b. Optimization / compression
- [x] Optimization DPI.
- [x] JPEG quality.
- [x] Grayscale.
- [x] Operation variables updated after optimization.
- [x] DPI / JPEG / GRAY reusable as template variables.
- [x] Optimization usable without OCR.
- [ ] Full browser acceptance after current earlier gates pass.

## 14. Translation
- [x] FR/EN/DE/ES source/target.
- [x] Side-by-side 50/50.
- [x] Original 1/3 / translation 2/3.
- [x] Original 2/3 / translation 1/3.
- [x] Facing-pages layout.
- [x] Browser Translator API path.
- [x] Configurable HTTP endpoint path.
- [x] Explicit HTTP endpoint takes priority when configured; Browser Translator API is fallback.
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
- [x] Nested variable-driven folders below Exports.
- [x] Releases folder model.
- [ ] Live Google OAuth acceptance. EXTERNAL.
- [ ] Upload 1.0 portable ZIP to Releases after green acceptance.


## 17. Common contextual ribbon UX
- [x] Ribbon and left sidebar use the same authoritative controls/state.
- [x] Compact contextual panel below ribbon.
- [x] “Details” opens the matching left-sidebar section.
- [x] Contexts for naming, stamps, image, header/footer, conversion, OCR, optimization, translation, history and output.
- [x] History context shows the last five operations.

## 18. Persistent history
- [x] Shared Studio V1 persistent action history service.
- [x] Full history in the left sidebar.
- [x] Last operations in ribbon context.
- [x] Export history JSON.
- [x] Clear history.
- [x] Persistence across page reloads.

## 19. Document conversions
- [x] PDF -> PNG/JPG.
- [x] PDF -> PNG/JPG ZIP.
- [x] PDF -> TXT.
- [x] PDF -> DOCX (browser text/structure fidelity).
- [x] PDF -> ODT (browser text/structure fidelity).
- [x] Images -> PDF.
- [x] DOCX -> PDF (browser text extraction fidelity).
- [x] ODT -> PDF (browser text extraction fidelity).
- [x] TXT -> PDF.
- [ ] High-fidelity office conversion backend/LibreOffice connector. IN DEVELOPMENT / EXTERNAL.

## 20. Global template language
- [x] Same {VARIABLE} syntax for naming, stamps, paths, headers/footers and QR/barcode values.
- [x] Global variables: dates, client, project, reference, site, service, category, tag, treatment.
- [x] File variables: filename/fullname/ext/folder/path/relative path/filesize/index.
- [x] Time/classification variables: year/month/day/week.
- [x] Page variables: page/pages/selected count.
- [x] Technical variables: source/output/output format/OCR language/DPI/JPEG/gray/operation.
- [x] Stamp variables: id/label/prefix/suffix.

## 21. Planned development after 1.0 acceptance
- [ ] Undo/redo snapshots with restore points across destructive PDF operations.
- [ ] Saved reusable workflow presets (pipeline: open -> stamp -> optimize -> rename -> classify -> export).
- [ ] High-fidelity DOCX/ODT conversion through an optional local/private service.
- [ ] Watermark/background layer presets.
- [ ] Bates/page numbering profiles.
- [ ] Batch processing of every selected PDF with the same operation pipeline.
- [ ] Reusable Studio preset library synchronized through personal Drive.
- [ ] Optional job report / manifest JSON per exported batch.

## 22. Release gates
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


## 23. Cross-Studio convergence — review 2026-09-29

### Shared UX / Studio Shell
- [x] Shared contextual-help service exists.
- [x] Shared previous/next file navigation exists.
- [x] Shared queue sorting exists.
- [x] PDF V1 exposes Selected files / Previous / Next in the ribbon.
- [ ] Migrate OCR Studio to Studio V1 shell.
- [ ] Migrate Code Studio to Studio V1 shell.
- [ ] Migrate Image Studio to Studio V1 shell.

### OCR Studio capabilities to converge into PDF
- [ ] Dynamic preview refresh on input change.
- [ ] Image/PDF-aware preview.
- [ ] Preview zoom +/-/fit.
- [ ] Editable OCR text post-processing.
- [ ] OCR editor undo/redo/reset.
- [ ] Context help for OCR engine/language/output.
- [ ] Shared local OCR service integration retained.

### Code Studio capabilities to converge into PDF
- [ ] Consume shared Code Engine.
- [ ] QR / Data Matrix / Aztec / PDF417 / 1D formats.
- [ ] Foreground/background color pickers + hexadecimal fields.
- [ ] Output scale/size.
- [ ] Advanced QR module/dot styling when supported.
- [ ] Center logo/image when supported and scan-safe.
- [ ] PNG/SVG.
- [ ] Decode/read workflow.
- [ ] Context help for formats and parameters.

### Image Studio capabilities to converge into PDF
- [ ] Quick ±90 degree rotation.
- [ ] Free rotation -360..+360.
- [ ] Horizontal/vertical mirror.
- [ ] Graphical crop.
- [ ] Source/result zoom.
- [ ] DPI/quality/format processing through shared Image Engine.
- [ ] Visible movable watermark: text/image/SVG/logo + opacity/size/rotation/margin.
- [ ] Simple invisible local mark encode/read/verify; not a web tracker.
- [ ] EXIF/metadata inspect/edit/delete/import/export.

### Common object manipulation
- [ ] Stamps move/resize/rotate.
- [ ] Text move/resize where applicable.
- [ ] Highlight move/resize.
- [ ] Image move/resize/rotate/crop.
- [ ] Signature move/resize/rotate.
- [ ] QR/barcode move/resize/rotate.
- [ ] Object operations recorded in shared history.

