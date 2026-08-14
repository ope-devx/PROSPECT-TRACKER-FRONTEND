/*
  components/prospects/ProspectList.jsx — The list of prospect cards, plus empty states.

  This component either renders the list of cards, or one of two empty state messages.
  It doesn't filter or sort — it just renders whatever prospects array it receives.

  PROPS:
    prospects        — array of prospect objects to display (already filtered and sorted)
    onSelectProspect — (id) => void — called when a card is clicked, opens the drawer
    onStartAdd       — () => void — called when "Add your first prospect" is clicked
    hasActiveFilters — boolean — true if any filter is currently active
    onClearFilters   — () => void — called when "Clear filters" is clicked in empty state
    loading          — boolean — true while the first load is still in progress
*/

import ProspectCard from './ProspectCard.jsx'
import ProspectListSkeleton from './ProspectListSkeleton.jsx'
import Button from '../ui/Button.jsx'

export default function ProspectList({
  prospects,
  onSelectProspect,
  onStartAdd,
  hasActiveFilters,
  onClearFilters,
  loading = false,
}) {

  /*
    LOADING STATE — checked FIRST, before the empty-state check below.

    Order matters here. On first load the prospects array is [] because
    nothing has arrived yet — which looks identical to "this user has no
    prospects". If we checked for empty first, every visit would flash
    "No prospects yet. Hit + Add Prospect" for a moment before the real
    cards appeared. Checking loading first means we show placeholder cards
    during the fetch, and only fall through to the empty state once we
    actually know the list came back empty.
  */
  if (loading) {
    return (
      /*
        role="status" + aria-live="polite" make screen readers announce
        "Loading prospects…" when this appears, then announce the result
        when it's replaced. sr-only hides the text visually — sighted users
        see the skeleton cards instead.
      */
      <div role="status" aria-live="polite">
        <span className="sr-only">Loading prospects…</span>
        <ProspectListSkeleton count={3} />
      </div>
    )
  }

  /*
    EMPTY STATE — show a helpful message instead of a blank screen.
    There are two different empty states:

    1. No results because filters are too narrow:
       Show "No prospects match your filters" + "Clear filters" button.
       The user has prospects but they're all hidden by active filters.

    2. No prospects at all (fresh install):
       Show "No prospects yet" + "Add your first prospect" button.
       The user hasn't added anything yet.

    We tell them apart with hasActiveFilters.
  */
  if (prospects.length === 0) {
    return (
      /*
        flex flex-col items-center — stack children vertically and centre them horizontally
        py-16 — lots of vertical padding so the message feels spacious
      */
      <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
        <div className="text-4xl">🎯</div>

        {/*
          Ternary operator: condition ? showIfTrue : showIfFalse
          The <> </> (React Fragment) lets us return multiple elements without
          adding an extra wrapper <div> to the DOM.
        */}
        {hasActiveFilters ? (
          <>
            <p className="text-sm text-muted">No prospects match your filters.</p>
            <Button variant="ghost" onClick={onClearFilters}>
              Clear filters
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">No prospects yet. Hit + Add Prospect and start hunting.</p>
            <Button variant="primary" onClick={onStartAdd}>
              Add your first prospect
            </Button>
          </>
        )}
      </div>
    )
  }

  /*
    NORMAL STATE — render the list of cards.
    flex flex-col gap-3 — stack cards vertically with 12px gap between each.

    .map() loops over every prospect and renders a ProspectCard for it.
    key={prospect.id} — React needs a unique key to track each card efficiently.
    When the list updates, React uses the key to figure out which card changed,
    was added, or was removed — without it, React would re-render everything.
  */
  return (
    <div className="flex flex-col gap-3">
      {prospects.map((prospect) => (
        <ProspectCard
          key={prospect.id}
          prospect={prospect}
          onClick={onSelectProspect}
        />
      ))}
    </div>
  )
}
