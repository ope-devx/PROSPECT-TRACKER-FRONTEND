# Prospect.kd — Claude Code Master Instructions

You are converting and improving a prospect tracking web app (originally a single HTML file)
into a production-quality React + Tailwind CSS application. All design decisions, schema
definitions, component specs, and UX requirements are documented in the `/docs` folder.
Read ALL docs files before writing any code.

---

## Tech Stack

- **React 18** (Vite scaffold — `npm create vite@latest`)
- **Tailwind CSS v3** (configured with custom design tokens — see `docs/UI_UX.md`)
- **No TypeScript** — plain JSX only
- **No external UI libraries** — every component is hand-built
- **No Redux / Zustand** — all state lives in `useProspects` hook, passed as props
- **No React Router** — single-page, view switching via state

---

## Docs to Read First (in this order)

1. `docs/SCHEMA.md` — data model and all constants. This is ground truth.
2. `docs/ARCHITECTURE.md` — folder structure and data flow rules.
3. `docs/SERVICES.md` — service layer pattern. Critical for backend swap later.
4. `docs/COMPONENTS.md` — every component's props, responsibilities, and rules.
5. `docs/UI_UX.md` — design system, Tailwind config, UX decisions.
6. `docs/FEATURES.md` — filter, sort, and stats specifications.

---

## Non-Negotiable Rules

### Data & State
- **NEVER** read or write localStorage directly from a component. Only `services/storage.js` touches localStorage.
- **NEVER** put filter/sort logic inside a component. All of it lives in `hooks/useProspects.js`.
- **NEVER** hardcode a niche name, status value, pain signal, or option string inside a component. Always import from `constants/prospects.js`.
- All prospect CRUD operations go through `useProspects`. Components call `addProspect`, `updateProspect`, `deleteProspect` — nothing else.

### Components
- UI primitives (`Button`, `Badge`, `Select`, `Toast`) must be **completely generic** — no domain logic, no prospect-specific strings.
- `ProspectForm` handles both add and edit. It receives `editingProspect` prop (null = add mode, object = edit mode).
- `ProspectDetail` is a **side drawer** on desktop, full-screen on mobile. It is NOT a modal.
- No `alert()`, `confirm()`, or `prompt()` anywhere. Use `Toast` for feedback, a confirm state inside the component for delete.

### Styling
- All colors use Tailwind custom tokens (`bg-surface`, `text-accent`, etc.) — never raw hex values in JSX.
- All font families via Tailwind (`font-sans`, `font-mono`).
- Responsive classes follow mobile-first: base = mobile, `md:` = 768px+.

### Images
- **Images are not supported in this version.** The field was intentionally dropped. Do not add an image upload input. Do not add an `images` field to the prospect object. It will be re-added when a backend with file storage is integrated.

### Followers Field
- Stored as a **number** in the prospect object — not a string.
- The form input is `type="number"`.
- On save, parse with `parseInt()` and strip any non-numeric characters.
- Display with `toLocaleString()` for readability (shows "4,200" visually).

---

## Implementation Order

Claude Code should implement in this exact order. Do not skip ahead.

1. **Scaffold & config** — Vite + React + Tailwind. Apply custom tokens in `tailwind.config.js`. Add Google Fonts import to `index.html`.
2. **Constants** — `src/constants/prospects.js`. All enums and option arrays defined here first.
3. **Services** — `src/services/storage.js` and `src/services/api.js` (stub).
4. **Hook** — `src/hooks/useProspects.js`. Implement all CRUD + filter + sort logic.
5. **UI primitives** — `Button`, `Badge`, `Select`, `Toast`.
6. **Layout components** — `Header`, `StatsRow`.
7. **FilterBar** — full filter + sort bar with active pill display.
8. **ProspectCard** — list item card.
9. **ProspectList** — list wrapper with empty state.
10. **ProspectForm** — full add/edit form with 3 sections.
11. **ProspectDetail** — side drawer.
12. **App.jsx** — wire everything together.

---

## Project Goal Context

This app is used by a freelance web designer (Opeyemi, Kaduna, Nigeria) to track Instagram-sourced business leads in Kaduna North. The backend (FastAPI) is being built in parallel. The service layer exists so the frontend can switch from localStorage to the API by changing one environment variable. Future additions planned: RAG-based prospect notes, database persistence, multi-user support.
