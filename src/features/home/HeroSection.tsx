import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  BookOpenText,
  Building2,
  FolderTree,
  Eye,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TOTAL_STATS } from "@/lib/academic-data";
import heroImage from "@/assets/layers.png"; 

const SUGGESTED_TOPICS = [
  "Machine Learning",
  "Quantum Computing",
  "Federated Learning",
  "Photonics",
  "Neuromorphic Silicon",
  "Differential Privacy",
];

export const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/search");
    }
  };

  const statItems = [
    {
      label: "Published Theses",
      value: TOTAL_STATS.totalPublished,
      icon: BookOpenText,
      unit: "dissertations",
    },
    {
      label: "Partner Institutions",
      value: TOTAL_STATS.institutions,
      icon: Building2,
      unit: "universities",
    },
    {
      label: "Academic Departments",
      value: TOTAL_STATS.departments,
      icon: FolderTree,
      unit: "faculties",
    },
    {
      label: "Cumulative Readership",
      value: TOTAL_STATS.totalViews,
      icon: Eye,
      unit: "views",
    },
    {
      label: "Full-Text Downloads",
      value: TOTAL_STATS.totalDownloads,
      icon: Download,
      unit: "downloads",
    },
  ];

  return (
    <>
      {/* Editorial Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-card/80 to-background py-20 sm:py-28 lg:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(50%_50%_at_50%_0%,hsl(var(--primary)/0.05),transparent)]" />
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          {/* Clean unboxed kicker (Anti-Slop Zero-Pill discipline) */}
          <p className="text-[8px] sm:text-xs uppercase tracking-widest text-primary font-medium my-3 border w-fit mx-auto px-1.5 py-1 rounded-full bg-primary/5 border-primary/30 flex items-center gap-1.5">
            {/* imgage src/assets/hero.png */}
            <img
              src={heroImage}
              alt="DHIU Logo"
              className="h-3 object-cover float-left"
            />
            DHIU Academic Research Archive & Dissertation Repository
          </p>

          <h1 className="font-display text-4xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            Discover scholarly theses from{" "}
            <span className="text-primary italic">
              Darul Huda Islamic University
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed text-balance">
            Explore open postgraduate research archives, doctoral dissertations,
            and faculty investigations categorized by academic department and
            scholarly discipline.
          </p>

          {/* Central Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto mt-12 flex max-w-2xl items-center gap-2.5"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, supervisor, or keyword…"
                className="h-12 pl-10 text-base shadow-sm bg-card border-border"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-6">
              Search Catalog
            </Button>
          </form>

          {/* Suggested Search Terms */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">Suggested:</span>
            {SUGGESTED_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() =>
                  navigate(`/search?search=${encodeURIComponent(topic)}`)
                }
                className="rounded-md border border-border/80 bg-card/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground hover:bg-card"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </section>
      {/* Operational Statistics Ribbon */}
      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y md:divide-y-0 sm:grid-cols-3 lg:grid-cols-5 border-x border-border">
          {statItems.map((item) => (
            <div key={item.label} className="p-6 text-center bg-card/40">
              <item.icon className="mx-auto mb-2 h-4 w-4 text-primary/80" />
              <p className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-foreground font-mono tabular-nums">
                {item.value.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>{" "}
    </>
  );
};
