# Data Schema & Constants

## localStorage Key

```
kd_prospects
```

Value is a JSON-stringified array of Prospect objects.

---

## Prospect Object

```js
{
  id: number,           // Date.now() timestamp. Set once on creation. Never mutated.
  name: string,         // Required. Business name. Free text.
  niche: string,        // Required. One value from NICHES constant.
  handle: string,       // Optional. Instagram handle e.g. "@faridahcakes"
  link: string,         // Optional. Instagram/social profile URL.
  followers: number,    // Optional. Integer. Stored as number, NOT string.
  engagement: string,   // Optional. One value from ENGAGEMENT_OPTIONS.
  website: string,      // Optional. One value from WEBSITE_OPTIONS.
  status: string,       // Required. One value from STATUSES (value field).
  contact: string,      // Optional. Phone, email, or DM link. Free text.
  spending: string,     // Optional. One value from SPENDING_OPTIONS.
  pains: string[],      // Optional. Array of values from PAIN_SIGNALS.
  score: number,        // Required. Integer 1–10. Default 0 = not set.
  notes: string,        // Optional. Free text.
  dateAdded: string,    // ISO date string. Set once on creation. e.g. "2025-07-10"
}
```

**No `images` field.** Intentionally excluded from this version.

---

## Constants (`src/constants/prospects.js`)

Export all of the following from a single file. Components always import from here.

### STATUSES
Defines both the stored value and the display label.

```js
export const STATUSES = [
  { value: 'new',             label: 'Not Contacted' },
  { value: 'contacted',       label: 'Contacted'     },
  { value: 'follow_up',       label: 'Follow Up'     },
  { value: 'meeting_booked',  label: 'Meeting Booked'},
  { value: 'closed',          label: 'Closed'        },
  { value: 'lost',            label: 'Lost'          },
];
```

> ⚠️ Always store the `value`. Always display the `label`. Never use raw strings.
> These values are compatible with the FastAPI backend being built in parallel.

### NICHES

```js
export const NICHES = [
  'Bakery / Cakes',
  'Photography',
  'Event Planning',
  'Fashion / Tailoring',
  'Catering',
  'Hair / Beauty Salon',
  'Makeup Artist',
  'Clinic / Healthcare',
  'Gym / Fitness',
  'Real Estate',
  'Logistics',
  'Interior Decor',
  'Printing / Branding',
  'Other',
];
```

### PAIN_SIGNALS

```js
export const PAIN_SIGNALS = [
  'People asking price in comments',
  'No booking system',
  'Sending DMs for every enquiry',
  'Price list in story highlights',
  'Running ads with no landing page',
  'Not on Google',
  'No link in bio',
  'Competitors have websites',
];
```

### ENGAGEMENT_OPTIONS

```js
export const ENGAGEMENT_OPTIONS = ['High', 'Medium', 'Low'];
```

### WEBSITE_OPTIONS

```js
export const WEBSITE_OPTIONS = [
  'No',
  'Partial / Broken',
  'Yes but outdated',
  'Yes (good)',
];
```

### SPENDING_OPTIONS

```js
export const SPENDING_OPTIONS = [
  'Yes (running ads)',
  'Yes (boosting posts)',
  'Unknown',
  'No',
];
```

### SORT_OPTIONS

```js
export const SORT_OPTIONS = [
  { value: 'score',     label: 'Score (highest first)'  },
  { value: 'date',      label: 'Date added (newest)'    },
  { value: 'followers', label: 'Followers (most first)' },
  { value: 'status',    label: 'Status'                 },
];
```

---

## Score Tiers (used for color coding)

| Score | Tier  | Color  |
|-------|-------|--------|
| 8–10  | Hot   | Green  |
| 5–7   | Warm  | Yellow |
| 1–4   | Cold  | Red    |
| 0     | Unset | Muted  |

---

## Spending — "Is Spending" Logic

A prospect is considered "spending on ads" if their `spending` value is either:
- `'Yes (running ads)'`
- `'Yes (boosting posts)'`

This is used for the spending filter and the card indicator badge.

```js
export const IS_SPENDING = ['Yes (running ads)', 'Yes (boosting posts)'];
```

---

## Filter State Shape

This is what `useProspects` manages internally for filtering:

```js
const defaultFilters = {
  search: '',       // string — matches name, handle, niche
  status: 'all',    // 'all' or a STATUSES value string
  niche: 'all',     // 'all' or a NICHES string
  spending: 'all',  // 'all' | 'yes' | 'no'
  sort: 'score',    // a SORT_OPTIONS value string
};
```
