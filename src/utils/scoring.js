/*
  utils/scoring.js — Pure helper functions for score and status display logic.

  "Pure" means these functions have no side effects — they take an input,
  return an output, and don't change anything else in the app.

  These live in utils/ rather than inside a component because multiple
  components need the same logic (ProspectCard, ProspectDetail, Badge, ProspectForm
  all need to know "what colour is score 7?"). Centralising avoids repetition.
*/

import { STATUSES, IS_SPENDING } from '../constants/prospects'

/*
  scoreTier(score) — converts a numeric score into a named tier.

  The tier drives colour coding across the whole app:
    hot  (8-10) = green  — strong lead, high priority
    warm (5-7)  = yellow — potential, needs nurturing
    cold (1-4)  = red    — weak lead
    unset (0)   = muted  — score not set yet

  We return a string name ('hot', 'warm', 'cold', 'unset') rather than
  a colour directly, because the same tier is used in different ways:
  a filled background colour for the score box vs. a text colour for the
  score in the detail drawer. The tier is the single source of truth.
*/
export function scoreTier(score) {
  if (score >= 8) return 'hot'
  if (score >= 5) return 'warm'
  if (score >= 1) return 'cold'
  return 'unset' // score === 0 means not set
}

/*
  SCORE_BOX_STYLES — Tailwind class strings for the filled score box
  (the 42×42 square on ProspectCard and the score buttons in ProspectForm).
  Indexed by tier name so we can look up the right class instantly.

  The /10 opacity modifier in Tailwind means "10% opacity" —
  e.g. bg-green-400/10 is green at 10% opacity (very faint).
*/
const SCORE_BOX_STYLES = {
  hot:   'bg-green-500 text-white border-green-400',
  warm:  'bg-yellow-500 text-white border-yellow-400',
  cold:  'bg-red-500 text-white border-red-400',
  unset: 'bg-surface2 text-muted border-border',
}

/*
  scoreClass(score) — returns the Tailwind classes for the filled score box.
  Calls scoreTier() to get the tier, then looks up the style string.

  Usage: <div className={scoreClass(prospect.score)}>
*/
export function scoreClass(score) {
  return SCORE_BOX_STYLES[scoreTier(score)]
}

/*
  SCORE_TEXT_STYLES — Tailwind text-colour classes for displaying the score
  as large text (e.g. the big score number in ProspectDetail).
  Same tier system, but only the text colour — no background.
*/
const SCORE_TEXT_STYLES = {
  hot:   'text-green-400',
  warm:  'text-yellow-400',
  cold:  'text-red-400',
  unset: 'text-muted',
}

/*
  scoreTextClass(score) — returns the Tailwind text-colour class for a score.
  Used in ProspectDetail for the large "8/10" heading colour.
*/
export function scoreTextClass(score) {
  return SCORE_TEXT_STYLES[scoreTier(score)]
}

/*
  STATUS_STYLES — Tailwind classes for status badge backgrounds.
  Each status gets a unique colour so at a glance you can tell
  a prospect's pipeline stage without reading the text.

  The /10 and /30 opacity modifiers create a subtle tinted pill:
    bg-blue-400/10   = very faint blue background
    border-blue-400/30 = semi-transparent blue border
    text-blue-400    = solid blue text
*/
const STATUS_STYLES = {
  new:            'bg-blue-400/10 border-blue-400/30 text-blue-400',
  contacted:      'bg-yellow-400/10 border-yellow-400/30 text-yellow-400',
  follow_up:      'bg-purple-400/10 border-purple-400/30 text-purple-400',
  meeting_booked: 'bg-indigo-400/10 border-indigo-400/30 text-indigo-400',
  closed:         'bg-green-400/10 border-green-400/30 text-green-400',
  lost:           'bg-red-400/10 border-red-400/30 text-red-400',
}

/*
  statusClass(status) — returns Tailwind classes for a status badge.
  The ?? operator means "if the left side is null/undefined, use the right side".
  So if an unknown status value is passed, we fall back to 'new' styling.
*/
export function statusClass(status) {
  return STATUS_STYLES[status] ?? STATUS_STYLES.new
}

/*
  getStatusLabel(status) — converts a stored status VALUE to its display LABEL.
  e.g. 'follow_up' → 'Follow Up'

  STATUSES.find() scans the array for the object whose .value matches.
  The ?. (optional chaining) means "if find() returns undefined (not found),
  don't crash — just return undefined" and then the ?? falls back to
  returning the raw status value unchanged.
*/
export function getStatusLabel(status) {
  return STATUSES.find((s) => s.value === status)?.label ?? status
}

/*
  isSpending(spending) — returns true if the prospect is actively spending on ads.
  IS_SPENDING is the constant array ['Yes (running ads)', 'Yes (boosting posts)'].
  .includes() checks if the spending value is one of those two options.

  Used in ProspectCard to decide whether to show the 💰 badge,
  and in useProspects for the spending filter.
*/
export function isSpending(spending) {
  return IS_SPENDING.includes(spending)
}
