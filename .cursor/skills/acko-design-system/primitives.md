# Design Primitives

**Layer 1** of the 3-layer token architecture. Raw values only — colors, spacing, radius, shadows, motion, and scale. These values are never used directly in components.

```
primitives.md (this file)  →  semantics.md  →  components
Raw values (hex, px)          Semantic roles     Component specs
                              (maps primitives    (only references
                               to intent)          semantic tokens)
```

**Components never reference this file directly** — they use semantic tokens from `semantics.md`.

---

## Color Primitives

Raw palette values. Only consult when adding a new semantic token or debugging a color value.

### Grey (Extended Neutral — 17 steps)

| Token | Hex |
|-------|-----|
| `--grey-white` | `#FFFFFF` |
| `--grey-50` | `#FBFBFB` |
| `--grey-100` | `#F5F5F5` |
| `--grey-150` | `#EBEBEB` |
| `--grey-200` | `#E0E0E1` |
| `--grey-250` | `#CCCCCD` |
| `--grey-300` | `#B7B7B8` |
| `--grey-350` | `#8F8E92` |
| `--grey-400` | `#7A7B7D` |
| `--grey-450` | `#605F63` |
| `--grey-500` | `#474649` |
| `--grey-550` | `#333333` |
| `--grey-600` | `#242324` |
| `--grey-650` | `#19191A` |
| `--grey-700` | `#141414` |
| `--grey-750` | `#0F0F10` |
| `--grey-800` | `#0A0A0A` |
| `--grey-black` | `#000000` |

### Chromatic Palettes (50–950 scale)

#### Purple (Brand)
| Token | Hex |
|-------|-----|
| `--purple-50` | `#F5F3FF` |
| `--purple-100` | `#EAEAFD` |
| `--purple-200` | `#D9D8FC` |
| `--purple-300` | `#BDB8FA` |
| `--purple-400` | `#9B8FF6` |
| `--purple-500` | `#7A62F0` |
| `--purple-600` | `#6841E6` |
| `--purple-700` | `#582FD2` |
| `--purple-800` | `#4E29BB` |
| `--purple-900` | `#3E2290` |
| `--purple-950` | `#241362` |

#### Red
| Token | Hex |
|-------|-----|
| `--red-50` | `#FEF2F2` |
| `--red-100` | `#FEE2E2` |
| `--red-200` | `#FECACA` |
| `--red-300` | `#FCA5A5` |
| `--red-400` | `#F87171` |
| `--red-500` | `#EF4444` |
| `--red-600` | `#DC2626` |
| `--red-700` | `#B91C1C` |
| `--red-800` | `#991B1B` |
| `--red-900` | `#7F1D1D` |
| `--red-950` | `#450A0A` |

#### Cerise (Error / Highlights)
| Token | Hex |
|-------|-----|
| `--cerise-100` | `#FDF2F8` |
| `--cerise-200` | `#FBCFE8` |
| `--cerise-300` | `#F9ABD4` |
| `--cerise-400` | `#F472B6` |
| `--cerise-500` | `#EC4899` |
| `--cerise-600` | `#DB2777` |
| `--cerise-700` | `#BE185D` |
| `--cerise-800` | `#9D174D` |

#### Green
| Token | Hex |
|-------|-----|
| `--green-50` | `#F0FDF4` |
| `--green-100` | `#DCFCE7` |
| `--green-200` | `#BBF7D0` |
| `--green-300` | `#86EFAC` |
| `--green-400` | `#4ADE80` |
| `--green-500` | `#22C55E` |
| `--green-600` | `#16A34A` |
| `--green-700` | `#15803D` |
| `--green-800` | `#166534` |
| `--green-900` | `#14532D` |
| `--green-950` | `#052E16` |

#### Blue
| Token | Hex |
|-------|-----|
| `--blue-50` | `#EFF6FF` |
| `--blue-100` | `#DBEAFE` |
| `--blue-200` | `#BFDBFE` |
| `--blue-300` | `#93C5FD` |
| `--blue-400` | `#60A5FA` |
| `--blue-500` | `#3B82F6` |
| `--blue-600` | `#2563EB` |
| `--blue-700` | `#1D4ED8` |
| `--blue-800` | `#1E40AF` |
| `--blue-900` | `#1E3A8A` |
| `--blue-950` | `#172554` |

#### Orange
| Token | Hex |
|-------|-----|
| `--orange-50` | `#FFF3E5` |
| `--orange-100` | `#FFE5CC` |
| `--orange-200` | `#FFCB9E` |
| `--orange-300` | `#FFB56B` |
| `--orange-400` | `#FFA85C` |
| `--orange-500` | `#FF8D28` |
| `--orange-600` | `#EB740A` |
| `--orange-700` | `#B65C0C` |
| `--orange-800` | `#8D4301` |
| `--orange-900` | `#521F00` |
| `--orange-950` | `#300212` |

#### Pink
| Token | Hex |
|-------|-----|
| `--pink-50` | `#FDF2F8` |
| `--pink-100` | `#FCE7F3` |
| `--pink-200` | `#FBCFE8` |
| `--pink-300` | `#F9ABD4` |
| `--pink-400` | `#F472B6` |
| `--pink-500` | `#EC4899` |
| `--pink-600` | `#DB2777` |
| `--pink-700` | `#BE185D` |
| `--pink-800` | `#9D174D` |
| `--pink-900` | `#831843` |
| `--pink-950` | `#500724` |

#### Yellow
| Token | Hex |
|-------|-----|
| `--yellow-50` | `#FEFAE8` |
| `--yellow-100` | `#FEF9C3` |
| `--yellow-200` | `#FEF08A` |
| `--yellow-300` | `#FDE047` |
| `--yellow-400` | `#FACC15` |
| `--yellow-500` | `#EAB308` |
| `--yellow-600` | `#D18C0A` |
| `--yellow-700` | `#A76406` |
| `--yellow-800` | `#875008` |
| `--yellow-900` | `#62360F` |
| `--yellow-950` | `#302012` |

#### Lime
| Token | Hex |
|-------|-----|
| `--lime-50` | `#F4FDF0` |
| `--lime-100` | `#E7FCDC` |
| `--lime-200` | `#CFF7BB` |
| `--lime-300` | `#A9EF86` |
| `--lime-400` | `#7BDE4A` |
| `--lime-500` | `#58C522` |
| `--lime-600` | `#45A316` |
| `--lime-700` | `#398015` |
| `--lime-800` | `#306516` |
| `--lime-900` | `#214210` |
| `--lime-950` | `#132E05` |

#### Teal
| Token | Hex |
|-------|-----|
| `--teal-50` | `#EDFDFE` |
| `--teal-100` | `#D1FBFC` |
| `--teal-200` | `#A9EFFB` |
| `--teal-300` | `#6FE2F1` |
| `--teal-400` | `#29CEE7` |
| `--teal-500` | `#17B6D3` |
| `--teal-600` | `#0891B2` |
| `--teal-700` | `#0E7490` |
| `--teal-800` | `#155E75` |
| `--teal-900` | `#164E63` |
| `--teal-950` | `#083344` |

#### Zinc
| Token | Hex |
|-------|-----|
| `--zinc-50` | `#FAFAFB` |
| `--zinc-100` | `#F3F4F6` |
| `--zinc-200` | `#E5E7EB` |
| `--zinc-300` | `#D1D5DB` |
| `--zinc-400` | `#9CA3AF` |
| `--zinc-500` | `#6B7280` |
| `--zinc-600` | `#485563` |
| `--zinc-700` | `#374151` |
| `--zinc-800` | `#1F2937` |
| `--zinc-900` | `#1A1F2A` |
| `--zinc-950` | `#030712` |

#### Earth Grey
| Token | Hex |
|-------|-----|
| `--earth-grey-50` | `#FAFAFA` |
| `--earth-grey-100` | `#F5F5F5` |
| `--earth-grey-200` | `#E5E5E5` |
| `--earth-grey-300` | `#D4D4D4` |
| `--earth-grey-400` | `#A3A3A3` |
| `--earth-grey-500` | `#737373` |
| `--earth-grey-600` | `#525252` |
| `--earth-grey-700` | `#404040` |
| `--earth-grey-800` | `#262626` |
| `--earth-grey-900` | `#171717` |
| `--earth-grey-950` | `#0A0A0A` |

---

## Spacing & Sizing

### 1px-Base Spacing (read this first)

`@acko/tokens` v1.1.0+ ships `--spacing: 0.0625rem` inside `@theme inline` in its `theme.css`. At a 16px root font size, this sets Tailwind v4's spacing base to **1px per unit**.

```css
/* Shipped by @acko/tokens — do NOT remove or override */
@theme inline {
  --spacing: 0.0625rem;
}
```

**Utility numbers equal pixel values directly:**

```
gap-8   →  8px       p-16   → 16px       h-64  → 64px
size-20 → 20px       mt-24  → 24px       w-40  → 40px
```

### How to detect the spacing base

Before writing any layout code, check if `@acko/tokens/theme.css` (or `@acko/tokens/tokens.css`) is imported in `index.css`. If it is, the 1px base is active. Verify by searching for `--spacing` in `node_modules/@acko/tokens/src/theme.css`.

### Rules

1. **Utility number = pixel value.** `p-16` = 16px, `gap-12` = 12px, `size-20` = 20px.
2. **Do not use raw `px` in JSX** for spacing — always use Tailwind utilities.
3. **Do not override `--spacing`** in `index.css` or any app-level `@theme` block. The value shipped by `@acko/tokens` is the source of truth.
4. **Legacy `--scale-*` names** — do not use removed/deprecated scale vars.

### Spacing reference (1px base)

| Utility | Pixels | Use case |
|---------|--------|----------|
| `gap-2` / `p-2` | 2px | Micro gaps, hairline spacing |
| `gap-4` / `p-4` | 4px | Tight gaps, icon–text inline |
| `gap-8` / `p-8` | 8px | Label–input gap, icon padding |
| `gap-12` / `p-12` | 12px | Small component padding |
| `gap-16` / `p-16` | 16px | Standard padding, mobile gutters |
| `gap-20` / `p-20` | 20px | Card padding (md), form field groups |
| `gap-24` / `p-24` | 24px | Card padding (lg), section sub-gaps |
| `gap-32` / `p-32` | 32px | Tablet gutters, section gaps |
| `gap-40` / `p-40` | 40px | Desktop gutters (`lg:px-40`) |
| `gap-48` / `p-48` | 48px | Section margins |
| `gap-64` / `p-64` | 64px | Large sections, hero spacing |

### Component sizing (1px base)

| Utility | Pixels | Typical use |
|---------|--------|-------------|
| `h-32` | 32px | Compact controls |
| `h-36` / `h-40` | 36px / 40px | sm inputs / buttons |
| `h-44` | 44px | Min tap target height |
| `h-48` | 48px | md inputs / buttons |
| `h-56` | 56px | lg buttons |
| `h-64` | 64px | Header height |

### Icon sizing (1px base)

| Utility | Pixels | When to use |
|---------|--------|-------------|
| `size-12` | 12px | xs icons |
| `size-16` | 16px | sm/md component icons |
| `size-20` | 20px | Standard icons in buttons, cards |
| `size-24` | 24px | lg icons, feature icons |
| `size-32` | 32px | xl icons, hero icons |
| `size-48` | 48px | Illustration-size icons |

### Inter-component spacing (1px base)

| Between | Suggested utility |
|---------|-------------------|
| Label and input | `gap-8` |
| Input and helper/error | `gap-4` |
| Form fields | `gap-20` or `gap-24` |
| Section heading and content | `gap-24` or `gap-32` |
| Cards in a grid | `gap-16` mobile, `gap-24` desktop |
| Icon and adjacent text | `gap-8` |
| Page sections | `gap-48` to `gap-64` |

### Layout container (1px base)

```tsx
<div className="w-full max-w-[1280px] mx-auto px-16 md:px-32 lg:px-40">
  {/* content */}
</div>
```

| Breakpoint | Gutter utility | Pixels |
|------------|---------------|--------|
| Mobile | `px-16` | 16px |
| Tablet | `md:px-32` | 32px |
| Desktop | `lg:px-40` | 40px |

### What is NOT affected by `--spacing`

These do **not** change with the 1px base:
- `max-w-2xl`, `max-w-3xl`, etc. — rem-based container widths
- `rounded-lg`, `rounded-full` — uses `--radius-*` tokens
- Arbitrary values: `max-w-[1280px]`, `rounded-[20px]`
- `grid-cols-*` — column count, not spacing
- Color, opacity, font utilities

### Migration from 0.25rem base (4px per unit)

If migrating from an older `@acko/tokens` version (or standard Tailwind default) where `p-4` = 16px:

**Multiply every spacing utility number by 4.**

| Old (0.25rem base) | New (1px base) | Pixels |
|--------------------|----------------|--------|
| `gap-2` | `gap-8` | 8px |
| `gap-3` | `gap-12` | 12px |
| `p-4` | `p-16` | 16px |
| `size-5` | `size-20` | 20px |
| `size-6` | `size-24` | 24px |
| `h-16` | `h-64` | 64px |
| `w-10` | `w-40` | 40px |
| `mt-6` | `mt-24` | 24px |
| `px-8` | `px-32` | 32px |

### Anti-patterns

| Don't | Do |
|-------|----|
| `gap-3` expecting 12px | `gap-12` — utility number = pixels |
| `size-5` for a 20px icon | `size-20` — icons need exact pixel values |
| `h-16` for a 64px header | `h-64` — multiply old values by 4 |
| `px-4 md:px-8 lg:px-10` for gutters | `px-16 md:px-32 lg:px-40` |
| Override `--spacing` in app CSS | Leave it as shipped by `@acko/tokens` |
| Hardcode `padding: 16px` in JSX | `p-16` Tailwind utility |

---

## Typography Scale

**Font family:** Euclid Circular B — all text across the system.

```css
font-family: 'Euclid Circular B', -apple-system, BlinkMacSystemFont, sans-serif;
```

CDN base: `https://pub-c050457d48794d5bb9ffc2b4649de2c1.r2.dev/Euclid%20Font/`

Weights: Light (300), Regular (400), Medium (500), Semibold (600), Bold (700).

Each level is expressed as 4 sub-tokens in `tokens.css`: `--font-{level}-size`, `--font-{level}-line`, `--font-{level}-spacing`, `--font-{level}-weight`.

### Display (marketing, heroes)

| Level | Size | Line Height | Letter Spacing | Weight |
|-------|------|-------------|----------------|--------|
| `--font-display-xl-*` | 72px | 80px | -2px | Bold 700 |
| `--font-display-lg-*` | 56px | 64px | -1.5px | Bold 700 |
| `--font-display-md-*` | 48px | 56px | -1px | Bold 700 |
| `--font-display-sm-*` | 40px | 48px | -0.5px | Semibold 600 |

### Heading (UI sections)

| Level | Size | Line Height | Letter Spacing | Weight |
|-------|------|-------------|----------------|--------|
| `--font-heading-xl-*` | 32px | 40px | -0.5px | Semibold 600 |
| `--font-heading-lg-*` | 24px | 32px | -0.3px | Semibold 600 |
| `--font-heading-md-*` | 20px | 28px | -0.2px | Semibold 600 |
| `--font-heading-sm-*` | 18px | 24px | 0px | Semibold 600 |

### Body (content)

| Level | Size | Line Height | Letter Spacing | Weight |
|-------|------|-------------|----------------|--------|
| `--font-body-lg-*` | 18px | 28px | 0px | Regular 400 |
| `--font-body-md-*` | 16px | 24px | 0px | Regular 400 |
| `--font-body-sm-*` | 14px | 20px | 0px | Regular 400 |

### Labels & Utility

| Level | Size | Line Height | Letter Spacing | Weight |
|-------|------|-------------|----------------|--------|
| `--font-label-lg-*` | 14px | 20px | 0.1px | Medium 500 |
| `--font-label-md-*` | 12px | 16px | 0.2px | Medium 500 |
| `--font-label-sm-*` | 11px | 14px | 0.3px | Medium 500 |
| `--font-caption-*` | 12px | 16px | 0px | Regular 400 |
| `--font-overline-*` | 11px | 16px | 0.5px | Semibold 600 |

### Tailwind Mapping

| Token | Tailwind equivalent |
|-------|-------------------|
| 12px / `--font-caption-size` | `text-xs` |
| 14px / `--font-body-sm-size` | `text-sm` |
| 16px / `--font-body-md-size` | `text-base` |
| 18px / `--font-body-lg-size` | `text-lg` |
| 20px / `--font-heading-md-size` | `text-xl` |
| 24px / `--font-heading-lg-size` | `text-2xl` |
| Weight 500 | `font-medium` |
| Weight 600 | `font-semibold` |
| Weight 700 | `font-bold` |

### Button Font Sizes (Intentionally Hardcoded)

Buttons use their own scale — not body tokens:

| Size | Font | Tailwind |
|------|------|----------|
| xs | 12px | `text-xs` |
| sm | 14px | `text-sm` |
| md | 16px | `text-base` |
| lg | 18px | `text-lg` |
| xl | 20px | `text-xl` |

### Typography Rules

- Minimum 14px for body text, 12px for labels, 11px absolute minimum
- Medium (500) for emphasis in body — not Bold
- Semibold (600) for headings, Bold (700) only for display
- Tighter letter-spacing for large text, looser for small text
- `font-variant-numeric: tabular-nums` for dynamic numbers

---

## Border Radius

| Token | Value | Use Case | Tailwind |
|-------|-------|----------|----------|
| `--radius-sm` | 4px | Nested insets | `rounded` |
| `--radius-md` | 6px | Checkboxes md/lg | `rounded-md` |
| `--radius-lg` | 8px | Options, table cells | `rounded-lg` |
| `--radius-xl` | 10px | Tooltip | `rounded-xl` |
| `--radius-2xl` | 12px | AlertCard, inline notices | `rounded-2xl` |
| `--radius-3xl` | 16px | Cards, dialogs | `rounded-[16px]` |
| `--radius-4xl` | 20px | Surface containers: cards, dialogs, drawers, toasts, dropdown menus | `rounded-[20px]` |
| `--radius-full` | 9999px | Buttons, inputs, pills | `rounded-full` |

**`--radius-4xl` (20px)** is the standard for surface containers.

### Nested Radius Rule

When a rectangular element is nested inside a rounded container:

```
inner radius = outer radius − padding
```

| Token | Value | When |
|-------|-------|------|
| `--radius-inset-sm` | 8px | Inner elements in `padding="sm"` (12px) cards → 20 − 12 = 8px |
| `--radius-inset-md` | 4px | Inner elements in `padding="md"` (16px) cards → 20 − 16 = 4px |
| `--radius-inset-lg` | 0px | Inner elements in `padding="lg"` (24px) cards → 20 − 24 = 0px |

Applies to: icon wrapper boxes, image thumbnails, inset panels.
Exempt (keep their own radius): buttons, badges, avatars.

---

## Shadow Scale (Primitive)

| Token | Light | Use Case |
|-------|-------|----------|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.04)` | Subtle depth |
| `--shadow-sm` | `0 1px 4px rgba(0,0,0,0.06)` | Light elevation |
| `--shadow-md` | `0 2px 8px rgba(0,0,0,0.06)` | Medium elevation |
| `--shadow-lg` | `0px 2px 16px 4px rgba(0,0,0,0.04)` | Cards, dropdowns |
| `--shadow-xl` | `0 4px 24px rgba(0,0,0,0.10)` | Modals, dialogs |
| `--shadow-2xl` | `0 8px 32px rgba(0,0,0,0.14)` | Maximum elevation |

Semantic aliases and component-specific shadows → see `semantics.md`.

---

## Easing Curves

| Token | Value | Use |
|-------|-------|-----|
| `--ease-out-quad` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Standard exit |
| `--ease-out-cubic` | `cubic-bezier(0.215, 0.61, 0.355, 1)` | Dropdown/modal enter |
| `--ease-out-quart` | `cubic-bezier(0.165, 0.84, 0.44, 1)` | Strong deceleration |
| `--ease-in-out-cubic` | `cubic-bezier(0.645, 0.045, 0.355, 1)` | On-screen movement |
| `--ease-in-out-quart` | `cubic-bezier(0.77, 0, 0.175, 1)` | Emphatic transitions |

There are **no `--duration-*` tokens** — use raw values (e.g. `150ms`, `200ms`, `300ms`).

---

## Opacity Scale

| Token | Value | | Token | Value |
|-------|-------|-|-------|-------|
| `--opacity-0` | 0 | | `--opacity-48` | 0.48 |
| `--opacity-4` | 0.04 | | `--opacity-56` | 0.56 |
| `--opacity-8` | 0.08 | | `--opacity-64` | 0.64 |
| `--opacity-12` | 0.12 | | `--opacity-72` | 0.72 |
| `--opacity-16` | 0.16 | | `--opacity-80` | 0.80 |
| `--opacity-20` | 0.20 | | `--opacity-88` | 0.88 |
| `--opacity-28` | 0.28 | | `--opacity-96` | 0.96 |
| `--opacity-40` | 0.40 | | `--opacity-100` | 1.00 |

---

## Z-Index Scale

| Token | Value | Use Case |
|-------|-------|----------|
| `--z-dropdown` | 100 | Dropdown menus, select popups |
| `--z-sticky` | 150 | Sticky headers, floating elements |
| `--z-modal` | 200 | Modal dialogs, sheets |
| `--z-tooltip` | 300 | Tooltips, popovers |
| `--z-toast` | 400 | Toast notifications |

---

## Responsive Breakpoints

| Name | Range | Media Query |
|------|-------|-------------|
| Mobile | 0 – 767px | Base styles (no media query) |
| Tablet | 768px – 1023px | `@media (min-width: 768px)` |
| Desktop | ≥ 1024px | `@media (min-width: 1024px)` |

Mobile-first only. Use `min-width` exclusively. Never mix with `max-width`.

---

## Hairline Border

```css
:root { --border-hairline: 1px; }
@media (min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  :root { --border-hairline: 0.5px; }
}
```
