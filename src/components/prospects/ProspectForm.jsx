/*
  components/prospects/ProspectForm.jsx — Add and edit form for a prospect.

  One form handles BOTH adding and editing. The difference is the editingProspect prop:
    editingProspect = null   → ADD mode (blank form, title "Add Prospect")
    editingProspect = object → EDIT mode (pre-filled form, title "Edit Prospect")

  The form has three sections, separated by visual dividers:
    1. Identity       — name, niche, handle, social link
    2. Profile Intel  — followers, engagement, website, spending, contact
    3. Qualification  — status, pain signals, score, notes

  PROPS:
    editingProspect — the prospect being edited, or null for add mode
    onSave          — (formData) => void — called when the form is submitted
    onCancel        — () => void — called when Cancel is clicked
    saving          — boolean — true while the save request is in flight
*/

import { useEffect, useState } from 'react'
import Button from '../ui/Button.jsx'
import Select from '../ui/Select.jsx'
import { scoreTier } from '../../utils/scoring.js'
import {
  NICHES,
  ENGAGEMENT_OPTIONS,
  WEBSITE_OPTIONS,
  SPENDING_OPTIONS,
  STATUSES,
  PAIN_SIGNALS,
} from '../../constants/prospects.js'

/*
  Convert the simple string arrays into { value, label } objects that Select expects.
  For options where the stored value and the displayed text are the same string,
  we set both value and label to the same thing.
  This is done once, outside the component, so it's not recalculated on every render.
*/
const NICHE_OPTIONS            = NICHES.map((n) => ({ value: n, label: n }))
const ENGAGEMENT_SELECT_OPTIONS = ENGAGEMENT_OPTIONS.map((v) => ({ value: v, label: v }))
const WEBSITE_SELECT_OPTIONS   = WEBSITE_OPTIONS.map((v) => ({ value: v, label: v }))
const SPENDING_SELECT_OPTIONS  = SPENDING_OPTIONS.map((v) => ({ value: v, label: v }))
const STATUS_SELECT_OPTIONS    = STATUSES.map((s) => ({ value: s.value, label: s.label }))

/*
  emptyForm — the default state for every field when adding a new prospect.
  status defaults to 'new' (Not Contacted) since that's where every prospect starts.
  pains defaults to [] (empty array) since it's a multi-select.
  score defaults to 0 which means "not set".
  All text fields default to '' (empty string).
*/
const emptyForm = {
  name:       '',
  niche:      '',
  handle:     '',
  link:       '',
  followers:  '',   // stored as string in the form, parsed to number on submit
  engagement: '',
  website:    '',
  spending:   '',
  contact:    '',
  status:     'new',
  pains:      [],
  score:      0,
  notes:      '',
}

/*
  SCORE_BUTTON_STYLES — visual states for each score button (1-10).
  Each score button can be "selected" (filled colour) or "unselected" (faint border only).
  The style depends on the tier (cold/warm/hot) of that button's number.
*/
const SCORE_BUTTON_STYLES = {
  cold: {
    unselected: 'border-red-400/30 text-muted bg-surface2',
    selected:   'border-red-400 text-white bg-red-500',
  },
  warm: {
    unselected: 'border-yellow-400/30 text-muted bg-surface2',
    selected:   'border-yellow-400 text-white bg-yellow-500',
  },
  hot: {
    unselected: 'border-green-400/30 text-muted bg-surface2',
    selected:   'border-green-400 text-white bg-green-500',
  },
}

/* Colours for the large score readout below the score buttons */
const SCORE_READOUT_STYLES = {
  unset: 'text-muted',
  cold:  'text-red-400',
  warm:  'text-yellow-400',
  hot:   'text-green-400',
}

/*
  SectionDivider — a small internal component for the visual section separators.
  Renders "IDENTITY ——————————————" style dividers between form sections.
  Defined here (not in its own file) because it's only used in this form.
*/
function SectionDivider({ title }) {
  return (
    <div className="flex items-center gap-3 my-6">
      {/* Section title text on the left */}
      <div className="text-[11px] text-muted uppercase tracking-widest whitespace-nowrap">
        {title}
      </div>
      {/* flex-1 makes this line grow to fill the remaining width */}
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

/*
  FieldLabel — styled label for form fields.
  Using a small component instead of repeating the className saves repetition
  and makes it easy to change all form labels at once.
  children = the label text passed between <FieldLabel>…</FieldLabel> tags.
*/
function FieldLabel({ children }) {
  return (
    <label className="block text-[12px] text-muted uppercase tracking-[0.8px] mb-1.5">
      {children}
    </label>
  )
}

/*
  inputClasses — shared Tailwind classes for all text inputs.
  Defined once as a string constant so every input looks identical.
  outline-none removes the browser's default blue focus ring.
  focus:border-accent gives a red border when the input is focused instead.
*/
const inputClasses =
  'bg-surface2 border border-border rounded-lg px-3 py-2.5 text-sm text-text w-full outline-none transition-colors duration-150 focus:border-accent placeholder:text-muted'

export default function ProspectForm({ editingProspect, onSave, onCancel, saving = false }) {
  /*
    form state — holds the current value of every field.
    This is a single state object (not separate useState for each field).
    When any field changes, we update just that one key with setField().
  */
  const [form, setForm] = useState(emptyForm)

  /*
    nameError — tracks whether to show the "Business name is required" error.
    Starts false, becomes true if the user tries to submit without a name,
    resets to false as soon as they start typing in the name field.
  */
  const [nameError, setNameError] = useState(false)

  /*
    useEffect with [editingProspect] dependency — runs whenever editingProspect changes.

    When editingProspect changes from null → an object (entering edit mode):
      Fill every field from the existing prospect data.
      followers is stored as a number but the input needs a string, so String() converts it.
      The ?? '' fallback ensures undefined fields become empty strings, not "undefined".

    When editingProspect changes from an object → null (entering add mode):
      Reset the form back to emptyForm so there's no leftover data.

    Either way, reset the nameError flag.
  */
  useEffect(() => {
    if (editingProspect) {
      setForm({
        name:       editingProspect.name       ?? '',
        niche:      editingProspect.niche      ?? '',
        handle:     editingProspect.handle     ?? '',
        link:       editingProspect.link       ?? '',
        followers:  editingProspect.followers  ? String(editingProspect.followers) : '',
        engagement: editingProspect.engagement ?? '',
        website:    editingProspect.website    ?? '',
        spending:   editingProspect.spending   ?? '',
        contact:    editingProspect.contact    ?? '',
        status:     editingProspect.status     ?? 'new',
        pains:      editingProspect.pains      ?? [],
        score:      editingProspect.score      ?? 0,
        notes:      editingProspect.notes      ?? '',
      })
    } else {
      setForm(emptyForm)
    }
    setNameError(false)
  }, [editingProspect])

  /*
    setField(key, value) — updates a single field in the form state.
    The spread { ...prev, [key]: value } copies all existing fields,
    then overwrites only the field that changed.
    This is immutable update — we never mutate the existing state object directly.
  */
  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  /*
    togglePain(pain) — adds or removes a pain signal from the pains array.
    If the pain is already in the array, filter it out (uncheck).
    If it's not in the array, add it (check).
    .includes() checks whether a value exists in an array.
  */
  const togglePain = (pain) => {
    setForm((prev) => ({
      ...prev,
      pains: prev.pains.includes(pain)
        ? prev.pains.filter((p) => p !== pain) // remove it
        : [...prev.pains, pain],                // add it
    }))
  }

  /*
    handleSubmit(e) — called when the form is submitted.
    e.preventDefault() stops the browser from doing its default form submission
    (which would reload the page). We handle saving ourselves.

    Validation: business name is required. If empty, set the error and stop.
    .trim() removes leading/trailing whitespace so "   " counts as empty.

    followers is stored as a string in the form input (because inputs are text).
    We parse it back to an integer before saving:
      .replace(/[^0-9]/g, '') — removes any character that isn't a digit (e.g. accidental spaces)
      parseInt(..., 10)       — converts the string to a base-10 integer
      || 0                    — if parseInt returns NaN (empty string), use 0 instead
  */
  const handleSubmit = (e) => {
    e.preventDefault()

    /*
      Guard against a second submit while the first is still saving.
      The Save button is already disabled during saving, but a form can also
      be submitted by pressing Enter in a text input — which bypasses the
      button entirely. Without this check that would fire a duplicate
      create request and add the same prospect twice.
    */
    if (saving) return

    if (!form.name.trim()) {
      setNameError(true)
      return // stop here — don't call onSave
    }

    const followers = parseInt(String(form.followers).replace(/[^0-9]/g, ''), 10) || 0

    onSave({
      ...form,        // all form fields
      followers,      // overwrite with the parsed number
      score: form.score,
    })
  }

  /*
    tier — the current score tier, used to colour the large score readout below the buttons.
    Recalculated whenever form.score changes (because the component re-renders on state change).
  */
  const tier = scoreTier(form.score)

  return (
    /* max-w-[700px] mx-auto — centres the form and limits its width on wide screens */
    <form onSubmit={handleSubmit} className="max-w-175 mx-auto">

      {/* Form title changes based on mode */}
      <h2 className="text-xl font-medium text-text mb-2">
        {editingProspect ? 'Edit Prospect' : 'Add Prospect'}
      </h2>

      {/* ── SECTION 1: IDENTITY ──────────────────────────────────────────── */}
      <SectionDivider title="Identity" />

      {/*
        grid grid-cols-1 md:grid-cols-2 — 1 column on mobile, 2 columns on desktop
        This makes the form readable on phones while efficient on larger screens.
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Business Name — the only required field */}
        <div>
          <FieldLabel>Business Name</FieldLabel>
          <input
            type="text"
            value={form.name}
            onChange={(e) => {
              setField('name', e.target.value)
              if (nameError) setNameError(false) // clear the error as soon as they type
            }}
            className={inputClasses}
          />
          {/* Inline error — only renders when nameError is true */}
          {nameError && <p className="text-xs text-red-400 mt-1">Business name is required.</p>}
        </div>

        {/* Niche — uses placeholder to prompt selection */}
        <div>
          <FieldLabel>Niche / Category</FieldLabel>
          <Select
            id="niche"
            value={form.niche}
            onChange={(v) => setField('niche', v)}
            options={NICHE_OPTIONS}
            placeholder="Select a niche"
            className="w-full"
          />
        </div>

        <div>
          <FieldLabel>Instagram Handle</FieldLabel>
          <input
            type="text"
            value={form.handle}
            onChange={(e) => setField('handle', e.target.value)}
            placeholder="@username"
            className={inputClasses}
          />
        </div>

        <div>
          <FieldLabel>Instagram / Social Link</FieldLabel>
          {/* type="url" gives mobile keyboards a better layout for URLs */}
          <input
            type="url"
            value={form.link}
            onChange={(e) => setField('link', e.target.value)}
            className={inputClasses}
          />
        </div>
      </div>

      {/* ── SECTION 2: PROFILE INTEL ─────────────────────────────────────── */}
      <SectionDivider title="Profile Intel" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <FieldLabel>Followers</FieldLabel>
          {/* type="number" shows a numeric keyboard on mobile and disallows letters */}
          <input
            type="number"
            min="0"
            value={form.followers}
            onChange={(e) => setField('followers', e.target.value)}
            className={inputClasses}
          />
        </div>

        <div>
          <FieldLabel>Engagement Level</FieldLabel>
          <Select
            id="engagement"
            value={form.engagement}
            onChange={(v) => setField('engagement', v)}
            options={ENGAGEMENT_SELECT_OPTIONS}
            placeholder="Select engagement"
            className="w-full"
          />
        </div>

        <div>
          <FieldLabel>Has Website?</FieldLabel>
          <Select
            id="website"
            value={form.website}
            onChange={(v) => setField('website', v)}
            options={WEBSITE_SELECT_OPTIONS}
            placeholder="Select website status"
            className="w-full"
          />
        </div>

        <div>
          <FieldLabel>Spending on Ads?</FieldLabel>
          <Select
            id="spending"
            value={form.spending}
            onChange={(v) => setField('spending', v)}
            options={SPENDING_SELECT_OPTIONS}
            placeholder="Select spending status"
            className="w-full"
          />
        </div>

        {/*
          md:col-span-2 — this field spans both columns on desktop so it's full width.
          On mobile (1-column grid) it's naturally full width already.
        */}
        <div className="md:col-span-2">
          <FieldLabel>Contact Info</FieldLabel>
          <input
            type="text"
            value={form.contact}
            onChange={(e) => setField('contact', e.target.value)}
            placeholder="Phone, email, or DM link"
            className={inputClasses}
          />
        </div>
      </div>

      {/* ── SECTION 3: QUALIFICATION ──────────────────────────────────────── */}
      <SectionDivider title="Qualification" />

      {/* Status dropdown */}
      <div>
        <FieldLabel>Status</FieldLabel>
        <Select
          id="status"
          value={form.status}
          onChange={(v) => setField('status', v)}
          options={STATUS_SELECT_OPTIONS}
          className="w-full"
        />
      </div>

      {/* Pain Signals — checkbox grid */}
      <div className="mt-4">
        <FieldLabel>Pain Signals Spotted</FieldLabel>

        {/*
          Each pain signal is a <label> wrapping a hidden checkbox.
          Wrapping in <label> means clicking anywhere on the pill
          (not just the tiny checkbox) toggles it — much better UX.

          The conditional className changes the pill's appearance when checked:
          - unchecked: default dark border
          - checked:   accent-coloured border + faint red background
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {PAIN_SIGNALS.map((pain) => (
            <label
              key={pain}
              className={`bg-surface2 border rounded-lg p-2 flex items-center gap-2 cursor-pointer text-sm text-text transition-colors duration-150 hover:border-accent/40 ${form.pains.includes(pain) ? 'border-accent/60 bg-accent/10' : 'border-border'}`}
            >
              <input
                type="checkbox"
                checked={form.pains.includes(pain)}
                onChange={() => togglePain(pain)}
              />
              {pain}
            </label>
          ))}
        </div>
      </div>

      {/* Score selector — 10 buttons in a row */}
      <div className="mt-4">
        <FieldLabel>Prospect Score</FieldLabel>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted uppercase tracking-widest">Weak</span>

          <div className="flex flex-1 justify-center gap-1.5">
            {/*
              Array.from({ length: 10 }, (_, i) => i + 1) creates [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].
              _ is the unused first argument (the array item, which is undefined).
              i is the index (0-9), so i + 1 gives us 1-10.
            */}
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
              const buttonTier = scoreTier(n) // what tier is this button's number?
              const styles     = SCORE_BUTTON_STYLES[buttonTier]
              const selected   = form.score === n // is this button the selected score?

              return (
                <button
                  key={n}
                  type="button" // prevent form submission on click
                  onClick={() => setField('score', selected ? 0 : n)}
                  /*
                    If clicking the already-selected button, clear the score (set to 0).
                    Otherwise, set the score to this button's number.
                    This is a toggle — click 8 to select it, click 8 again to deselect.
                  */
                  className={`w-9 h-9 rounded-lg border font-mono text-xs flex items-center justify-center transition-all ${selected ? styles.selected : styles.unselected}`}
                >
                  {n}
                </button>
              )
            })}
          </div>

          <span className="text-[11px] text-muted uppercase tracking-widest">Hot</span>
        </div>

        {/* Large score readout below the buttons — shows the current score in its tier colour */}
        <div className="text-center mt-2">
          <span className={`font-mono text-3xl font-medium tabular-nums ${SCORE_READOUT_STYLES[tier]}`}>
            {form.score === 0 ? '—' : form.score}
            {/* tabular-nums — all digits take equal width so the number doesn't shift */}
          </span>
        </div>
      </div>

      {/* Notes — free text area */}
      <div className="mt-4">
        <FieldLabel>Notes</FieldLabel>
        <textarea
          value={form.notes}
          onChange={(e) => setField('notes', e.target.value)}
          className={`${inputClasses} min-h-20`}
          /* min-h-[80px] — textarea starts at 80px tall and can grow taller */
        />
      </div>

      {/* Form footer — Save and Cancel buttons */}
      {/*
        flex-col on mobile (buttons stack vertically)
        md:flex-row on desktop (buttons side by side)
      */}
      <div className="flex flex-col md:flex-row gap-3 mt-6">
        {/*
          While saving: the button shows a spinner, the label changes to
          "Saving…" so the user knows what's happening, and clicks are blocked.
        */}
        <Button variant="primary" fullWidth loading={saving} onClick={handleSubmit}>
          {saving ? 'Saving…' : 'Save Prospect'}
        </Button>

        {/*
          Cancel is disabled mid-save too. Leaving it live would let the user
          navigate back to the list while the request is still running — the
          save would then complete invisibly and the toast would appear out of
          context, with no way to tell whether it worked.
        */}
        <Button variant="ghost" disabled={saving} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
