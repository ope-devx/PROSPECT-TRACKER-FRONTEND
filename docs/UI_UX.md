# UI / UX Specification

---

## Tailwind Configuration

```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#0f0f13',
        surface:  '#1a1a22',
        surface2: '#22222e',
        border:   '#2e2e3e',
        accent:   '#e94560',
        accent2:  '#7c3aed',
        text:     '#f0f0f5',
        muted:    '#888899',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
```

## Google Fonts (index.html `<head>`)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

## Global CSS (index.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

*, *::before, *::after { box-sizing: border-box; }
body { background-color: #0f0f13; color: #f0f0f5; }
```

---

## Layout

```
App root: max-w-[900px] mx-auto px-4 py-4

On desktop with drawer open:
  List area shifts: calc from full width to full width - 440px
  Achieved with: flex layout where list = flex-1 and drawer = fixed right panel
```

Page background: `bg-bg min-h-screen`

---

## Spacing & Sizing System

Use Tailwind's default spacing scale consistently:
- Card padding: `p-4` or `p-5`
- Gap between cards: `gap-3`
- Section gaps in form: `gap-4`
- Between major sections: `mb-5` or `mb-6`
- Border radius: cards = `rounded-xl`, buttons = `rounded-lg`, badges = `rounded-full` or `rounded-md`

---

## Typography Scale

| Usage                  | Classes                                    |
|------------------------|--------------------------------------------|
| Logo                   | `font-mono text-[13px] text-accent uppercase tracking-[2px]` |
| Stat value             | `font-mono text-2xl font-medium`           |
| Stat label             | `text-[11px] text-muted uppercase tracking-widest` |
| Card business name     | `text-[15px] font-medium text-text`        |
| Card meta              | `text-xs text-muted`                       |
| Section label (form)   | `text-[11px] text-muted uppercase tracking-[0.8px]` |
| Form label             | `text-[12px] text-muted uppercase tracking-[0.8px]` |
| Detail score big       | `font-mono text-5xl font-medium`           |
| Detail name            | `text-xl font-medium text-text`            |
| Detail row key         | `text-[11px] text-muted uppercase tracking-[0.5px]` |
| Detail row value       | `text-sm font-medium text-text`            |
| Badge text             | `text-[11px] font-medium uppercase tracking-[0.5px]` |

---

## Colour Usage

| Purpose              | Token          | Tailwind class       |
|----------------------|----------------|----------------------|
| Page background      | `#0f0f13`      | `bg-bg`              |
| Card/panel bg        | `#1a1a22`      | `bg-surface`         |
| Input/hover bg       | `#22222e`      | `bg-surface2`        |
| All borders          | `#2e2e3e`      | `border-border`      |
| Primary red/accent   | `#e94560`      | `text-accent bg-accent border-accent` |
| Purple accent        | `#7c3aed`      | `text-accent2 bg-accent2` |
| Body text            | `#f0f0f5`      | `text-text`          |
| Muted/secondary text | `#888899`      | `text-muted`         |
| Hot score / Closed   | `#22c55e`      | `text-green-400`     |
| Warm score / Follow  | `#f59e0b`      | `text-yellow-400`    |
| Cold / Lost / Delete | `#ef4444`      | `text-red-400`       |
| Contacted / Sort     | `#3b82f6`      | `text-blue-400`      |

Alpha values (for badge backgrounds and borders):
- Use Tailwind opacity modifiers: `bg-green-400/10 border-green-400/30 text-green-400`
- Same pattern for red, yellow, blue, purple

---

## Form UX

### Inputs & Selects

```
bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm text-text
w-full outline-none transition-colors duration-150
focus:border-accent
placeholder:text-muted
```

### Checkbox Pills (Pain Signals)

```
Base:    bg-surface2 border border-border rounded-lg p-2 flex items-center gap-2 cursor-pointer text-sm text-text
Hover:   border-accent/40
Checked: border-accent/60 bg-accent/10 text-text
Checkbox: accent-color: accent (set via global CSS: input[type=checkbox] { accent-color: #e94560 })
```

### Score Selector

10 buttons in a flex row, with "Weak" and "Hot" labels on each end.
Below the buttons: current score displayed large in the centre.

```
Button base:  w-9 h-9 rounded-lg border font-mono text-xs flex items-center justify-center transition-all

Unselected cold  (1–4):  border-red-400/30    text-muted    bg-surface2
Unselected warm  (5–7):  border-yellow-400/30 text-muted    bg-surface2
Unselected hot   (8–10): border-green-400/30  text-muted    bg-surface2

Selected cold:            border-red-400       text-white    bg-red-500
Selected warm:            border-yellow-400    text-white    bg-yellow-500
Selected hot:             border-green-400     text-white    bg-green-500
```

Large score readout below buttons:
```
score === 0 : text-muted "—"
score 1–4   : text-red-400    [score]
score 5–7   : text-yellow-400 [score]
score 8–10  : text-green-400  [score]

Classes: font-mono text-3xl font-medium tabular-nums
```

### Section Dividers in Form

```jsx
<div className="flex items-center gap-3 my-6">
  <div className="text-[11px] text-muted uppercase tracking-widest whitespace-nowrap">
    Section Title
  </div>
  <div className="flex-1 h-px bg-border" />
</div>
```

---

## ProspectDetail Drawer Transitions

```
Transition: translate-x-full → translate-x-0
Duration: 250ms, ease-out
Implementation: CSS transition on transform with conditional class
```

Use a wrapper div with class:
```
fixed right-0 top-0 h-full w-[440px] bg-surface border-l border-border
transform transition-transform duration-250 ease-out z-30
translate-x-full (closed) / translate-x-0 (open)
```

Overlay (behind drawer, in front of list):
```
fixed inset-0 bg-black/30 z-20
opacity-0 pointer-events-none → opacity-100 pointer-events-auto
transition-opacity duration-250
```

---

## Responsive Breakpoints

| Breakpoint | Behaviour                                         |
|------------|---------------------------------------------------|
| < 640px    | Single column form. 2-col stats becomes 2×2 grid. |
|            | Pain signals: 1 column. FilterBar wraps.          |
|            | Drawer: full screen overlay (`fixed inset-0`)     |
| 640px+     | 2-column form grid. FilterBar horizontal.         |
| 768px+     | 5-column stats row. Drawer is side panel.         |

---

## UX Decisions

**No modals for data entry.** The full form is a view (`view === 'form'`), not a modal.
This avoids focus trapping issues and is cleaner on mobile.

**No `window.confirm`.** Delete uses a two-click confirmation pattern inline in the drawer.

**No `alert`.** All feedback goes through Toast.

**Drawer vs modal for detail view.** Drawer preserves list context — user sees the list
alongside the detail and can quickly close and open another card without losing scroll position.

**Active filter pills.** Users must always be able to see what's filtered. Pills are the
visual representation of active filters and can be dismissed individually.

**Empty state is context-aware.** Two different messages:
1. "No prospects yet. Hit + Add Prospect and start hunting."
2. "No results for current filters. [Clear filters]"

**Followers displayed, not stored, as formatted string.** Store `1200` (number).
Display `"1,200"`. Never store `"1,200"`.

**Score 0 is "not set".** Card shows `?`. Score selector shows `—`. Not displayed
as a low score or included in warm/cold stats calculations.
```js
const isScoredHot  = p => p.score >= 8;
const isScoredWarm = p => p.score >= 5 && p.score < 8;
// score === 0 is excluded from both
```
