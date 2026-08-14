/*
  components/ui/Spinner.jsx — Generic spinning loading indicator.

  Like Button and Badge, this knows NOTHING about prospects. It's a pure
  visual primitive: a circle with one transparent edge, rotated forever by
  Tailwind's animate-spin.

  HOW THE CIRCLE IS DRAWN:
    rounded-full          — makes the square div a circle
    border-2              — 2px border all the way around
    border-current        — border uses whatever text colour the parent has,
                            so it automatically matches the button it sits in
    border-t-transparent  — the TOP edge is invisible, which is what makes the
                            spin visible (a fully solid ring looks static)

  PROPS:
    size      — 'sm' (12px, for inside buttons) or 'md' (24px, standalone)
    className — extra Tailwind classes from the caller (e.g. a colour override)
*/

const SIZE_CLASSES = {
  sm: "w-3 h-3",
  md: "w-6 h-6",
};

export default function Spinner({ size = "sm", className = "" }) {
  return (
    <span
      className={`inline-block rounded-full border-2 border-current border-t-transparent animate-spin ${SIZE_CLASSES[size]} ${className}`}
      /*
        role="status" + aria-label tell screen readers that something is
        loading here. Without it, a spinner is invisible to non-visual users.
      */
      role="status"
      aria-label="Loading"
    />
  );
}
