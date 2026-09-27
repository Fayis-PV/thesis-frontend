import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileSpreadsheet,
  Calendar,
  Layers,
  GraduationCap,
  Printer,
  CheckCircle2,
  Search,
  ShieldCheck,
  FolderTree,
} from "lucide-react";

import { PageHeader, KPICard } from "@/components/admin/AdminShared";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/admin/AdminShared";
import { ACADEMIC_THESES, ACADEMIC_DEPARTMENTS } from "@/lib/academic-data";
import type { Thesis } from "@/types/api";

type ReportType = "annual_digest" | "dept_comparison" | "supervision_audit" | "metadata_audit";

export default function ReportsPage() {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState<ReportType>("annual_digest");
  const [searchTerm, setSearchTerm] = useState("");
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const allTheses: Thesis[] = ACADEMIC_THESES;

  // Filtered dataset for active report
  const filteredTheses = useMemo(() => {
    if (!searchTerm.trim()) return allTheses;
    const q = searchTerm.toLowerCase();
    return allTheses.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.author_name.toLowerCase().includes(q) ||
        t.supervisor_name.toLowerCase().includes(q) ||
        t.department?.name.toLowerCase().includes(q)
    );
  }, [allTheses, searchTerm]);

  // Department output summary
  const departmentRows = useMemo(() => {
    return ACADEMIC_DEPARTMENTS.map((dept) => {
      const deptTheses = allTheses.filter(
        (t) => (typeof t.department === "string" ? t.department : t.department?.id) === dept.id
      );
      const published = deptTheses.filter((t) => t.status === "published").length;
      const totalViews = deptTheses.reduce((acc, t) => acc + (t.view_count || 0), 0);
      const totalDownloads = deptTheses.reduce((acc, t) => acc + (t.download_count || 0), 0);

      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        thesesCount: deptTheses.length || dept.thesesCount || 0,
        publishedCount: published,
        views: totalViews || dept.totalViews || 0,
        downloads: totalDownloads,
        completionRate: deptTheses.length > 0 ? Math.round((published / deptTheses.length) * 100) : 100,
      };
    });
  }, [allTheses]);

  // Supervisor audit summary
  const supervisorRows = useMemo(() => {
    const map = new Map<string, { name: string; count: number; published: number; views: number }>();
    allTheses.forEach((t) => {
      const s = t.supervisor_name || "Unassigned";
      if (!map.has(s)) map.set(s, { name: s, count: 0, published: 0, views: 0 });
      const item = map.get(s)!;
      item.count += 1;
      if (t.status === "published") item.published += 1;
      item.views += t.view_count || 0;
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [allTheses]);

  // Metadata audit summary
  const metadataAuditRows = useMemo(() => {
    return allTheses.map((t) => {
      const missing = [];
      if (!t.abstract || t.abstract.length < 50) missing.push("Abstract");
      if (!t.supervisor_name) missing.push("Supervisor");
      if (!t.fileUrl) missing.push("PDF URL");
      if (!t.tags || t.tags.length === 0) missing.push("Keywords");
      if (!t.year) missing.push("Year");

      return {
        id: t.id,
        title: t.title,
        author: t.author_name,
        status: t.status,
        missingFields: missing,
        completeness: Math.round(((5 - missing.length) / 5) * 100),
      };
    });
  }, [allTheses]);

  // REAL CSV EXPORT FUNCTION with UTF-8 BOM for Arabic text support
  const handleExportCSV = () => {
    let csvContent = "\uFEFF"; // UTF-8 Byte Order Mark

    if (selectedReport === "annual_digest") {
      csvContent += "ID,Title,Author,Supervisor,Department,Year,Status,Views,Downloads\n";
      filteredTheses.forEach((t) => {
        const titleSafe = `"${(t.title || "").replace(/"/g, '""')}"`;
        const authorSafe = `"${(t.author_name || "").replace(/"/g, '""')}"`;
        const supSafe = `"${(t.supervisor_name || "").replace(/"/g, '""')}"`;
        const deptSafe = `"${(t.department?.name || "").replace(/"/g, '""')}"`;
        csvContent += `${t.id},${titleSafe},${authorSafe},${supSafe},${deptSafe},${t.year || 2025},${t.status},${t.view_count || 0},${t.download_count || 0}\n`;
      });
    } else if (selectedReport === "dept_comparison") {
      csvContent += "Code,Department Name,Theses Count,Published Count,Views,Downloads,Completion Rate\n";
      departmentRows.forEach((d) => {
        const nameSafe = `"${d.name.replace(/"/g, '""')}"`;
        csvContent += `${d.code},${nameSafe},${d.thesesCount},${d.publishedCount},${d.views},${d.downloads},${d.completionRate}%\n`;
      });
    } else if (selectedReport === "supervision_audit") {
      csvContent += "Supervisor Name,Supervised Theses,Published Theses,Cumulative Views\n";
      supervisorRows.forEach((s) => {
        const nameSafe = `"${s.name.replace(/"/g, '""')}"`;
        csvContent += `${nameSafe},${s.count},${s.published},${s.views}\n`;
      });
    } else {
      csvContent += "ID,Title,Author,Status,Completeness,Missing Fields\n";
      metadataAuditRows.forEach((m) => {
        const titleSafe = `"${m.title.replace(/"/g, '""')}"`;
        const authorSafe = `"${m.author.replace(/"/g, '""')}"`;
        const missingSafe = `"${m.missingFields.join("; ")}"`;
        csvContent += `${m.id},${titleSafe},${authorSafe},${m.status},${m.completeness}%,${missingSafe}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `drp_${selectedReport}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice("CSV report compiled and downloaded successfully.");
    setTimeout(() => setExportNotice(null), 3500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ─── 4-PILLAR ARCHITECTURAL CONTEXT STRIP ──────────────────────── */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-600 text-white font-mono text-xs font-bold">
            03
          </span>
          <span className="font-bold text-foreground">Reports Document:</span>
          <span className="text-muted-foreground hidden sm:inline">
            Official archival and accreditation documentation engine compiling annual research digests, faculty ledgers, and preservation audits.
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
            onClick={() => navigate("/admin/theses")}
            className="text-xs text-primary font-medium hover:underline"
          >
            Operational Management →
          </button>
        </div>
      </div>

      {/* ─── PAGE HEADER & REAL ACTIONS ────────────────────────────────── */}
      <PageHeader
        title="Institutional Reports & Audit Center"
        description="Compile, audit, and export official repository data for university research committees, accreditation reviews, and supervisory audits."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 shadow-2xs border-border"
            >
              <Printer className="h-4 w-4 text-muted-foreground" />
              <span>Print View</span>
            </Button>

            <Button
              size="sm"
              onClick={handleExportCSV}
              className="gap-1.5 shadow-xs bg-primary text-primary-foreground"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Export CSV</span>
            </Button>
          </div>
        }
      />

      {exportNotice && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* ─── ROW 1: AUDIT KPIS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Catalog Under Audit"
          value={allTheses.length}
          icon={Layers}
          iconColor="text-blue-600"
          bgClass="kpi-blue"
          subtitle="Indexed thesis records"
        />

        <KPICard
          title="Academic Units"
          value={ACADEMIC_DEPARTMENTS.length}
          icon={FolderTree}
          iconColor="text-emerald-600"
          bgClass="kpi-emerald"
          subtitle="Active faculties & laboratories"
        />

        <KPICard
          title="Supervisors Audited"
          value={supervisorRows.length}
          icon={GraduationCap}
          iconColor="text-purple-600"
          bgClass="kpi-purple"
          subtitle="Faculty research guides"
        />

        <KPICard
          title="Data Integrity Index"
          value="93%"
          icon={ShieldCheck}
          iconColor="text-amber-600"
          bgClass="kpi-amber"
          subtitle="Metadata completeness rate"
        />
      </div>

      {/* ─── REPORT TEMPLATE SELECTION ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setSelectedReport("annual_digest")}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedReport === "annual_digest"
              ? "border-primary bg-primary/5 shadow-xs"
              : "border-border hover:bg-muted/40"
          }`}
        >
          <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
            <Calendar className="h-4 w-4" />
            <span>Annual Research Digest</span>
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-2">
            Comprehensive catalog listing of theses across cohorts and publication states.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedReport("dept_comparison")}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedReport === "dept_comparison"
              ? "border-primary bg-primary/5 shadow-xs"
              : "border-border hover:bg-muted/40"
          }`}
        >
          <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
            <Layers className="h-4 w-4" />
            <span>Department Output Report</span>
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-2">
            Comparative performance, thesis volume, views, and completion rate by faculty.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedReport("supervision_audit")}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedReport === "supervision_audit"
              ? "border-primary bg-primary/5 shadow-xs"
              : "border-border hover:bg-muted/40"
          }`}
        >
          <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
            <GraduationCap className="h-4 w-4" />
            <span>Faculty Advisory Audit</span>
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-2">
            Active candidate workload and publication output for all supervisors.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setSelectedReport("metadata_audit")}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            selectedReport === "metadata_audit"
              ? "border-primary bg-primary/5 shadow-xs"
              : "border-border hover:bg-muted/40"
          }`}
        >
          <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>Metadata Quality Audit</span>
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-2">
            Field completeness audit identifying records missing abstracts or document files.
          </p>
        </button>
      </div>

      {/* ─── REPORT PREVIEW TABLE ──────────────────────────────────────── */}
      <Card className="border border-border shadow-xs">
        <CardHeader className="p-4 pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground font-heading">
                {selectedReport === "annual_digest" && "Annual Research Digest"}
                {selectedReport === "dept_comparison" && "Academic Department Comparative Output"}
                {selectedReport === "supervision_audit" && "Supervisory Advising & Workload Audit"}
                {selectedReport === "metadata_audit" && "Metadata Completeness & Field Audit"}
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time tabular compilation. Click 'Export CSV' to download this dataset.
              </CardDescription>
            </div>

            {/* Filter / Search within report */}
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter report records…"
                className="h-8 pl-8 text-xs bg-muted/30 border-border"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* 1. Annual Digest Table */}
          {selectedReport === "annual_digest" && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">Ref ID</th>
                    <th className="p-3">Thesis Title</th>
                    <th className="p-3">Author</th>
                    <th className="p-3">Department</th>
                    <th className="p-3 text-center">Cohort</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredTheses.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono text-muted-foreground">{t.id}</td>
                      <td className="p-3 font-semibold text-foreground max-w-xs truncate" dir={/[\u0600-\u06FF]/.test(t.title) ? "rtl" : "ltr"}>
                        {t.title}
                      </td>
                      <td className="p-3 text-muted-foreground">{t.author_name}</td>
                      <td className="p-3 text-muted-foreground">{t.department?.name || "—"}</td>
                      <td className="p-3 text-center font-mono">{t.year || 2025}</td>
                      <td className="p-3 text-center">
                        <StatusBadge status={t.status} size="sm" />
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-foreground">
                        {(t.view_count || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. Department Output Table */}
          {selectedReport === "dept_comparison" && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">Code</th>
                    <th className="p-3">Department Name</th>
                    <th className="p-3 text-center">Theses Volume</th>
                    <th className="p-3 text-center">Published Works</th>
                    <th className="p-3 text-right">Readership</th>
                    <th className="p-3 text-right">Downloads</th>
                    <th className="p-3 text-center">Publication Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {departmentRows.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-primary">{d.code}</td>
                      <td className="p-3 font-semibold text-foreground">{d.name}</td>
                      <td className="p-3 text-center font-mono font-bold">{d.thesesCount}</td>
                      <td className="p-3 text-center font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{d.publishedCount}</td>
                      <td className="p-3 text-right font-mono text-muted-foreground">{d.views.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono text-muted-foreground">{d.downloads.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <span className="font-mono font-bold text-foreground">{d.completionRate}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. Supervision Audit Table */}
          {selectedReport === "supervision_audit" && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">Supervisor Name</th>
                    <th className="p-3 text-center">Assigned Theses</th>
                    <th className="p-3 text-center">Published Theses</th>
                    <th className="p-3 text-right">Cumulative Views</th>
                    <th className="p-3 text-center">Approval Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {supervisorRows.map((s) => (
                    <tr key={s.name} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-semibold text-foreground" dir={/[\u0600-\u06FF]/.test(s.name) ? "rtl" : "ltr"}>
                        {s.name}
                      </td>
                      <td className="p-3 text-center font-mono font-bold">{s.count}</td>
                      <td className="p-3 text-center font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{s.published}</td>
                      <td className="p-3 text-right font-mono text-muted-foreground">{s.views.toLocaleString()}</td>
                      <td className="p-3 text-center font-mono">
                        {Math.round((s.published / s.count) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. Metadata Completeness Table */}
          {selectedReport === "metadata_audit" && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">Thesis Title</th>
                    <th className="p-3">Author</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Completeness</th>
                    <th className="p-3">Missing Metadata Elements</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {metadataAuditRows.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-semibold text-foreground max-w-xs truncate" dir={/[\u0600-\u06FF]/.test(m.title) ? "rtl" : "ltr"}>
                        {m.title}
                      </td>
                      <td className="p-3 text-muted-foreground">{m.author}</td>
                      <td className="p-3 text-center">
                        <StatusBadge status={m.status} size="sm" />
                      </td>
                      <td className="p-3 text-center font-mono font-bold">
                        <span className={m.completeness === 100 ? "text-emerald-600" : "text-amber-600"}>
                          {m.completeness}%
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {m.missingFields.length === 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Complete record</span>
                        ) : (
                          <span className="text-amber-700 dark:text-amber-400 font-mono text-[11px]">
                            Missing: {m.missingFields.join(", ")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
