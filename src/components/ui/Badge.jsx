/*
  components/ui/Badge.jsx — Small coloured label pill.

  A Badge is a tiny inline tag used to label things — like "Closed" in green
  or "Bakery / Cakes pain signal" in grey. It has four variants:

    'status'   — shows a prospect's pipeline stage (colour-coded by stage)
    'score'    — shows a numeric score (colour-coded by tier: hot/warm/cold)
    'pain'     — shows a pain signal tag (muted grey)
    'spending' — shows the 💰 Spending indicator (yellow)

  PROPS:
    variant — which type of badge to render (see above)
    value   — for status: the status VALUE string (e.g. 'follow_up')
              for score: the numeric score (e.g. 7)
              for pain: the pain signal text string
              for spending: not used (the badge always says "💰 Spending")
*/

import { getStatusLabel, scoreTier } from '../../utils/scoring.js'

/*
  STATUS_BADGE_STYLES — each pipeline stage gets its own colour.
  The /10 and /30 modifiers create transparent tinted backgrounds and borders,
  so the badge looks like a subtle pill rather than a solid block of colour.
*/
const STATUS_BADGE_STYLES = {
  new:            'bg-blue-400/10 border-blue-400/30 text-blue-400',
  contacted:      'bg-yellow-400/10 border-yellow-400/30 text-yellow-400',
  follow_up:      'bg-purple-400/10 border-purple-400/30 text-purple-400',
  meeting_booked: 'bg-indigo-400/10 border-indigo-400/30 text-indigo-400',
  closed:         'bg-green-400/10 border-green-400/30 text-green-400',
  lost:           'bg-red-400/10 border-red-400/30 text-red-400',
}

/* Score badges follow the hot/warm/cold tier, not individual values */
const SCORE_BADGE_STYLES = {
  hot:   'bg-green-400/10 border-green-400/30 text-green-400',
  warm:  'bg-yellow-400/10 border-yellow-400/30 text-yellow-400',
  cold:  'bg-red-400/10 border-red-400/30 text-red-400',
  unset: 'bg-surface2 border-border text-muted',
}

/*
  BASE_CLASSES — Tailwind classes shared by ALL badge variants.
  inline-flex     = display inline but allow flex layout inside
  items-center    = vertically centre content
  gap-1           = small gap between icon and text if needed
  uppercase       = force text to capitals
  tracking-[0.5px] = slight letter spacing for readability at small sizes
*/
const BASE_CLASSES =
  'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium uppercase tracking-[0.5px]'

export default function Badge({ variant, value }) {

  /*
    STATUS BADGE
    We receive the stored VALUE (e.g. 'follow_up') but display the human LABEL
    ('Follow Up') — getStatusLabel() handles that translation.
    ?? STATUS_BADGE_STYLES.new = fall back to blue if the status isn't recognised.
  */
  if (variant === 'status') {
    return (
      <span className={`${BASE_CLASSES} rounded-full ${STATUS_BADGE_STYLES[value] ?? STATUS_BADGE_STYLES.new}`}>
        {getStatusLabel(value)}
      </span>
    )
  }

  /*
    SCORE BADGE
    scoreTier() converts the number (e.g. 7) to a tier name ('warm'),
    then we look up the colour for that tier.
    Score 0 means "not set" — we display '?' instead of '0'.
  */
  if (variant === 'score') {
    const tier = scoreTier(value)
    return (
      <span className={`${BASE_CLASSES} ${SCORE_BADGE_STYLES[tier]}`}>
        {value === 0 ? '?' : value}
      </span>
    )
  }

  /*
    PAIN SIGNAL BADGE
    Small muted grey pill displaying the pain signal text.
    Uses a simpler one-off className since there's no colour variation.
  */
  if (variant === 'pain') {
    return (
      <span className="bg-surface2 text-muted border border-border text-[11px] rounded-md px-2 py-1">
        {value}
      </span>
    )
  }

  /*
    SPENDING BADGE
    Always shows the same thing — no value prop needed.
    Yellow because spending on ads = money = ₦/💰
  */
  if (variant === 'spending') {
    return (
      <span className={`${BASE_CLASSES} rounded-full bg-yellow-400/10 border-yellow-400/30 text-yellow-400`}>
        💰 Spending
      </span>
    )
  }

  /* If an unrecognised variant is passed, render nothing */
  return null
}
