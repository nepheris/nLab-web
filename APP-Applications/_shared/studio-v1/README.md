# nLab Studio v1 shared framework

PDF Studio 1.0 is a clean rewrite and does not load any 0.9.x patch runtime.

## Shared modules
- tokens.css: canonical nLab visual tokens.
- studio.css: common Studio shell, ribbon, sidebar, viewer and status patterns.
- icons.js: shared SVG icon registry.
- core.js: common Studio UI behavior.
- variables.js: shared variable and naming engine.
- file-io.js: file queue, directory handles, ZIP input and output routing.
- drive.js: reusable Google Drive integration.

## Rules
1. No version patch chain.
2. Critical controls belong to the base UI.
3. Shared Studio functions belong in _shared/studio-v1.
4. Use the canonical nLab wordmark asset.
5. Use canonical nLab design tokens.
6. A function is validated only after browser interaction tests.
7. External integrations remain explicitly marked as external until exercised with a configured provider.

This framework is intended for PDF Studio, Image Studio, OCR Studio, File Studio, Data Studio, JSON Studio, Code Studio and future Studio-class tools.
