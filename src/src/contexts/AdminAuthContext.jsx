import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import { authApi } from "@/api/authApi";
import { tokenStore, getStoredUser, setStoredUser } from "@/lib/auth";
import { setUnauthorizedHandler } from "@/api/httpClient";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      tokenStore.clear();
      setUser(null);
    });
    // Verify any persisted session.
    let active = true;
    (async () => {
      if (tokenStore.access) {
        try {
          const me = await authApi.me();
          if (active) setUser(me);
        } catch {
          tokenStore.clear();
          if (active) setUser(null);
        }
      }
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const {
      access,
      refresh,
      user: u,
    } = await authApi.login({ email, password });
    tokenStore.set({ access, refresh });
    setStoredUser(u);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    tokenStore.clear();
    setStoredUser(null);
    setUser(null);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{ user, loading, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx)
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
