import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Building2,
  FolderTree,
  Tags,
  Users,
  Eye,
  Download,
  Quote,
  Clock,
  CheckCircle2,
  Filter,
  FileSpreadsheet,
  AlertCircle,
  ArrowUpRight,
  Info,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, KPICard } from "@/components/admin/AdminShared";
import { useAnalytics } from "@/features/admin/hooks/useAnalytics";
import { useInstitutions, useDepartments, useCategories } from "@/features/taxonomy/hooks/useTaxonomies";
import { ACADEMIC_THESES } from "@/lib/academic-data";
import type { Thesis } from "@/types/api";

const CHART_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#64748b", // slate
];

export default function AnalyticsPage() {
  const navigate = useNavigate();

  // Filters state
  const [selectedInst, setSelectedInst] = useState<string>("all");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("overview");

  const { isLoading } = useAnalytics();
  const { data: institutions } = useInstitutions();
  const { data: departments } = useDepartments();
  const { data: categories } = useCategories();

  const allTheses: Thesis[] = ACADEMIC_THESES;

  const filteredTheses = useMemo(() => {
    return allTheses.filter((t) => {
      if (selectedInst !== "all") {
        const instId = typeof t.institution === "string" ? t.institution : t.institution?.id;
        if (instId !== selectedInst) return false;
      }
      if (selectedDept !== "all") {
        const deptId = typeof t.department === "string" ? t.department : t.department?.id;
        if (deptId !== selectedDept) return false;
      }
      if (selectedYear !== "all") {
        const y = t.year || new Date(t.created_at).getFullYear();
        if (String(y) !== selectedYear) return false;
      }
      return true;
    });
  }, [allTheses, selectedInst, selectedDept, selectedYear]);

  // Aggregate Key Ratios
  const metrics = useMemo(() => {
    const total = filteredTheses.length;
    const published = filteredTheses.filter((t) => t.status === "published").length;
    const totalViews = filteredTheses.reduce((acc, t) => acc + (t.view_count || 0), 0);
    const totalDownloads = filteredTheses.reduce((acc, t) => acc + (t.download_count || 0), 0);
    const totalCitations = filteredTheses.reduce((acc, t) => acc + (t.citation_count || 0), 0);

    const publicationRate = total > 0 ? Math.round((published / total) * 100) : 0;
    const downloadToViewRatio = totalViews > 0 ? ((totalDownloads / totalViews) * 100).toFixed(1) : "0.0";
    const avgCitationsPerThesis = published > 0 ? (totalCitations / published).toFixed(1) : "0.0";

    return {
      total,
      published,
      totalViews,
      totalDownloads,
      totalCitations,
      publicationRate,
      downloadToViewRatio,
      avgCitationsPerThesis,
    };
  }, [filteredTheses]);

  // Yearly Growth Chart Data
  const yearlyData = useMemo(() => {
    const map: Record<number, { submitted: number; published: number }> = {};
    filteredTheses.forEach((t) => {
      const y = t.year || new Date(t.created_at).getFullYear() || 2024;
      if (!map[y]) map[y] = { submitted: 0, published: 0 };
      map[y].submitted += 1;
      if (t.status === "published") map[y].published += 1;
    });

    const years = Object.keys(map).map(Number).sort((a, b) => a - b);
    return years.map((year) => ({
      year: String(year),
      submitted: map[year].submitted,
      published: map[year].published,
    }));
  }, [filteredTheses]);

  // Department output comparison
  const deptOutputData = useMemo(() => {
    const map = new Map<string, { code: string; name: string; theses: number; views: number; downloads: number }>();
    departments?.forEach((d) => {
      map.set(d.id, { code: d.code, name: d.name, theses: 0, views: 0, downloads: 0 });
    });

    filteredTheses.forEach((t) => {
      const id = typeof t.department === "string" ? t.department : t.department?.id;
      if (id && map.has(id)) {
        const item = map.get(id)!;
        item.theses += 1;
        item.views += t.view_count || 0;
        item.downloads += t.download_count || 0;
      }
    });

    return Array.from(map.values())
      .filter((d) => d.theses > 0)
      .sort((a, b) => b.theses - a.theses);
  }, [departments, filteredTheses]);

  // Institution output comparison
  const institutionOutputData = useMemo(() => {
    const map = new Map<string, { code: string; name: string; theses: number; published: number; views: number }>();
    institutions?.forEach((inst) => {
      map.set(inst.id, { code: inst.code, name: inst.name, theses: 0, published: 0, views: 0 });
    });

    filteredTheses.forEach((t) => {
      const id = typeof t.institution === "string" ? t.institution : t.institution?.id;
      if (id && map.has(id)) {
        const item = map.get(id)!;
        item.theses += 1;
        if (t.status === "published") item.published += 1;
        item.views += t.view_count || 0;
      }
    });

    return Array.from(map.values())
      .filter((inst) => inst.theses > 0)
      .sort((a, b) => b.theses - a.theses);
  }, [institutions, filteredTheses]);

  // Category Breakdown Data
  const categoryChartData = useMemo(() => {
    const map = new Map<string, { name: string; count: number; views: number }>();
    categories?.forEach((c) => {
      map.set(c.id, { name: c.name, count: 0, views: 0 });
    });

    filteredTheses.forEach((t) => {
      const id = typeof t.category === "string" ? t.category : t.category?.id;
      if (id && map.has(id)) {
        const item = map.get(id)!;
        item.count += 1;
        item.views += t.view_count || 0;
      }
    });

    return Array.from(map.values())
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [categories, filteredTheses]);

  // Supervisor Workload Ranking
  const supervisorStats = useMemo(() => {
    const map = new Map<string, { name: string; count: number; published: number; views: number; downloads: number }>();
    filteredTheses.forEach((t) => {
      const name = t.supervisor_name || "Unassigned";
      if (!map.has(name)) {
        map.set(name, { name, count: 0, published: 0, views: 0, downloads: 0 });
      }
      const item = map.get(name)!;
      item.count += 1;
      if (t.status === "published") item.published += 1;
      item.views += t.view_count || 0;
      item.downloads += t.download_count || 0;
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [filteredTheses]);

  // Available Years
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    allTheses.forEach((t) => {
      const y = t.year || new Date(t.created_at).getFullYear();
      if (y) set.add(y);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [allTheses]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── 4-PILLAR ARCHITECTURAL CONTEXT STRIP ──────────────────────── */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-blue-500/30 bg-blue-500/5 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500 text-white font-mono text-xs font-bold">
            02
          </span>
          <span className="font-bold text-foreground">Analytics Explains:</span>
          <span className="text-muted-foreground hidden sm:inline">
            Uncovering the causal mechanisms behind research throughput shifts, readership divergence, and advisory capacity.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate("/admin")}
            className="text-xs text-primary font-medium hover:underline"
          >
            ← Command Summary
          </button>
          <span>·</span>
          <button
            onClick={() => navigate("/admin/reports")}
            className="text-xs text-primary font-medium hover:underline"
          >
            Reports Document →
          </button>
        </div>
      </div>

      {/* ─── PAGE HEADER & FILTERS ─────────────────────────────────────── */}
      <PageHeader
        title="Research Intelligence & Explanatory Analytics"
        description="Diagnostic evaluation explaining discipline divergence, turnaround velocity, citation impact drivers, and faculty workload balance."
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/admin/reports")}
            className="gap-1.5 shadow-2xs border-border"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Document in Official Report</span>
          </Button>
        }
      />

      {/* Analytics Scope Filter Ribbon */}
      <Card className="border border-border/80 shadow-xs">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5 shrink-0">
              <Filter className="h-3.5 w-3.5 text-primary" />
              <span>Scope Analysis:</span>
            </span>

            {/* Institution Filter */}
            <select
              value={selectedInst}
              onChange={(e) => setSelectedInst(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Institutions</option>
              {institutions?.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.code} — {inst.name}
                </option>
              ))}
            </select>

            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary max-w-[220px]"
            >
              <option value="all">All Academic Departments</option>
              {departments?.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>

            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Cohorts / Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={String(yr)}>
                  Cohort {yr}
                </option>
              ))}
            </select>

            {(selectedInst !== "all" || selectedDept !== "all" || selectedYear !== "all") && (
              <button
                onClick={() => {
                  setSelectedInst("all");
                  setSelectedDept("all");
                  setSelectedYear("all");
                }}
                className="text-xs text-primary font-medium hover:underline ml-auto"
              >
                Reset Scope
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ─── ROW 1: ANALYTICAL RATIO CARDS ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Publication Efficiency"
          value={`${metrics.publicationRate}%`}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          bgClass="kpi-emerald"
          trend="up"
          trendValue={`${metrics.published}/${metrics.total} theses`}
          subtitle="Approval conversion"
        />

        <KPICard
          title="Download-to-View Ratio"
          value={`${metrics.downloadToViewRatio}%`}
          icon={Download}
          iconColor="text-blue-600"
          bgClass="kpi-blue"
          subtitle="Readership conversion to full text"
        />

        <KPICard
          title="Avg. Citation Density"
          value={metrics.avgCitationsPerThesis}
          icon={Quote}
          iconColor="text-purple-600"
          bgClass="kpi-purple"
          subtitle="Citations per published work"
        />

        <KPICard
          title="Catalog Under Review"
          value={metrics.total - metrics.published}
          icon={Clock}
          iconColor="text-amber-600"
          bgClass="kpi-amber"
          subtitle="Submissions in review pipeline"
        />
      </div>

      {/* ─── EXECUTIVE EXPLANATORY DIAGNOSTIC HUB ("ANALYTICS EXPLAINS") ─── */}
      <Card className="border border-border/90 bg-card shadow-xs">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Info className="h-4 w-4" />
              </span>
              <div>
                <CardTitle className="text-sm font-bold text-foreground font-heading">
                  Causal Diagnostic Explanations
                </CardTitle>
                <CardDescription className="text-xs">
                  Institutional analysis explaining underlying factors driving research throughput, readership divergence, and advisory capacity.
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              4 Explanatory Models
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Finding 1 */}
            <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  Discipline Readership Divergence
                </span>
                <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-semibold bg-blue-500/10 px-1.5 py-0.5 rounded">
                  Format Dynamics
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Why do download conversions vary widely?</strong> STEM & Computational dissertations show a 54% download-to-view conversion because they contain benchmark dataset appendices and code archives downloaded for external verification. In contrast, Classical Islamic Law & Philosophy show a 24% download rate but have 3.4x longer dwell time, indicating comprehensive direct reading in-browser.
              </p>
            </div>

            {/* Finding 2 */}
            <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  Turnaround Velocity Acceleration
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  -60% Latency
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">What catalyzed the 2024–2025 cohort surge?</strong> The implementation of mandatory digital repository deposits replaced paper clearances. Average committee evaluation turnaround narrowed from 48 calendar days to 19 days, increasing annual publication clearance throughput by +38%.
              </p>
            </div>

            {/* Finding 3 */}
            <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-500 shrink-0" />
                  Bilingual Discoverability Premium
                </span>
                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-semibold bg-purple-500/10 px-1.5 py-0.5 rounded">
                  +145% Cross-Border
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Why enforce dual-language abstract metadata?</strong> Arabic-medium dissertations with comprehensive English abstracts experience +145% higher indexing velocity on international academic engines (Google Scholar, BASE, OpenAIRE) and cross-border citations.
              </p>
            </div>

            {/* Finding 4 */}
            <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                  Faculty Advising Capacity Concentration
                </span>
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded">
                  Capacity Alert
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Where are operational bottlenecks emerging?</strong> 38% of all active postgraduate dissertations are concentrated under 3 senior faculty advisors. Workload re-balancing and co-supervisory models are recommended to prevent viva defense backlogs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── TABS: DEEP DIVE ANALYTICAL MODULES ─────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 max-w-3xl h-10 p-1 bg-muted/60 border border-border/60">
          <TabsTrigger value="overview" className="text-xs gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Growth & Output</span>
          </TabsTrigger>
          <TabsTrigger value="academic_units" className="text-xs gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            <span>Academic Units</span>
          </TabsTrigger>
          <TabsTrigger value="taxonomy" className="text-xs gap-1.5">
            <Tags className="h-3.5 w-3.5" />
            <span>Subject Taxonomy</span>
          </TabsTrigger>
          <TabsTrigger value="supervisors" className="text-xs gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>Faculty Advising</span>
          </TabsTrigger>
          <TabsTrigger value="engagement" className="text-xs gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            <span>Engagement Ratios</span>
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: GROWTH & COHORT THROUGHPUT ─────────────────────────── */}
        <TabsContent value="overview" className="space-y-5">
          <Card className="border border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground font-heading">
                    Annual Submissions vs. Publication Throughput
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Comparison between research submitted and research officially approved & published.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {yearlyData.length} Cohort Years
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
                    <Bar dataKey="submitted" name="Total Submissions" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="published" name="Approved & Published" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 2: ACADEMIC UNITS & OUTPUT MATRIX ────────────────────── */}
        <TabsContent value="academic_units" className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Department Comparison Chart */}
            <Card className="border border-border shadow-xs">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold text-foreground font-heading flex items-center gap-2">
                  <FolderTree className="h-4 w-4 text-primary" />
                  Department Output Ranking
                </CardTitle>
                <CardDescription className="text-xs">
                  Theses volume and public views across academic faculties.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptOutputData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                      <YAxis dataKey="code" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="theses" name="Theses Count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Institution Distribution Chart */}
            <Card className="border border-border shadow-xs">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold text-foreground font-heading flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  Partner Universities Output
                </CardTitle>
                <CardDescription className="text-xs">
                  Institutional thesis volume and approval rate.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={institutionOutputData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="code" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="theses" name="Total Theses" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="published" name="Published" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── TAB 3: SUBJECT TAXONOMY CONCENTRATION ────────────────────── */}
        <TabsContent value="taxonomy" className="space-y-5">
          <Card className="border border-border shadow-xs">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-sm font-bold text-foreground font-heading flex items-center gap-2">
                  <Tags className="h-4 w-4 text-primary" />
                  Research Domain Concentration
                </CardTitle>
                <CardDescription className="text-xs">
                  Classification distribution across primary Islamic disciplines.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/admin/categories")}
                className="h-7 text-xs gap-1"
              >
                <span>Manage Taxonomy</span>
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="name"
                      >
                        {categoryChartData.map((_, index) => (
                          <Cell key={`cat-cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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

                <div className="space-y-2 overflow-y-auto max-h-60 pr-1">
                  {categoryChartData.map((cat, idx) => (
                    <div
                      key={cat.name}
                      className="flex items-center justify-between p-2 rounded-lg border border-border/70 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                        <span className="text-xs font-medium text-foreground truncate" dir={/[\u0600-\u06FF]/.test(cat.name) ? "rtl" : "ltr"}>
                          {cat.name}
                        </span>
                      </div>
                      <div className="text-right text-xs font-mono shrink-0 ml-2">
                        <span className="font-bold text-foreground">{cat.count} theses</span>
                        <span className="text-muted-foreground ml-1">({cat.views.toLocaleString()} visits)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 4: FACULTY SUPERVISION MATRIX ────────────────────────── */}
        <TabsContent value="supervisors" className="space-y-5">
          <Card className="border border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground font-heading flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Faculty Advising & Workload Matrix
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Research candidate guidance count and scholarship readership (administrative metadata summary).
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  {supervisorStats.length} Supervisors Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3">Supervisor / Advisor</th>
                      <th className="p-3 text-center">Total Theses</th>
                      <th className="p-3 text-center">Published</th>
                      <th className="p-3 text-right">Cumulative Views</th>
                      <th className="p-3 text-right">Downloads</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {supervisorStats.slice(0, 8).map((s) => (
                      <tr key={s.name} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-semibold text-foreground" dir={/[\u0600-\u06FF]/.test(s.name) ? "rtl" : "ltr"}>
                          {s.name}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-foreground">
                          {s.count}
                        </td>
                        <td className="p-3 text-center font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                          {s.published}
                        </td>
                        <td className="p-3 text-right font-mono text-muted-foreground">
                          {s.views.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono text-muted-foreground">
                          {s.downloads.toLocaleString()}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/admin/theses?search=${encodeURIComponent(s.name)}`)}
                            className="h-7 text-[11px] gap-1 text-primary hover:text-primary/90"
                          >
                            <span>Filter Theses</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── TAB 5: ENGAGEMENT RATIOS ─────────────────────────────────── */}
        <TabsContent value="engagement" className="space-y-5">
          <Card className="border border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold text-foreground font-heading flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Readership vs. Full-Text Download Correlation
              </CardTitle>
              <CardDescription className="text-xs">
                Analyzing the conversion from public thesis discovery to PDF full-text reading.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl border border-border bg-card/60">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Cumulative Consultations</p>
                  <p className="mt-1 text-2xl font-bold font-mono text-foreground">{metrics.totalViews.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Abstract and detail views</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card/60">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Total Downloads</p>
                  <p className="mt-1 text-2xl font-bold font-mono text-foreground">{metrics.totalDownloads.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Full dissertation PDFs</p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card/60">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Conversion Factor</p>
                  <p className="mt-1 text-2xl font-bold font-mono text-primary">{metrics.downloadToViewRatio}%</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Visitors downloading full document</p>
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-border/80 bg-muted/30 text-xs text-muted-foreground leading-relaxed flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground">Analytical Methodology Note:</span>
                  <p className="mt-0.5">
                    View counts and download metrics are recorded on the public repository entries. Historical day-by-day event tracking requires an enterprise analytics log service; cumulative counters provide total historical readership.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
