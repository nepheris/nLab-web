# nLab Studio V1 — UX contract

This contract defines the reusable interaction model for Studio-class applications.

## 1. One authoritative state
A Studio must not maintain separate values for the ribbon and the left sidebar.

- The detailed sidebar controls are authoritative.
- The contextual ribbon reads and writes the same state.
- A ribbon quick control must update the detailed control immediately.
- The Details button opens the corresponding sidebar section.
- A value edited in the sidebar must be reflected the next time the context ribbon opens.

## 2. Standard shell
Every Studio-class app should use:
1. canonical nLab wordmark;
2. application name and version/state badge;
3. top menu;
4. action ribbon;
5. contextual ribbon panel;
6. resizable/compact/hideable left sidebar;
7. main preview/work area;
8. persistent status bar.

## 3. Standard input module
Input provider and selection method are separate.

Providers:
- Local computer.
- Connected Google Drive.

Local methods:
- one file;
- multiple files;
- folder;
- ZIP workspace.

The common selected-files module must expose:
- current file;
- checkbox state;
- selected / total count;
- select all / select none;
- recent load history.

## 4. Standard output module
Output provider and classification structure are separate.

Providers:
- chosen local folder;
- beside source;
- Google Drive;
- browser download.

Classification:
- destination root;
- treatment folder;
- year/month;
- year/month/week;
- treatment/year/month;
- custom variable template.

Custom folder/path code uses the same global template language as naming and stamps.
Source folders are never destructively renamed by default. Generated/renamed content is copied to the configured output.

## 5. Global template language
The same `{VARIABLE}` syntax is used for:
- file names;
- folder/path names;
- stamps;
- headers and footers;
- QR/barcode values;
- batch/job labels;
- future workflow presets.

Date variables accept formatting, e.g.:
- `{DATE:YYYY-MM-DD}`
- `{STAMP_DATE:DD/MM/YYYY}`

Studios may add domain variables, but shared variables should keep identical meanings across applications.

## 6. Contextual ribbon pattern
For any significant tool:
- ribbon button activates or opens the tool;
- a compact context panel appears below the ribbon;
- the panel shows only the most frequently used settings;
- Details opens the complete left-sidebar section;
- both views use the same values and actions.

Recommended contexts:
- naming;
- output/classification;
- stamps;
- image/object insertion;
- header/footer;
- conversion;
- OCR;
- optimization/compression;
- translation;
- history.

## 7. History pattern
Two views:
- ribbon context: last 5 actions;
- left sidebar: complete persistent history.

History should support:
- timestamp;
- action;
- short detail;
- optional metadata;
- JSON export;
- explicit clear action.

## 8. Naming pattern
Two modes:
- Classic: prefix + template + suffix.
- Code: complete variable template.

Batch operations must first offer a preview. File-source renaming is non-destructive by default; output copies are produced instead.

## 9. Tool separation
Do not conflate independent workflows:
- OCR ≠ optimization/compression.
- Visual signature ≠ cryptographic PAdES signature.
- File naming ≠ output classification.
- Input provider ≠ output provider.
- Page selection ≠ file selection.

## 10. Acceptance
A control is not considered implemented until:
1. code exists;
2. UI exists;
3. browser can see it;
4. browser interaction works;
5. output/state changes as expected.

Static grep checks alone are insufficient.
