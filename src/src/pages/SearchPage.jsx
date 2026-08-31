import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
  RotateCcw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { thesisApi } from "@/api/thesisApi";
import { institutionApi } from "@/api/institutionApi";
import { departmentApi } from "@/api/departmentApi";
import { categoryApi } from "@/api/categoryApi";
import ThesisCard from "@/components/common/ThesisCard";
import { ThesisCardGridSkeleton } from "@/components/common/Skeletons";
import { EmptyState, ErrorState } from "@/components/common/EmptyState";
import { useDebounce } from "@/hooks/useDebounce";

const PAGE_SIZE = 9;

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);

  const search = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 500);

  const institutionId = searchParams.get("institution") || "";
  const departmentId = searchParams.get("department") || "";
  const categoryId = searchParams.get("category") || "";
  const year = searchParams.get("year") || "";
  const sort = searchParams.get("sort") || "newest";

  // Sync debounced search into URL
  useEffect(() => {
    if (debouncedSearch !== search) {
      setPage(1);
      const next = new URLSearchParams(searchParams);
      if (debouncedSearch) next.set("search", debouncedSearch);
      else next.delete("search");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => setSearchInput(search), [search]);

  const { data: institutions } = useQuery({
    queryKey: ["institutions"],
    queryFn: () => institutionApi.list(),
  });
  const { data: departments } = useQuery({
    queryKey: ["departments", institutionId],
    queryFn: () => departmentApi.list({ institutionId }),
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.list(),
  });

  const queryArgs = {
    search: search || undefined,
    institutionId: institutionId || undefined,
    departmentId: departmentId || undefined,
    categoryId: categoryId || undefined,
    year: year ? Number(year) : undefined,
    sort,
    page,
    pageSize: PAGE_SIZE,
    status: "published",
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["theses", queryArgs],
    queryFn: () => thesisApi.list(queryArgs),
    placeholderData: (prev) => prev,
  });

  const setParam = (key, value) => {
    setPage(1);
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
    setSearchInput("");
    setPage(1);
  };

  const activeFilters = [
    institutionId && {
      key: "institution",
      label: institutions?.find((i) => i.id === institutionId)?.name,
    },
    departmentId && {
      key: "department",
      label: departments?.find((d) => d.id === departmentId)?.name,
    },
    categoryId && {
      key: "category",
      label: categories?.find((c) => c.id === categoryId)?.name,
    },
    year && { key: "year", label: year },
  ].filter(Boolean);

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => now - i);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Explore research
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search the repository by title, author, supervisor, keyword or
          abstract.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search theses…"
          className="h-12 pl-10 text-base shadow-sm"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Filters */}
        <aside className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </h2>
            {(activeFilters.length > 0 || search) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 text-xs"
              >
                <RotateCcw className="h-3 w-3" /> Clear
              </Button>
            )}
          </div>

          <FilterSelect
            label="Institution"
            value={institutionId}
            onChange={(v) => setParam("institution", v)}
            options={institutions}
          />
          <FilterSelect
            label="Department"
            value={departmentId}
            onChange={(v) => setParam("department", v)}
            options={departments}
            placeholder={
              institutionId ? "All departments" : "Select institution first"
            }
          />
          <FilterSelect
            label="Category"
            value={categoryId}
            onChange={(v) => setParam("category", v)}
            options={categories}
          />
          <FilterSelect
            label="Year"
            value={year}
            onChange={(v) => setParam("year", v)}
            options={years.map((y) => ({ id: String(y), name: String(y) }))}
          />

          {/* Sort + view */}
          <div className="space-y-2 border-t pt-4">
            <label className="text-xs font-medium text-muted-foreground">
              Sort by
            </label>
            <Select value={sort} onValueChange={(v) => setParam("sort", v)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="views">Most viewed</SelectItem>
                <SelectItem value="downloads">Most downloaded</SelectItem>
                <SelectItem value="title">Title (A–Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </aside>

        {/* Results */}
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {data
                  ? `${data.count} ${data.count === 1 ? "result" : "results"}`
                  : "Loading…"}
              </span>
              {activeFilters.map((f) => (
                <Badge key={f.key} variant="secondary" className="gap-1 pr-1">
                  {f.label}
                  <button
                    onClick={() => setParam(f.key, "")}
                    className="rounded-sm hover:bg-background/50"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-md border p-0.5">
              <Button
                size="icon"
                variant={view === "grid" ? "secondary" : "ghost"}
                className="h-8 w-8"
                onClick={() => setView("grid")}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant={view === "list" ? "secondary" : "ghost"}
                className="h-8 w-8"
                onClick={() => setView("list")}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isError ? (
            <ErrorState onRetry={refetch} />
          ) : isLoading ? (
            <ThesisCardGridSkeleton count={6} />
          ) : data.results.length === 0 ? (
            <EmptyState
              title="No theses found"
              description="Try adjusting your search terms or clearing filters."
              action={
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : view === "grid" ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {data.results.map((t) => (
                <ThesisCard key={t.id} thesis={t} />
              ))}
            </div>
          ) : (
            <div className="divide-y rounded-xl border">
              {data.results.map((t) => (
                <Link
                  key={t.id}
                  to={`/thesis/${t.slug}`}
                  className="block p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-medium text-foreground line-clamp-1">
                        {t.title}
                      </h3>
                      <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                        {t.abstract}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t.author} · {t.institutionName} · {t.departmentName} ·{" "}
                        {new Date(t.publicationDate).getFullYear()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground">
                      <span>{t.views.toLocaleString()} views</span>
                      <span>{t.downloads.toLocaleString()} dl</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {data.page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "All",
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Select
        value={value || "__all"}
        onValueChange={(v) => onChange(v === "__all" ? "" : v)}
      >
        <SelectTrigger className="h-9">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">{placeholder}</SelectItem>
          {(options || []).map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
