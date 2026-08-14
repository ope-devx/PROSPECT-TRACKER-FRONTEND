/*
  components/ui/Toast.jsx — Temporary notification popup.

  A "toast" is a small message that appears briefly (like a piece of toast
  popping up), then disappears. Used to confirm actions like "Prospect added ✓"
  or warn of errors like "Failed to save. Try again."

  IMPORTANT: This component does NOT manage its own timer.
  The 3-second auto-dismiss is handled by showToast() in useProspects.js.
  This component just renders what it's given and hides itself when toast is null.
  Keeping logic in the hook and rendering in the component is the React pattern.

  PROPS:
    toast     — either { message: string, type: 'success' | 'error' } or null
    onDismiss — function to call when the user clicks the toast to close it early
*/
export default function Toast({ toast, onDismiss }) {
  /*
    Early return — if toast is null, render nothing at all.
    This is a common React pattern: return null to render nothing.
    The component is always in the tree (in App.jsx), but it's invisible
    until the toast state has a value.
  */
  if (!toast) return null

  /* Determine type once so we don't repeat the check multiple times below */
  const isSuccess = toast.type === 'success'

  return (
    <div
      /*
        fixed top-4 right-4  — positions the toast in the top-right corner of the
                               viewport, floating above all other content.
        z-50                 — z-index 50: appears on top of everything including the drawer (z-30).
        border-l-4           — thick left border (the coloured stripe on the left side).
        shadow-lg            — drop shadow to make it "float" above the page.
        The border-l colour changes based on success (green) or error (red).
      */
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border-l-4 bg-surface border border-border px-4 py-3 text-sm text-text shadow-lg ${isSuccess ? 'border-l-green-400' : 'border-l-red-400'}`}
      role="status"    /* tells screen readers this is a live status message */
      onClick={onDismiss}  /* clicking anywhere on the toast closes it immediately */
    >
      {/* Checkmark for success, ✕ for errors — coloured to match the border stripe */}
      <span className={isSuccess ? 'text-green-400' : 'text-red-400'}>
        {isSuccess ? '✓' : '✕'}
      </span>

      {/* The actual message text, e.g. "Prospect added ✓" */}
      {toast.message}
    </div>
  )
}
