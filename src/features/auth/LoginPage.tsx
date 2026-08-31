import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form"; // Note: adjust to your exact react-hook-form imports
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { api } from "@/lib/api";
import { setTokens } from "@/lib/auth-utils";
import { useAuth } from "./AuthContext";
import type { APIResponse, User } from "@/types/api";

// 1. Define the Zod Schema for strict validation
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type LoginResponse = APIResponse<{
  access: string;
  refresh: string;
  user: User;
}>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, isAuthenticated, isLoading } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  // 2. Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Where to send the user after logging in (defaults to /admin)
  const from = location.state?.from?.pathname || "/admin";

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to={from} replace />;

  // 3. The Submit Handler
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setServerError(null);

      // The interceptor unwraps the outer Axios response, leaving our APIResponse
      const response = await api.post<unknown, LoginResponse>(
        "/auth/login/",
        data,
      );

      if (response.success) {
        // response.data contains the { access, refresh, user } dictionary we built in Django
        const { access, refresh, user } = response.data;

        setTokens(access, refresh);
        setUser(user);

        // Redirect them to where they were trying to go
        navigate(from, { replace: true });
      } else {
        throw new Error(
          response.message || "Invalid token response from server",
        );
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      setServerError(err.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access the Thesis Management System
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register("password")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          {/* Server Error Message */}
          {serverError && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};
