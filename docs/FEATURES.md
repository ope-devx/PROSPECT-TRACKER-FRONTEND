# Feature Specifications

---

## Filter System

All filter logic lives in `hooks/useProspects.js`. FilterBar only renders controls
and fires callbacks. It never filters data itself.

### Filter Controls

| Control  | Type         | Options                                          | Default     |
|----------|--------------|--------------------------------------------------|-------------|
| Search   | text input   | Free text                                        | `''`        |
| Status   | Select       | All Statuses + each STATUSES entry (label shown) | `'all'`     |
| Niche    | Select       | All Niches + each NICHES entry                   | `'all'`     |
| Spending | Select       | All / Is Spending / Not Spending                 | `'all'`     |
| Sort     | Select       | SORT_OPTIONS entries                             | `'score'`   |

### Filter Logic (applied in `useProspects`)

```js
let result = [...prospects];

// 1. Search — case insensitive, matches name OR handle OR niche
if (filters.search) {
  const q = filters.search.toLowerCase();
  result = result.filter(p =>
    p.name?.toLowerCase().includes(q) ||
    p.handle?.toLowerCase().includes(q) ||
    p.niche?.toLowerCase().includes(q)
  );
}

// 2. Status
if (filters.status !== 'all') {
  result = result.filter(p => p.status === filters.status);
}

// 3. Niche
if (filters.niche !== 'all') {
  result = result.filter(p => p.niche === filters.niche);
}

// 4. Spending
if (filters.spending === 'yes') {
  result = result.filter(p => IS_SPENDING.includes(p.spending));
} else if (filters.spending === 'no') {
  result = result.filter(p => !IS_SPENDING.includes(p.spending));
}

// 5. Sort
if (filters.sort === 'score') {
  result.sort((a, b) => b.score - a.score);
} else if (filters.sort === 'date') {
  result.sort((a, b) => b.id - a.id);
} else if (filters.sort === 'followers') {
  result.sort((a, b) => (b.followers || -1) - (a.followers || -1));
} else if (filters.sort === 'status') {
  result.sort((a, b) => a.status.localeCompare(b.status));
}

return result;  // this is filteredProspects
```

### Active Filter Pills

Displayed in FilterBar below the controls row.

Rules for which filters show a pill:
- `search !== ''` → pill: `Search: "[value]"` (truncate at 20 chars)
- `status !== 'all'` → pill: `Status: [label]`
- `niche !== 'all'` → pill: `Niche: [niche name]`
- `spending !== 'all'` → pill: `Spending: [Is Spending | Not Spending]`
- Sort never gets a pill (always active, not an "active filter")

Each pill has an `×` button that calls `onClearFilter(key)`.
If 2 or more filters are active, show "Clear all" button on the right.

Result count always shows: `"Showing N of M prospects"` — N = filtered count, M = total.

---

## Sort Options

| Sort value   | Behaviour                                                     |
|--------------|---------------------------------------------------------------|
| `score`      | Descending by `score`. Unscored (0) go to bottom.            |
| `date`       | Descending by `id` (timestamp = date added).                 |
| `followers`  | Descending by `followers`. Missing/zero go to bottom.        |
| `status`     | Alphabetical by status value string.                         |

---

## Stats Row

Displayed above FilterBar. Always reflects the **full** prospect list (not filtered).

| Stat          | Calculation                                     | Colour       |
|---------------|-------------------------------------------------|--------------|
| Total         | `prospects.length`                              | text-text    |
| Hot (8–10)    | `p.score >= 8`                                  | text-green-400 |
| Warm (5–7)    | `p.score >= 5 && p.score < 8`                  | text-yellow-400 |
| Closed        | `p.status === 'closed'`                         | text-accent  |
| Niches        | `new Set(prospects.map(p => p.niche)).size`     | text-accent2 |

> Score 0 (unset) is excluded from Hot and Warm counts.

---

## Prospect Form — Add vs Edit

The same `ProspectForm` component handles both modes. Behaviour differences:

| Behaviour            | Add Mode                  | Edit Mode                      |
|----------------------|---------------------------|--------------------------------|
| `editingProspect`    | `null`                    | Prospect object                |
| Form title           | "Add Prospect"            | "Edit Prospect"                |
| Score initial state  | 0 (none selected)         | `editingProspect.score`        |
| `dateAdded`          | Set by `storage.create()` | Preserved from original        |
| On cancel            | `setView('list')`         | `setView('list')` + clear edit |
| On save              | calls `addProspect(data)` | calls `updateProspect(id, data)` |

---

## Delete Flow (Two-Click Confirmation)

Implemented entirely inside `ProspectDetail`. No external state needed.

```jsx
const [confirmDelete, setConfirmDelete] = useState(false);

// In JSX:
<Button
  variant={confirmDelete ? 'danger' : 'ghost'}
  onClick={() => {
    if (confirmDelete) {
      onDelete(prospect.id);
      onClose();
    } else {
      setConfirmDelete(true);
    }
  }}
>
  {confirmDelete ? 'Confirm Delete?' : 'Delete'}
</Button>
```

Reset `confirmDelete` to `false` when:
- `prospect` prop changes (different prospect opened)
- drawer closes

---

## Toast Notification

Triggered by `useProspects` after every mutation.

| Action           | Message                           | Type      |
|------------------|-----------------------------------|-----------|
| Add prospect     | "Prospect added ✓"                | success   |
| Update prospect  | "Prospect updated ✓"              | success   |
| Delete prospect  | "Prospect deleted"                | success   |
| Load failure     | "Failed to load prospects"        | error     |
| Save failure     | "Failed to save. Try again."      | error     |

Duration: 3000ms, then `setToast(null)`.

---

## Future Features (Do Not Implement Now — Listed for Architecture Awareness)

These must NOT break when added later. The current structure accommodates all of them.

- **Backend persistence** — `VITE_USE_API=true` flips the service layer. Zero component changes.
- **Image uploads** — Add `images: string[]` field back to schema. Add upload UI to `ProspectForm`. Backend handles file storage and returns URLs.
- **RAG notes** — A "Notes" tab in `ProspectDetail` that sends notes to an AI endpoint and returns enriched summaries. New tab inside the drawer — no layout changes to the rest.
- **Pipeline view (Kanban)** — New view option in `App`. Reads `filteredProspects` from `useProspects`. No service changes.
- **Export to CSV** — Pure utility function in `utils/export.js`. Not a service concern.
- **Multi-user / auth** — Add `userId` field to Prospect schema. Auth token passed in `apiService` headers. No component changes.
