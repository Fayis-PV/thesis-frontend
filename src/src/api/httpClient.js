/**
 * Thin fetch-based HTTP client with an Axios-like interceptor contract.
 *
 * - Injects `Authorization: Bearer <access>` on every request.
 * - On 401, attempts a single token refresh; on failure, clears session and
 *   redirects to /login.
 *
 * The app currently runs against mock data (see ./mockData.js), so this client
 * is only exercised by authApi. Connecting the Django backend is a matter of
 * pointing VITE_API_URL at it and removing the mock fallbacks in the domain
 * modules — the call sites stay identical.
 */

import { tokenStore } from "@/lib/auth";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function refreshAccessToken() {
  if (!tokenStore.refresh) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: tokenStore.refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    tokenStore.set({ access: data.access, refresh: tokenStore.refresh });
    return true;
  } catch {
    return false;
  }
}

export async function apiRequest(
  path,
  { method = "GET", body, headers, skipAuth = false } = {},
) {
  const finalHeaders = { "Content-Type": "application/json", ...headers };
  if (!skipAuth && tokenStore.access) {
    finalHeaders.Authorization = `Bearer ${tokenStore.access}`;
  }

  const doFetch = (authHeader) =>
    fetch(`${BASE_URL}${path}`, {
      method,
      headers: authHeader
        ? { ...finalHeaders, Authorization: `Bearer ${authHeader}` }
        : finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

  let res = await doFetch(tokenStore.access);

  if (res.status === 401 && !skipAuth) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      res = await doFetch(tokenStore.access);
    } else {
      tokenStore.clear();
      onUnauthorized?.();
      throw new ApiError("Session expired. Please sign in again.", 401);
    }
  }

  if (!res.ok) {
    let payload = null;
    try {
      payload = await res.json();
    } catch {
      /* non-JSON error */
    }
    const message =
      payload?.detail ||
      payload?.message ||
      payload?.non_field_errors?.[0] ||
      `Request failed (${res.status})`;
    throw new ApiError(message, res.status, payload);
  }

  if (res.status === 204) return null;
  return res.json();
}

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = payload || null;
  }
}

export const http = {
  get: (path, opts) => apiRequest(path, { ...opts, method: "GET" }),
  post: (path, body, opts) =>
    apiRequest(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => apiRequest(path, { ...opts, method: "PUT", body }),
  patch: (path, body, opts) =>
    apiRequest(path, { ...opts, method: "PATCH", body }),
  delete: (path, opts) => apiRequest(path, { ...opts, method: "DELETE" }),
};
