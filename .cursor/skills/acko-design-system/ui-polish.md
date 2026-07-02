# UI Polish

Final-layer polish: focus, skeletons, safe areas, logos, and micro-details that keep ACKO UI feeling production-ready.

---

## Font Rendering

```css
body {
  font-family: 'Euclid Circular B', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## Prevent Layout Shift

- Never change font weight on hover or selected states
- Use `font-variant-numeric: tabular-nums` for dynamic numbers (prices, counters, timers)
- Use fixed dimensions for skeleton loaders and image placeholders

```css
.counter, .price, .timer {
  font-variant-numeric: tabular-nums;
}
```

---

## Text Wrapping

```css
h1, h2, h3 { text-wrap: balance; }
p { text-wrap: pretty; }
```

---

## Hairline Borders

```css
:root { --border-hairline: 1px; }

@media (min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  :root { --border-hairline: 0.5px; }
}
```

Prefer `box-shadow` hairlines on retina when border looks too heavy:

```css
/* Instead of border: 1px solid rgba(0, 0, 0, 0.08) */
box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
```

---

## Focus States

- Visible focus ring on all interactive elements
- Use semantic `--color-border-selected` or package focus styles — do not remove outlines without a replacement
- Modal open: move focus to first interactive element; on close, return focus to trigger

---

## Skeleton Loaders

- Match final content dimensions exactly
- Use `--color-surface-raised` or package `Skeleton` component
- Animate opacity only — never width/height

---

## Z-Index

Use only defined scale tokens from [primitives.md](primitives.md):

| Token | Value |
|-------|-------|
| `--z-dropdown` | 100 |
| `--z-sticky` | 150 |
| `--z-modal` | 200 |
| `--z-tooltip` | 300 |
| `--z-toast` | 400 |

---

## Decorative Elements

```css
.decorative-bg {
  pointer-events: none;
  user-select: none;
}
```

Never block interaction with decorative layers.

---

## Safe Areas

Respect `env(safe-area-inset-*)` on fixed headers, footers, and full-bleed mobile layouts.

```css
.site-header {
  padding-top: env(safe-area-inset-top);
}
```

---

## Dark Mode

- Rely on `@acko/tokens` semantic mappings — no per-component dark overrides
- Test contrast for `--color-text-primary` / `--color-text-secondary` on `--color-surface`
- Logo: use Primary Dark BG on dark surfaces, Light BG on light surfaces

---

## Logo Assets

**ACKO primary**
- Dark background: `https://pub-c050457d48794d5bb9ffc2b4649de2c1.r2.dev/ACKO%20logo%20Primary%20Dark%20BG.svg`
- Light background: `https://pub-c050457d48794d5bb9ffc2b4649de2c1.r2.dev/ACKO%20logo%20primary%20Light%20BG.svg`

**ACKO horizontal**
- Dark background: `https://pub-c050457d48794d5bb9ffc2b4649de2c1.r2.dev/ACKO%20logo%20horizontal%20Dark%20bg.svg`
- Light background: `https://pub-c050457d48794d5bb9ffc2b4649de2c1.r2.dev/ACKO%20logo%20horizontal%20Light%20BG.svg`

**ACKO Drive horizontal** — use Figma `ACKODrive Horizontal` component or exported SVG; minimum height 24px.

### Logo rules

- Clear space = ½ logo height on all sides
- Minimum size: 24px height (16px extreme cases only)
- Never rotate, outline, stretch, or recolor the mark
