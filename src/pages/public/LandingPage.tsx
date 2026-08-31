import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  ArrowRight,
  BookOpenText,
  Building2,
  FolderTree,
  Eye,
  Download,
  Layers,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const SUGGESTED = [
  "Machine Learning",
  "Quantum Computing",
  "Federated Learning",
  "Photonics",
];

// Mock data fetching - replace with actual API calls
function useMockData() {
  return {
    featured: {
      results: [],
    },
    latest: {
      results: [],
    },
    stats: {
      totalPublished: 0,
      institutions: 0,
      departments: 0,
      totalViews: 0,
      totalDownloads: 0,
    },
    categories: [],
  };
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const { stats, categories } = useMockData();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(q ? `/search?search=${encodeURIComponent(q)}` : "/search");
  };

  const statItems = stats
    ? [
        { label: "Theses", value: stats.totalPublished, icon: BookOpenText },
        { label: "Institutions", value: stats.institutions, icon: Building2 },
        { label: "Departments", value: stats.departments, icon: FolderTree },
        { label: "Total Views", value: stats.totalViews, icon: Eye },
        {
          label: "Total Downloads",
          value: stats.totalDownloads,
          icon: Download,
        },
      ]
    : [];

  const topCategories = (categories || []).slice(0, 6);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--primary)/0.06),transparent)]" />
          <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
            <Badge
              variant="outline"
              className="mb-5 border-primary/20 bg-primary/5 text-primary"
            >
              <Layers className="mr-1.5 h-3 w-3" /> Academic Research Repository
            </Badge>
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Discover scholarly theses from{" "}
              <span className="text-primary">leading institutions</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Explore the comprehensive postgraduate research archives,
              featuring groundbreaking theses across disciplines and
              institutions.
            </p>
            <form
              onSubmit={submit}
              className="mx-auto mt-8 flex max-w-2xl items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by title, author, keyword, or abstract…"
                  className="h-12 pl-10 text-base shadow-sm"
                />
              </div>
              <Button type="submit" size="lg" className="h-12">
                Search
              </Button>
            </form>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Suggested:</span>
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() =>
                    navigate(`/search?search=${encodeURIComponent(s)}`)
                  }
                  className="rounded-full border bg-background px-3 py-1 text-xs transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b bg-muted/20">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
            {statItems.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-4 py-8 text-center">
                    <div className="mx-auto mb-2 h-8 w-16 animate-pulse rounded bg-muted" />
                    <div className="mx-auto h-4 w-20 animate-pulse rounded bg-muted" />
                  </div>
                ))
              : statItems.map((s) => (
                  <div key={s.label} className="px-4 py-8 text-center">
                    <s.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                    <p className="font-display text-2xl font-semibold">
                      {s.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
          </div>
        </section>

        {/* Categories */}
        <section className="border-y bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Browse by category
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Explore research organised by discipline
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topCategories.map((c: any) => (
                <Link
                  key={c.id}
                  to={`/search?category=${c.id}`}
                  className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-medium group-hover:text-primary">
                      {c.name}
                    </h3>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{c.slug}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
