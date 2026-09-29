# nLab Studio manifest v1

A Studio application is composed from four layers:

1. **Studio Core** — shared shell and UX.
2. **Studio manifest** — declarative menus, ribbon groups, sidebar sections and capabilities.
3. **Domain engine** — PDF, OCR, Image, Markdown, Translation, QR/Barcode, etc.
4. **Studio bridges** — open a specialized Studio and receive the resulting asset/state.

## Canonical manifest fields

```js
{
  schema: "nlab-studio-manifest/v1",
  id: "markdown-studio",
  name: "Markdown Studio",
  subtitle: "Éditeur texte structuré",
  menus: [{ id, label }],
  ribbon: [{
    id, label,
    items: [{ action, label, icon, status }]
  }],
  sections: [{ id, label, short, open, status }],
  capabilities: ["files", "history", "markdown", "yaml"]
}
```

## Rules

- Common UI behavior is implemented once in `_shared/studio-v1`.
- A Studio must not fork the shell to add a new menu or ribbon group.
- Studio-specific controls are declared by manifest or injected into named slots.
- A domain engine owns its advanced feature implementation.
- Other Studios expose only simplified presets and open the specialized Studio for advanced editing.
- `status: "development"` must render visibly in yellow.
- Shared improvements to shell, accessibility, responsive layout, help, history, preferences and status propagate to every Studio.
- Domain-specific code must not redefine shared shell behavior.
