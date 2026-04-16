const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const SESSION_KEY = "cal_demo_session";

export async function apiFetch(path, options = {}) {
  const init = {
    method: options.method || "GET",
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, init);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || `Request failed (${response.status})`);
  }

  return payload;
}

export function saveSession(session) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function readSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(SESSION_KEY);
}
