import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BookOpen,
  FileText,
  CheckCircle2,
  Clock,
  FileEdit,
  Eye,
  Download,
  Quote,
  Building2,
  FolderTree,
  Tags,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Upload,
  RefreshCw,
  Sparkles,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/admin/AdminShared";
import { useAnalytics } from "@/features/admin/hooks/useAnalytics";
import { useInstitutions, useDepartments, useCategories } from "@/features/taxonomy/hooks/useTaxonomies";
import { ACADEMIC_THESES } from "@/lib/academic-data";
import type { Thesis } from "@/types/api";

const STATUS_COLORS: Record<string, string> = {
  published: "#10b981", // emerald
  approved: "#3b82f6",  // blue
  under_review: "#8b5cf6", // purple
  submitted: "#f59e0b", // amber
  draft: "#64748b",     // slate
  rejected: "#ef4444",  // red
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Selected filters for the command bar
  const [selectedInstitution, setSelectedInstitution] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [growthMode, setGrowthMode] = useState<"annual" | "cumulative">("annual");
  const [performanceTab, setPerformanceTab] = useState<"views" | "downloads" | "citations">("views");

  // Load analytical and taxonomy queries
  const { isLoading: analyticsLoading, refetch } = useAnalytics();
  const { data: institutions } = useInstitutions();
  const { data: departments } = useDepartments();
  const { data: categories } = useCategories();

  // All local theses for deterministic calculations and fast filtering
  const allTheses: Thesis[] = ACADEMIC_THESES;

  // Filtered dataset based on command bar selections
  const filteredTheses = useMemo(() => {
    return allTheses.filter((thesis) => {
      if (selectedInstitution !== "all") {
        const instId = typeof thesis.institution === "string" ? thesis.institution : thesis.institution?.id;
        if (instId !== selectedInstitution) return false;
      }
      if (selectedDepartment !== "all") {
        const deptId = typeof thesis.department === "string" ? thesis.department : thesis.department?.id;
        if (deptId !== selectedDepartment) return false;
      }
      if (selectedStatus !== "all" && thesis.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [allTheses, selectedInstitution, selectedDepartment, selectedStatus]);

  // Derived KPI metrics
  const totalThesesCount = filteredTheses.length;
  const publishedCount = filteredTheses.filter((t) => t.status === "published").length;
  const approvedCount = filteredTheses.filter((t) => t.status === "approved").length;
  const underReviewCount = filteredTheses.filter((t) => t.status === "under_review").length;
  const submittedCount = filteredTheses.filter((t) => t.status === "submitted").length;
  const draftCount = filteredTheses.filter((t) => t.status === "draft").length;
  const totalViews = filteredTheses.reduce((acc, t) => acc + (t.view_count || 0), 0);
  const totalDownloads = filteredTheses.reduce((acc, t) => acc + (t.download_count || 0), 0);
  const totalCitations = filteredTheses.reduce((acc, t) => acc + (t.citation_count || 0), 0);

  // Status breakdown array for charts
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {
      published: 0,
      approved: 0,
      under_review: 0,
      submitted: 0,
      draft: 0,
      rejected: 0,
    };
    filteredTheses.forEach((t) => {
      const s = (t.status || "draft").toLowerCase();
      if (counts[s] !== undefined) counts[s] += 1;
      else counts.draft += 1;
    });
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({
        name: status.replace("_", " ").toUpperCase(),
        statusKey: status,
        value: count,
        color: STATUS_COLORS[status] || "#94a3b8",
      }));
  }, [filteredTheses]);

  // Research growth by year (derived from actual publication dates & years)
  const growthData = useMemo(() => {
    const yearCounts: Record<number, number> = {};
    filteredTheses.forEach((t) => {
      const y = t.year || new Date(t.created_at).getFullYear() || 2024;
      yearCounts[y] = (yearCounts[y] || 0) + 1;
    });

    const years = Object.keys(yearCounts).map(Number).sort((a, b) => a - b);
    const result: Array<{ year: string; count: number; cumulative: number }> = [];
    let running = 0;
    for (const year of years) {
      const count = yearCounts[year] || 0;
      running += count;
      result.push({
        year: String(year),
        count,
        cumulative: running,
      });
    }
    return result;
  }, [filteredTheses]);

  // Institution analytics ranking
  const institutionRanking = useMemo(() => {
    const map = new Map<string, { id: string; name: string; code: string; count: number; published: number; views: number }>();
    institutions?.forEach((inst) => {
      map.set(inst.id, {
        id: inst.id,
        name: inst.name,
        code: inst.code,
        count: 0,
        published: 0,
        views: 0,
      });
    });

    filteredTheses.forEach((t) => {
      const id = typeof t.institution === "string" ? t.institution : t.institution?.id;
      if (id && map.has(id)) {
        const item = map.get(id)!;
        item.count += 1;
        if (t.status === "published") item.published += 1;
        item.views += (t.view_count || 0);
      }
    });

    return Array.from(map.values())
      .filter((i) => i.count > 0 || institutions?.length)
      .sort((a, b) => b.count - a.count);
  }, [institutions, filteredTheses]);

  // Department analytics ranking
  const departmentRanking = useMemo(() => {
    const map = new Map<string, { id: string; name: string; code: string; count: number; views: number; topTopic?: string }>();
    departments?.forEach((dept) => {
      map.set(dept.id, {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        count: 0,
        views: 0,
        topTopic: dept.topics?.[0] || "Islamic Research",
      });
    });

    filteredTheses.forEach((t) => {
      const id = typeof t.department === "string" ? t.department : t.department?.id;
      if (id && map.has(id)) {
        const item = map.get(id)!;
        item.count += 1;
        item.views += (t.view_count || 0);
      }
    });

    return Array.from(map.values())
      .filter((d) => d.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [departments, filteredTheses]);

  // Category distribution
  const categoryDistribution = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number; views: number }>();
    categories?.forEach((cat) => {
      map.set(cat.id, {
        id: cat.id,
        name: cat.name,
        count: 0,
        views: 0,
      });
    });

    filteredTheses.forEach((t) => {
      const id = typeof t.category === "string" ? t.category : t.category?.id;
      if (id && map.has(id)) {
        const item = map.get(id)!;
        item.count += 1;
        item.views += (t.view_count || 0);
      }
    });

    return Array.from(map.values())
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [categories, filteredTheses]);

  // Supervisor insights aggregation
  const supervisorRanking = useMemo(() => {
    const map = new Map<string, { name: string; count: number; published: number; views: number }>();
    filteredTheses.forEach((t) => {
      const name = t.supervisor_name || "Unassigned";
      if (!map.has(name)) {
        map.set(name, { name, count: 0, published: 0, views: 0 });
      }
      const item = map.get(name)!;
      item.count += 1;
      if (t.status === "published") item.published += 1;
      item.views += (t.view_count || 0);
    });

    return Array.from(map.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredTheses]);

  // Top thesis performance sorted according to selected tab
  const topTheses = useMemo(() => {
    return [...filteredTheses].sort((a, b) => {
      if (performanceTab === "views") return (b.view_count || 0) - (a.view_count || 0);
      if (performanceTab === "downloads") return (b.download_count || 0) - (a.download_count || 0);
      return (b.citation_count || 0) - (a.citation_count || 0);
    }).slice(0, 5);
  }, [filteredTheses, performanceTab]);

  // Language / Content breakdown
  const languageBreakdown = useMemo(() => {
    let arabic = 0;
    let english = 0;
    filteredTheses.forEach((t) => {
      const isAr = /[\u0600-\u06FF]/.test(t.title || "") || t.language === "Arabic";
      if (isAr) arabic++;
      else english++;
    });
    return { arabic, english, total: filteredTheses.length };
  }, [filteredTheses]);

  // Transparent Data Quality Score Calculation
  const dataQualityScore = useMemo(() => {
    if (filteredTheses.length === 0) return 100;
    let totalScore = 0;
    filteredTheses.forEach((t) => {
      let itemScore = 0;
      if (t.title && t.title.length > 5) itemScore += 15;
      if (t.author_name) itemScore += 15;
      if (t.supervisor_name) itemScore += 15;
      if (t.abstract && t.abstract.length > 80) itemScore += 20;
      if (t.department) itemScore += 10;
      if (t.category) itemScore += 10;
      if (t.fileUrl) itemScore += 15;
      totalScore += itemScore;
    });
    return Math.round(totalScore / filteredTheses.length);
  }, [filteredTheses]);

  // Actionable Attention Items
  const attentionItems = useMemo(() => {
    const list = [];
    const pendingTheses = filteredTheses.filter((t) => t.status === "under_review" || t.status === "submitted");
    if (pendingTheses.length > 0) {
      list.push({
        id: "pending",
        title: `${pendingTheses.length} Theses Awaiting Review`,
        desc: "Postgraduate submissions pending faculty committee approval.",
        type: "warning",
        actionText: "Review Now",
        onClick: () => navigate("/admin/theses?status=under_review"),
      });
    }

    const missingDocTheses = filteredTheses.filter((t) => !t.fileUrl && t.status === "published");
    if (missingDocTheses.length > 0) {
      list.push({
        id: "missing_doc",
        title: `${missingDocTheses.length} Published Theses Missing PDF URL`,
        desc: "Records published without an attached dissertation document link.",
        type: "danger",
        actionText: "Inspect",
        onClick: () => navigate("/admin/theses"),
      });
    }

    const drafts = filteredTheses.filter((t) => t.status === "draft");
    if (drafts.length > 0) {
      list.push({
        id: "drafts",
        title: `${drafts.length} Unfinished Draft Records`,
        desc: "Theses saved in draft state that have not yet been submitted.",
        type: "neutral",
        actionText: "View Drafts",
        onClick: () => navigate("/admin/theses?status=draft"),
      });
    }

    return list;
  }, [filteredTheses, navigate]);

  return (
    <div className="space-y-5">
      {/* ─── COMMAND CENTER HEADER & FILTER BAR ────────────────────────── */}
      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
                DRP Repository Command Center
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Monitor research activity, repository growth, academic structure, and thesis performance.
            </p>
          </div>

          {/* Quick Command Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              className="h-8 gap-1.5 text-xs shadow-2xs border-border"
              title="Refresh repository statistics"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${analyticsLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/admin/upload")}
              className="h-8 gap-1.5 text-xs shadow-2xs border-border hidden sm:inline-flex"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Bulk Upload</span>
            </Button>

            <Button
              size="sm"
              onClick={() => navigate("/admin/theses/create")}
              className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Thesis</span>
            </Button>
          </div>
        </div>

        {/* Global Multi-dimensional Filter Bar */}
        <div className="pt-3 border-t border-border/60 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground font-medium flex items-center gap-1 shrink-0">
            <span>Filter Scope:</span>
          </span>

          {/* Institution Filter */}
          <select
            value={selectedInstitution}
            onChange={(e) => setSelectedInstitution(e.target.value)}
            className="h-7.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Filter by Institution"
          >
            <option value="all">All Institutions ({institutions?.length || 5})</option>
            {institutions?.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.code} — {inst.name}
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="h-7.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary max-w-[200px]"
            aria-label="Filter by Department"
          >
            <option value="all">All Departments ({departments?.length || 8})</option>
            {departments?.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-7.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Filter by Status"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="under_review">Under Review</option>
            <option value="submitted">Submitted</option>
            <option value="draft">Draft</option>
            <option value="rejected">Rejected</option>
          </select>

          {(selectedInstitution !== "all" || selectedDepartment !== "all" || selectedStatus !== "all") && (
            <button
              onClick={() => {
                setSelectedInstitution("all");
                setSelectedDepartment("all");
                setSelectedStatus("all");
              }}
              className="text-xs text-primary font-medium hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ─── 4-PILLAR COMMAND ARCHITECTURE NAVIGATION ─────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Pillar 1: Dashboard Summarizes (Active) */}
        <div className="rounded-xl border-2 border-primary/50 bg-primary/5 p-3.5 shadow-2xs relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold font-mono">
                01
              </span>
              <div>
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">Dashboard</p>
                <p className="text-xs text-primary font-semibold">Summarizes</p>
              </div>
            </div>
            <span className="text-[10px] bg-primary/20 text-primary font-medium px-2 py-0.5 rounded-full font-mono">
              Active Center
            </span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground leading-snug">
            Executive bird's-eye synthesis: repository vitals, pipeline velocity, intake bottlenecks, and top impactful works.
          </p>
        </div>

        {/* Pillar 2: Analytics Explains */}
        <div
          onClick={() => navigate("/admin/analytics")}
          className="rounded-xl border border-border bg-card p-3.5 shadow-2xs hover:border-blue-500/50 hover:bg-card/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold font-mono group-hover:bg-blue-600 group-hover:text-white transition-colors">
                02
              </span>
              <div>
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">Analytics</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Explains</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground leading-snug">
            Diagnostic intelligence: reveals *why* citation rates diverge, turnaround velocity, and bilingual discoverability.
          </p>
        </div>

        {/* Pillar 3: Reports Document */}
        <div
          onClick={() => navigate("/admin/reports")}
          className="rounded-xl border border-border bg-card p-3.5 shadow-2xs hover:border-emerald-500/50 hover:bg-card/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                03
              </span>
              <div>
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">Reports</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Documents</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground leading-snug">
            Auditable documentation: Annual Academic Digest, Accreditation Ledgers, Supervisory Workload, and CSV/PDF export.
          </p>
        </div>

        {/* Pillar 4: Management Acts */}
        <div
          onClick={() => navigate("/admin/theses")}
          className="rounded-xl border border-border bg-card p-3.5 shadow-2xs hover:border-purple-500/50 hover:bg-card/80 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold font-mono group-hover:bg-purple-600 group-hover:text-white transition-colors">
                04
              </span>
              <div>
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">Management</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Acts</p>
              </div>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground leading-snug">
            Operational triage: rapid moderation workflows, batch actions, file attachment checks, and publication approvals.
          </p>
        </div>
      </div>

      {/* ─── ROW 1: KPI COMMAND STRIP (7 COMPACT METRICS) ─────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* KPI 1: Total Theses */}
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-medium">
            <span>Total Theses</span>
            <BookOpen className="h-3.5 w-3.5 text-primary" />
          </div>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground font-heading">
            {totalThesesCount.toLocaleString()}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground truncate">
            Across {institutions?.length || 5} institutions
          </p>
        </div>

        {/* KPI 2: Published */}
        <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20 p-3.5 shadow-2xs hover:border-emerald-500/50 transition-colors">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-[11px] font-medium">
            <span>Published</span>
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-900 dark:text-emerald-200 font-heading">
            {publishedCount.toLocaleString()}
          </p>
          <p className="mt-1 text-[10px] text-emerald-700/80 dark:text-emerald-400/80 truncate">
            {totalThesesCount ? Math.round((publishedCount / totalThesesCount) * 100) : 0}% of catalog
          </p>
        </div>

        {/* KPI 3: Under Review */}
        <div
          onClick={() => navigate("/admin/theses?status=under_review")}
          className="rounded-xl border border-amber-200/60 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/20 p-3.5 shadow-2xs hover:border-amber-500/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-[11px] font-medium">
            <span>Under Review</span>
            <Clock className="h-3.5 w-3.5" />
          </div>
          <p className="mt-1 text-2xl font-bold tracking-tight text-amber-900 dark:text-amber-200 font-heading">
            {underReviewCount.toLocaleString()}
          </p>
          <p className="mt-1 text-[10px] text-amber-700/80 dark:text-amber-400/80 truncate font-semibold">
            {underReviewCount > 0 ? "Requires action →" : "All cleared"}
          </p>
        </div>

        {/* KPI 4: Drafts */}
        <div
          onClick={() => navigate("/admin/theses?status=draft")}
          className="rounded-xl border border-border bg-card p-3.5 shadow-2xs hover:border-primary/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-medium">
            <span>Drafts</span>
            <FileEdit className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground font-heading">
            {draftCount.toLocaleString()}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground truncate">
            In-progress items
          </p>
        </div>

        {/* KPI 5: Total Views (Cumulative) */}
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs hover:border-primary/40 transition-colors group relative">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-medium">
            <span>Readership</span>
            <Eye className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground font-heading font-mono">
            {totalViews.toLocaleString()}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground truncate" title="Cumulative page views across public thesis entries">
            Cumulative views
          </p>
        </div>

        {/* KPI 6: Full Downloads (Cumulative) */}
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-medium">
            <span>Downloads</span>
            <Download className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground font-heading font-mono">
            {totalDownloads.toLocaleString()}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground truncate" title="Cumulative PDF downloads">
            Full-text access
          </p>
        </div>

        {/* KPI 7: Citations (Cumulative) */}
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs hover:border-primary/40 transition-colors col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-medium">
            <span>Citations</span>
            <Quote className="h-3.5 w-3.5 text-purple-500" />
          </div>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground font-heading font-mono">
            {totalCitations.toLocaleString()}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground truncate" title="Indexed scholarly citations">
            Academic citations
          </p>
        </div>
      </div>

      {/* ─── REPOSITORY LIFECYCLE INTAKE PIPELINE ─────────────────────── */}
      <Card className="border border-border shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
            <div>
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider font-heading">
                Repository Intake & Dissemination Pipeline
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Progressive lifecycle stages from initial researcher draft to open-access preservation.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/admin/theses")}
              className="h-7 text-xs gap-1 self-start sm:self-auto"
            >
              <span>Manage Pipeline Queue</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3">
            {/* Stage 1: Drafts */}
            <div
              onClick={() => navigate("/admin/theses?status=draft")}
              className="p-3 rounded-lg border border-border/80 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-muted-foreground text-[10px] font-semibold uppercase">
                <span>01. Drafts</span>
                <FileEdit className="h-3.5 w-3.5" />
              </div>
              <p className="mt-1 text-xl font-bold text-foreground font-mono tabular-nums">
                {draftCount}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                In-progress by authors
              </p>
            </div>

            {/* Stage 2: Submitted */}
            <div
              onClick={() => navigate("/admin/theses?status=submitted")}
              className="p-3 rounded-lg border border-amber-200/50 bg-amber-50/20 dark:border-amber-900/30 dark:bg-amber-950/10 hover:border-amber-500/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-[10px] font-semibold uppercase">
                <span>02. Submitted</span>
                <Clock className="h-3.5 w-3.5" />
              </div>
              <p className="mt-1 text-xl font-bold text-amber-900 dark:text-amber-200 font-mono tabular-nums">
                {submittedCount}
              </p>
              <p className="mt-0.5 text-[10px] text-amber-700/80 dark:text-amber-400/80">
                Awaiting intake check
              </p>
            </div>

            {/* Stage 3: Under Review */}
            <div
              onClick={() => navigate("/admin/theses?status=under_review")}
              className="p-3 rounded-lg border border-purple-200/50 bg-purple-50/20 dark:border-purple-900/30 dark:bg-purple-950/10 hover:border-purple-500/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 text-[10px] font-semibold uppercase">
                <span>03. Faculty Review</span>
                <Clock className="h-3.5 w-3.5" />
              </div>
              <p className="mt-1 text-xl font-bold text-purple-900 dark:text-purple-200 font-mono tabular-nums">
                {underReviewCount}
              </p>
              <p className="mt-0.5 text-[10px] text-purple-700/80 dark:text-purple-400/80">
                Committee evaluation
              </p>
            </div>

            {/* Stage 4: Approved */}
            <div
              onClick={() => navigate("/admin/theses?status=approved")}
              className="p-3 rounded-lg border border-blue-200/50 bg-blue-50/20 dark:border-blue-900/30 dark:bg-blue-950/10 hover:border-blue-500/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-blue-700 dark:text-blue-400 text-[10px] font-semibold uppercase">
                <span>04. Approved</span>
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <p className="mt-1 text-xl font-bold text-blue-900 dark:text-blue-200 font-mono tabular-nums">
                {approvedCount}
              </p>
              <p className="mt-0.5 text-[10px] text-blue-700/80 dark:text-blue-400/80">
                Cleared for release
              </p>
            </div>

            {/* Stage 5: Published */}
            <div
              onClick={() => navigate("/admin/theses?status=published")}
              className="p-3 rounded-lg border border-emerald-200/50 bg-emerald-50/20 dark:border-emerald-900/30 dark:bg-emerald-950/10 hover:border-emerald-500/40 transition-colors cursor-pointer col-span-2 sm:col-span-1"
            >
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold uppercase">
                <span>05. Published</span>
                <BookOpen className="h-3.5 w-3.5" />
              </div>
              <p className="mt-1 text-xl font-bold text-emerald-900 dark:text-emerald-200 font-mono tabular-nums">
                {publishedCount}
              </p>
              <p className="mt-0.5 text-[10px] text-emerald-700/80 dark:text-emerald-400/80">
                Open Access & Indexed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── ROW 2: GROWTH OVER TIME & STATUS COMPOSITION ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Research Growth Over Time (2 Columns) */}
        <Card className="lg:col-span-2 border border-border shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-bold text-foreground font-heading flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Repository Research Growth
              </CardTitle>
              <CardDescription className="text-xs">
                Submissions and publication volume across academic cohorts (based on catalog dates).
              </CardDescription>
            </div>

            {/* Growth Mode Toggle */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg border border-border bg-muted/50 text-[11px]">
              <button
                type="button"
                onClick={() => setGrowthMode("annual")}
                className={`px-2 py-0.5 rounded font-medium transition-all ${
                  growthMode === "annual" ? "bg-card text-foreground shadow-2xs font-semibold" : "text-muted-foreground"
                }`}
              >
                Annual
              </button>
              <button
                type="button"
                onClick={() => setGrowthMode("cumulative")}
                className={`px-2 py-0.5 rounded font-medium transition-all ${
                  growthMode === "cumulative" ? "bg-card text-foreground shadow-2xs font-semibold" : "text-muted-foreground"
                }`}
              >
                Cumulative
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelStyle={{ fontWeight: "bold" }}
                  />
                  <Area
                    type="monotone"
                    dataKey={growthMode === "annual" ? "count" : "cumulative"}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#growthGrad)"
                    name={growthMode === "annual" ? "Theses Output" : "Total Catalog"}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution (1 Column) */}
        <Card className="border border-border shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold text-foreground font-heading">
              Workflow Status Distribution
            </CardTitle>
            <CardDescription className="text-xs">
              Lifecycle stages of all filtered repository records.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-center">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Clickable Legend */}
            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-border/60 text-[11px]">
              {statusData.map((item) => (
                <button
                  key={item.statusKey}
                  type="button"
                  onClick={() => navigate(`/admin/theses?status=${item.statusKey}`)}
                  className="flex items-center justify-between p-1 rounded hover:bg-muted/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground truncate">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-foreground ml-1">{item.value}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── ROW 3: ATTENTION CENTER & DATA QUALITY AUDIT ─────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Admin Attention Center (2 Columns) */}
        <Card className="md:col-span-2 border border-border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <CardTitle className="text-sm font-bold text-foreground font-heading">
                  Needs Administrator Attention
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                {attentionItems.length} Actionable Items
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Direct administrative triggers to unblock submissions and maintain repository standards.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            {attentionItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                <p className="font-semibold text-foreground">All Submissions in Order</p>
                <p className="text-[11px] mt-0.5">No overdue reviews, drafts, or missing documents require immediate action.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {attentionItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card/60 hover:bg-card transition-colors"
                  >
                    <div>
                      <p className="text-xs font-semibold text-foreground font-heading">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={item.onClick}
                      className="h-7 text-xs gap-1 shadow-2xs shrink-0 self-start sm:self-auto"
                    >
                      <span>{item.actionText}</span>
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Quality & Multilingual Distribution (1 Column) */}
        <Card className="border border-border shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold text-foreground font-heading flex items-center justify-between">
              <span>Metadata Quality Index</span>
              <span className="font-mono text-primary font-bold">{dataQualityScore}%</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Deterministic index based on 8 core academic metadata fields.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${dataQualityScore}%` }}
              />
            </div>

            {/* Language Distribution in catalog */}
            <div className="p-3 rounded-lg border border-border/70 bg-muted/30 space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span>Language Composition</span>
                <span className="text-[10px] text-muted-foreground font-mono">Bilingual Archive</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Arabic Content:
                </span>
                <span className="font-mono font-bold text-foreground">
                  {languageBreakdown.arabic} ({Math.round((languageBreakdown.arabic / (languageBreakdown.total || 1)) * 100)}%)
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  English Content:
                </span>
                <span className="font-mono font-bold text-foreground">
                  {languageBreakdown.english} ({Math.round((languageBreakdown.english / (languageBreakdown.total || 1)) * 100)}%)
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/reports")}
              className="w-full h-7.5 text-xs border-border/80 shadow-2xs gap-1"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Generate Audit Report</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ─── ROW 4: ACADEMIC STRUCTURE (INSTITUTIONS & DEPARTMENTS) ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Institution Distribution */}
        <Card className="border border-border shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-bold text-foreground font-heading flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-primary" />
                Contributing Academic Institutions
              </CardTitle>
              <CardDescription className="text-xs">
                Theses distribution, publication rate, and engagement across partner universities.
              </CardDescription>
            </div>
            <Link to="/admin/institutions" className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5">
              <span>All Institutions</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="space-y-2.5">
              {institutionRanking.map((inst, index) => (
                <div
                  key={inst.id}
                  onClick={() => navigate(`/admin/institutions/${inst.id}`)}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:border-primary/40 hover:bg-card/80 transition-all cursor-pointer group"
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <span className="font-mono text-xs text-muted-foreground w-4">
                      #{index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {inst.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Code: <span className="font-mono font-medium text-foreground">{inst.code}</span> • Published: {inst.published}/{inst.count}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right shrink-0">
                    <div>
                      <p className="text-xs font-bold font-mono text-foreground">{inst.count} Theses</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{inst.views.toLocaleString()} views</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Intelligence */}
        <Card className="border border-border shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-bold text-foreground font-heading flex items-center gap-1.5">
                <FolderTree className="h-4 w-4 text-primary" />
                Departmental Research Output
              </CardTitle>
              <CardDescription className="text-xs">
                Academic disciplines ranked by theses volume and research consultation.
              </CardDescription>
            </div>
            <Link to="/admin/departments" className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5">
              <span>All Departments</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="space-y-2.5">
              {departmentRanking.slice(0, 5).map((dept, index) => (
                <div
                  key={dept.id}
                  onClick={() => navigate(`/admin/departments/${dept.id}`)}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:border-primary/40 hover:bg-card/80 transition-all cursor-pointer group"
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <span className="font-mono text-xs text-muted-foreground w-4">
                      #{index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {dept.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        Area: {dept.topTopic}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right shrink-0">
                    <div>
                      <p className="text-xs font-bold font-mono text-foreground">{dept.count} Theses</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{dept.views.toLocaleString()} views</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── ROW 5: RESEARCH CATEGORIES & SUPERVISOR INSIGHTS ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Research Categories Breakdown */}
        <Card className="border border-border shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-bold text-foreground font-heading flex items-center gap-1.5">
                <Tags className="h-4 w-4 text-primary" />
                Research Subject Taxonomy
              </CardTitle>
              <CardDescription className="text-xs">
                Hierarchical classification of Islamic disciplines and inquiry domains.
              </CardDescription>
            </div>
            <Link to="/admin/categories" className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5">
              <span>Taxonomy Tree</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="space-y-2">
              {categoryDistribution.slice(0, 5).map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/admin/categories/${cat.id}`)}
                  className="flex items-center justify-between p-2 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary/60" />
                    <span className="text-xs font-medium text-foreground" dir={/[\u0600-\u06FF]/.test(cat.name) ? "rtl" : "ltr"}>
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                    <span className="font-semibold text-foreground">{cat.count} works</span>
                    <span>•</span>
                    <span>{cat.views.toLocaleString()} visits</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Supervisor / Advisory Insights */}
        <Card className="border border-border shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-bold text-foreground font-heading flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                Faculty Supervision Load
              </CardTitle>
              <CardDescription className="text-xs">
                Top advisors by associated dissertations (academic metadata aggregation only).
              </CardDescription>
            </div>
            <Link to="/admin/analytics" className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5">
              <span>Supervisory Matrix</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="space-y-2">
              {supervisorRanking.map((sup) => (
                <div
                  key={sup.name}
                  onClick={() => navigate(`/admin/theses?search=${encodeURIComponent(sup.name)}`)}
                  className="flex items-center justify-between p-2 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors cursor-pointer group"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate" dir={/[\u0600-\u06FF]/.test(sup.name) ? "rtl" : "ltr"}>
                      {sup.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Published: {sup.published}/{sup.count} dissertations
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold font-mono text-foreground">{sup.count} Theses</span>
                    <p className="text-[10px] text-muted-foreground font-mono">{sup.views.toLocaleString()} views</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── ROW 6: THESIS PERFORMANCE & RECENT ACTIVITY ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top Thesis Performance (2 Columns) */}
        <Card className="lg:col-span-2 border border-border shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-bold text-foreground font-heading">
                Top Thesis Performance
              </CardTitle>
              <CardDescription className="text-xs">
                Ranked by real cumulative repository metrics. Click any thesis to open the dedicated workspace.
              </CardDescription>
            </div>

            {/* Performance Metric Tabs */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg border border-border bg-muted/50 text-[11px]">
              <button
                type="button"
                onClick={() => setPerformanceTab("views")}
                className={`px-2 py-0.5 rounded font-medium transition-all ${
                  performanceTab === "views" ? "bg-card text-foreground shadow-2xs font-semibold" : "text-muted-foreground"
                }`}
              >
                Views
              </button>
              <button
                type="button"
                onClick={() => setPerformanceTab("downloads")}
                className={`px-2 py-0.5 rounded font-medium transition-all ${
                  performanceTab === "downloads" ? "bg-card text-foreground shadow-2xs font-semibold" : "text-muted-foreground"
                }`}
              >
                Downloads
              </button>
              <button
                type="button"
                onClick={() => setPerformanceTab("citations")}
                className={`px-2 py-0.5 rounded font-medium transition-all ${
                  performanceTab === "citations" ? "bg-card text-foreground shadow-2xs font-semibold" : "text-muted-foreground"
                }`}
              >
                Citations
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="divide-y divide-border/60">
              {topTheses.map((thesis, idx) => (
                <div
                  key={thesis.id}
                  onClick={() => navigate(`/admin/theses/${thesis.id}`)}
                  className="py-2.5 flex items-center justify-between gap-4 hover:bg-muted/30 px-1.5 rounded transition-colors cursor-pointer group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="font-mono text-xs font-bold text-muted-foreground mt-0.5 w-5 shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p
                        className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1"
                        dir={/[\u0600-\u06FF]/.test(thesis.title) ? "rtl" : "ltr"}
                      >
                        {thesis.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        By <span className="font-medium text-foreground/90">{thesis.author_name}</span> • Advisor: {thesis.supervisor_name} • {thesis.year}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right font-mono">
                      <span className="text-xs font-bold text-foreground">
                        {performanceTab === "views" && `${(thesis.view_count || 0).toLocaleString()} views`}
                        {performanceTab === "downloads" && `${(thesis.download_count || 0).toLocaleString()} dls`}
                        {performanceTab === "citations" && `${(thesis.citation_count || 0).toLocaleString()} cites`}
                      </span>
                      <p className="text-[10px] text-muted-foreground">{thesis.department?.name || "General"}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Repository Activity (1 Column) */}
        <Card className="border border-border shadow-xs flex flex-col justify-between">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-sm font-bold text-foreground font-heading">
                Recent Submissions
              </CardTitle>
              <CardDescription className="text-xs">
                Latest theses logged in the repository.
              </CardDescription>
            </div>
            <Link to="/admin/theses" className="text-xs text-primary font-medium hover:underline">
              View All
            </Link>
          </CardHeader>
          <CardContent className="p-4 pt-1 flex-1">
            <div className="space-y-3">
              {filteredTheses.slice(0, 4).map((thesis) => (
                <div
                  key={thesis.id}
                  onClick={() => navigate(`/admin/theses/${thesis.id}`)}
                  className="p-2.5 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors cursor-pointer group space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={thesis.status} size="sm" />
                    <span className="text-[10px] text-muted-foreground font-mono">{thesis.year || "2025"}</span>
                  </div>
                  <p
                    className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1"
                    dir={/[\u0600-\u06FF]/.test(thesis.title) ? "rtl" : "ltr"}
                  >
                    {thesis.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {thesis.author_name} • {thesis.department?.name || "Department"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
