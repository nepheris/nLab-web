# nLab Studios — public/private architecture (v0.1)

Date: 2026-09-22
Branch: `feat/nlab-studios-suite-v0.1`

## Goal

Create a coherent browser-based family of nLab tools using the current PDF Studio visual language and the reusable concepts already present in nLab / nLab-Web-Framework.

## Recovered foundations

- **PDF / Scan / OCR**: canonical application `APP07-scan-studio`; PDF Studio is a sub-module, OCR remains part of Scan Studio rather than a competing standalone application.
- **JSON Studio**: industrialized component on `nepheris/nLab-Web-Framework` branch `New`, with Raw / Tree / Table / Form concepts, history, safe paths and validation.
- **Code tools**: `CodeBlock` supports text, JSON, JavaScript, Python, Bash, HTML, CSS, CSV and Markdown, with automatic language detection, export and safe rendering.
- **Data tools**: `TableWiz`, `DataWiz`, `DataResolver`, `PresentationResolver`.
- **Media/document tools**: `MediaWiz`, `DocumentWiz`.
- **QR tools**: QR Studio components and sessions exist in the Web Framework.
- **Common UI**: toolbar model, Header Studio, Theme Workshop and contextual help patterns.

## Public wave 1

| Tool | Route | Public behavior |
|---|---|---|
| PDF Studio | `../pdf-studio/` | Existing public application |
| JSON Studio | `../json-studio/` | Local JSON open/edit/tree/table/validate/export |
| Code Studio | `../code-studio/` | Local code/text editor with language detection, preview, copy/export |
| Image Studio | `../image-studio/` | Local image open/rotate/flip/filter/resize/export |
| Studios portal | `./` | Common entrypoint and capability map |

All wave-1 processing is browser-local. No file is uploaded by these pages.

## Public wave 2 candidates

- Data Studio (TableWiz + DataWiz + import/export)
- QR Studio
- Document Studio (DocumentWiz + templates)
- Multi-format Import/Export (APP01 + APP02)
- Selected public views of APP03 / APP04
- Optional public read-only fronts for APP09 / APP10 using public datasets only

## Private layer

The public shell must never embed private records or secrets.

Target contract already exists in `nLab-Web-Framework/main`:

- `NLAB_AUTH_SESSION_GOOGLE` — Google identity -> short-lived opaque application session;
- `NLAB_ACCESS_CONTROL_RBAC` — deny-by-default server authorization;
- `NLAB_APPS_SCRIPT_SECURITY_GATEWAY` — server-side gateway;
- `NLAB_REQUEST_RATE_LIMIT` — quotas before Drive/API work;
- `PROVIDER_GOOGLE_DRIVE` + `NLAB_PERSONAL_STORAGE_CONTRACT` — private data overlay.

Current maturity is mixed (`experimental` / `planned`), so the public apps expose only a clear private-mode boundary until the backend is promoted and validated.

## Security rules

1. Public GitHub Pages contain only public code, public configuration examples and synthetic fixtures.
2. No private Drive content is copied into the public repository or generated public assets.
3. No OAuth client secret, refresh token, service-account key, P12/PFX, password or session token is committed.
4. Private authorization is server-authoritative; client visibility is UX only.
5. Rate limiting and batching run before expensive Drive/API operations.
6. Public tools remain usable without login.
7. Sensitive documents default to local-only processing.

## Naming

Use the family label **nLab Studios** with product names:

- nLab PDF Studio
- nLab JSON Studio
- nLab Code Studio
- nLab Image Studio
- later: nLab Data Studio, nLab QR Studio, nLab Document Studio

Scan/OCR remains an APP07 capability rather than a separate competing application.
