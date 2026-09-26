import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, Home } from "lucide-react";

interface BreadcrumbsProps {
  className?: string;
  showHome?: boolean;
}

export function Breadcrumbs({ className, showHome = true }: BreadcrumbsProps) {
  const location = useLocation();
  const { t, isRTL } = useLanguage();
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const pathMap: Record<string, string> = {
    admin: t("breadcrumbs.admin"),
    theses: t("breadcrumbs.theses"),
    create: t("breadcrumbs.create"),
    edit: t("breadcrumbs.edit"),
    institutions: t("breadcrumbs.institutions"),
    departments: t("breadcrumbs.departments"),
    categories: t("breadcrumbs.categories"),
    analytics: t("breadcrumbs.analytics"),
    reports: t("breadcrumbs.reports"),
    upload: t("breadcrumbs.upload"),
    settings: t("breadcrumbs.settings"),
  };

  const segments = location.pathname
    .split("/")
    .filter(Boolean)
    .map((seg, index, arr) => {
      // If segment is an ID or uuid, shorten or label as Details
      const isId = /^[0-9a-f-]{8,}$/i.test(seg) || /^\d+$/.test(seg);
      const label = isId ? `#${seg.slice(0, 6)}` : pathMap[seg] || seg;
      return {
        key: seg,
        label,
        path: "/" + arr.slice(0, index + 1).join("/"),
        isLast: index === arr.length - 1,
      };
    });

  if (segments.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto scrollbar-hidden py-1",
        className
      )}
    >
      {showHome && (
        <span className="flex items-center gap-1.5 shrink-0">
          <Link
            to="/admin"
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            title={t("breadcrumbs.admin")}
            aria-label={t("breadcrumbs.admin")}
          >
            <Home className="h-3.5 w-3.5" />
          </Link>
          <ChevronIcon className="h-3 w-3 opacity-40 shrink-0" aria-hidden="true" />
        </span>
      )}

      {segments.map((seg, i) => (
        <span key={seg.path} className="flex items-center gap-1.5 shrink-0">
          {i > 0 && (
            <ChevronIcon className="h-3 w-3 opacity-40 shrink-0" aria-hidden="true" />
          )}
          {seg.isLast ? (
            <span
              className="font-semibold text-foreground truncate max-w-[200px]"
              aria-current="page"
            >
              {seg.label}
            </span>
          ) : (
            <Link
              to={seg.path}
              className="hover:text-foreground transition-colors truncate max-w-[150px]"
            >
              {seg.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
