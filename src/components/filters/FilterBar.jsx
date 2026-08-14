/*
  components/filters/FilterBar.jsx — Search, filter, and sort controls.

  This component renders all the filter controls but contains NO filtering logic.
  When the user changes a filter, it calls the prop function (onFilterChange)
  to tell the parent (App.jsx → useProspects). The actual filtering happens
  in useProspects.js. FilterBar just renders the UI and fires events upward.

  This separation means FilterBar is easy to test and change independently.

  PROPS:
    filters         — current filter state: { search, status, niche, spending, sort }
    onFilterChange  — (key, value) => void — tells the hook to update one filter
    onClearFilter   — (key) => void — resets one filter back to its default
    onClearAll      — () => void — resets all filters at once
    resultCount     — how many prospects pass the current filters (for "Showing N of M")
    totalCount      — total prospects regardless of filters
    loading         — true during the first load; swaps the count for a loading message
*/

import Select from '../ui/Select.jsx'
import { STATUSES, NICHES, SORT_OPTIONS } from '../../constants/prospects.js'

/*
  These arrays are the options for each dropdown.
  We add an 'all' option at the top of each so the user can clear a filter.
  The spread operator ...STATUSES.map(...) takes the constant and transforms
  each item into the { value, label } shape that Select.jsx expects.
*/
const SPENDING_SELECT_OPTIONS = [
  { value: 'all', label: 'All Spending' },
  { value: 'yes', label: 'Is Spending'  },
  { value: 'no',  label: 'Not Spending' },
]

const STATUS_SELECT_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  ...STATUSES.map((s) => ({ value: s.value, label: s.label })),
]

const NICHE_SELECT_OPTIONS = [
  { value: 'all', label: 'All Niches' },
  ...NICHES.map((n) => ({ value: n, label: n })), // for niches, value and label are the same string
]

/*
  truncate(str, max) — shortens a string to max characters and adds "…" if needed.
  Used for the search pill label so it doesn't overflow if someone types a long search.
  e.g. truncate("Kaduna bakery cake", 10) → "Kaduna bak…"
*/
function truncate(str, max) {
  return str.length > max ? `${str.slice(0, max)}…` : str
}

export default function FilterBar({
  filters,
  onFilterChange,
  onClearFilter,
  onClearAll,
  resultCount,
  totalCount,
  loading = false,
}) {

  /*
    Build the "active filter pills" — small removable tags below the controls
    that show which filters are currently active.

    We build a pills array by checking each filter. If it's not at its default
    value ('all' or ''), we add a pill object { key, label } for it.
    The key is used to call onClearFilter(key) when the × is clicked.
    Sort is intentionally excluded — sort is always active, it's not a "filter".
  */
  const pills = []

  if (filters.search !== '') {
    pills.push({ key: 'search', label: `Search: "${truncate(filters.search, 20)}"` })
  }
  if (filters.status !== 'all') {
    /* Look up the human label for the active status value */
    pills.push({
      key: 'status',
      label: `Status: ${STATUSES.find((s) => s.value === filters.status)?.label}`,
    })
  }
  if (filters.niche !== 'all') {
    pills.push({ key: 'niche', label: `Niche: ${filters.niche}` })
  }
  if (filters.spending !== 'all') {
    pills.push({
      key: 'spending',
      label: `Spending: ${filters.spending === 'yes' ? 'Is Spending' : 'Not Spending'}`,
    })
  }

  return (
    <div className="mb-5">

      {/* ROW 1: Filter controls */}
      {/*
        flex flex-wrap — lays controls out in a row, wrapping to the next
        line on small screens when they don't all fit
        gap-2 — 8px gap between each control
      */}
      <div className="flex flex-wrap gap-2">

        {/*
          Search input — uses a wrapper div so we can position the 🔍 icon inside.
          relative on the wrapper + absolute on the icon positions the icon
          inside the input field (not beside it).
          flex-1 lets this input grow to fill available space.
          pl-9 on the input adds left padding so text doesn't overlap the icon.
        */}
        <div className="relative flex-1 min-w-40">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">
            🔍
          </span>
          {/*
            pointer-events-none — the icon div doesn't block click events
            absolute left-3    — 12px from the left edge of the wrapper
            top-1/2 -translate-y-1/2 — perfectly centred vertically
          */}
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            /* every keystroke calls onFilterChange, which updates the hook's search state */
            placeholder="Search prospects..."
            className="bg-surface2 border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-text w-full outline-none transition-colors duration-150 focus:border-accent placeholder:text-muted"
          />
        </div>

        {/*
          The four Select dropdowns. Each one:
          - reads the current value from `filters`
          - calls onFilterChange with its key and the newly selected value
          - has w-auto so it doesn't grow to fill the row (unlike the search input)
        */}
        <Select
          id="filter-status"
          value={filters.status}
          onChange={(v) => onFilterChange('status', v)}
          options={STATUS_SELECT_OPTIONS}
          className="w-auto min-w-35"
        />
        <Select
          id="filter-niche"
          value={filters.niche}
          onChange={(v) => onFilterChange('niche', v)}
          options={NICHE_SELECT_OPTIONS}
          className="w-auto min-w-35"
        />
        <Select
          id="filter-spending"
          value={filters.spending}
          onChange={(v) => onFilterChange('spending', v)}
          options={SPENDING_SELECT_OPTIONS}
          className="w-auto min-w-35"
        />
        <Select
          id="filter-sort"
          value={filters.sort}
          onChange={(v) => onFilterChange('sort', v)}
          options={SORT_OPTIONS}
          className="w-auto min-w-40"
        />
      </div>

      {/* ROW 2: Result count + active filter pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3">

        {/*
          "Showing 3 of 12 prospects" — always visible.

          During the first load both counts are 0 (nothing has arrived yet),
          and "Showing 0 of 0 prospects" reads like a definite answer — as if
          the user genuinely has none. We show a neutral "Loading prospects…"
          until the real numbers are known.
        */}
        <span className="text-muted text-xs">
          {loading
            ? 'Loading prospects…'
            : `Showing ${resultCount} of ${totalCount} prospects`}
        </span>

        {/*
          Only render the pills section if at least one filter is active.
          pills.length > 0 is the condition — if the array is empty, nothing renders.
        */}
        {pills.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">

            {/* One pill per active filter */}
            {pills.map((pill) => (
              <span
                key={pill.key}
                className="bg-surface2 border border-border text-xs rounded-full px-3 py-1 flex items-center gap-1"
              >
                {pill.label}

                {/* × button — clicking this clears just this one filter */}
                <button
                  type="button"
                  onClick={() => onClearFilter(pill.key)}
                  className="text-muted hover:text-text"
                  aria-label={`Clear ${pill.key} filter`}
                  /* aria-label helps screen readers describe what the button does */
                >
                  ×
                </button>
              </span>
            ))}

            {/*
              "Clear all" only appears when 2 or more filters are active,
              because it's only worth showing a bulk-clear when there's more
              than one thing to clear.
            */}
            {pills.length >= 2 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs text-muted hover:text-text underline"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
