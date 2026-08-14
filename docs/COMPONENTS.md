# Component Specifications

---

## UI Primitives (`src/components/ui/`)

These are completely generic. No domain knowledge, no prospect-specific strings.

### Button.jsx

```jsx
// Props
{
  variant: 'primary' | 'ghost' | 'danger',  // default: 'primary'
  size: 'sm' | 'md',                        // default: 'md'
  onClick: fn,
  disabled: bool,
  fullWidth: bool,
  children,
}
```

Tailwind classes per variant:
- `primary`: `bg-accent text-white hover:opacity-90 active:scale-95`
- `ghost`: `bg-transparent border border-border text-muted hover:text-text hover:border-text`
- `danger`: `bg-red-900/30 border border-red-500/40 text-red-400 hover:bg-red-900/50`

All variants share: `rounded-lg font-sans font-medium transition-all duration-150`

### Badge.jsx

```jsx
// Props
{
  variant: 'status' | 'score' | 'pain' | 'spending',
  value: string | number,
}
```

For `variant="status"`, Badge receives the status VALUE (e.g. `'meeting_booked'`) and
renders the LABEL with the correct colour. Import `STATUSES` to look up the label.

Status colour mapping:
- `new`            → blue
- `contacted`      → yellow
- `follow_up`      → purple
- `meeting_booked` → indigo
- `closed`         → green
- `lost`           → red

For `variant="score"`:
- 8–10 → green
- 5–7  → yellow
- 1–4  → red
- 0    → muted, displays `?`

For `variant="pain"`: small muted pill — `bg-surface2 text-muted border border-border text-[11px]`

For `variant="spending"`: yellow pill — `💰 Spending` text

### Select.jsx

A thin styled wrapper around `<select>`.

```jsx
// Props
{
  id: string,
  value: string,
  onChange: fn,
  options: [{ value, label }],
  placeholder: string,   // shown as first disabled option
  className: string,
}
```

Renders a `<select>` with `bg-surface2 border-border text-text rounded-lg` styling.
The placeholder option has `value=""` and is `disabled`.

### Toast.jsx

```jsx
// Props
{
  toast: { message: string, type: 'success' | 'error' } | null,
  onDismiss: fn,
}
```

- Position: `fixed top-4 right-4 z-50`
- `success`: green left border, check icon
- `error`: red left border, X icon
- Renders `null` when `toast` prop is `null`
- Does NOT manage its own timer. The hook manages the 3s timeout.

---

## Layout Components (`src/components/layout/`)

### Header.jsx

```jsx
// Props: none

// Renders:
// Left: "Prospect.kd" logo — font-mono text-accent uppercase tracking-widest + ".kd" in text-muted
// Right: "Kaduna North · Web Design Leads" — text-xs text-muted
```

No state, no logic, no props.

### StatsRow.jsx

```jsx
// Props
{
  stats: {
    total: number,
    hot: number,
    warm: number,
    closed: number,
    uniqueNiches: number,
  }
}
```

Renders 5 stat tiles in a grid (`grid-cols-2 md:grid-cols-5`):
1. Total Prospects (text-text)
2. Hot (8–10) (text-green-400)
3. Warm (5–7) (text-yellow-400)
4. Closed (text-accent)
5. Niches (text-accent2)

Each tile: `bg-surface border border-border rounded-xl p-4`
Value: `font-mono text-2xl font-medium`
Label: `text-[11px] text-muted uppercase tracking-widest mt-1`

---

## Filters (`src/components/filters/`)

### FilterBar.jsx

```jsx
// Props
{
  filters: { search, status, niche, spending, sort },
  onFilterChange: (key, value) => void,
  onClearFilter: (key) => void,
  onClearAll: () => void,
  resultCount: number,   // how many prospects match current filters
}
```

**Layout — two rows:**

Row 1 — Controls (`flex flex-wrap gap-2`):
- Search input (flex-1, min-width 160px): text input, magnifying glass icon left
- Status Select (options from STATUSES + "All Statuses")
- Niche Select (options from NICHES + "All Niches")
- Spending Select: All Spending / Is Spending / Not Spending
- Sort Select (options from SORT_OPTIONS)

Row 2 — Active pills + result count:
- Left: "Showing N results" in text-muted text-xs
- Right: One dismissable pill per active filter that isn't "all"/empty.
  Pill: `bg-surface2 border border-border text-xs rounded-full px-3 py-1 flex items-center gap-1`
  × button inside pill calls `onClearFilter(key)`
- If any filters active: "Clear all" ghost link on far right

**Active filter detection:**
- `search !== ''`
- `status !== 'all'`
- `niche !== 'all'`
- `spending !== 'all'`
- Sort is never shown as an active pill (sort is always active)

---

## Prospect Components (`src/components/prospects/`)

### ProspectCard.jsx

```jsx
// Props
{
  prospect: Prospect,
  onClick: (id) => void,
}
```

**Layout:**
```
┌─────────────────────────────────────────────────┐
│ [Score]  Business Name          [Status Badge]  │
│          @handle · Niche · N,NNN followers      │
│          [Pain tag] [Pain tag]   [💰 Spending]  │
└─────────────────────────────────────────────────┘
```

- Score box (42×42): uses `scoreClass()` — green/yellow/red background
- Business name: `text-[15px] font-medium`
- Meta row: handle, niche, formatted followers — `text-xs text-muted`
- Pain tags: first 3 only, `+N more` if there are more
- Status badge: top right — uses `Badge` component
- Spending badge: shows only if `IS_SPENDING.includes(prospect.spending)` — yellow "💰" badge
- Hover state: `border-accent/40 bg-surface2 cursor-pointer`
- Full card is clickable — `onClick(prospect.id)`

**Date added:** bottom right — `text-[11px] text-muted` — only if `prospect.dateAdded` exists

### ProspectList.jsx

```jsx
// Props
{
  prospects: Prospect[],
  onSelectProspect: (id) => void,
  onStartAdd: () => void,
}
```

If `prospects.length === 0`: render empty state:
```
🎯
No prospects match your filters.
[Clear filters] button  OR  [Add your first prospect] button
```
(Two empty states — one when filters are active but no results, one when there are 0 prospects total)

Otherwise: `flex flex-col gap-3`, one `ProspectCard` per prospect.

### ProspectForm.jsx

```jsx
// Props
{
  editingProspect: Prospect | null,   // null = add mode, Prospect = edit mode
  onSave: (formData) => void,
  onCancel: () => void,
}
```

**Form title:** "Add Prospect" or "Edit Prospect" based on `editingProspect`

**Three sections with divider + section label:**

**Section 1 — Identity** (`grid grid-cols-1 md:grid-cols-2 gap-4`)
- Business Name (text input, required)
- Niche / Category (Select, required)
- Instagram Handle (text input, placeholder "@username")
- Instagram / Social Link (url input)

**Section 2 — Profile Intel** (`grid grid-cols-1 md:grid-cols-2 gap-4`)
- Followers (number input, min 0) — label: "Followers"
- Engagement Level (Select: High / Medium / Low)
- Has Website? (Select: WEBSITE_OPTIONS)
- Spending on Ads? (Select: SPENDING_OPTIONS)
- Contact Info (text input, full width) — placeholder: "Phone, email, or DM link"

**Section 3 — Qualification** (full width fields)
- Status (Select: STATUSES — uses value, displays label)
- Pain Signals Spotted (checkbox grid, 2 cols on desktop, 1 on mobile)
  Each checkbox: `bg-surface2 border border-border rounded-lg p-2 flex items-center gap-2 cursor-pointer`
  Hover: `border-accent/40`
- Prospect Score 1–10 (visual score selector — see below)
- Notes (textarea, min-height 80px)

**Score selector:**
- Horizontal row of 10 buttons (1–10)
- Each button: 36×36, rounded
- Color-coded borders even when unselected: red (1–4), yellow (5–7), green (8–10)
- Selected button: filled with the tier colour
- "Weak" label on left, "Hot" label on right
- Current score shown large in centre: `font-mono text-3xl` with tier colour

**Validation (client-side):**
- Business name: required — show inline error below field if empty on submit
- No other required fields

**Footer buttons:**
- "Save Prospect" (Button primary, full-width on mobile)
- "Cancel" (Button ghost)

**On submit:**
- Build the prospect object from form state
- `followers`: `parseInt(value) || 0` — strip non-numeric, store as number
- `score`: stored as number (0 if not selected)
- Call `onSave(formData)`

**Edit mode pre-filling:**
When `editingProspect` is not null, populate all fields from it on mount.
Score selector should reflect `editingProspect.score`.

### ProspectDetail.jsx

```jsx
// Props
{
  prospect: Prospect,
  onEdit: (prospect) => void,
  onDelete: (id) => void,
  onClose: () => void,
}
```

**On desktop (`md:`):** Right-side drawer.
- Fixed position, slides in from right: `translate-x-0` vs `translate-x-full`
- Width: `w-[400px]` or `w-[440px]`
- Full viewport height, scrollable
- Background: `bg-surface border-l border-border`
- Backdrop: semi-transparent overlay behind list (not full black — `bg-black/30`)

**On mobile:** Full-screen overlay.
- `fixed inset-0 z-40 bg-surface overflow-y-auto`

**Header:**
- Large score: `font-mono text-5xl` in tier colour, with `/10` in muted
- Business name: `text-xl font-medium`
- Niche: `text-sm text-muted`
- Close button (×) top right
- Status badge beneath name

**Body — detail rows:**
Each row: `flex justify-between items-center py-3 border-b border-border text-sm`
Key: `text-xs text-muted uppercase tracking-wide`
Value: `text-text font-medium text-right max-w-[60%]`

Fields to show (in order):
1. Handle (link to `link` URL if available, else plain text)
2. Followers (formatted with `toLocaleString()`)
3. Engagement
4. Has Website
5. Spending on Ads
6. Contact
7. Status
8. Date Added

**Pain Signals section:**
If `pains.length > 0`: heading "Pain Signals" then wrap of `<Badge variant="pain">` pills

**Notes section:**
If `notes`: heading "Notes" then `text-sm leading-relaxed text-text`

**Footer:**
```
[Edit Prospect (primary, flex-1)]   [Delete (danger)]
```

Delete must show an inline confirmation (not `window.confirm`):
- First click: button label changes to "Confirm Delete?" turns red
- Second click: actually calls `onDelete(prospect.id)` and `onClose()`
- Any other interaction resets the confirm state
