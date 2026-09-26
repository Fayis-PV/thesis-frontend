import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Eye,
  Download,
  Quote,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { usePublicTheses } from "@/features/public-search/hooks/usePublicTheses";
import type { Thesis } from "@/types/api";

export const BestWorksSpotlight = () => {
  const navigate = useNavigate();
  // Fetch theses ordered by view_count descending to show the highest impact works
  const { data, isLoading } = usePublicTheses({
    ordering: "-view_count",
    page: 1,
  });

  const theses: Thesis[] = data?.results?.slice(0, 4) || [];

  return (
    <section
      id="spotlight-section"
      className="py-20 bg-background border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border/80">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-accent" />
              <span>Highest Impact Research</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-foreground text-balance">
              Most Consulted Postgraduate Theses
            </h2>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed text-balance">
              Top doctoral and master's works ranked by global readership, downloads, and academic citations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/search?ordering=-view_count")}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline self-start md:self-auto"
          >
            <span>View all ranked research</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Theses Grid */}
        {isLoading ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-xl border border-border bg-card p-6 animate-pulse"
              >
                <div className="h-4 bg-muted rounded w-1/3 mb-4" />
                <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                <div className="h-16 bg-muted/60 rounded w-full mb-4" />
                <div className="h-4 bg-muted/40 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {theses.map((thesis, idx) => (
              <article
                key={thesis.id}
                className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 sm:p-7 shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                <div>
                  {/* Top Row: Rank & Metrics (Zero-Pill: Clean unboxed metadata) */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-primary">
                        Top Work #{idx + 1}
                      </span>
                      {thesis.department && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-[220px]">
                            {thesis.department.name}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3 font-mono tabular-nums text-foreground/90 font-medium">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5 text-accent" />
                        {(thesis.view_count || 0).toLocaleString()}
                      </span>
                      <span aria-hidden="true" className="text-border">/</span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3.5 w-3.5 text-muted-foreground" />
                        {(thesis.download_count || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-xl sm:text-2xl font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                    <Link to={`/thesis/${thesis.id}`}>
                      {thesis.title}
                    </Link>
                  </h3>

                  {/* Author & Supervisor */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {thesis.author_name}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Advisor: {thesis.supervisor_name}</span>
                    {thesis.year && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {thesis.year}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Abstract preview */}
                  <p className="mt-3.5 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {thesis.abstract}
                  </p>
                </div>

                {/* Bottom Row */}
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    {thesis.citation_count !== undefined && (
                      <span className="flex items-center gap-1 text-muted-foreground font-mono tabular-nums">
                        <Quote className="h-3 w-3" />
                        {thesis.citation_count} citations
                      </span>
                    )}
                    {thesis.page_count && (
                      <span className="flex items-center gap-1 text-muted-foreground font-mono tabular-nums">
                        <BookOpen className="h-3 w-3" />
                        {thesis.page_count} pp.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {thesis.department && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/search?department=${encodeURIComponent(
                              thesis.department?.id || thesis.department?.name || "",
                            )}&ordering=-view_count`,
                          )
                        }
                        className="text-muted-foreground hover:text-primary transition-colors hidden sm:inline-block"
                      >
                        More from Department
                      </button>
                    )}
                    <Link
                      to={`/thesis/${thesis.id}`}
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      <span>Read Abstract</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
