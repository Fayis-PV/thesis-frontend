import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { BookOpen, Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export default function Login() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPwd, setShowPwd] = useState(false);
  const [serverError, setServerError] = useState("");

  const from = location.state?.from || "/admin";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@repository.edu", password: "password" },
  });

  const onSubmit = async (values) => {
    setServerError("");
    try {
      await login(values);
      toast.success("Welcome back");
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message || "Invalid credentials");
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — branding */}
      <div className="relative hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <div className="absolute inset-0 -z-10 opacity-10 [background:repeating-linear-gradient(0deg,transparent,transparent_39px,hsl(var(--primary-foreground))_40px),repeating-linear-gradient(90deg,transparent,transparent_39px,hsl(var(--primary-foreground))_40px)]" />
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground text-primary">
            <BookOpen className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display text-base font-semibold">Scholarum</p>
            <p className="text-[11px] opacity-70">Thesis Repository</p>
          </div>
        </Link>
        <div>
          <ShieldCheck className="mb-4 h-8 w-8 opacity-80" />
          <h1 className="font-display text-3xl font-semibold leading-tight">
            Administration Control Panel
          </h1>
          <p className="mt-3 max-w-sm text-sm opacity-80">
            Manage theses, review submissions, oversee institutions and monitor
            repository analytics — all from a single scholarly workspace.
          </p>
        </div>
        <p className="text-xs opacity-60">
          © {new Date().getFullYear()} Scholarum Repository
        </p>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" /> Back to repository
            </Link>
          </Button>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Sign in
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your administrator credentials to continue.
          </p>

          {serverError && (
            <div className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@repository.edu"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Demo credentials are pre-filled. Click sign in to enter the admin
            panel.
          </p>
        </div>
      </div>
    </div>
  );
}
