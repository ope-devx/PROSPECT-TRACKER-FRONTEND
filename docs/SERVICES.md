# Services & Hook Specification

## services/storage.js

localStorage adapter. All async (returns Promises) to match the API service interface.

```js
const KEY = 'kd_prospects';

const read = () => JSON.parse(localStorage.getItem(KEY) || '[]');
const write = (data) => localStorage.setItem(KEY, JSON.stringify(data));

export const storageService = {

  getAll: () => Promise.resolve(read()),

  create: (prospectData) => {
    const all = read();
    const newProspect = {
      ...prospectData,
      id: Date.now(),
      dateAdded: new Date().toISOString().split('T')[0],
    };
    write([...all, newProspect]);
    return Promise.resolve(newProspect);
  },

  update: (id, prospectData) => {
    const all = read();
    const idx = all.findIndex(p => p.id === id);
    if (idx === -1) return Promise.reject(new Error('Prospect not found'));
    const updated = { ...all[idx], ...prospectData, id, dateAdded: all[idx].dateAdded };
    const next = [...all];
    next[idx] = updated;
    write(next);
    return Promise.resolve(updated);
  },

  remove: (id) => {
    const all = read();
    write(all.filter(p => p.id !== id));
    return Promise.resolve();
  },

};
```

---

## services/api.js

FastAPI adapter stub. Mirrors storageService exactly. All methods are async.
Not active yet — activated by `VITE_USE_API=true` environment variable.

```js
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiService = {

  getAll: async () => {
    const res = await fetch(`${BASE}/prospects`);
    if (!res.ok) throw new Error('Failed to fetch prospects');
    return res.json();
  },

  create: async (prospectData) => {
    const res = await fetch(`${BASE}/prospects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prospectData),
    });
    if (!res.ok) throw new Error('Failed to create prospect');
    return res.json();
  },

  update: async (id, prospectData) => {
    const res = await fetch(`${BASE}/prospects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prospectData),
    });
    if (!res.ok) throw new Error('Failed to update prospect');
    return res.json();
  },

  remove: async (id) => {
    const res = await fetch(`${BASE}/prospects/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete prospect');
  },

};
```

---

## hooks/useProspects.js — Full Specification

This is the brain of the app. Everything state-related lives here.

### What it manages internally (useState)
```js
const [prospects, setProspects]         = useState([]);   // full list from service
const [filters, setFilters]             = useState(defaultFilters);
const [selectedId, setSelectedId]       = useState(null); // for detail drawer
const [editingProspect, setEditing]     = useState(null); // for form edit mode
const [view, setView]                   = useState('list');
const [toast, setToast]                 = useState(null);
const [loading, setLoading]             = useState(false);
```

### What it exposes (returned object)

```js
return {
  // Derived data
  filteredProspects,   // computed — filtered + sorted prospects array
  stats,               // computed — { total, hot, warm, closed, uniqueNiches }
  selectedProspect,    // computed — prospects.find(p => p.id === selectedId) | null

  // Raw state
  filters,
  view,
  toast,
  loading,
  editingProspect,

  // Actions
  addProspect,
  updateProspect,
  deleteProspect,
  selectProspect,      // sets selectedId, opens drawer
  closeDetail,         // clears selectedId
  startEdit,           // sets editingProspect, sets view to 'form'
  setView,
  setFilter,           // (key, value) => updates one filter
  clearFilter,         // (key) => resets one filter to default
  clearAllFilters,     // resets all filters to defaultFilters
  dismissToast,
};
```

### Computed: filteredProspects

Apply in this order:
1. Search filter — case-insensitive match on `name`, `handle`, `niche`
2. Status filter — exact match on `status` value
3. Niche filter — exact match on `niche`
4. Spending filter:
   - `'yes'` → `IS_SPENDING.includes(p.spending)`
   - `'no'`  → `!IS_SPENDING.includes(p.spending)`
   - `'all'` → no filter
5. Sort:
   - `'score'`     → descending by `score`
   - `'date'`      → descending by `id` (timestamp)
   - `'followers'` → descending by `followers` (treat null/0 as -1)
   - `'status'`    → alphabetical by `status` value

### Computed: stats

```js
const stats = {
  total:         prospects.length,
  hot:           prospects.filter(p => p.score >= 8).length,
  warm:          prospects.filter(p => p.score >= 5 && p.score < 8).length,
  closed:        prospects.filter(p => p.status === 'closed').length,
  uniqueNiches:  new Set(prospects.map(p => p.niche).filter(Boolean)).size,
};
```

### Toast helper

```js
const showToast = (message, type = 'success') => {
  setToast({ message, type });
  setTimeout(() => setToast(null), 3000);
};
```

### useEffect on mount

```js
useEffect(() => {
  setLoading(true);
  service.getAll()
    .then(setProspects)
    .catch(() => showToast('Failed to load prospects', 'error'))
    .finally(() => setLoading(false));
}, []);
```
