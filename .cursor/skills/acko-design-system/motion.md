# Motion

Animation tokens, keyframes, and performance rules.

---

## Easing Curves

| Token | Value | Use |
|-------|-------|-----|
| `--ease-out-quad` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Standard exit |
| `--ease-out-cubic` | `cubic-bezier(0.215, 0.61, 0.355, 1)` | Dropdown/modal enter |
| `--ease-out-quart` | `cubic-bezier(0.165, 0.84, 0.44, 1)` | Strong deceleration |
| `--ease-in-out-cubic` | `cubic-bezier(0.645, 0.045, 0.355, 1)` | On-screen movement |
| `--ease-in-out-quart` | `cubic-bezier(0.77, 0, 0.175, 1)` | Emphatic transitions |

### Decision Guide

| Scenario | Easing |
|----------|--------|
| Element entering/exiting | `ease-out` |
| On-screen movement | `ease-in-out` |
| Hover/color transitions | `ease` (CSS default) |
| Seen 100+ times daily | Don't animate |

## Duration

There are **no `--duration-*` tokens**. Use raw values directly:

| Use | Value |
|-----|-------|
| Micro interactions (hover, color) | `150ms` |
| Standard transitions (dropdown, menu) | `200ms` |
| Modal / sheet enter | `300ms` |
| Exit animations | 20–30% faster than entrance |

---

## Shared Keyframes

Define in the component CSS file that needs them:

### `@keyframes acko-spin`
```css
@keyframes acko-spin { to { transform: rotate(360deg); } }
```
Used by: Button (loading spinner). Duration: `600ms linear infinite`.

### `@keyframes acko-shake`
```css
@keyframes acko-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(2px); }
}
```
Used by: TextInput (error), Dropdown (error). Duration: `300ms ease-out`.

### `@keyframes acko-check-pop`
```css
@keyframes acko-check-pop {
  0% { opacity: 0; transform: scale(0.5); }
  60% { opacity: 1; transform: scale(1.15); }
  100% { opacity: 1; transform: scale(1); }
}
```
Used by: TextInput (success). Duration: `300ms ease-out`.

### `@keyframes acko-menu-enter`
```css
@keyframes acko-menu-enter {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
```
Used by: Dropdown menu. Duration: `150ms ease-out-cubic`.

### `@keyframes acko-tick-pop`
```css
@keyframes acko-tick-pop {
  0% { opacity: 0; transform: scale(0.3); }
  60% { opacity: 1; transform: scale(1.15); }
  100% { opacity: 1; transform: scale(1); }
}
```
Used by: Dropdown (selected item tick). Duration: `250ms ease-out`.

---

## Performance Rules

- Only animate `transform` and `opacity` (GPU-accelerated)
- Never animate `padding`, `margin`, `height`, `width`, `top`, `left`
- Use `will-change: transform` for frequently animated elements — remove it after animation completes
- Exit animations 20–30% faster than entrances
- Respect `prefers-reduced-motion` — every animation must have a fallback

### Never Use `transition: all`

```css
/* ❌ Wrong */
.button { transition: all 200ms ease; }

/* ✅ Correct */
.button { transition: background-color 150ms ease; }
```

### Theme Switching

Disable transitions during theme changes to prevent flash:

```js
function setTheme(theme) {
  document.documentElement.classList.add('no-transitions');
  document.documentElement.setAttribute('data-theme', theme);
  requestAnimationFrame(() => requestAnimationFrame(() =>
    document.documentElement.classList.remove('no-transitions')
  ));
}
```

Motion tokens are **theme-agnostic**.
