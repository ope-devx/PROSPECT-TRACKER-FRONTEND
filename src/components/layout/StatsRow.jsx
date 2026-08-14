/*
  components/layout/StatsRow.jsx — The 5-tile summary bar at the top of the app.

  Shows key metrics about ALL prospects (not just the filtered ones).
  This gives you a bird's-eye view of your pipeline at a glance.

  PROPS:
    stats — object from useProspects: { total, hot, warm, closed, uniqueNiches }
            These numbers are computed in the hook and passed down as props.

  This component has no logic — it just renders numbers it receives.
*/

/*
  TILES — defines what each stat tile shows.
  Keeping this as data (an array of objects) instead of hardcoding 5 identical
  <div> blocks means we loop once and all 5 tiles render from one template.

  key        — the property name to look up in the stats object
  label      — the label shown below the number
  valueClass — Tailwind text colour for the number (each stat gets a distinct colour)
*/
const TILES = [
  {
    key: "total",
    label: "Total Prospects",
    valueClass: "text-text",
  },
  {
    key: "hot",
    label: "Hot (8-10)",
    valueClass: "text-green-400",
  },
  { key: "warm", label: "Warm (5-7)", valueClass: "text-yellow-400" },
  { key: "closed", label: "Closed", valueClass: "text-accent" },
  { key: "uniqueNiches", label: "Niches", valueClass: "text-accent2" },
];

export default function StatsRow({ stats }) {
  return (
    /*
      grid grid-cols-2      — 2 columns on mobile (stats wrap into 2 rows of 2+1)
      md:grid-cols-5        — 5 columns on screens 768px+ (all in one row)
      gap-3                 — 12px gap between tiles
      mb-5                  — 20px space below before the FilterBar
    */
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
      {/*
        .map() loops over the TILES array and renders one tile <div> per item.
        key={tile.key} — React requires a unique key prop on each item in a list.
        tile.key also tells us WHICH property to read from the stats object.
        stats[tile.key] is computed property access — same as stats.total, stats.hot, etc.
        but using the variable key name instead of a hardcoded property name.
      */}
      {TILES.map((tile) => (
        <div
          key={tile.key}
          className="bg-surface border border-border rounded-xl p-4"
          /*
            bg-surface    — slightly lighter than the page background
            border-border — subtle border using our custom dark colour
            rounded-xl    — more rounded than a regular card (xl = 12px radius)
            p-4           — 16px padding inside each tile
          */
        >
          {/* The big number — monospace so digits don't shift width */}
          <div className={`font-mono text-2xl font-medium ${tile.valueClass}`}>
            {stats[tile.key]}
          </div>

          {/* The label below the number */}
          <div className="text-[11px] text-muted uppercase tracking-widest mt-1">
            {tile.label}
          </div>
        </div>
      ))}
    </div>
  );
}
