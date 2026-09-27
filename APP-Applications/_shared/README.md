# nLab Studios — shared browser bricks

This directory contains reusable browser-side components shared by several public nLab Studios.

## `selection-scope.js`

Canonical source: **BRK105-selection-scope-controller** in the private nLab Build registry.

Standardizes selection semantics independently of content type:

- current item;
- Ctrl/Cmd multi-selection;
- Shift range selection;
- selected items;
- all items;
- optional custom scopes supplied by a Studio.

Typical consumers: PDF pages, Image Studio batches, File Studio files, Data Studio rows, QR/Barcode sheets.

## `archive-workspace.js`

Canonical source: **BRK104-browser-zip-workspace**.

Provides local browser ZIP workspace primitives:

- safe ZIP path normalization;
- open archive in memory;
- replace/remove entries;
- rebuild ZIP;
- extract entries to a user-selected directory.

The component expects JSZip to be supplied by the consuming Studio. It does not upload archive contents.

## Design rule

Studios should keep UI/adapters specific to their domain, but delegate reusable state and file primitives to these shared components rather than copy/paste their implementation.
