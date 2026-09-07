/*
  App.jsx — The root component. The top of the whole app.

  This is the only component that calls useProspects(). It gets everything
  back from the hook — data, state, and action functions — then passes the
  right pieces down to each child component as props.

  Think of App.jsx as a switchboard: it doesn't contain much logic of its own,
  it just wires the hook's outputs to the right components.

  WHAT APP.JSX RENDERS:
    Always:
      - <Toast>      — the floating notification popup (hidden when no message)
      - <Header>     — the "Prospect.kd" logo bar
      - <StatsRow>   — the 5-tile summary counts

    When view === 'list':
      - The "All Prospects" heading + "+ Add Prospect" button
      - <FilterBar>     — search, filter, sort controls
      - <ProspectList>  — the cards or empty state

    When view === 'form':
      - <ProspectForm>  — the add / edit form

    Independently (can overlay the list):
      - <ProspectDetail> — the side drawer (shown when a prospect is selected)
*/

import { useProspects } from "./hooks/useProspects.js";
import Toast from "./components/ui/Toast.jsx";
import Button from "./components/ui/Button.jsx";
import Spinner from "./components/ui/Spinner.jsx";
import Header from "./components/layout/Header.jsx";
import StatsRow from "./components/layout/StatsRow.jsx";
import FilterBar from "./components/filters/FilterBar.jsx";
import ProspectList from "./components/prospects/ProspectList.jsx";
import ProspectForm from "./components/prospects/ProspectForm.jsx";
import ProspectDetail from "./components/prospects/ProspectDetail.jsx";

function App() {
  /*
    Destructuring — pulls named values out of the object returned by useProspects().
    This is shorthand for:
      const result = useProspects()
      const filteredProspects = result.filteredProspects
      const stats = result.stats
      ... etc
    Everything about the app's state and actions comes from this one hook.
  */
  const {
    showToast, // (message, type) => shows a notification for 3 seconds
    refreshProspects, // () => re-fetch all prospects from the server
    filteredProspects, // the filtered+sorted list to render
    stats, // { total, hot, warm, closed, uniqueNiches }
    selectedProspect, // the prospect whose drawer is open (or null)
    filters, // current { search, status, niche, spending, sort }
    view, // 'list' or 'form'
    toast, // current notification: { message, type } or null
    loading, // true while the very first load is still running
    refreshing, // true while a background re-fetch is running
    saving, // true while an add or update is in flight
    deletingId, // id currently being deleted, or null
    statusPendingId, // id whose inline status change is saving, or null
    editingProspect, // prospect being edited in the form, or null
    addProspect, // (data) => saves a new prospect
    updateProspect, // (id, data) => saves changes to an existing prospect
    setStatus, // (id, status) => changes just the pipeline stage, no form needed
    deleteProspect, // (id) => deletes a prospect
    selectProspect, // (id) => opens the detail drawer for that prospect
    closeDetail, // () => closes the detail drawer
    startEdit, // (prospect) => opens the form in edit mode
    setView, // (view) => switches between 'list' and 'form'
    setFilter, // (key, value) => updates one filter
    clearFilter, // (key) => resets one filter to default
    clearAllFilters, // () => resets all filters
    dismissToast, // () => hides the toast immediately
  } = useProspects();

  /*
    hasActiveFilters — true if any filter is not at its default value.
    Used to tell ProspectList which empty state to show:
    "no results for these filters" vs "no prospects at all".
    Sort is excluded because sort is always active — it's not a filter.
  */
  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "all" ||
    filters.niche !== "all" ||
    filters.spending !== "all";

  /*
    handleSave — single function that handles BOTH add and edit form submissions.
    ProspectForm always calls onSave(data) — it doesn't know or care whether
    we're adding or editing. App.jsx decides which action to call based on
    whether editingProspect is set.
  */
  const handleSave = (data) => {
    if (editingProspect) {
      updateProspect(editingProspect.id, data); // edit: update the existing record
    } else {
      addProspect(data); // add: create a brand new record
    }
  };

  /*
    handleCancel — returns the user to the list view.
    The hook's startEdit() sets editingProspect. When the user cancels,
    setView('list') switches the view back. The hook clears editingProspect
    automatically when updateProspect succeeds.
  */
  const handleCancel = () => {
    setView("list");
  };

  return (
    /*
      min-h-screen — page is at least as tall as the viewport
      bg-bg        — uses our custom dark background colour (#0f0f13)
    */
    <div className="min-h-screen bg-bg">
      {/*
        Toast is always in the tree but renders nothing when toast is null.
        It's placed outside the centred container so it can be fixed-positioned
        in the top-right corner of the whole screen.
      */}
      <Toast toast={toast} onDismiss={dismissToast} />

      {/*
        max-w-225 mx-auto — centres content and limits width to 900px on wide screens
        px-4 py-4         — 16px horizontal padding, 16px top/bottom padding
      */}
      <div className="max-w-225 mx-auto px-4 py-4">
        {/* Always visible — logo bar and stats tiles */}
        <Header />
        <StatsRow stats={stats} />

        {/*
          VIEW: LIST
          The && short-circuit pattern: if view === 'list' is true, render the right side.
          If false, nothing renders (React treats false as "render nothing").
          The <> </> fragment wraps multiple sibling elements without adding a DOM div.
        */}
        {view === "list" && (
          <>
            {/* Heading row with the "+ Add Prospect" button */}
            <div className="flex items-center justify-between mb-4">
              {/*
                The heading sits next to a small "Refreshing…" indicator that
                only appears during a background re-fetch (e.g. after the AI
                writes a message back to a prospect). The list keeps showing
                the current cards while this runs — we're re-syncing, not
                loading from scratch, so blanking the list would be wrong.
              */}
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-medium text-text">All Prospects</h1>
                {refreshing && (
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <Spinner size="sm" />
                    Refreshing…
                  </span>
                )}
              </div>

              {/*
                Adding is disabled during the first load — there's nothing to
                return to yet, and the form would render over an empty list.
              */}
              <Button
                variant="primary"
                size="sm"
                disabled={loading}
                onClick={() => setView("form")}
              >
                + Add Prospect
              </Button>
            </div>

            {/*
              FilterBar receives the current filter state and callbacks.
              It calls these callbacks when the user changes a filter —
              the actual filtering happens in useProspects, not here.
            */}
            <FilterBar
              filters={filters}
              onFilterChange={setFilter}
              onClearFilter={clearFilter}
              onClearAll={clearAllFilters}
              resultCount={filteredProspects.length}
              totalCount={stats.total}
              loading={loading}
            />

            {/*
              ProspectList renders the filtered cards (or an empty state).
              onStartAdd is passed so the empty state's "Add your first prospect"
              button can switch the view to 'form'.
            */}
            <ProspectList
              prospects={filteredProspects}
              onSelectProspect={selectProspect}
              onStatusChange={setStatus} // clicking a card's status badge saves directly
              statusPendingId={statusPendingId}
              onStartAdd={() => setView("form")}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearAllFilters}
              loading={loading} // shows skeleton cards instead of the empty state
            />
          </>
        )}

        {/*
          VIEW: FORM
          Replaces the entire list area. The form is either in add mode
          (editingProspect = null) or edit mode (editingProspect = a prospect object).
          ProspectForm figures out which mode it's in from the editingProspect prop.
        */}
        {view === "form" && (
          <ProspectForm
            editingProspect={editingProspect}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={saving} // spinner on Save, and blocks a double submit
          />
        )}
      </div>

      {/*
        DETAIL DRAWER — rendered OUTSIDE the centred container so it can
        be fixed-positioned to the right edge of the full viewport.
        Only rendered when selectedProspect is not null (a prospect was clicked).
        When selectedProspect becomes null (drawer closed), the component
        unmounts entirely — so its open/animation state resets automatically.
      */}
      {selectedProspect && (
        <ProspectDetail
          prospect={selectedProspect}
          onEdit={startEdit} // opens the form in edit mode with this prospect
          onStatusChange={setStatus} // same quick status change as on the card
          statusPending={statusPendingId === selectedProspect.id}
          onRefresh={refreshProspects} // re-fetches all prospects from the server
          onToast={showToast} // shows a temporary notification in the top-right corner
          onDelete={deleteProspect}
          onClose={closeDetail} // clears selectedId → selectedProspect becomes null
          deleting={deletingId === selectedProspect.id} // true while this one is being deleted
        />
      )}
    </div>
  );
}

export default App;
