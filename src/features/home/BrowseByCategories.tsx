import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  ArrowRight,
  Eye,
  BookOpen,
  Sparkles,
  SlidersHorizontal,
  Search,
} from "lucide-react";
import { useCategories } from "@/features/categories/hooks/useCategories";
import type { ThesisCategory } from "@/types/api";

type CategorySort = "visits" | "theses" | "name";

export const BrowseByCategories = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading } = useCategories();
  const [sortOption, setSortOption] = useState<CategorySort>("visits");
  const [filterQuery, setFilterQuery] = useState("");

  const sortedCategories = useMemo(() => {
    if (!categories) return [];

    let list = [...categories];

    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.featuredTopic?.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      if (sortOption === "visits") {
        return (b.visits ?? 0) - (a.visits ?? 0);
      }
      if (sortOption === "theses") {
        return (b.thesesCount ?? 0) - (a.thesesCount ?? 0);
      }
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [categories, sortOption, filterQuery]);

  const handleSelectCategory = (cat: ThesisCategory) => {
    // Navigate to /search filtered by this category and sorted by views descending
    navigate(
      `/search?category=${encodeURIComponent(cat.id)}&ordering=-view_count`,
    );
  };

  return (
    <section
      id="categories-section"
      className="py-20 bg-muted/20 border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border/80">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2 flex items-center gap-2">
              <Compass className="h-3.5 w-3.5 text-accent" />
              <span>Research Taxonomy & Inquiry Domains</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground text-balance">
              Top Disciplines by Global Readership
            </h2>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed text-balance">
              Specialized research fields ranked by academic consultations and visitor engagement.
              Discover groundbreaking contributions ordered by view impact.
            </p>
          </div>
        </div>

        {/* Toolbar: Category Search & Segmented Sort Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search disciplines or research topics…"
              className="h-10 w-full pl-10 pr-4 text-sm bg-card border border-border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          {/* Quick Segmented Controls for Category Ranking */}
          <div className="flex items-center gap-1 p-1 bg-card rounded-lg border border-border shrink-0 self-start sm:self-auto">
            <span className="text-xs text-muted-foreground px-2 font-medium hidden sm:inline-flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3" /> Sort:
            </span>
            <button
              type="button"
              onClick={() => setSortOption("visits")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                sortOption === "visits"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Most Visits
            </button>
            <button
              type="button"
              onClick={() => setSortOption("theses")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                sortOption === "theses"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Most Theses
            </button>
            <button
              type="button"
              onClick={() => setSortOption("name")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                sortOption === "name"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              A – Z
            </button>
          </div>
        </div>

        {/* Category Cards Display */}
        {isLoading ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-xl border border-border bg-card p-5 animate-pulse"
              >
                <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                <div className="h-10 bg-muted/60 rounded w-full mb-3" />
                <div className="h-4 bg-muted/40 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : sortedCategories.length === 0 ? (
          <div className="mt-8 p-10 text-center border border-dashed border-border rounded-xl bg-card">
            <p className="text-sm text-muted-foreground">
              No academic categories found.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {sortedCategories.map((cat, index) => {
              const rank = (index + 1).toString().padStart(2, "0");
              const visitsFormatted = (cat.visits ?? 0).toLocaleString();
              const thesesCount = cat.thesesCount ?? 20;

              return (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-primary/20"
                >
                  <div>
                    {/* Header Row: Rank & Metrics */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2.5">
                      <span className="font-mono text-xs font-medium text-accent">
                        #{rank}
                      </span>
                      <div className="flex items-center gap-1 font-mono tabular-nums text-foreground/80 font-medium">
                        <Eye className="h-3.5 w-3.5 text-accent" />
                        <span>{visitsFormatted} visits</span>
                      </div>
                    </div>

                    {/* Category Title */}
                    <h3 className="font-display text-lg font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                      {cat.name}
                    </h3>

                    {/* Category Description */}
                    {cat.description && (
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>
                    )}

                    {/* Featured Topic / Kicker */}
                    {cat.featuredTopic && (
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Sparkles className="h-3 w-3 text-accent shrink-0" />
                        <span className="truncate">{cat.featuredTopic}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Works Count & Action */}
                  <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground font-mono tabular-nums">
                      <BookOpen className="h-3 w-3" />
                      {thesesCount} works
                    </span>

                    <span className="inline-flex items-center gap-1 font-medium text-primary group-hover:translate-x-0.5 transition-transform">
                      <span>Explore</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Global Action Banner */}
        <div className="mt-12 rounded-xl border border-border/80 bg-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div>
            <h4 className="font-display text-xl font-medium text-foreground">
              Looking for research across all specialized fields?
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Filter by supervisor, institution, publication year, and full-text abstracts in the central catalog.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/search?ordering=-view_count")}
            className="px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            Browse All Theses by Most Viewed
          </button>
        </div>
      </div>
    </section>
  );
};
