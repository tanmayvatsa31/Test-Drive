# Layout & Composition

Structural layout system and composition principles. How screens are built, spaced, and arranged.

---

## The Core Principle

Composition is not decoration. Every layout decision — spacing, surface, hierarchy — exists to help the user understand what to do next, faster.

---

## Layout Hierarchy

Every screen must have one clear primary action. Build the layout around it.

```
1. Primary message / heading     → Largest, highest contrast
2. Supporting context            → Secondary weight, below primary
3. Primary action (CTA)          → Most prominent interactive element
4. Secondary actions             → Visually subordinate to primary CTA
5. Escape hatches (back, cancel) → Present but never competing
```

Never put two elements of equal visual weight next to each other if one is more important.

---

## Breakpoints

Mobile-first only. Use `min-width` media queries exclusively. **Never** mix with `max-width`.

| Name | Range | Media Query |
|------|-------|-------------|
| Mobile | 0 – 767px | Base styles (no media query) |
| Tablet | 768px – 1023px | `@media (min-width: 768px)` |
| Desktop | ≥ 1024px | `@media (min-width: 1024px)` |

```css
/* Mobile — default */
.layout { ... }

/* Tablet — 768px+ */
@media (min-width: 768px) { ... }

/* Desktop — 1024px+ */
@media (min-width: 1024px) { ... }
```

---

## Section Container

The standard constrained wrapper used in most sections.

```css
.section-container {
  width: 100%;
  padding-left: 16px;
  padding-right: 16px;
}

@media (min-width: 768px) {
  .section-container {
    padding-left: 32px;
    padding-right: 32px;
  }
}

@media (min-width: 1024px) {
  .section-container {
    max-width: 1280px;
    margin: 0 auto;
    padding-left: 40px;
    padding-right: 40px;
  }
}
```

### Gutters

| Breakpoint | Gutter | Token |
|------------|--------|-------|
| Mobile | 16px | `p-16` |
| Tablet | 32px | `p-32` |
| Desktop | 40px | `p-40` |

Gutters are **internal padding**, not margin.

### Effective Content Width (Desktop)

| Viewport | Usable Content |
|----------|----------------|
| 1024px | 944px |
| 1280px | 1200px |
| > 1280px | 1200px (centered) |

---

## Full-bleed Sections

For hero banners, image/video backgrounds, edge-to-edge media.

```html
<!-- Outer: spans full viewport width -->
<section class="full-bleed">
  <!-- Inner: constrains content -->
  <div class="section-container">
    ...content...
  </div>
</section>
```

Always use the two-layer structure. The outer wrapper carries the background. The inner uses Section Container rules.

---

## Desktop Typography Scaling

Between **1024px and 1280px**, only typography scales. Grid, spacing, and component density stay constant.

- **Preferred:** fluid scaling using `clamp()`
- **Acceptable:** stepped increase at `@media (min-width: 1280px)`

---

## Grid Rules

- Use relative units (`fr`, `%`) — no fixed pixel widths for layout columns
- Avoid `100vw` inside constrained containers (use `100%` relative to parent)
- Use `minmax(0, 1fr)` to prevent overflow issues
- Grid structure must not change between 1024px and 1280px

---

## Spacing Rhythm

Always use Tailwind spacing utilities from `primitives.md`. Never hardcode padding, margin, or gap values.

### Rules

(Default Tailwind scale — see `primitives.md`.)

- Related elements → less space between them
- Unrelated elements → more space between them
- Section breaks → `gap-12` (≈48px) or larger
- Within a card or form group → `gap-4` to `gap-6`
- Between form fields → `gap-5` (≈20px)
- Between page sections → `gap-12` to `gap-16` (≈48–64px)

### Vertical Rhythm

Maintain consistent vertical rhythm throughout a flow. If the first screen uses `gap-5` between fields, every screen in that flow must too.

---

## Surface Decisions

### When to Use a Card (Elevated Surface)

Use cards when content needs to be:
- Scanned independently (a policy summary, a claim card)
- Selected or acted on individually
- Distinguished from surrounding content

Card styling: `border-radius: var(--radius-4xl)` · `box-shadow: var(--shadow-md)`

### Card Spacing

- **Gap between cards**: At least `gap-12` (12px) between any two adjacent cards
- **Internal padding**: Cards use `padding="md"` (20px) by default

### When to Use a Flat Surface

Use flat surfaces (no card, just spacing + dividers) when:
- Content is part of a continuous list or feed
- Items are related and belong to the same group

Divider: `border-bottom: var(--border-hairline) solid var(--color-border)`

### When to Use No Surface

Use no surface (spacing only) when:
- Content is inline within a flow
- It's a single piece of information

### Never
- Nest cards inside cards
- Use cards just to add visual interest
- Mix card and flat patterns within the same list

---

## Page Structure Templates

### Standard Flow Screen (Purchase, Claims, Renewal)

```
[Header / Progress indicator]
  ↓ gap-8
[Screen title — heading-lg or heading-xl]
  ↓ gap-2
[Supporting subtitle — body-md]
  ↓ gap-8
[Primary content area]
  ↓ gap-10
[Primary CTA — full width on mobile]
  ↓ gap-4
[Secondary action / escape hatch]
```

Spacing uses **Tailwind’s default scale** (see `primitives.md`). Example: `gap-2` ≈ 8px, `gap-8` ≈ 32px.

### Dashboard / Overview Screen

```
[Header with user context]
  ↓ gap-8
[Primary status card]
  ↓ gap-6
[Secondary cards / list items]
  ↓ gap-12
[Contextual actions]
```

### Form Screen

```
[Field label — label-lg]
  ↓ gap-2
[Input]
  ↓ gap-1
[Helper text or error — label-md]
  ↓ gap-5
[Next field]
```

---

## Responsive Composition

### What Changes at Breakpoints

| Element | Mobile | Tablet+ |
|---------|--------|---------|
| Multi-column layout | Single column | 2–3 columns |
| Side-by-side CTAs | Stacked, full width | Inline |
| Navigation | Bottom bar or hamburger | Top nav |
| Cards in a grid | 1 column | 2–3 columns |
| Form fields | Full width | Can be 2-column |
| Modal | Full screen bottom sheet | Centered dialog |

### Rules

- CTAs on mobile are always full width
- Text never overflows its container — use `overflow-wrap: break-word`
- Tap targets always minimum 44px
- Font sizes never go below 12px (label-md); use 14px (body-sm) as the floor for body text
- No horizontal scroll — ever

---

## Information Density

### Dense Content (Policy details, documents, claim history)
- More breathing room, not less
- Clear section headers using `heading-sm` variant
- Dividers using `--border-hairline` between logical groups
- Line height: `body-md` or `body-lg` tokens (24–28px)

### Sparse Content (Onboarding, success states, single actions)
- Generous whitespace to signal importance
- One thing at a time — don't fill empty space
- Large typography (`heading-xl` or `display-sm`), centered layout, single CTA

### Loading States
- Every piece of async content needs a skeleton loader
- Skeleton dimensions must match actual content dimensions — no layout shift
- Skeleton border-radius must match the real component's radius token

---

## Empty States

Empty states are never blank. They always:
1. Acknowledge what's missing
2. Explain why (if relevant)
3. Tell the user exactly what to do next

```
[Icon — lucide-react or /public/assets/icons/, size-10]
[Title — heading-md]
  ↓ gap-2
[Body — body-md, secondary color]
  ↓ gap-6
[Primary CTA]
```

Never leave a user at a dead end.

---

## Component Composition Rules

### Do
- Use the ACKO component package as-is
- Compose layouts using Stack, Grid, and Container components
- Use component variants as designed — don't override internal styles

### Never
- Create a new component if one exists in the package
- Override component internals with inline styles or hardcoded values
- Nest interactive components inside other interactive components
- Use a component for a purpose it wasn't designed for

---

## Anti-Patterns

| Don't | Do |
|-------|----|
| `max-width` media queries | `min-width` media queries (mobile-first) |
| Margin for gutters | Padding for gutters |
| Fixed pixel column widths | `fr` / `%` / `minmax()` |
| `100vw` inside constrained containers | `100%` relative to parent |
| Scale spacing between 1024–1280px | Only scale typography |
| Skip inner container in full-bleed | Always use two-layer structure |
| Hardcoded `padding: 16px` | `p-16` Tailwind utility |
