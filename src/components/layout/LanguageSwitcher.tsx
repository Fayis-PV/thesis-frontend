import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "badge" | "button";
}

export function LanguageSwitcher({
  className,
  variant = "button",
}: LanguageSwitcherProps) {
  const { lang, setLang } = useLanguage();

  const toggleLanguage = () => {
    setLang(lang === "en" ? "ar" : "en");
  };

  if (variant === "badge") {
    return (
      <button
        onClick={toggleLanguage}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          className
        )}
        aria-label={lang === "en" ? "Switch to Arabic language" : "التبديل إلى اللغة الإنجليزية"}
        title={lang === "en" ? "العربية (Arabic)" : "English"}
      >
        <Globe className="h-3 w-3 text-muted-foreground" />
        <span className="font-semibold">{lang === "en" ? "العربية" : "EN"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        "flex h-9 items-center gap-1.5 rounded-md border border-border/70 bg-card px-2.5 py-1 text-xs font-semibold text-foreground transition-all hover:bg-accent/15 hover:border-border active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring shadow-2xs",
        className
      )}
      aria-label={lang === "en" ? "Switch to Arabic language" : "التبديل إلى اللغة الإنجليزية"}
      title={lang === "en" ? "التبديل إلى العربية" : "Switch to English"}
    >
      <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
      <span>{lang === "en" ? "عربي" : "English"}</span>
      <span className="rounded bg-muted px-1 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
        {lang}
      </span>
    </button>
  );
}
