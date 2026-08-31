import type { ReactNode } from "react";
import { useAuth } from "@/features/auth/AuthContext";

export const AppInitializer = ({ children }: { children: ReactNode }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
};
