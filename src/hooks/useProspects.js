/*
  hooks/useProspects.js — The brain of the entire app.

  A "hook" in React is a function that manages state and logic.
  The name must start with "use" — that's a React convention.

  WHY ONE HOOK FOR EVERYTHING:
  Instead of each component managing its own data, ONE hook owns all:
    - the list of prospects
    - the current filter/sort settings
    - which prospect is selected (open in the drawer)
    - which prospect is being edited (form is open)
    - which view is showing (list or form)
    - toast notifications (success/error messages)
    - loading state (first load, background refresh, saving, deleting)

  App.jsx calls this hook, gets everything back, and passes pieces
  down to each component as props. No component ever calls this hook
  directly except App.jsx. This keeps data flow simple and predictable.
*/

import { useEffect, useMemo, useState } from "react";
import { storageService } from "../services/storage.js";
import { apiService } from "../services/api.js";
import { IS_SPENDING } from "../constants/prospects.js";
import { getStatusLabel } from "../utils/scoring.js";

/*
  BACKEND SWITCH — controlled by an environment variable.

  import.meta.env reads from .env files (e.g. .env.local).
  If VITE_USE_API is 'true', the app talks to the FastAPI server.
  Otherwise it uses localStorage.

  This line runs ONCE when the file first loads (not on every render).
  "service" then holds whichever adapter is active for the whole session.
*/
const service =
  import.meta.env.VITE_USE_API === "true" ? apiService : storageService;

/*
  defaultFilters — the "reset" state for all filters.
  'all' means "no filter applied — show everything".
  sort: 'score' means the default sort is by score, highest first.

  This is defined outside the hook so it's created once, not
  re-created every time the component re-renders.
*/
const defaultFilters = {
  search: "", // text search across name, handle, niche
  status: "all", // filter by pipeline stage
  niche: "all", // filter by business category
  spending: "all", // filter by ad spend status
  sort: "score", // sort order
};

export function useProspects() {
  /*
    useState() creates a reactive variable. When you call the setter
    (the second value in the array), React re-renders everything that
    uses that variable.

    Reading: const [value, setValue] = useState(initialValue)
      value    = the current state
      setValue = call this to update the state and trigger a re-render
  */

  // The full unfiltered list of all prospects from storage/API
  const [prospects, setProspects] = useState([]);

  // Current active filter and sort settings (starts at defaults above)

  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      search: params.get("search") ?? defaultFilters.search,
      status: params.get("status") ?? defaultFilters.status,
      niche: params.get("niche") ?? defaultFilters.niche,
      spending: params.get("spending") ?? defaultFilters.spending,
      sort: params.get("sort") ?? defaultFilters.sort,
    };
  });

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== defaultFilters[key]) {
        params.set(key, value);
      }
    });
    const query = params.toString();
    history.replaceState(
      null,
      "",
      query ? `?${query}` : window.location.pathname,
    );
  }, [filters]);

  // The id of whichever prospect's detail drawer is open (null = closed)
  const [selectedId, setSelectedId] = useState(null);

  // The full prospect object being edited in the form (null = add mode)
  const [editingProspect, setEditingProspect] = useState(null);

  // Which screen is showing: 'list' (the main list) or 'form' (add/edit)
  const [view, setView] = useState("list");

  // The current toast notification, or null if none is showing
  // Shape: { message: string, type: 'success' | 'error' }
  const [toast, setToast] = useState(null);

  // true while prospects are loading from storage on first mount
  // Starts as true because we ARE loading before the effect even runs
  const [loading, setLoading] = useState(true);

  /*
    refreshing — true while a background re-fetch is running.

    This is deliberately SEPARATE from `loading`. `loading` is the very first
    load, when we have nothing to show and the list area renders skeletons.
    `refreshing` happens when we already have cards on screen and are just
    re-syncing with the server — there we keep the existing cards visible and
    show a subtle indicator instead, so the list doesn't blank out.
  */
  const [refreshing, setRefreshing] = useState(false);

  /*
    saving / deletingId — pending flags for the write operations.

    saving      — true while an add or update request is in flight. The form's
                  Save button uses this to show a spinner and block a second
                  submit (a double-click would otherwise create two prospects).
    deletingId  — the id currently being deleted, or null. We store the id
                  rather than a plain boolean so only the row/drawer for THAT
                  prospect shows a pending state.
  */
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  /*
    statusPendingId — the id whose quick status change is currently saving,
    or null. Same reasoning as deletingId: an id rather than a boolean, so a
    change on one card doesn't dim every other card's status badge.
  */
  const [statusPendingId, setStatusPendingId] = useState(null);

  /*
    refreshProspects() — re-fetches the whole list from the server.

    Returns the promise so callers can await it if they need to. Errors are
    surfaced as a toast rather than swallowed — previously a failed refresh
    left the user looking at stale data with no indication anything went wrong.
  */
  const refreshProspects = () => {
    setRefreshing(true);
    return service
      .getAll()
      .then(setProspects)
      .catch(() => showToast("Failed to refresh prospects", "error"))
      .finally(() => setRefreshing(false));
  };

  /*
    showToast() — displays a notification for 3 seconds, then hides it.
    setToast() triggers a re-render showing the message.
    setTimeout() schedules setToast(null) 3000ms later to hide it.
    type defaults to 'success' if not specified.
  */
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /*
    useEffect() runs code AFTER React renders the component.
    The empty array [] at the end means "only run this once — on first load".
    (If the array had variables in it, it would re-run whenever those changed.)

    Here we load all prospects from storage/API when the app first opens.
    .then()    = runs when the Promise resolves successfully, sets the list
    .catch()   = runs if something went wrong, shows an error toast
    .finally() = runs whether it succeeded or failed, stops the loading spinner
  */
  useEffect(() => {
    service
      .getAll()
      .then(setProspects)
      .catch(() => showToast("Failed to load prospects", "error"))
      .finally(() => setLoading(false));
  }, []);

  /*
    useMemo() — computes a derived value and caches it.
    The function inside only re-runs when the values in the second
    array (the "dependency array") change.

    Without useMemo, React would re-calculate filteredProspects on
    EVERY render (including tiny unrelated state changes). With useMemo,
    it only recalculates when prospects or filters actually change.
  */

  /*
    filteredProspects — the list AFTER applying all active filters and sorting.
    This is what gets shown in the UI (not the full prospects array).

    Filters are applied in sequence — each step narrows the list further.
    The sort is always applied last, after all filtering is done.
  */
  const filteredProspects = useMemo(() => {
    // Start with a copy of all prospects (spread [...] so we don't mutate the original)
    let result = [...prospects];

    // 1. Search filter — case-insensitive partial match on name, handle, or niche
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) || // ?. = don't crash if name is undefined
          p.handle?.toLowerCase().includes(q) ||
          p.niche?.toLowerCase().includes(q),
      );
    }

    // 2. Status filter — only show prospects with this exact pipeline stage
    if (filters.status !== "all") {
      result = result.filter((p) => p.status === filters.status);
    }

    // 3. Niche filter — only show prospects in this business category
    if (filters.niche !== "all") {
      result = result.filter((p) => p.niche === filters.niche);
    }

    // 4. Spending filter — filter by whether they're spending on ads
    if (filters.spending === "yes") {
      result = result.filter((p) => IS_SPENDING.includes(p.spending));
    } else if (filters.spending === "no") {
      result = result.filter((p) => !IS_SPENDING.includes(p.spending));
    }
    // if filters.spending === 'all', no filtering needed

    // 5. Sort — reorder the filtered results
    if (filters.sort === "score") {
      // b.score - a.score = descending (highest score first)
      result.sort((a, b) => b.score - a.score);
    } else if (filters.sort === "date") {
      // id is a timestamp, so higher id = more recent
      result.sort((a, b) => b.id - a.id);
    } else if (filters.sort === "followers") {
      // || -1 means prospects with 0 or no followers go to the bottom
      result.sort((a, b) => (b.followers || -1) - (a.followers || -1));
    } else if (filters.sort === "status") {
      // localeCompare = alphabetical string comparison
      result.sort((a, b) => a.status.localeCompare(b.status));
    }

    return result;
  }, [prospects, filters]); // only recalculate when prospects or filters change

  /*
    stats — summary numbers shown in the StatsRow at the top.
    These always reflect the FULL list (not the filtered list),
    so you always see overall counts regardless of active filters.

    new Set() creates a Set (a collection of unique values).
    .size gives the count of unique items in the Set.
    So uniqueNiches = how many different business categories are represented.
  */
  const stats = useMemo(
    () => ({
      total: prospects.length,
      hot: prospects.filter((p) => p.score >= 8).length,
      warm: prospects.filter((p) => p.score >= 5 && p.score < 8).length,
      closed: prospects.filter((p) => p.status === "closed").length,
      uniqueNiches: new Set(prospects.map((p) => p.niche).filter(Boolean)).size,
    }),
    [prospects],
  );

  /*
    selectedProspect — the full prospect object for whoever is open in the drawer.
    .find() scans the array and returns the first item where the condition is true.
    ?? null = if find() returns undefined (nothing found), use null instead.
  */
  const selectedProspect = useMemo(
    () => prospects.find((p) => p.id === selectedId) ?? null,
    [prospects, selectedId],
  );

  /*
    CRUD ACTIONS — functions that modify data.
    Each one calls the service (storage or API), then updates React state
    on success, or shows an error toast on failure.
  */

  /*
    addProspect(data) — creates a new prospect.
    After the service saves it, we add the returned prospect (which now has
    an id) to our local state array without re-fetching everything.
    Then we switch the view back to 'list' so the user sees the new card.

    (prev) => [...prev, created] is the "updater function" pattern.
    Using prev ensures we always have the latest state even if multiple
    updates happen close together.
  */
  const addProspect = (data) => {
    setSaving(true); // form's Save button now shows a spinner and blocks clicks
    return service
      .create(data)
      .then((created) => {
        setProspects((prev) => [...prev, created]);
        showToast("Prospect added ✓");
        setView("list");
      })
      .catch((err) =>
        showToast(err.message || "Failed to save. Try again.", "error"),
      )
      .finally(() => setSaving(false)); // clears on success AND failure
  };

  /*
    updateProspect(id, data) — saves changes to an existing prospect.
    .map() loops through every prospect and returns a new array.
    For the prospect with the matching id, we replace it with the
    updated version returned from the service. All others stay unchanged.
  */
  const updateProspect = (id, data) => {
    setSaving(true);
    return service
      .update(id, data)
      .then((updated) => {
        setProspects((prev) => prev.map((p) => (p.id === id ? updated : p)));
        showToast("Prospect updated ✓");
        setEditingProspect(null);
        setView("list");
      })
      .catch((err) =>
        showToast(err.message || "Failed to save. Try again.", "error"),
      )
      .finally(() => setSaving(false));
  };

  /*
    setStatus(id, status) — changes ONLY a prospect's pipeline stage.

    This exists separately from updateProspect because the two are used in
    very different situations. updateProspect is the form saving: it sets the
    `saving` flag, clears editingProspect, and switches back to the list view.
    Doing any of that from a card in the list would be wrong — the user never
    left the list, so there is no view to return to and no form to clear.

    We also can't send just { status } to the service. storage.update merges,
    but the API does a full replace, so a partial body would blank every other
    field. Spreading the existing prospect first keeps the record intact and
    overrides the one field we're actually changing.

    statusPendingId (not a boolean) tracks WHICH prospect is mid-change, so
    only that one card shows a pending state while the request runs.
  */
  const setStatus = (id, status) => {
    const current = prospects.find((p) => p.id === id);
    if (!current || current.status === status) return; // no-op if unchanged

    setStatusPendingId(id);
    return service
      .update(id, { ...current, status })
      .then((updated) => {
        setProspects((prev) => prev.map((p) => (p.id === id ? updated : p)));
        showToast(`Status → ${getStatusLabel(status)} ✓`);
      })
      .catch((err) =>
        showToast(err.message || "Failed to update status.", "error"),
      )
      .finally(() => setStatusPendingId(null));
  };

  /*
    deleteProspect(id) — removes a prospect.
    .filter() returns a new array without the deleted prospect.
    The drawer closes separately (called from ProspectDetail after this).
  */
  const deleteProspect = (id) => {
    setDeletingId(id); // the drawer's Confirm Delete button shows a spinner
    return service
      .remove(id)
      .then(() => {
        setProspects((prev) => prev.filter((p) => p.id !== id));
        showToast("Prospect deleted");
        /*
          Close the drawer here, on success, rather than in the component.
          Previously the drawer closed on click — before the request had even
          finished — so a failed delete showed an error toast while the
          prospect silently stayed in the list. Now the drawer stays open with
          a spinner until we know the delete actually worked.
        */
        setSelectedId(null);
      })
      .catch((err) =>
        showToast(err.message || "Failed to delete. Try again.", "error"),
      )
      .finally(() => setDeletingId(null));
  };

  /* Opens the detail drawer for a prospect by storing its id */
  const selectProspect = (id) => setSelectedId(id);

  /* Closes the detail drawer by clearing the selected id */
  const closeDetail = () => setSelectedId(null);

  /*
    startEdit(prospect) — opens the form in edit mode.
    Stores the full prospect object so the form can pre-fill all fields.
    Then switches the view to 'form'.
  */
  const startEdit = (prospect) => {
    setEditingProspect(prospect);
    setView("form");
  };

  /*
    setFilter(key, value) — updates one filter without touching the others.
    The spread { ...prev, [key]: value } copies ALL existing filter values,
    then overrides just the one we're changing.
    [key] uses computed property names — key is a variable, so [key] means
    "use the VALUE of key as the property name".
    e.g. setFilter('status', 'closed') → { ...prev, status: 'closed' }
  */
  const setFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  /*
    clearFilter(key) — resets one filter back to its default value.
    defaultFilters[key] looks up what the default is for that filter.
    e.g. clearFilter('status') → sets status back to 'all'
  */
  const clearFilter = (key) =>
    setFilters((prev) => ({ ...prev, [key]: defaultFilters[key] }));

  /* clearAllFilters() — resets every filter back to the defaults at once */
  const clearAllFilters = () => setFilters(defaultFilters);

  /* dismissToast() — hides the notification immediately (e.g. if user clicks it) */
  const dismissToast = () => setToast(null);

  /*
    The return value — everything App.jsx needs to run the whole app.
    App.jsx destructures this object and passes each piece down to
    whichever component needs it as a prop.
  */
  return {
    showToast, // (message, type) => shows a notification for 3 seconds
    refreshProspects, // () => re-fetch all prospects from the server
    // Derived / computed values
    filteredProspects, // the filtered+sorted list to display
    stats, // { total, hot, warm, closed, uniqueNiches }
    selectedProspect, // the prospect whose drawer is open, or null

    // Raw state
    filters, // current { search, status, niche, spending, sort }
    view, // 'list' or 'form'
    toast, // { message, type } or null
    loading, // true while first load is in progress
    refreshing, // true while a background re-fetch is running
    saving, // true while an add or update is in flight
    deletingId, // id currently being deleted, or null
    statusPendingId, // id whose quick status change is saving, or null
    editingProspect, // prospect being edited, or null (add mode)

    // Actions — functions that change state or save data
    addProspect,
    updateProspect,
    setStatus, // (id, status) => changes only the pipeline stage
    deleteProspect,
    selectProspect, // opens detail drawer
    closeDetail, // closes detail drawer
    startEdit, // opens form in edit mode
    setView, // switches between 'list' and 'form'
    setFilter, // updates one filter
    clearFilter, // resets one filter
    clearAllFilters, // resets all filters
    dismissToast, // hides the toast notification
  };
}
