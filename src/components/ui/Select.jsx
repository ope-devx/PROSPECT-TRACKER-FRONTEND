/*
  components/ui/Select.jsx — Styled dropdown wrapper.

  The browser's native <select> element is ugly by default (looks different
  in every browser). This component wraps it with our dark-theme styling
  so every dropdown in the app looks consistent.

  PROPS:
    id          — HTML id attribute, connects a <label> to this select for accessibility
    value       — the currently selected option's VALUE (controlled by parent state)
    onChange    — called with the new value string whenever the user picks an option
    options     — array of { value, label } objects to show as <option> elements
    placeholder — optional greyed-out first option (e.g. "Select a niche")
                  disabled so the user can't re-select it after picking a real option
    className   — optional extra Tailwind classes to merge in (e.g. for width overrides)

  HOW CONTROLLED INPUTS WORK IN REACT:
  The parent holds the selected value in state and passes it as the `value` prop.
  When the user picks something, onChange fires and tells the parent to update its state.
  React then re-renders this component with the new value selected.
  The component itself never decides what's selected — the parent does.
  This is called a "controlled component".
*/
export default function Select({ id, value, onChange, options, placeholder, className = '' }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      /*
        e is the DOM Event object. e.target is the <select> element.
        e.target.value is the value of whichever <option> the user just picked.
        We pass that string up to the parent via onChange.
      */
      className={`bg-surface2 border border-border text-text rounded-lg px-3 py-2.5 text-sm outline-none transition-colors duration-150 focus:border-accent ${className}`}
      /*
        outline-none         — removes the default browser blue focus ring (we use focus:border-accent instead)
        transition-colors    — smoothly animates the border colour change on focus
        focus:border-accent  — border turns red when the select is active/focused
        ${className}         — any extra Tailwind classes passed in from outside (e.g. min-w-[140px])
      */
    >
      {/*
        Render the placeholder as the first option if one was provided.
        value="" is an empty string so it doesn't match any real option.
        disabled prevents the user from re-selecting it after choosing something real.
        != null checks for both null and undefined with a single check.
      */}
      {placeholder != null && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}

      {/*
        Map over the options array and render one <option> per item.
        key={opt.value} — React needs a unique key on each list item so it
        can efficiently update only the options that changed.
        value={opt.value} — what gets stored/compared when this option is selected.
        The text inside the tag (opt.label) is what the user sees in the dropdown.
      */}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
