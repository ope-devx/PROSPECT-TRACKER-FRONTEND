/*
  components/prospects/ProspectListSkeleton.jsx — Placeholder cards shown
  while the first load is in progress.

  WHY A SKELETON INSTEAD OF A SPINNER:
  A centred spinner makes the page jump when the real content arrives.
  A skeleton occupies roughly the same shape and height as the real cards,
  so the layout stays still and the wait feels shorter.

  Each grey block is just a rounded div with animate-pulse (Tailwind's
  built-in fade in-and-out animation). There's no data here at all —
  it's purely visual filler.

  PROPS:
    count — how many placeholder cards to render (defaults to 3)
*/

function SkeletonCard() {
  return (
    /*
      aria-hidden — this is decorative filler, so screen readers should skip it.
      The real "Loading prospects" announcement comes from the status region
      in ProspectList, not from these blocks.
    */
    <div
      aria-hidden="true"
      className="bg-surface border border-border rounded-xl p-4 animate-pulse"
    >
      <div className="flex justify-between items-start gap-4">
        {/* Left side — stands in for the name and niche lines */}
        <div className="flex-1">
          <div className="h-4 w-2/5 bg-surface2 rounded" />
          <div className="h-3 w-1/4 bg-surface2 rounded mt-2" />
        </div>
        {/* Right side — stands in for the score number */}
        <div className="h-8 w-12 bg-surface2 rounded" />
      </div>

      {/* Bottom row — stands in for the status badge and pain pills */}
      <div className="flex gap-2 mt-4">
        <div className="h-5 w-20 bg-surface2 rounded-full" />
        <div className="h-5 w-24 bg-surface2 rounded-full" />
      </div>
    </div>
  );
}

export default function ProspectListSkeleton({ count = 3 }) {
  return (
    /*
      Same wrapper classes as the real list in ProspectList, so the
      placeholders sit in exactly the same positions as the cards
      that will replace them.
    */
    <div className="flex flex-col gap-3">
      {/*
        Array.from({ length: count }) makes an array of `count` empty slots.
        We only need the index (i) as the React key — there's no data to map.
      */}
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
