# Architecture

## Folder Structure

```
kd-prospect-tracker-react/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/                     # Generic, reusable primitives. Zero domain logic.
│   │   │   ├── Button.jsx          # Variant-based button (primary, ghost, danger)
│   │   │   ├── Badge.jsx           # Status and score colour badges
│   │   │   ├── Select.jsx          # Styled dropdown wrapper
│   │   │   └── Toast.jsx           # Success/error notification, auto-dismisses
│   │   │
│   │   ├── layout/                 # Page-level structural components
│   │   │   ├── Header.jsx          # Logo + subtitle. No logic.
│   │   │   └── StatsRow.jsx        # 5-stat summary bar. Receives computed stats.
│   │   │
│   │   ├── filters/
│   │   │   └── FilterBar.jsx       # Search + Status + Niche + Spending + Sort controls
│   │   │                           # Active filter pills displayed below controls.
│   │   │
│   │   └── prospects/
│   │       ├── ProspectCard.jsx    # Single list item card
│   │       ├── ProspectList.jsx    # List wrapper + empty state
│   │       ├── ProspectForm.jsx    # Add / Edit form (same component, dual mode)
│   │       └── ProspectDetail.jsx  # Side drawer — prospect full view
│   │
│   ├── hooks/
│   │   └── useProspects.js         # ALL state, CRUD, filter, sort logic lives here
│   │
│   ├── services/
│   │   ├── storage.js              # localStorage adapter (active now)
│   │   └── api.js                  # FastAPI adapter (stub — not active yet)
│   │
│   ├── constants/
│   │   └── prospects.js            # Single source of truth for all enums + options
│   │
│   ├── utils/
│   │   └── scoring.js              # Pure functions: scoreClass(), statusClass(),
│   │                               # getStatusLabel(), isSpending()
│   │
│   ├── App.jsx                     # Root component. Wires everything. Minimal logic.
│   ├── main.jsx                    # React DOM render entry point
│   └── index.css                   # Tailwind directives only (@tailwind base/components/utilities)
│
├── index.html                      # Google Fonts link goes here
├── tailwind.config.js
└── vite.config.js
```

---

## Component Tree

```
App
├── Toast                           (conditionally rendered, position: fixed)
├── Header
├── StatsRow                        (receives: stats object)
├── FilterBar                       (receives: filters, onFilterChange)
│
├── [view === 'list']
│   └── ProspectList                (receives: prospects[], onSelect, onAdd)
│       └── ProspectCard × n        (receives: prospect, onSelect)
│
└── [view === 'form']
    └── ProspectForm                (receives: editingProspect|null, onSave, onCancel)

ProspectDetail                      (rendered alongside list when selectedId != null)
  receives: prospect, onEdit, onDelete, onClose
```

---

## Data Flow

```
useProspects (hook)
  │
  ├── reads/writes via → services/storage.js → localStorage
  │                  (or services/api.js → FastAPI, via env flag)
  │
  └── exposes to App:
        prospects[]          — full unfiltered list
        filteredProspects[]  — after applying all active filters + sort
        filters              — current filter state object
        stats                — computed { total, hot, warm, closed, niches }
        selectedProspect     — currently open in detail drawer (or null)
        editingProspect      — currently open in form (or null)
        view                 — 'list' | 'form'
        toast                — { message, type } | null
        —
        addProspect(data)
        updateProspect(id, data)
        deleteProspect(id)
        selectProspect(id)
        startEdit(prospect)
        setFilter(key, value)
        clearFilter(key)
        clearAllFilters()
        setView(view)
        dismissToast()
```

**Rule:** `App.jsx` receives everything from `useProspects` and distributes it downward as props.
No child component calls `useProspects` directly. No child component reads localStorage.

---

## Service Layer — Backend Swap

When the FastAPI backend is ready, switching is a single environment variable change.

```
# .env.local (localStorage mode — default)
VITE_USE_API=false

# .env.production (API mode — when backend is live)
VITE_USE_API=true
```

```js
// hooks/useProspects.js
import { storageService } from '../services/storage.js';
import { apiService }     from '../services/api.js';

const service = import.meta.env.VITE_USE_API === 'true'
  ? apiService
  : storageService;
```

Both `storageService` and `apiService` expose **identical interfaces**:

```js
getAll()           → Promise<Prospect[]>   // storageService wraps in Promise.resolve()
create(data)       → Promise<Prospect>
update(id, data)   → Promise<Prospect>
remove(id)         → Promise<void>
```

Using async/await in `useProspects` from day one means the UI never needs to change
when the backend is wired in.

---

## View State (No Router)

`App.jsx` holds a `view` string: `'list'` or `'form'`.
The detail drawer is independent — it can be open or closed regardless of view.

| view   | drawerOpen | What's visible                         |
|--------|------------|----------------------------------------|
| list   | false      | Header + Stats + FilterBar + List      |
| list   | true       | Header + Stats + FilterBar + List (narrowed) + Drawer |
| form   | false      | Header + Stats + Form (add or edit)    |

On mobile: drawer always takes full screen. List is hidden when drawer is open.
