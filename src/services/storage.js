/*
  services/storage.js — localStorage adapter.

  WHY THIS FILE EXISTS (the service layer pattern):
  The app needs to save and load prospects somewhere. Right now that's the browser's
  localStorage. Later it'll be a real database via a FastAPI server.

  Instead of having every component talk to localStorage directly, ALL data access
  goes through this one file. This means when the backend is ready, we only change
  THIS file (or switch to api.js), and every single component automatically
  starts using the real database — no component needs to change at all.

  IMPORTANT: No component in the app touches localStorage. Only this file does.

  WHY EVERYTHING RETURNS A PROMISE:
  The backend version (api.js) has to make network requests, which are async —
  they take time and might fail. To keep both adapters identical in shape,
  storageService also returns Promises even though localStorage is instant.
  This means useProspects.js can use the same .then() / .catch() pattern
  whether it's talking to localStorage or the real API.
*/

/* The key under which all prospect data is stored in localStorage. */
const KEY = 'kd_prospects'

/*
  read() — loads all prospects from localStorage.
  localStorage.getItem() returns a JSON string or null if nothing is saved yet.
  JSON.parse() converts the JSON string back into a JavaScript array.
  The || '[]' fallback means "if nothing is saved, pretend we got an empty array".
*/
const read = () => JSON.parse(localStorage.getItem(KEY) || '[]')

/*
  write(data) — saves the full prospects array to localStorage.
  JSON.stringify() converts the JavaScript array into a JSON string
  because localStorage can only store strings, not JavaScript objects.
*/
const write = (data) => localStorage.setItem(KEY, JSON.stringify(data))

export const storageService = {

  /*
    getAll() — returns all saved prospects.
    Promise.resolve() wraps the result in a Promise so the caller
    can use .then() just like it would with a real API.
  */
  getAll: () => Promise.resolve(read()),

  /*
    create(prospectData) — saves a brand new prospect.
    prospectData is everything the form submitted (name, niche, score, etc.)
    but WITHOUT an id or dateAdded — we generate those here.

    The spread operator {...prospectData} copies all the form fields,
    then we ADD id and dateAdded on top.

    id: Date.now() gives a unique number — it's the number of milliseconds
    since 1 Jan 1970 (Unix timestamp). Since no two prospects are created
    at the exact same millisecond, this is unique enough for our purposes.

    dateAdded: new Date().toISOString() gives "2025-07-10T14:30:00.000Z"
    and .split('T')[0] takes only the date part: "2025-07-10".
  */
  create: (prospectData) => {
    const all = read()
    const newProspect = {
      ...prospectData,
      id: Date.now(),
      dateAdded: new Date().toISOString().split('T')[0],
    }
    write([...all, newProspect]) // save the existing list PLUS the new prospect
    return Promise.resolve(newProspect) // return the new prospect with its id
  },

  /*
    update(id, prospectData) — overwrites one existing prospect by its id.

    findIndex() scans the array and returns the position (index) of the
    prospect with the matching id. Returns -1 if not found.

    The spread merge { ...all[idx], ...prospectData } means:
    "start with all the existing fields, then overwrite with the new data".
    We then forcibly restore the original id and dateAdded so those
    can never be accidentally changed by an edit.

    We spread all into a new array ([...all]) before modifying it so
    we don't mutate the original array — React cares about immutability.
  */
  update: (id, prospectData) => {
    const all = read()
    const idx = all.findIndex((p) => p.id === id)
    if (idx === -1) return Promise.reject(new Error('Prospect not found'))
    const updated = { ...all[idx], ...prospectData, id, dateAdded: all[idx].dateAdded }
    const next = [...all]
    next[idx] = updated
    write(next)
    return Promise.resolve(updated)
  },

  /*
    remove(id) — deletes a prospect by its id.
    filter() creates a new array containing only prospects whose id
    does NOT match the one we're deleting. The deleted one is simply
    not included in the new array.
  */
  remove: (id) => {
    const all = read()
    write(all.filter((p) => p.id !== id))
    return Promise.resolve() // no return value needed for delete
  },

}
