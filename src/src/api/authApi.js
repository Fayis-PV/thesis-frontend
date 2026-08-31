/**
 * Auth API — login, refresh, logout, current user.
 * Real endpoints (Django SimpleJWT):
 *   POST /auth/token/          -> { access, refresh }
 *   POST /auth/token/refresh/  -> { access }
 *   POST /auth/token/verify/
 *   GET  /auth/me/              -> AuthUser
 */
import { mockRequest } from "./mockRequest";
import { http } from "./httpClient";

const MOCK_USER = {
  id: "u1",
  name: "Repository Admin",
  email: "admin@repository.edu",
  role: "admin",
};

export const authApi = {
  /** @param {{email:string, password:string}} creds @returns {Promise<LoginResponse>} */
  async login({ email, password }) {
    // return http.post("/auth/token/", { email, password }, { skipAuth: true });
    return mockRequest(() => {
      if (!email || !password) throw new Error("Invalid credentials");
      return {
        access: "mock-access-token",
        refresh: "mock-refresh-token",
        user: { ...MOCK_USER, email },
      };
    });
  },
  async me() {
    // return http.get("/auth/me/");
    return mockRequest(() => MOCK_USER, { latency: 150 });
  },
  async logout() {
    // return http.post("/auth/token/refresh/", { refresh: tokenStore.refresh });
    return mockRequest(() => ({ ok: true }), { latency: 100 });
  },
};
