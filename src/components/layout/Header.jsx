/*
  components/layout/Header.jsx — App title bar.

  The simplest component in the app — no props, no state, no logic.
  It just renders the logo text and the subtitle on every page.

  Having it as its own component (even though it's small) means:
  - It's easy to find and change the logo text in one place
  - App.jsx stays clean and readable
  - If we ever add navigation links or a user menu here, it's isolated
*/
export default function Header() {
  return (
    /*
      flex items-center justify-between — puts the logo on the left
      and the subtitle on the right, with space between them.
      mb-5 — 20px margin below the header, separating it from the stats row.
    */
    <div className="flex items-center justify-between mb-5">

      {/*
        The logo: "Prospect" in the accent red, ".kd" in muted grey.
        font-mono        — uses JetBrains Mono (our monospace font)
        text-[13px]      — custom 13px size (Tailwind's scale doesn't have this exactly)
        text-accent      — our brand red (#e94560)
        uppercase        — forces ALL CAPS
        tracking-[2px]   — 2px letter spacing makes it feel like a brand mark
      */}
      <div className="font-mono text-[13px] text-accent uppercase tracking-[2px]">
        Prospect<span className="text-muted">.kd</span>
      </div>

      {/* Subtitle on the right — small and muted so it doesn't compete with the logo */}
      <div className="text-xs text-muted">Kaduna North · Web Design Leads</div>
    </div>
  )
}
