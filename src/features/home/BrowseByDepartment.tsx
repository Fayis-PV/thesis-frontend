import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  TrendingUp,
  Search,
  ArrowUpRight,
  BookOpen,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { useDepartments } from "@/features/departments/hooks/useDepartments";
import type { Department } from "@/types/api";

type SortMode = "views" | "theses" | "alphabetical";

export const BrowseByDepartment = () => {
  const navigate = useNavigate();
  const { data: departments, isLoading } = useDepartments();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("views");

  const institutionName = (inst: Department["institution"]): string => {
    if (!inst) return "Research Institute";
    if (typeof inst === "string") return inst;
    return inst.name;
  };

  const filteredAndSortedDepartments = useMemo(() => {
    if (!departments) return [];

    let list = [...departments];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.topics?.some((t) => t.toLowerCase().includes(q)) ||
          institutionName(d.institution).toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      if (sortMode === "views") {
        return (b.totalViews ?? 0) - (a.totalViews ?? 0);
      }
      if (sortMode === "theses") {
        return (b.thesesCount ?? 0) - (a.thesesCount ?? 0);
      }
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [departments, searchQuery, sortMode]);

  const handleSelectDepartment = (dept: Department) => {
    // Navigate to /search filtered by this department and sorted by views descending
    navigate(
      `/search?department=${encodeURIComponent(dept.id)}&ordering=-view_count`,
    );
  };

  return (
    <section
      id="departments-section"
      className="py-20 bg-background border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border/80">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2 flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span>Academic Faculties & Laboratories</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground text-balance">
              Browse Research by Department
            </h2>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed text-balance">
              Examine doctoral dissertations and research archives across disciplines.
              Select any department to filter its collection and discover its most-consulted works.
            </p>
          </div>

          {/* Quick Stats Pill Replacement: Clean inline counter */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
            <span className="font-mono tabular-nums font-semibold text-foreground text-sm">
              {filteredAndSortedDepartments.length}
            </span>
            <span>Departments Listed</span>
            <span aria-hidden="true">·</span>
            <span className="text-primary font-medium">Sorted by Best Works</span>
          </div>
        </div>

        {/* Toolbar: Search & Segmented Sort Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Department Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by faculty, code (e.g. CSAI), or research area…"
              className="h-10 w-full pl-10 pr-4 text-sm bg-card border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          {/* Segmented Controls for Sorting */}
          <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg border border-border self-start sm:self-auto">
            <span className="text-xs text-muted-foreground px-2 font-medium hidden md:inline-flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3" /> Sort:
            </span>
            <button
              type="button"
              onClick={() => setSortMode("views")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                sortMode === "views"
                  ? "bg-card text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Highest Readership
            </button>
            <button
              type="button"
              onClick={() => setSortMode("theses")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                sortMode === "theses"
                  ? "bg-card text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Most Theses
            </button>
            <button
              type="button"
              onClick={() => setSortMode("alphabetical")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                sortMode === "alphabetical"
                  ? "bg-card text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              A – Z
            </button>
          </div>
        </div>

        {/* Department Grid */}
        {isLoading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-72 rounded-xl border border-border bg-card/60 p-6 animate-pulse"
              >
                <div className="h-4 bg-muted rounded w-1/4 mb-4" />
                <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                <div className="h-12 bg-muted/70 rounded w-full mb-6" />
                <div className="h-16 bg-muted/50 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredAndSortedDepartments.length === 0 ? (
          <div className="mt-10 p-12 text-center border border-dashed border-border rounded-xl bg-card">
            <Building2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-display text-lg font-medium text-foreground">
              No matching departments found
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Try adjusting your filter keyword or search term to discover academic units.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-4 text-xs font-medium text-primary hover:underline"
            >
              Reset department filter
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedDepartments.map((dept) => {
              const formattedViews = (dept.totalViews ?? 0).toLocaleString();
              const thesesCount = dept.thesesCount ?? 20;

              return (
                <div
                  key={dept.id}
                  onClick={() => handleSelectDepartment(dept)}
                  className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-primary/20"
                >
                  <div>
                    {/* Top Kicker: Department Code & Institution (Zero-Pill: Clean unboxed metadata) */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-mono font-semibold text-primary">
                          {dept.code}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">
                          {institutionName(dept.institution)}
                        </span>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
                    </div>

                    {/* Department Title */}
                    <h3 className="font-display text-xl font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                      {dept.name}
                    </h3>

                    {/* Department Description */}
                    {dept.description && (
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {dept.description}
                      </p>
                    )}

                    {/* Topics list */}
                    {dept.topics && dept.topics.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground/80">
                        {dept.topics.slice(0, 3).map((topic, i) => (
                          <span key={topic} className="flex items-center gap-2">
                            <span>{topic}</span>
                            {i < 2 && <span aria-hidden="true" className="text-border">·</span>}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Top Thesis Highlight Box */}
                    {dept.topThesis && (
                      <div className="mt-4 pt-3 border-t border-border/60">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-accent" />
                            <span>Top Read Thesis</span>
                          </span>
                          <span className="font-mono tabular-nums text-foreground/80 lowercase">
                            {dept.topThesis.views.toLocaleString()} views
                          </span>
                        </div>
                        <p className="text-xs font-serif italic text-foreground/90 line-clamp-1 group-hover:text-primary transition-colors">
                          "{dept.topThesis.title}"
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          By {dept.topThesis.author}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Metrics & Action */}
                  <div className="mt-5 pt-4 border-t border-border/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="flex items-center gap-1 font-mono tabular-nums text-foreground font-medium">
                        <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                        {thesesCount} Theses
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 font-mono tabular-nums text-foreground font-medium">
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        {formattedViews} Views
                      </span>
                    </div>

                    <span className="inline-flex items-center text-xs font-medium text-primary group-hover:underline">
                      Best Works
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
