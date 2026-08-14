/*
  components/ui/Button.jsx — Generic reusable button.

  This component knows NOTHING about prospects, niches, or statuses.
  It only knows about appearance (variant, size) and behaviour (onClick, disabled).
  That makes it reusable anywhere in the app.

  PROPS (inputs this component accepts):
    variant   — controls the colour/style: 'primary' (red), 'ghost' (outline), 'danger' (red-tinted)
    size      — controls padding and text size: 'sm' or 'md'
    onClick   — the function to call when the button is clicked
    disabled  — if true, the button can't be clicked and appears faded
    loading   — if true, shows a spinner and blocks clicks (see note below)
    fullWidth — if true, the button stretches to fill its container's full width
    children  — whatever you put between <Button>…</Button> tags (the button text)

  THE LOADING PROP:
  Any button that triggers an async action (saving, deleting, calling the AI)
  should pass loading={true} while that action is in flight. The button then:
    - shows a spinner next to its label, so the user can see work is happening
    - stops responding to clicks, so an impatient double-click can't fire the
      same request twice (which would create duplicate prospects)

  Keeping this in Button — rather than each caller hand-rolling it — means
  every loading button in the app looks and behaves identically.
*/

import Spinner from './Spinner.jsx'

/*
  VARIANT_CLASSES — lookup table mapping each variant name to its Tailwind classes.
  This keeps the JSX clean — just one className lookup instead of long if-else chains.

  Tailwind class notes:
    hover:opacity-90   = on mouse hover, make it 90% opaque (slightly faded)
    active:scale-95    = when clicked, shrink to 95% size (gives a "press" effect)
    bg-transparent     = no background fill (for ghost)
    border-border      = use our custom border colour token
*/
const VARIANT_CLASSES = {
  primary: 'bg-accent text-white hover:opacity-90 active:scale-95',
  ghost:   'bg-transparent border border-border text-muted hover:text-text hover:border-text',
  danger:  'bg-red-900/30 border border-red-500/40 text-red-400 hover:bg-red-900/50',
}

/*
  SIZE_CLASSES — padding and font size per size option.
  px = horizontal padding, py = vertical padding.
*/
const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
}

/*
  Default values after the = in destructuring:
  variant='primary' means if no variant prop is passed, it defaults to 'primary'.
  This prevents crashes and makes the component easier to use.
*/
export default function Button({
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  children,
}) {
  /*
    A loading button is also a disabled button — that's what stops the
    double-click. We OR the two together rather than asking callers to
    pass both disabled and loading.
  */
  const isDisabled = disabled || loading

  return (
    <button
      type="button"       // prevents accidental form submission when inside a <form>
      onClick={onClick}
      disabled={isDisabled}
      /*
        aria-busy tells screen readers "this control is working right now".
        Sighted users get the spinner; this is the equivalent announcement.
      */
      aria-busy={loading}
      className={`
        rounded-lg font-sans font-medium transition-all duration-150
        inline-flex items-center justify-center gap-2
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${fullWidth ? 'w-full' : ''}
        disabled:opacity-50 disabled:pointer-events-none
      `}
      /*
        disabled:opacity-50      = when disabled, reduce opacity to 50%
        disabled:pointer-events-none = when disabled, ignore all mouse clicks
        inline-flex items-center gap-2 = lays the spinner and the label side by
        side, vertically centred, with an 8px gap between them
      */
    >
      {/*
        The spinner renders BEFORE the label and only while loading.
        The label itself stays on screen the whole time — swapping the text
        for the word "Loading" makes the button resize and the row jump.
      */}
      {loading && <Spinner size="sm" />}
      {children}
      {/* children renders whatever text or elements were placed inside <Button>…</Button> */}
    </button>
  )
}
