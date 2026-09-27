import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import { Database, AlertTriangle, CheckCircle2 } from "lucide-react";

interface DemoModeIndicatorProps {
  className?: string;
  variant?: "pill" | "banner";
}

export function DemoModeIndicator({
  className,
  variant = "pill",
}: DemoModeIndicatorProps) {
  const { t } = useLanguage();

  // Detect whether mock data mode is active
  const isDemo =
    import.meta.env.VITE_USE_MOCK_DATA === "true" ||
    import.meta.env.DEV ||
    !import.meta.env.API_URL;

  if (variant === "banner" && isDemo) {
    return (
      <aside
        aria-label="Simulation notice"
        className="demo-banner border-b px-4 py-1.5 text-center text-xs font-semibold tracking-wide flex items-center justify-center gap-2"
      >
        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
        <span>
          {t("common.demoModeLabel")} — {t("common.mockModeDesc")}
        </span>
      </aside>
    );
  }

  if (variant === "banner") {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-colors",
        isDemo
          ? "border-amber-300/70 bg-amber-50/80 text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300"
          : "border-emerald-300/70 bg-emerald-50/80 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300",
        className
      )}
      title={
        isDemo
          ? "Running in Mock/Demo Mode with simulated academic data"
          : "Connected to live Django REST API backend"
      }
    >
      {isDemo ? (
        <>
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <Database className="h-3 w-3 opacity-70" />
          <span>{t("common.demoModeLabel")}</span>
        </>
      ) : (
        <>
          <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          <span>{t("common.liveApiLabel")}</span>
        </>
      )}
    </div>
  );
}
