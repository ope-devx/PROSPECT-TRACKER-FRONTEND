/*
  components/prospects/ProspectDetail.jsx — Side drawer showing full prospect info.

  On desktop (768px+): slides in from the right as a 440px wide panel.
  On mobile: covers the full screen.

  The drawer is NOT a modal — it's a fixed panel alongside the list,
  so the user can still see the list behind it on desktop.

  The slide-in animation is a CSS transform transition: the panel starts
  "off screen to the right" (translate-x-full = 100% right) and slides
  to "on screen" (translate-x-0 = original position). We trigger this by
  setting open=true one frame after the component mounts.

  PROPS:
    prospect  — the full prospect object to display
    onEdit    — (prospect) => void — called when "Edit Prospect" is clicked
    onStatusChange — (id, status) => void — called when the status badge is used
    statusPending  — boolean — true while this prospect's status change is saving
    onDelete  — (id) => void — called on the second click of the delete button
    onClose   — () => void — called when the backdrop or × is clicked
    onRefresh — () => Promise — re-fetches all prospects from the server
    onToast   — (message, type) => void — shows a notification
    deleting  — boolean — true while THIS prospect's delete request is running
*/

import { useEffect, useState } from "react";
import Badge from "../ui/Badge.jsx";
import StatusPicker from "./StatusPicker.jsx";
import Button from "../ui/Button.jsx";
import Spinner from "../ui/Spinner.jsx";
import { scoreTextClass } from "../../utils/scoring.js";
import { apiService } from "../../services/api.js";
/*
  DetailRow — one labelled info row inside the drawer.
  Renders: "FOLLOWERS          4,200"
  Returns null (renders nothing) if value is falsy — so empty fields are hidden.

  This is a small internal component, only used inside this file.
*/
function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-3 border-b border-border text-sm">
      <span className="text-[11px] text-muted uppercase tracking-[0.5px]">
        {label}
      </span>
      <span className="text-text font-medium text-right max-w-[60%]">
        {value}
      </span>
    </div>
  );
}

export default function ProspectDetail({
  prospect,
  onEdit,
  onStatusChange,
  statusPending = false,
  onDelete,
  onClose,
  onRefresh,
  onToast,
  deleting = false,
}) {
  const [generatedMessage, setGeneratedMessage] = useState("");

  /*
    loading — which AI action is currently running, as a string:
      ""           → nothing is running
      "cold-dm"    → the cold DM request is in flight
      "follow-up"  → the follow-up request is in flight

    A single string (rather than two booleans) makes the two actions mutually
    exclusive by construction — we can never end up showing both spinners at
    once, and `!!loading` is an easy "is anything running?" check.
  */
  const [loading, setLoading] = useState("");

  /*
    open — controls whether the drawer is visually "in" or "out".
    Starts false (off-screen), set to true after first render to trigger the slide-in.
  */
  const [open, setOpen] = useState(false);

  /*
    confirmDelete — the two-click delete pattern.
    false = showing "Delete" button (ghost style)
    true  = showing "Confirm Delete?" button (danger style)
    This avoids accidental deletions without using window.confirm().
  */
  const [confirmDelete, setConfirmDelete] = useState(false);

  /*
    Slide-in animation trigger.
    requestAnimationFrame() waits until the browser has painted one frame
    before setting open=true. Without this, React might batch the initial
    render and the state change together, skipping the transition entirely.
    The cleanup function (return () => cancelAnimationFrame(id)) cancels
    the frame request if the component unmounts before it fires.

    The empty [] dependency array means this only runs once, on mount.
  */
  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  /*
    Reset confirmDelete whenever a different prospect is opened.
    Without this, if you deleted, cancelled, then opened another prospect,
    the "Confirm Delete?" state would still be active from the last one.
    [prospect] in the dependency array means this runs whenever prospect changes.
  */
  useEffect(() => {
    setConfirmDelete(false);
  }, [prospect]);

  async function handleColdDm() {
    setLoading("cold-dm");

    try {
      setGeneratedMessage(await apiService.generateColdDm(prospect.id));
      /*
        await the refresh so the button stays in its loading state until the
        list has actually re-synced. Without the await, loading would clear
        the instant the AI responded while the re-fetch was still running —
        the button would look finished while work was still happening.
      */
      await onRefresh();
    } catch (error) {
      onToast(error.message || "Failed to genrate cold Dm message.", "error");
    } finally {
      setLoading("");
    }
  }

  async function handleFollowUp() {
    setLoading("follow-up");
    try {
      setGeneratedMessage(await apiService.generateFollowUpDm(prospect.id));
    } catch (error) {
      onToast(
        error.message || "Failed to generate follow-up message.",
        "error",
      );
    } finally {
      setLoading("");
    }
  }

  function handleShowColdDmMessage() {
    setGeneratedMessage(prospect.last_message);
  }

  function handleClearMessage() {
    setGeneratedMessage("");
  }

  return (
    /*
      React Fragment <> </> — lets us return two sibling elements (the backdrop
      overlay and the drawer panel) without wrapping them in a div.
    */

    <>
      {/*
        BACKDROP — the semi-transparent dark overlay behind the drawer.
        Clicking it closes the drawer (calls onClose).

        fixed inset-0    — covers the entire viewport
        z-20             — above the list but below the drawer (z-30)
        bg-black/30      — 30% opacity black (semi-transparent)
        transition-opacity — smoothly fades in/out when open changes
        opacity-0 pointer-events-none — fully invisible AND unclickable when closed
        opacity-100 pointer-events-auto — visible and clickable when open
      */}
      <div
        /*
          Ignore backdrop clicks while a delete is running. The drawer closes
          itself when the delete succeeds; letting the user dismiss it early
          would hide the pending state and any error that follows.
        */
        onClick={deleting ? undefined : onClose}
        className={`fixed inset-0 bg-black/30 z-20 transition-opacity duration-250 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/*
        DRAWER PANEL
        fixed right-0 top-0 h-full — anchored to the right edge, full height
        w-full md:w-[440px]        — full width on mobile, 440px on desktop
        z-30                       — above the backdrop overlay
        overflow-y-auto            — scrolls if content is taller than the screen

        The slide-in animation:
        transform transition-transform duration-250 ease-out — CSS transition on the transform property
        translate-x-full  — off-screen to the right (when open=false)
        translate-x-0     — on-screen in normal position (when open=true)
      */}
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-110 bg-surface border-l border-border transform transition-transform duration-250 ease-out z-30 overflow-y-auto ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-5">
          {/* HEADER ROW: large score number on the left, close button on the right */}
          <div className="flex justify-between items-start">
            {/*
              Large score — e.g. "8/10" in the tier colour.
              scoreTextClass() returns 'text-green-400', 'text-yellow-400', etc.
              Score 0 shows "—" (dash) because 0 means "not set".
              /10 is shown in muted grey so only the score number is prominent.
            */}
            <div
              className={`font-mono text-5xl font-medium ${scoreTextClass(prospect.score)}`}
            >
              {prospect.score === 0 ? "—" : prospect.score}
              <span className="text-muted text-xl">/10</span>
            </div>

            {/* × close button — top right corner */}
            <button
              type="button"
              onClick={onClose}
              disabled={deleting} // same reason as the backdrop above
              className="text-muted hover:text-text text-xl leading-none disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Close"
              /* aria-label explains what the × button does for screen readers */
            >
              ×
            </button>
          </div>

          {/* Prospect name, niche, and status badge */}
          <div className="text-xl font-medium text-text mt-3">
            {prospect.name}
          </div>
          <div className="text-sm text-muted">{prospect.niche}</div>
          {/*
            Clickable status, same control as on the list card. align="left"
            because this badge sits at the drawer's left edge — a right-aligned
            menu would hang off toward the panel's border.
          */}
          <div className="mt-2">
            <StatusPicker
              value={prospect.status}
              onChange={(status) => onStatusChange(prospect.id, status)}
              pending={statusPending}
              align="left"
            />
          </div>

          {/* INFO ROWS — each field as a label-value row with a bottom border */}
          <div className="mt-4">
            {/*
              Handle row — if they have a link, make the handle a clickable hyperlink.
              This is a nested ternary:
                if handle exists →
                  if link exists → render an <a> tag
                  else           → render plain text
                else             → pass null (DetailRow returns null, renders nothing)

              target="_blank"   — opens in a new tab
              rel="noreferrer"  — security best practice for external links (prevents the
                                  new page from accessing the opener via window.opener)
            */}
            <DetailRow
              label="Handle"
              value={
                prospect.handle ? (
                  prospect.link ? (
                    <a
                      href={prospect.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline"
                    >
                      {prospect.handle}
                    </a>
                  ) : (
                    prospect.handle
                  )
                ) : null
              }
            />

            {/* Followers — toLocaleString() formats 4200 as "4,200" */}
            <DetailRow
              label="Followers"
              value={
                prospect.followers ? prospect.followers.toLocaleString() : null
              }
            />

            <DetailRow label="Engagement" value={prospect.engagement} />
            <DetailRow label="Has Website" value={prospect.website} />
            <DetailRow label="Spending on Ads" value={prospect.spending} />
            <DetailRow label="Contact" value={prospect.contact} />
            <DetailRow label="Date Added" value={prospect.dateAdded} />
          </div>

          {/*
            Pain signals section — only renders if pains array has items.
            ?. optional chaining — if prospect.pains is undefined, > 0 is skipped
            and this whole block doesn't render (no crash).
          */}
          {prospect.pains?.length > 0 && (
            <div className="mt-4">
              <div className="text-[11px] text-muted uppercase tracking-wide mb-2">
                Pain Signals
              </div>
              {/* flex-wrap — pills flow onto multiple lines if there are many */}
              <div className="flex flex-wrap gap-1.5">
                {prospect.pains.map((pain) => (
                  <Badge key={pain} variant="pain" value={pain} />
                ))}
              </div>
            </div>
          )}

          {/* Notes section — only renders if notes is not empty */}
          {prospect.notes && (
            <div className="mt-4">
              <div className="text-[11px] text-muted uppercase tracking-wide mb-2">
                Notes
              </div>
              <p className="text-sm leading-relaxed text-text">
                {prospect.notes}
              </p>
            </div>
          )}

          {/* FOOTER: Edit and Delete buttons */}
          <div className="flex gap-3 mt-6">
            {/* flex-1 makes the Edit button stretch to fill available space */}
            <div className="flex-1">
              {/*
                Editing is blocked mid-delete — opening the form for a
                prospect that's about to disappear would leave the user
                editing a record that no longer exists.
              */}
              <Button
                variant="primary"
                fullWidth
                disabled={deleting}
                onClick={() => onEdit(prospect)}
              >
                Edit Prospect
              </Button>
            </div>

            {/*
              TWO-CLICK DELETE PATTERN:
              First click:  confirmDelete = false → sets confirmDelete = true
                            Button changes to danger style and "Confirm Delete?" text
              Second click: confirmDelete = true → calls onDelete
                            Button shows a spinner while the request runs

              This prevents accidental deletions without using window.confirm().
              The button's variant and text both change based on confirmDelete state.

              The drawer is NOT closed here. useProspects closes it itself once
              the delete actually succeeds. Closing on click looked instant but
              was a lie — if the request failed, the prospect stayed in the list
              while an error toast appeared over a drawer that had already gone.
            */}
            <Button
              variant={confirmDelete ? "danger" : "ghost"}
              loading={deleting}
              onClick={() => {
                if (confirmDelete) {
                  onDelete(prospect.id);
                } else {
                  setConfirmDelete(true);
                }
              }}
            >
              {deleting
                ? "Deleting…"
                : confirmDelete
                  ? "Confirm Delete?"
                  : "Delete"}
            </Button>
          </div>

          {/*
            GENERATED MESSAGE PANEL

            Three possible states:
              1. loading  → a spinner and "Writing your message…". AI calls take
                            several seconds, so without this the drawer looks
                            frozen and users click the button again.
              2. a message → the text itself, with newlines preserved.
              3. neither  → render nothing at all. The panel used to render an
                            empty bordered box before anything was generated.

            aria-live="polite" makes a screen reader read the message out once
            it arrives, without interrupting whatever it's currently saying.
          */}
          {(loading || generatedMessage) && (
            <div
              aria-live="polite"
              className="border border-border p-4 rounded-md mt-4 mb-4 text-sm text-text"
            >
              {loading ? (
                <span className="flex items-center gap-2 text-muted">
                  <Spinner size="sm" />
                  Writing your message…
                </span>
              ) : (
                /* whitespace-pre-wrap keeps the AI's line breaks and spacing */
                <p className="whitespace-pre-wrap">{generatedMessage}</p>
              )}
            </div>
          )}

          {/*
            AI ACTION BUTTONS

            Every button here is disabled while an AI request is running —
            not just the two that trigger requests. "Clear Message" and
            "Show Cold DM" both overwrite generatedMessage, so leaving them
            live would let the user wipe the panel mid-request only for the
            arriving response to overwrite it again a second later.
          */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              onClick={() => handleColdDm()}
              loading={loading === "cold-dm"}
              disabled={!!loading || deleting}
            >
              {loading === "cold-dm" ? "Generating…" : "Cold Dm"}
            </Button>

            <Button
              onClick={() => handleFollowUp()}
              loading={loading === "follow-up"}
              disabled={!!loading || deleting}
            >
              {loading === "follow-up" ? "Generating…" : "Follow Up"}
            </Button>

            <Button onClick={() => handleClearMessage()} disabled={!!loading}>
              Clear Message
            </Button>

            <Button
              onClick={() => handleShowColdDmMessage()}
              disabled={!!loading}
            >
              Show Cold DM
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
