// A stable, anonymous per-browser id used to rate-limit the public contact and
// feedback forms. It identifies a browser, not a person, and carries no personal data.

const KEY = "rp_form_session";
let memoryId = "";

function makeId() {
  try {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getFormSessionId() {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = makeId();
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // Storage blocked — fall back to an id that lasts for this page load.
    if (!memoryId) memoryId = makeId();
    return memoryId;
  }
}