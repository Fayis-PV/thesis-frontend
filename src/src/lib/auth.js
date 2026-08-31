/**
 * Token storage for the admin JWT auth flow.
 * Tokens live in memory + localStorage so a page refresh keeps the session.
 * (Swap target: Django SimpleJWT access/refresh tokens.)
 */

const ACCESS_KEY = "tms_access";
const REFRESH_KEY = "tms_refresh";
const USER_KEY = "tms_user";

let access = localStorage.getItem(ACCESS_KEY) || null;
let refresh = localStorage.getItem(REFRESH_KEY) || null;

export const tokenStore = {
  get access() {
    return access;
  },
  get refresh() {
    return refresh;
  },
  set({ access: a, refresh: r }) {
    access = a;
    refresh = r;
    if (a) localStorage.setItem(ACCESS_KEY, a);
    else localStorage.removeItem(ACCESS_KEY);
    if (r) localStorage.setItem(REFRESH_KEY, r);
    else localStorage.removeItem(REFRESH_KEY);
  },
  clear() {
    access = null;
    refresh = null;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}
