/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import { clearTokens } from "@/lib/auth-utils";
import type { User } from "@/types/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isUser = (value: unknown): value is User =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  "email" in value;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = async () => {
    try {
      const refresh = localStorage.getItem("refreshToken");
      if (refresh) {
        await api.post("/auth/logout/", { refresh });
      }
    } catch {
      console.error("Logout API failed, continuing local logout");
    } finally {
      clearTokens();
      setUser(null);
      // FIXED: Force redirect to the home page upon logout
      window.location.href = "/";
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      if (!localStorage.getItem("accessToken")) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await api.get<unknown, User | { data?: User }>(
          "/auth/me/",
        );
        const userData = "data" in response ? response.data : response;
        if (isUser(userData)) setUser(userData);
      } catch {
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    const handleForcedLogout = () => {
      setUser(null);
      window.location.href = "/";
    };

    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
