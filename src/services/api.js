/*
  services/api.js — FastAPI backend adapter (stub — not active yet).

  This file is the future version of storage.js. When the FastAPI server
  is ready, flipping VITE_USE_API=true in the environment will make the
  app use this file instead of storage.js. No component needs to change.

  Notice how every method here has the exact same name and behaviour
  as storageService in storage.js:
    getAll()        → returns Promise<Prospect[]>
    create(data)    → returns Promise<Prospect>
    update(id,data) → returns Promise<Prospect>
    remove(id)      → returns Promise<void>

  This is intentional — both services are interchangeable.

  HOW THE URL IS DETERMINED:
  import.meta.env.VITE_API_URL reads from the .env file.
  If VITE_API_URL isn't set, we fall back to http://localhost:8000
  which is where FastAPI runs locally during development.
*/

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const apiService = {
  /*
    getAll() — fetches all prospects from GET /prospects.
    fetch() makes an HTTP request. It returns a Promise.
    "await" pauses execution until the Promise resolves (the request finishes).
    res.ok is true if the HTTP status code was 200-299 (success).
    res.json() parses the response body from JSON into a JS object/array.
  */
  getAll: async () => {
    const res = await fetch(`${BASE}/prospects`);
    if (!res.ok) throw new Error("Failed to fetch prospects");
    return res.json();
  },

  /*
    create(prospectData) — sends new prospect data to POST /prospects.
    method: 'POST' tells the server we're creating something new.
    headers tells the server the body is JSON (not a form, not plain text).
    body: JSON.stringify() converts the JS object to a JSON string for sending.
  */
  create: async (prospectData) => {
    const res = await fetch(`${BASE}/prospects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prospectData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to create prospect");
    }
    return res.json();
  },

  /*
    update(id, prospectData) — sends changes to PUT /prospects/:id.
    The id is embedded in the URL path so the server knows WHICH
    prospect to update (e.g. PUT /prospects/1752244800000).
  */
  update: async (id, prospectData) => {
    const res = await fetch(`${BASE}/prospects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prospectData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to update prospect");
    }
    return res.json();
  },

  /*
    remove(id) — sends DELETE /prospects/:id to the server.
    No body needed — the id in the URL is enough.
    No return value — we just need to know it succeeded (or threw).
  */
  remove: async (id) => {
    const res = await fetch(`${BASE}/prospects/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to delete prospect");
    }
  },

  generateColdDm: async (id) => {
    const res = await fetch(`${BASE}/prospects/${id}/cold-dm-generator`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "AI response failed");
    }

    return res.json();
  },

  generateFollowUpDm: async (id) => {
    const res = await fetch(
      `${BASE}/prospects/${id}/generate-follow-up-message`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "AI response failed");
    }

    return res.json();
  },
};
