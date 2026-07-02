---
name: acko-design-system
description: ACKO's design system principles and patterns for building polished, accessible, production-ready UI. Use this skill when building any ACKO product UI — purchase flows, claims, renewals, dashboards, or any customer-facing surface. Triggers on: UI components, layout composition, forms, animations, transitions, responsive design, typography, spacing, color, insurance flows, mobile UX, accessibility, button states, input fields, loading states, error states, copy tone, marketing pages.
---

# ACKO Design System — Skill Orchestrator

## Token Architecture

All values flow through a 3-layer system. Never skip layers.

```
primitives.md → semantics.md → components
Raw values       Semantic roles    Component specs
```

**Rule:** Components reference semantic tokens only. Semantic tokens reference primitives only. Never use a primitive directly in a component.

---

## ACKO Product Personality

**Warm, bright, modern, and disciplined.**
Playful in spirit — never in execution.

This → Clear, human, confident, fast, trustworthy.
Not this → Cold, corporate, bloated, legal-heavy, fear-driven.
Not this → Cartoony, gimmicky, over-animated, patronizing.

---

## Design Principles

1. **Clear over Clever** — Plain language, no jargon, error messages explain what to do next.
2. **Effortless by Default** — No unnecessary steps, always show loading states, prefill known data.
3. **Present When It Matters** — Claims and emergencies get maximum clarity, no clutter.
4. **Respectful of User's Time** — No forced upsells in flows, no dead ends, remember context.
5. **Trustworthy at Every Touchpoint** — Visual consistency, only ACKO package components, no stale data.

---

## Hard Constraints

```
NEVER create a component that does not exist in the ACKO component package.
NEVER hardcode any value — always use tokens from primitives.md via semantics.md.
NEVER write playful, witty, or clever copy. Clear always wins.
NEVER ship a layout that is not fully responsive.

NEVER leave an error state without a resolution path.
NEVER use a z-index value outside --z-dropdown / --z-sticky / --z-modal / --z-tooltip / --z-toast.
NEVER use transition: all.
NEVER change font weight on hover or selected state.

NEVER reference a primitive token directly in a component — always go through semantics.

NEVER add an app-level `@theme` / `index.css` override for Tailwind’s `--spacing` when `@acko/tokens` is imported. `@acko/tokens` already defines `--spacing` (1px-per-unit base). A second definition desyncs packaged `@acko/*` component CSS from your utilities and breaks layouts. See **Tailwind spacing and @acko/tokens** below and primitives.md “Spacing & Sizing”.

NEVER place a card primary title and supporting body in a left/right split row — use vertical reading order. See cards.md.

NEVER place a title-reference Badge beside or below the title — only above the title (top-edge overlap allowed). See cards.md.
```

---

## Tailwind spacing and @acko/tokens

**What ships:** `@acko/tokens` includes `theme.css`, which sets `--spacing: 0.0625rem` so Tailwind v4 utilities use a **1px-per-unit** scale (`p-16` = 16px, `gap-8` = 8px). That value is intentional and is the single source of truth.

**What breaks things:** Defining `--spacing` again in your app (e.g. another `@theme inline { --spacing: … }` in `index.css`, or “restoring” the classic 0.25rem base) overrides the token package. Packaged components were built assuming the shipped base; utilities and component CSS then disagree → wrong padding, gaps, and icon sizes.

**What to do instead:**

1. Import `@acko/tokens/tokens.css` and `@acko/tokens/theme.css` as documented — do not override `--spacing` after them.
2. Use Tailwind spacing utilities with the **1px mapping** from primitives.md (e.g. gutters `px-16 md:px-32 lg:px-40`, not old `px-4` expectations).
3. If migrating from the old 0.25rem mental model, use the **multiply by 4** table in primitives.md (“Migration from 0.25rem base”).

**Not the problem:** Leaving `@acko/tokens` as the only `--spacing` definition. **Is the problem:** Any extra `--spacing` override in application CSS.

---

## Decision Flowcharts

### Is This Copy Correct?

```
Plain language a first-time insurance buyer would understand?
├── No → Rewrite
└── Yes → Contains jargon or hidden conditions?
           ├── Yes → Rewrite
           └── No → Warm but controlled? → Yes → Ship it
```

### Card or Flat Surface?

```
Content scanned independently? → Card (--shadow-md, --radius-4xl)
Part of a list or feed?        → Flat surface with --border-hairline divider
Inline content in a flow?      → No surface, spacing tokens only
```

---

## Review Checklist

Before shipping any UI:

- [ ] All values from tokens — zero hardcoded values
- [ ] Token layering: components → semantics → primitives
- [ ] Only ACKO package components — no improvised patterns
- [ ] Copy is clear, plain, sentence case, never playful
- [ ] Fully responsive — mobile first, 768px, 1024px breakpoints

- [ ] Touch targets minimum 44px
- [ ] Hover effects disabled on touch devices
- [ ] Keyboard navigation works
- [ ] All icon buttons have aria labels
- [ ] Forms submit on Enter / Cmd+Enter
- [ ] Input font size minimum 16px (body-md)
- [ ] Loading states for all async content
- [ ] Error states have resolution paths
- [ ] No layout shift on dynamic content
- [ ] No `transition: all`
- [ ] z-index uses defined scale tokens only
- [ ] No app-level `--spacing` override — must match `@acko/tokens` only (see **Tailwind spacing and @acko/tokens**)
- [ ] Cards: title + body/subtext stack vertically — not title left / subtext right
- [ ] Title-reference badge above title only (top-edge overlap OK); unrelated badges use their own slot
- [ ] Card grids: primary CTAs align to the same vertical position (equal-height / footer pinned)

---

## Reference Files

| File | What's in it |
|------|-------------|
| [primitives.md](primitives.md) | All Layer 1 raw values: colors, spacing, typography scale, radius, shadows, easing, opacity, z-index, breakpoints |
| [semantics.md](semantics.md) | All Layer 2 semantic mappings: color roles, shadow aliases, component tokens, light + dark theme variable mappings |
| [typography.md](typography.md) | Typography component API, variants, weights, colors, patterns, text casing rules |
| [iconography.md](iconography.md) | Icon library, arrow vs chevron semantics, sizing, placement, anti-patterns |
| [layout.md](layout.md) | Layout hierarchy, breakpoints, section container, spacing rhythm, surface decisions, responsive composition, empty states |
| [motion.md](motion.md) | Easing curves, keyframes, animation performance rules, duration guidance |
| [forms-controls.md](forms-controls.md) | Inputs, buttons, validation timing, error handling, OTP, multi-step forms, CTA copy |
| [touch-accessibility.md](touch-accessibility.md) | Tap targets, hover on touch, keyboard nav, ARIA, reduced motion, time-limited actions |
| [performance.md](performance.md) | Image optimization, code splitting, list virtualization, React patterns, Vite config |
| [ui-polish.md](ui-polish.md) | Focus states, skeleton loaders, dark mode implementation, safe areas, logo assets, decorative elements |
| [cards.md](cards.md) | Card base API, **10** typed card patterns (incl. **PlanRadioCard** §10 — selectable plan option), slot vocabulary, **layout hierarchy & badge placement**, shell selection guide, token reference |

---

## Before Building UI

Read **every** reference file in this directory before writing UI code. `SKILL.md` is the orchestrator only — reading it alone is not enough.

**Read order:**
1. [primitives.md](primitives.md) + [semantics.md](semantics.md) — token foundation
2. [typography.md](typography.md) + [layout.md](layout.md) — structure and type
3. Domain files as needed: [cards.md](cards.md), [forms-controls.md](forms-controls.md), [iconography.md](iconography.md), [motion.md](motion.md), [touch-accessibility.md](touch-accessibility.md), [performance.md](performance.md), [ui-polish.md](ui-polish.md)
