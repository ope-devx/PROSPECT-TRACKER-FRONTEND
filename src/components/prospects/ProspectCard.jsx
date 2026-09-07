/*
  components/prospects/ProspectCard.jsx — One row in the prospect list.

  Each card shows a summary of a single prospect. Clicking it opens the
  detail drawer (by calling onClick with the prospect's id).

  The status badge is the one exception to "clicking the card opens the
  drawer" — it's a StatusPicker, so the status can be changed straight from
  the list without opening the card and going through the edit form.

  PROPS:
    prospect        — the full prospect object from the list
    onClick         — (id) => void — called when the card is clicked, passing the prospect's id
    onStatusChange  — (id, status) => void — called when a new status is picked
    statusPending   — boolean — true while THIS prospect's status change is saving
*/

import Badge from '../ui/Badge.jsx'
import StatusPicker from './StatusPicker.jsx'
import { scoreClass, isSpending } from '../../utils/scoring.js'

export default function ProspectCard({
  prospect,
  onClick,
  onStatusChange,
  statusPending = false,
}) {

  /*
    Only show the first 3 pain signals on the card — the drawer shows all of them.
    slice(0, 3) returns a new array with only the first 3 items.
    ?. (optional chaining) — if prospect.pains is undefined, return undefined
    instead of crashing. ?? [] — if undefined, use an empty array instead.
  */
  const visiblePains   = prospect.pains?.slice(0, 3) ?? []

  /*
    Calculate how many pain signals are hidden ("+ 2 more").
    Total pains minus the 3 we're showing.
    ?? 0 — if prospect.pains is undefined, length is 0, so extraPainCount is 0.
  */
  const extraPainCount = (prospect.pains?.length ?? 0) - visiblePains.length

  /*
    Build the meta info line: "@handle · Bakery / Cakes · 4,200 followers"
    We put each piece in an array (some may be missing) then filter out null/undefined,
    then join with " · " so only present items appear.

    toLocaleString() formats the number with commas: 4200 → "4,200"
    The ternary (condition ? trueValue : falseValue) only adds followers if it exists.
  */
  const metaParts = [
    prospect.handle,
    prospect.niche,
    prospect.followers ? `${prospect.followers.toLocaleString()} followers` : null,
  ].filter(Boolean) // .filter(Boolean) removes null, undefined, '', 0, false from the array

  return (
    /*
      The whole card is a clickable div.
      () => onClick(prospect.id) creates an arrow function that calls onClick with the id.
      We don't write onClick={onClick} directly because onClick expects (id), not an event.

      transition-colors duration-150 — border and background colours animate smoothly on hover
      hover:border-accent/40         — on hover, border turns slightly red (40% opacity)
      hover:bg-surface2              — on hover, background gets slightly lighter
    */
    <div
      onClick={() => onClick(prospect.id)}
      className="relative bg-surface border border-border rounded-xl p-4 cursor-pointer transition-colors duration-150 hover:border-accent/40 hover:bg-surface2"
    >
      <div className="flex items-start gap-3">

        {/*
          SCORE BOX — the coloured square showing the prospect's score.
          scoreClass() returns the right background and border colour for the score tier.
          shrink-0 — prevents the box from shrinking if the text beside it is long.
          Score 0 means "not set" — show '?' instead of '0'.
        */}
        <div
          className={`w-[42px] h-[42px] shrink-0 rounded-lg border flex items-center justify-center font-mono text-sm font-medium ${scoreClass(prospect.score)}`}
        >
          {prospect.score === 0 ? '?' : prospect.score}
        </div>

        {/*
          CONTENT AREA — business name, meta line, pain tags
          flex-1 — takes up all remaining width after the score box
          min-w-0 — critical fix: without this, long text can overflow its container
        */}
        <div className="flex-1 min-w-0">

          {/* Top row: business name on the left, status badge on the right */}
          <div className="flex items-start justify-between gap-2">
            <div className="text-[15px] font-medium text-text truncate">{prospect.name}</div>
            {/* truncate adds "…" if the name is too long for the available space */}

            {/*
              Clickable status. StatusPicker stops the click from bubbling up
              to the card's own onClick, so changing a status doesn't also
              open the detail drawer behind the menu.

              align="right" — the badge sits at the card's right edge, so the
              menu hangs down from that edge rather than overflowing off-screen.
            */}
            <StatusPicker
              value={prospect.status}
              onChange={(status) => onStatusChange(prospect.id, status)}
              pending={statusPending}
              align="right"
            />
          </div>

          {/*
            Meta row: "@handle · Niche · N,NNN followers"
            Only renders if there's at least one piece of meta info.
            The pieces are joined with " · " (middle dot separator).
          */}
          {metaParts.length > 0 && (
            <div className="text-xs text-muted mt-1 truncate">{metaParts.join(' · ')}</div>
          )}

          {/*
            Pain tags row — only renders if there are pain signals OR a spending badge.
            flex-wrap — lets the tags wrap to a second line if there are many.
          */}
          {(visiblePains.length > 0 || isSpending(prospect.spending)) && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">

              {/* Render up to 3 pain signal badges */}
              {visiblePains.map((pain) => (
                <Badge key={pain} variant="pain" value={pain} />
              ))}

              {/* If more than 3 pain signals, show a count of the hidden ones */}
              {extraPainCount > 0 && (
                <span className="text-[11px] text-muted">+{extraPainCount} more</span>
              )}

              {/* 💰 Spending badge — only appears if they're running or boosting ads */}
              {isSpending(prospect.spending) && <Badge variant="spending" />}
            </div>
          )}
        </div>
      </div>

      {/* Date added — bottom right, only if it exists */}
      {prospect.dateAdded && (
        <div className="text-[11px] text-muted text-right mt-2">{prospect.dateAdded}</div>
      )}
    </div>
  )
}
