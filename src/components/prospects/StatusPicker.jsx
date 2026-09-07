/*
  components/prospects/StatusPicker.jsx — A status badge you can click to change.

  This replaces the read-only status Badge on the card and in the detail drawer.
  Clicking it opens a small menu of every pipeline stage; picking one saves
  immediately, so changing a status no longer means opening the card, hitting
  Edit, finding the status field, and saving.

  It renders the same pill as <Badge variant="status"> so the list looks
  unchanged until you interact with it — it just gains a ▾ caret, a hover
  state, and a focus ring.

  PROPS:
    value    — the prospect's current status VALUE (e.g. 'follow_up')
    onChange — (statusValue) => void — called with the newly picked status
    pending  — boolean — true while this prospect's change is saving
    align    — 'right' (default) or 'left' — which edge the menu lines up with.
               Cards put the badge at the right edge, so the menu opens
               rightwards from it; the drawer's badge is on the left.
*/

import { useEffect, useRef, useState } from 'react'
import { STATUSES } from '../../constants/prospects.js'
import { statusClass, getStatusLabel } from '../../utils/scoring.js'
import Spinner from '../ui/Spinner.jsx'

export default function StatusPicker({ value, onChange, pending = false, align = 'right' }) {
  /* open — whether the dropdown menu is currently showing */
  const [open, setOpen] = useState(false)

  /*
    wrapperRef points at the outer div so the two effects below can ask
    "was that click inside me, or somewhere else on the page?"
  */
  const wrapperRef = useRef(null)

  /*
    Close the menu when the user clicks anywhere outside it.

    Without this the menu would stay open until you picked something —
    clicking elsewhere on the page would leave it hanging. We listen on the
    whole document and check whether the click landed inside our wrapper.

    The listener is only attached while the menu is open, and the cleanup
    function removes it again. Leaving a document-level listener attached
    for every card in the list would be wasteful.
  */
  useEffect(() => {
    if (!open) return

    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    /* Escape closes the menu too — expected behaviour for any popup */
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  /*
    handlePick — the user chose a status from the menu.
    We close the menu first so it feels instant, then fire onChange.
    If they picked the status it already has, onChange still runs — the hook
    short-circuits that case rather than sending a pointless request.
  */
  function handlePick(e, statusValue) {
    e.stopPropagation() // don't let the click reach the card and open the drawer
    setOpen(false)
    onChange(statusValue)
  }

  return (
    /*
      relative — the absolutely-positioned menu below anchors to this wrapper.
      inline-block — the wrapper hugs the badge rather than filling the row.
    */
    <div ref={wrapperRef} className="relative inline-block shrink-0">

      {/*
        THE BADGE ITSELF — a real <button>, not a span, so it's keyboard
        focusable and announced as a button by screen readers.

        stopPropagation is critical here: this badge sits inside ProspectCard,
        whose own onClick opens the detail drawer. Without it, clicking the
        badge to change a status would ALSO open the drawer behind the menu.

        aria-haspopup / aria-expanded tell assistive tech that this button
        opens a menu and whether that menu is currently open.
      */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((prev) => !prev)
        }}
        disabled={pending}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Status: ${getStatusLabel(value)}. Click to change.`}
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium uppercase tracking-[0.5px] transition-opacity duration-150 cursor-pointer hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-default ${statusClass(value)}`}
      >
        {/*
          While saving, the caret is swapped for a small spinner. The label
          stays visible so the badge doesn't collapse or jump in width —
          the row would visibly shift if the text disappeared.
        */}
        {getStatusLabel(value)}
        {pending ? (
          <Spinner size="sm" />
        ) : (
          /* aria-hidden — the caret is decorative, the aria-label above says it opens */
          <span aria-hidden="true" className="text-[8px] leading-none">▾</span>
        )}
      </button>

      {/*
        THE DROPDOWN MENU — only in the DOM while open.

        absolute z-40      — floats above the card; z-40 clears the detail
                             drawer (z-30) so the drawer's own picker works too
        mt-1               — small gap below the badge
        right-0 / left-0   — which edge it aligns to, per the align prop
        min-w-max          — wide enough for the longest label ("Meeting Booked")
                             without wrapping
      */}
      {open && (
        <div
          role="listbox"
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-1 z-40 min-w-max bg-surface2 border border-border rounded-lg py-1 shadow-lg shadow-black/40`}
        >
          {/*
            One row per status. We map over STATUSES rather than hardcoding
            the six stages — adding a stage to constants/prospects.js makes it
            appear here automatically.
          */}
          {STATUSES.map((status) => {
            const isCurrent = status.value === value
            return (
              <button
                key={status.value}
                type="button"
                role="option"
                aria-selected={isCurrent}
                onClick={(e) => handlePick(e, status.value)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-text hover:bg-surface transition-colors duration-100"
              >
                {/*
                  A small coloured dot in the status's own colour, so the menu
                  is scannable by colour the same way the badges are.
                  statusClass() gives back background + border + text classes;
                  on a 6px square only the background and border read.
                */}
                <span
                  aria-hidden="true"
                  className={`w-1.5 h-1.5 rounded-full border shrink-0 ${statusClass(status.value)}`}
                />
                {status.label}

                {/*
                  A checkmark marks the current status. ml-auto pushes it to
                  the far right so the labels stay left-aligned.
                */}
                {isCurrent && <span aria-hidden="true" className="ml-auto text-accent">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
