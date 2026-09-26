/**
 * DRP Islamic Thesis Portal — Shared Reusable Admin Components
 * Production-grade foundational UI primitives for academic admin workflows
 */

import type { ReactNode, ComponentType } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  FileX,
  ServerCrash,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Loader2,
} from "lucide-react";

// ─── Status Badge ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  published: {
    label: "Published",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60",
  },
  approved: {
    label: "Approved",
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60",
  },
  submitted: {
    label: "Submitted",
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60",
  },
  under_review: {
    label: "Under Review",
    className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60",
  },
  revision_requested: {
    label: "Revision Requested",
    className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800/60",
  },
  draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-700",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/60",
  },
};

interface StatusBadgeProps {
  status: string;
  labelOverride?: string;
  className?: string;
  size?: "sm" | "md";
}

export const StatusBadge = ({
  status,
  labelOverride,
  className,
  size = "md",
}: StatusBadgeProps) => {
  const { t } = useLanguage();
  const normalized = status.toLowerCase().replace(/\s+/g, "_");
  const cfg = STATUS_CONFIG[normalized] || {
    label: status,
    className: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-700",
  };

  const localizedLabel = labelOverride || t(`status.${normalized}`);
  const finalLabel = localizedLabel !== `status.${normalized}` ? localizedLabel : cfg.label;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium transition-colors",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs",
        cfg.className,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current me-1.5 opacity-70" />
      {finalLabel}
    </span>
  );
};

// ─── Language Badge ──────────────────────────────────────────────────────────

const LANG_COLORS: Record<string, string> = {
  Arabic: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/50",
  English: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/50",
  Malayalam: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/50",
  Urdu: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/50",
};

export const LanguageBadge = ({
  language,
  className,
}: {
  language: string;
  className?: string;
}) => {
  const { t } = useLanguage();
  const colorClass =
    LANG_COLORS[language] ||
    "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";

  const key = `language.${language.toLowerCase()}`;
  const translated = t(key);
  const display = translated !== key ? translated : language;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        colorClass,
        className,
      )}
    >
      {display}
    </span>
  );
};

// ─── Directional Isolation Wrapper ───────────────────────────────────────────

interface BdiProps {
  children: ReactNode;
  className?: string;
  dir?: "ltr" | "rtl";
}

/**
 * Ensures numeric IDs, DOIs, URLs, and emails maintain correct punctuation
 * and direction when rendered inside right-to-left Arabic sentences.
 */
export const Bdi = ({ children, className, dir = "ltr" }: BdiProps) => (
  <bdi
    dir={dir}
    className={cn(
      "inline-block font-mono tracking-tight",
      dir === "ltr" && "ltr-force",
      className,
    )}
  >
    {children}
  </bdi>
);

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KPICardProps {
  title: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
  iconColor?: string;
  bgClass?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  subtitle?: string;
  onClick?: () => void;
  loading?: boolean;
}

export const KPICard = ({
  title,
  value,
  icon: Icon,
  iconColor = "text-primary",
  bgClass = "kpi-blue",
  trend,
  trendValue,
  subtitle,
  onClick,
  loading = false,
}: KPICardProps) => {
  return (
    <Card
      className={cn(
        "border card-hover shadow-sm transition-all",
        bgClass,
        onClick && "cursor-pointer hover:border-primary/40",
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        {loading ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 bg-muted rounded animate-pulse" />
              <div className="h-5 w-5 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-8 w-20 bg-muted rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90">
                {title}
              </p>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/60 shadow-sm border border-border/50">
                <Icon className={cn("h-4 w-4 shrink-0", iconColor)} />
              </span>
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-foreground font-heading">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>

            <div className="mt-2.5 flex items-center justify-between text-xs">
              {trend && trendValue ? (
                <div className="flex items-center gap-1 font-medium">
                  {trend === "up" && (
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  {trend === "down" && (
                    <TrendingDown className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                  )}
                  {trend === "neutral" && (
                    <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span
                    className={cn(
                      trend === "up" && "text-emerald-700 dark:text-emerald-400",
                      trend === "down" && "text-red-700 dark:text-red-400",
                      trend === "neutral" && "text-muted-foreground",
                    )}
                  >
                    {trendValue}
                  </span>
                </div>
              ) : (
                <span />
              )}
              {subtitle && (
                <span className="text-muted-foreground text-[11px] truncate">
                  {subtitle}
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Page Header ──────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  className?: string;
}

export const PageHeader = ({
  title,
  description,
  badge,
  actions,
  breadcrumbs,
  className,
}: PageHeaderProps) => (
  <div className={cn("space-y-2 pb-2", className)}>
    {breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-3xl">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({
  title,
  description,
  icon: Icon = FileX,
  action,
  className,
}: EmptyStateProps) => {
  const { t } = useLanguage();
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-12 text-center",
        className,
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/80 mb-4 border border-border shadow-xs">
        <Icon className="h-8 w-8 text-muted-foreground/70" />
      </div>
      <h3 className="text-base font-semibold text-foreground font-heading">
        {title || t("common.noData")}
      </h3>
      {description && (
        <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

// ─── Error State ──────────────────────────────────────────────────────────────

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({
  title,
  description,
  onRetry,
  className,
}: ErrorStateProps) => {
  const { t } = useLanguage();
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-red-200/60 bg-red-50/30 dark:border-red-900/40 dark:bg-red-950/10 p-12 text-center",
        className,
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 mb-4 shadow-xs">
        <ServerCrash className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold text-foreground font-heading">
        {title || t("common.error")}
      </h3>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
        {description || "Unable to retrieve academic records from the server."}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-5 gap-2 border-border shadow-xs"
          onClick={onRetry}
        >
          <RefreshCw className="h-4 w-4" />
          {t("common.retry")}
        </Button>
      )}
    </div>
  );
};

// ─── Loading State / Spinner ──────────────────────────────────────────────────

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export const LoadingSpinner = ({
  className,
  size = "md",
  label,
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center justify-center gap-2.5 p-4" role="status">
      <Loader2
        className={cn("animate-spin text-primary", sizeClasses[size], className)}
      />
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// ─── Loading Skeletons ────────────────────────────────────────────────────────

export const TableRowSkeleton = ({ cols = 5 }: { cols?: number }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div
          className="h-4 bg-muted/80 rounded animate-pulse"
          style={{ width: `${55 + ((i * 19) % 35)}%` }}
        />
      </td>
    ))}
  </tr>
);

export const KPIGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="border border-border/80 shadow-xs animate-pulse">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-24 bg-muted rounded" />
            <div className="h-6 w-6 bg-muted rounded-md" />
          </div>
          <div className="h-8 w-20 bg-muted rounded" />
          <div className="h-3 w-16 bg-muted rounded" />
        </CardContent>
      </Card>
    ))}
  </div>
);

// ─── Section Container ────────────────────────────────────────────────────────

interface SectionProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const Section = ({
  title,
  description,
  actions,
  children,
  className,
}: SectionProps) => (
  <section className={cn("space-y-4", className)}>
    {(title || actions) && (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
        <div>
          {title && (
            <h2 className="text-lg font-semibold text-foreground font-heading">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    )}
    {children}
  </section>
);

// ─── Filter Bar ───────────────────────────────────────────────────────────────

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  children?: ReactNode;
  className?: string;
}

export const FilterBar = ({
  searchTerm,
  onSearchChange,
  placeholder,
  onClear,
  children,
  className,
}: FilterBarProps) => {
  const { t } = useLanguage();
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-card border border-border rounded-xl p-3 shadow-xs",
        className,
      )}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder || `${t("common.search")}...`}
          className="ps-9 pe-9 h-9 bg-background/80"
        />
        {searchTerm && (
          <button
            onClick={() => {
              onSearchChange("");
              onClear?.();
            }}
            className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 flex-wrap">{children}</div>
      )}
    </div>
  );
};

// ─── Pagination Component ─────────────────────────────────────────────────────

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  className?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  className,
}: PaginationProps) => {
  const { t, isRTL } = useLanguage();

  if (totalPages <= 1) return null;

  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  const startItem = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : null;
  const endItem =
    totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : null;

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 px-1 text-xs text-muted-foreground",
        className,
      )}
    >
      <div>
        {startItem !== null && endItem !== null && totalItems !== undefined ? (
          <span>
            {t("common.showing")} <bdi className="font-semibold text-foreground">{startItem}</bdi>-
            <bdi className="font-semibold text-foreground">{endItem}</bdi> {t("common.of")}{" "}
            <bdi className="font-semibold text-foreground">{totalItems}</bdi> {t("common.results")}
          </span>
        ) : (
          <span>
            {t("common.page")} <bdi className="font-semibold text-foreground">{currentPage}</bdi> {t("common.of")}{" "}
            <bdi className="font-semibold text-foreground">{totalPages}</bdi>
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="h-8 gap-1 px-2.5"
          aria-label={t("common.previous")}
        >
          <PrevIcon className="h-3.5 w-3.5" />
          <span>{t("common.previous")}</span>
        </Button>

        <span className="px-2 font-medium text-foreground">
          {currentPage} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="h-8 gap-1 px-2.5"
          aria-label={t("common.next")}
        >
          <span>{t("common.next")}</span>
          <NextIcon className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};
