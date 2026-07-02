# Semantic Tokens

**Layer 2** of the 3-layer token architecture. Maps primitive values to intent-based roles. Components and patterns reference **only** these tokens — never primitives directly.

```
primitives.md → semantics.md → components / cards.md / layout.md
```

Shipped in `@acko/tokens` (`tokens.css` + `theme.css`). Light and dark theme mappings are handled by the token package — do not write per-component dark overrides.

---

## Text Colors

| Token | Light (typical) | Use |
|-------|-----------------|-----|
| `--color-text-primary` | grey-800 | Headings, values, main content |
| `--color-text-secondary` | grey-500 | Subtext, captions, helpers |
| `--color-text-tertiary` | grey-400 | Placeholders, disabled hints |
| `--color-text-invert` | white | Text on dark/filled surfaces |
| `--color-text-brand` | purple-800 | Links, brand emphasis |
| `--color-text-error` | red-700 | Error messages |
| `--color-text-success` | green-700 | Success messages |
| `--color-text-warning` | orange-700 | Warning messages |
| `--color-text-static` | white | Fixed white across themes |

Typography `color` prop maps 1:1 to `--color-text-{prop}` — see [typography.md](typography.md).

---

## Surface & Background

| Token | Use |
|-------|-----|
| `--color-surface` | Page background |
| `--color-surface-raised` | Raised panels, neutral alert backgrounds |
| `--color-surface-overlay` | Modal scrim |

### Card surfaces

| Token | Primitive (light) | Use |
|-------|-------------------|-----|
| `--color-card-bg` | grey-50 | Default card fill |
| `--color-card-border` | white highlight edge | Default card stroke |
| `--color-card-elevated-bg` | white | Elevated card fill |
| `--color-card-outline-border` | grey-200 | Outline card stroke |
| `--color-card-demoted-bg` | grey-150 | Secondary/demoted card |
| `--color-card-demoted-border` | grey-200 | Demoted card stroke |

---

## Borders

| Token | Use |
|-------|-----|
| `--color-border` | Standard dividers, input borders |
| `--color-border-subtle` | Card header/footer separators |
| `--color-border-selected` | Focused/selected field borders |
| `--border-hairline` | 1px / 0.5px retina — see [primitives.md](primitives.md) |

---

## Brand & Interactive

| Token | Use |
|-------|-----|
| `--color-primary` | Primary buttons, selected states, links |
| `--color-primary-hover` | Primary hover (mouse only) |
| `--color-primary-muted` | Subtle primary tint, hover borders |
| `--color-primary-subtle` | Scheduled/status backgrounds |

---

## Status (Feedback)

Each status has **subtle bg**, **icon/accent**, and **text** roles:

| Role | Subtle bg | Accent | Text |
|------|-----------|--------|------|
| Info | `--color-info-subtle` | `--color-info` | `--color-info-text` |
| Warning | `--color-warning-subtle` | `--color-warning` | `--color-warning-text` |
| Error | `--color-error-subtle` | `--color-error` | `--color-error-text` |
| Success | `--color-success-subtle` | `--color-success` | `--color-success-text` |

### Badge backgrounds

| Token | Use |
|-------|-----|
| `--color-success-badge-bg` | Completed / paid badges |
| `--color-warning-badge-bg` | Pending / processing badges |
| `--color-error-badge-bg` | Failed / rejected badges |

---

## Shadows (Semantic Aliases)

| Token | Primitive | Use |
|-------|-----------|-----|
| `--shadow-card` | shadow-lg | Elevated cards |
| `--shadow-subtle` | shadow-sm | Small internal raised elements |
| `--shadow-dropdown` | shadow-md | Menus, popovers |

Primitive shadow scale → [primitives.md](primitives.md).

---

## Rules

1. **Components use semantic tokens only** — e.g. `var(--color-text-primary)`, not `var(--grey-800)`.
2. **Theme switching is automatic** — semantic tokens remap in `@acko/tokens`; never hardcode light/dark pairs in components.
3. **New tokens** — add primitive in `primitives.md` first, then map here before use in components.
4. **Card-specific tokens** — use `--color-card-*` family; see [cards.md](cards.md) shell variants.
