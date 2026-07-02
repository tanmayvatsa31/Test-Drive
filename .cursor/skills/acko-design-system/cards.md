# ACKO Card System

**Layer 3** of the design system — card grammar for composing contextual UI surfaces.

```
primitives.md → semantics.md → components → cards.md
Raw values      Color roles    Atom components  Card grammar
```

> **Rule for LLM generation:** Every card must use a `Card` variant from the shell spec, compose from the slot vocabulary, pick a card type that matches the content's purpose, and reference only semantic tokens — never primitive values directly.

---

## Part 1 — Card Base Component

### React API

```tsx
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'elevated' | 'demoted';  // default: 'default'
  padding?: 'none' | 'sm' | 'md' | 'lg';                     // default: 'md'
  children: React.ReactNode;
}
```

### Sub-components

```tsx
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
```

### Variants

| Variant | Fill | Stroke | Shadow |
|---------|------|--------|--------|
| `default` | `--color-card-bg` (grey-50) | `1px solid --color-card-border` (white highlight edge) | none |
| `outline` | `transparent` | `1px solid --color-card-outline-border` (grey-200) | none |
| `elevated` | `--color-card-elevated-bg` (white) | none | `--shadow-card` |
| `demoted` | `--color-card-demoted-bg` (grey-150) | `1px solid --color-card-demoted-border` (grey-200) | none |

### Padding Scale

| Value | CSS |
|-------|-----|
| `none` | `0` |
| `sm` | `12px` |
| `md` | `20px` |
| `lg` | `24px` |

### Sub-component Layout

| Sub-component | Padding | Border |
|---------------|---------|--------|
| `CardHeader` | `padding-bottom: 16px` | `border-bottom: 1px solid var(--color-border-subtle)` |
| `CardContent` | `padding: 20px 0` | none |
| `CardFooter` | `padding-top: 16px` | `border-top: 1px solid var(--color-border-subtle)` |

### Specifications

- Border radius: `--radius-4xl` (20px)
- Footer aligns children to `flex-end`

---

## Part 2 — Card Grammar

1. **Identify the purpose** — match to one of the **10** card types below
2. **Pick the shell variant** specified for that type
3. **Compose slots** — use only the slots defined for that type
4. **Use real components** from the atom layer (Button, Badge, Typography, etc.)
5. **Reference semantic tokens only** — never hardcode hex values or primitives

---

## Card layout hierarchy & badge placement (mandatory)

### Reading order — vertical, not split columns

- Do **not** place the **primary title** on the left and **supporting / body** text on the right in the same row. That left/right split is **not** a default card pattern for marketing or product cards.
- Use a **vertical reading order**: optional `eyebrow` → title-reference `status-badge` → `title` → `meta` → `body` → actions in `CardFooter`. Title and subtext **stack**; body copy is not a second column beside the title unless a **documented exception** applies (e.g. a compact data row, not a standard card).

### Title-reference badges (`status-badge`)

- When a badge **qualifies the headline** (e.g. “Most popular”, “New”), it must appear **above the title** in document order.
- It may sit on the **top edge of the card**, including **slight overlap** of the top border — that is a **valid** reference pattern when product chrome calls for it.
- Do **not** place title-reference badges **beside** the title, **below** the title, or in **inconsistent** corners of the card.
- Badges **not** tied to the title (e.g. price chip, ancillary tag) belong in a **separate slot** (`meta`, trailing area, or the card type’s defined field) — do not reuse title-reference placement rules for those.

### Actions in card grids

- In a **row of cards** (e.g. plan comparison, feature tiles), **primary actions** must sit at a **consistent vertical position** across cards: use **equal-height** cards, column flex, and push the footer row (e.g. `mt-auto` on the action row or `CardFooter` at the bottom). Avoid **staggered button heights** when body copy length differs between cards.

---

## Slot Vocabulary

| Slot | Description | Typical Component |
|------|-------------|------------------|
| `status-badge` | Above the title — state or title qualifier (Pending, Most popular); may sit on top card edge | `Badge` |
| `eyebrow` | Small overline label above the title | `Typography variant="overline"` |
| `title` | Primary headline of the card | `Typography variant="heading-sm"` |
| `meta` | Supporting info — vehicle reg, date, ID | `Typography variant="body-sm" color="secondary"` |
| `body` | Secondary descriptive content or warning | `Typography variant="body-sm"` |
| `media` | Hero image or illustration | `<img>` with `object-fit: cover` |
| `icon` | Product or entity icon | Lucide icon or `/public/assets/icons/*.svg` |
| `primary-cta` | Main action for the card | `Button variant="primary"` or `"secondary"` |
| `secondary-cta` | Supporting action or text link | `Button variant="ghost"` or `"outline"` |
| `footer-link` | Subtle inline link at the bottom | `Typography variant="body-sm" color="brand"` as anchor |
| `input` | Inline text entry within the card | `TextInput` |
| `divider` | Horizontal rule between sections | `Separator` |
| `progress` | Progress bar or indicator | `Progress` |
| `inline-notice` | Nested informational strip | `Alert` (compact) |

---

## Card Type Catalog

### 1. PolicyCard

**Purpose:** Displays an existing insurance policy (car, bike, health).

**Shell:** `Card variant="default"` or `"elevated"`, `padding="md"`

| Slot | Required | Notes |
|------|----------|-------|
| `icon` | Yes | Product icon — 24px |
| `title` | Yes | Policy name |
| `meta` | Yes | Vehicle reg + coverage expiry |
| `status-badge` | Conditional | Only when expiring/expired/notice |
| `primary-cta` | Conditional | Only for actionable states |
| `secondary-cta` | Optional | |
| `inline-notice` | Optional | Renewal message below actions |

**Variants:** `compact` (icon + title + meta + chevron), `standard` (+ expiry badge + actions), `with-notice`

**Token rules:** Expiry text in `--color-success-text` (active) / `--color-error-text` (expired) / `--color-warning-text` (expiring soon). Chevron: `ChevronRight`, 18px.

---

### 2. PromoCard

**Purpose:** Acquisition, cross-sell, or upsell — drives toward a new product or purchase.

| Slot | Required | Notes |
|------|----------|-------|
| `title` | Yes | Bold value proposition |
| `primary-cta` | Yes | Always present |
| `media` | Conditional | Required for vertical-rich and carousel variants |
| `body` | Optional | Supporting subtitle |
| `eyebrow` | Optional | Offer tag — use `Badge` |

**Variants:**

| Variant | Shell | Layout |
|---------|-------|--------|
| `horizontal-banner` | `Card variant="elevated" padding="md"` | Text left, image right |
| `vertical-rich` | Custom full-bleed image + gradient overlay | Image fills card, text overlays at bottom |
| `mini` | `Card variant="default" padding="sm"` | Eyebrow + title + CTA — compact |
| `carousel-tile` | `Card variant="elevated" padding="none"` | Image top, label + CTA bottom |

---

### 3. AlertCard

**Purpose:** Status notification — policy update, system message, time-sensitive event.

**Shell:** Custom — no Card wrapper. Full-width banner with left accent border.

| Slot | Required | Notes |
|------|----------|-------|
| `eyebrow` | Yes | Policy/context name |
| `title` | Yes | Status message |
| `body` | Optional | Additional detail |
| `primary-cta` | Optional | Aligned trailing |

**Variants by severity:**

| Variant | Background | Left border | Text color |
|---------|------------|-------------|------------|
| `info` | `--color-info-subtle` | `--color-info` | `--color-info-text` |
| `warning` | `--color-warning-subtle` | `--color-warning` | `--color-warning-text` |
| `error` | `--color-error-subtle` | `--color-error` | `--color-error-text` |
| `success` | `--color-success-subtle` | `--color-success` | `--color-success-text` |
| `neutral` | `--color-surface-raised` | `--color-border` | `--color-text-default` |

Left accent border: `4px solid {color}`, full card height. Border radius: `--radius-2xl`.

---

### 4. DecisionCard

**Purpose:** Requires explicit user choice before proceeding. High urgency. Blocks flow.

**Shell:** `Card variant="outline" padding="md"` with colored top border.

| Slot | Required | Notes |
|------|----------|-------|
| `status-badge` | Yes | "Pending", "On hold", "Action required" |
| `title` | Yes | Clear directive — `heading-md` |
| `body` | Yes | Context explaining why action is needed |
| `primary-cta` | Yes | `Button variant="primary" fullWidth` |
| `icon` | Optional | |
| `footer-link` | Optional | "Learn more" |

**Variants:** `pending` (warning border), `on-hold` (error border), `action-required` (error border)

---

### 5. ServiceTile

**Purpose:** Quick-access shortcut to a feature or service. Tappable square.

**Shell:** `Card variant="default" padding="sm"` — fixed square aspect ratio.

| Slot | Required | Notes |
|------|----------|-------|
| `icon` | Yes | 24px, `--color-text-default` |
| `title` | Yes | `label-lg` — 2 lines max |

Size: 80×80px to 96×96px. No explicit CTA — entire tile is interactive.

---

### 6. NetworkCard

**Purpose:** Provider in a network — hospital, garage, lab. Used in listing contexts.

**Shell:** `Card variant="outline" padding="md"` or `Card variant="default" padding="md"`

| Slot | Required | Notes |
|------|----------|-------|
| `title` | Yes | Provider name |
| `meta` | Yes | Rating + distance or address |
| `status-badge` | Optional | Network type ("Cashless") |
| `media` | Optional | Provider thumbnail, 64×64px, `--radius-lg` |
| `footer-link` | Optional | "View details" |

Selected state: `border-color: --color-primary` + `box-shadow: 0 0 0 1px var(--color-primary)`

---

### 7. StatusCard

**Purpose:** Shows status of a claim, transaction, booking, or background process.

**Shell:** `Card variant="default" padding="md"`

| Slot | Required | Notes |
|------|----------|-------|
| `status-badge` | Yes | Current status |
| `title` | Yes | What is being tracked |
| `meta` | Yes | Reference ID, date, timestamp |
| `body` | Optional | Secondary detail |
| `primary-cta` | Optional | "View details" |
| `progress` | Optional | For in-progress states |

**Badge color by state:**

| State | Badge bg | Badge text |
|-------|----------|------------|
| Completed / Paid | `--color-success-badge-bg` | `--color-success-text` |
| Scheduled | `--color-primary-subtle` | `--color-primary` |
| Pending / Processing | `--color-warning-badge-bg` | `--color-warning-text` |
| Failed / Rejected | `--color-error-badge-bg` | `--color-error-text` |

---

### 8. CommerceCard

**Purpose:** Pricing, discounts, coupon entry, and reward display.

**Shell:** `Card variant="outline" padding="md"`

| Slot | Required | Notes |
|------|----------|-------|
| `title` | Yes | Offer headline or pricing label |
| `primary-cta` | Yes | Apply, Save, Explore |
| `icon` | Conditional | Coupon/offer icon — 24px |
| `input` | Conditional | `TextInput` for coupon code entry |
| `body` | Optional | Savings amount, terms |
| `secondary-cta` | Optional | Remove (for applied state) |

**Variants:** `coupon-input`, `coupon-applied`, `pricing-summary`, `reward`, `offer-banner`

---

### 9. ContentCard

**Purpose:** Editorial content — articles, how-to guides, explanations.

**Shell:** `Card variant="elevated" padding="none"` for image-top; `Card variant="default" padding="md"` for inline banner.

| Slot | Required | Notes |
|------|----------|-------|
| `title` | Yes | Article title |
| `media` | Conditional | Hero image — full bleed, 16:9 or 3:2 |
| `eyebrow` | Optional | Category label — `overline color="brand"` |
| `meta` | Optional | Author, date, read time — `caption` |
| `body` | Optional | Excerpt — 3 lines max |
| `primary-cta` | Optional | "Read more" — `Button variant="outline" size="sm"` |

**Variants:** `image-top`, `thumbnail-right`, `info-banner`

---

### 10. PlanRadioCard (selectable plan option)

**Purpose:** One **plan option** inside a **radio group** (e.g. bike insurance Comprehensive vs Third-party). User selects **exactly one** plan; the **card shell** shows selection via **border** (not a full-card tint). Used in purchase flows where the card is the **entire hit target** but may include **secondary links** (see exceptions below).

**This is a documented variation** of the card shell: it does **not** use the `Card` component wrapper — it uses **ACKO radio “card item”** primitives (`acko-radio-card-item`, `acko-radio-native`, `acko-radio-circle`, `acko-radio-label-content`) plus **app-level CSS** for grid layout and borders.

**Reference implementation:** D2C bike journey — `PlanRadioCard` in `SelectPlan.tsx`; styles in app `index.css` under `.plan-radio-card*`.

#### Shell & border (mandatory)

| State | Border | Token / value |
|-------|--------|----------------|
| Default / unselected | **1px** solid | `var(--color-card-outline-border)` — **matches** `Card variant="outline"` (e.g. bike details / IDV strips on same screen). |
| Selected | **2px** solid | `var(--color-primary)` |
| Hover (unselected) | **1px** | Border `var(--color-primary-muted)` |
| Hover (selected) | **2px** | Border `var(--color-primary-hover)` |

- **Padding:** `var(--space-5)`; **radius:** `var(--radius-4xl)`; **background:** `var(--color-card-elevated-bg)`.
- **Transition:** `border-color`, `border-width`, `background-color` (~150ms).
- **Focus:** `@acko/css` applies **`box-shadow`** on **`.acko-radio-card-item:focus-within`**, which stacks with the purple border and looks like a **double** purple edge. **Override** for this pattern only: **`.plan-radio-card.acko-radio-card-item:focus-within { box-shadow: none; }`**. Keyboard focus remains on the **radio circle** via **`.acko-radio-native:focus-visible + .acko-radio-circle`** (DS).

#### Layout — CSS Grid (not default ACKO flex row)

Use **`plan-radio-card--plan-grid`**: `grid-template-columns: auto 1fr`; **`align-items: center`** on the title row so the **radio** and **plan title** align vertically.

| `plan-radio-card--has-badge` | Grid areas |
|------------------------------|------------|
| **No** | `radio \| title` then `main \| main` (full width) |
| **Yes** | `badge \| badge` (full width), then `radio \| title`, then `main \| main` |

- **Badge row** must span **both** columns (`badge badge`), **`justify-self: start`**, so the **“Most popular”** pill aligns with the **radio column** — do **not** place the badge only in column 2.
- **Main** (`acko-radio-label-content.plan-radio-card-main`): set **`gap: 0`** on the label content override so spacing is controlled only by inner stacks.

#### Slots (composition)

| Slot | Required | Notes |
|------|----------|-------|
| `status-badge` | Conditional | **“Most popular”** — `Badge variant="solid" color="purple" size="md" textCase="sentence"`; optional **shimmer** (wrapper + `::after` gradient animation; badge `z-index` above shimmer; `margin-bottom: calc(var(--space-1) / 2)` under pill). Respect **`prefers-reduced-motion`**. |
| `title` | Yes | Plan name — `Typography` **20px** bold (`heading-sm` + explicit size/line height), primary. |
| `body` (pointers) | Yes | **Single `<ul>`** — **tenure** lines first, then **coverage** lines; same visual system for all rows: Lucide **`Check`** 18px, `var(--color-success-text)`, `Typography body-sm` primary **medium**; list **`gap: var(--space-3)`**; row **`gap: var(--space-2)`** icon-to-text. |
| `footer-link` | Optional | **“More details”** — `Button variant="link" size="sm"`; **`stopPropagation`** on click so the label does not toggle radio. |
| `divider` | Yes | `Separator` between body and price — tuned **`marginTop`** (e.g. `calc(var(--space-4) - var(--space-1))`) above separator block. |
| `meta` (price) | Yes | **Row:** `flex flex-nowrap justify-start items-center gap-2`. **Main price:** `heading-md` + **`--font-heading-md-*`** tokens. **Strikethrough (optional):** `body-md` secondary, `line-through`, **`--font-body-md-*`**, regular weight (not extrabold unless product specifies). |

**Main block top spacing:** `padding-top: calc(var(--space-2) + var(--space-1))` on `.plan-radio-card-main` for space below the title row.

#### Props (data model)

| Prop | Purpose |
|------|---------|
| `groupName` | Radio `name` (from parent `useId()`). |
| `value` / current `plan` | Option id vs selection. |
| `setPlan` | Updates selection. |
| `showHighlightBadge?` | Renders badge row + `plan-radio-card--has-badge`. |
| `title` | Plan name. |
| `tenurePointers` | `string[]` — short tenure lines (same checklist style as features). |
| `features` | `string[]` — coverage bullets. |
| `price` | Formatted amount. |
| `strikethrough?` | Optional old price. |

#### Exceptions to global card rules

- **Nested control:** Rule “no interactive inside fully interactive card” is **relaxed** here for **“More details”**: use **`type="button"`** + **`stopPropagation`** — required for product UX; document in QA.
- **Selection chrome:** Rule 12 in `Rules for LLM Card Generation` references a **box-shadow ring** — for **PlanRadioCard**, selection is **`border-width` 1→2px** + **primary color**, **not** an extra `box-shadow` on the card (and **disable** DS `:focus-within` shadow as above).

---

## Shell Selection Guide

| Card Type | Default Shell | When elevated | When outline |
|-----------|--------------|---------------|--------------|
| PolicyCard | `default` | On dark/grey page bg | Never |
| PromoCard | `elevated` | Always for rich variants | Never |
| AlertCard | Custom | — | — |
| DecisionCard | `outline` | Never | Always |
| ServiceTile | `default` | Never | Never |
| NetworkCard | `outline` | Never | For listing/selection |
| StatusCard | `default` | Never | Never |
| CommerceCard | `outline` | Never | Always |
| ContentCard | `elevated` | For standalone articles | Never |
| PlanRadioCard | ACKO radio **card item** + app grid (see **§10**) — **not** the `Card` component | — | **Idle** border matches `outline`: **1px** `--color-card-outline-border`; **selected**: **2px** `--color-primary` |

---

## Token Quick Reference

### Surfaces
| Token | Use |
|-------|-----|
| `--color-card-bg` | Default card background |
| `--color-card-elevated-bg` | Elevated card background |
| `--color-card-demoted-bg` | Demoted/secondary card |

### Spacing in cards (Tailwind default scale — see `primitives.md`)

| Utility | ≈ Value (16px root) | Use |
|---------|---------------------|-----|
| `gap-2` | 8px | Icon-to-text gap, tight rows |
| `gap-3` | 12px | Card padding `sm` |
| `gap-4` | 16px | Internal section gaps |
| `gap-5` | 20px | Card padding `md` (default) |
| `gap-6` | 24px | Card padding `lg` |

### Border radius
| Token | Value | Use |
|-------|-------|-----|
| `--radius-4xl` | 20px | All card containers |
| `--radius-2xl` | 12px | AlertCard, inline notices |
| `--radius-full` | 9999px | Badges, pill elements |

### Shadows
| Token | Use |
|-------|-----|
| `--shadow-card` | Elevated card shell |
| `--shadow-subtle` | Small internal raised elements |

---

## Rules for LLM Card Generation

1. **Match type first** — identify which of the **10** types the card is (including **PlanRadioCard** in §10). Closest type wins; extend minimally.
2. **Only use defined slots** — do not invent new structural regions.
3. **One primary CTA per card** — never two primary buttons in the same card.
4. **Tokens only** — never write a raw hex, rem, or px value for color or spacing.
5. **Typography via component** — always use `Typography` with a named variant.
6. **Badge for status** — any state label (Pending, Active, Expired) uses `Badge`, not custom text.
7. **No decorative borders inside default cards** — use `Separator` only for genuine content divisions.
8. **Card width is always contextual** — cards never define their own `width`. Parent layout controls it.
9. **Dark theme is inherited** — do not write per-card dark theme overrides. Semantic tokens handle it.
10. **Media must have a fallback** — if a `media` slot image fails, the card must still be usable.
11. **No CTA inside fully-interactive cards** — when the entire card is a tap target, do not nest `Button` or any interactive component inside it. Nesting interactive elements is invalid HTML and an accessibility violation. **Exception:** **PlanRadioCard** (§10) may include a **link-style** “More details” control with **`stopPropagation`** — documented pattern for purchase flows.
12. **Selection state is communicated by the card shell only** — use variant change and a visible border treatment. Typical pattern: `box-shadow: 0 0 0 2px var(--color-primary)` **or** **PlanRadioCard**’s **1px → 2px** border + primary color (see §10). Never use a `Badge` or internal element to indicate selected/unselected state.
13. **Title and body stack vertically** — never default to title left / subtext right in one row. See “Card layout hierarchy & badge placement”.
14. **Title-reference badges stay above the title** (top-edge overlap allowed). Align primary CTAs across cards in a grid to the same vertical position.
