import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { PageHeader, Section, KPICard } from "@/components/admin/AdminShared";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileBarChart,
  FileSpreadsheet,
  FileText,
  Download,
  Calendar,
  Layers,
  GraduationCap,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function ReportsPage() {
  const { t } = useLanguage();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const reportTemplates = [
    {
      id: "annual_digest",
      titleKey: "reports.annualDigest",
      descKey: "reports.annualDigestDesc",
      icon: Calendar,
      format: "PDF & XLSX",
      cohort: "2025-2026 Cohort",
    },
    {
      id: "dept_comparison",
      titleKey: "reports.departmentComparison",
      descKey: "reports.departmentComparisonDesc",
      icon: Layers,
      format: "XLSX",
      cohort: "All Academic Units",
    },
    {
      id: "supervision_audit",
      titleKey: "reports.supervisionAudit",
      descKey: "reports.supervisionAuditDesc",
      icon: GraduationCap,
      format: "PDF",
      cohort: "Faculty Workload",
    },
    {
      id: "velocity_index",
      titleKey: "reports.publicationVelocity",
      descKey: "reports.publicationVelocityDesc",
      icon: Clock,
      format: "CSV",
      cohort: "Submission Cycles",
    },
  ];

  const handleExport = (id: string, _formatName?: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      setDownloadSuccess(id);
      setTimeout(() => setDownloadSuccess(null), 3500);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("reports.title")}
        description={t("reports.subtitle")}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("quick_pdf", "PDF")}
              className="gap-1.5 shadow-2xs"
            >
              <FileText className="h-4 w-4 text-red-500" />
              <span>{t("reports.exportPdf")}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("quick_xlsx", "Excel")}
              className="gap-1.5 shadow-2xs"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>{t("reports.exportExcel")}</span>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Generated Reports"
          value="48"
          icon={FileBarChart}
          iconColor="text-blue-600"
          bgClass="kpi-blue"
          trend="up"
          trendValue="+12%"
          subtitle="This academic semester"
        />
        <KPICard
          title="Export Formats"
          value="PDF / XLSX / CSV"
          icon={FileSpreadsheet}
          iconColor="text-emerald-600"
          bgClass="kpi-emerald"
          subtitle="Standard metadata compliant"
        />
        <KPICard
          title="Audited Theses"
          value="156"
          icon={GraduationCap}
          iconColor="text-amber-600"
          bgClass="kpi-amber"
          subtitle="Full text and citations"
        />
        <KPICard
          title="Review Velocity"
          value="18.4 Days"
          icon={Clock}
          iconColor="text-purple-600"
          bgClass="kpi-purple"
          trend="down"
          trendValue="-2.3 days"
          subtitle="Submission to approval"
        />
      </div>

      <Section
        title={t("reports.reportTemplates")}
        description="Standardized research report templates ready for instant compilation."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTemplates.map((tpl) => {
            const Icon = tpl.icon;
            const isProcessing = downloadingId === tpl.id;
            const isDone = downloadSuccess === tpl.id;

            return (
              <Card
                key={tpl.id}
                className="border border-border/80 shadow-xs hover:border-primary/40 transition-colors"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <CardTitle className="text-base font-heading">
                          {t(tpl.titleKey)}
                        </CardTitle>
                        <span className="text-xs text-muted-foreground font-mono">
                          {tpl.cohort}
                        </span>
                      </div>
                    </div>
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {tpl.format}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-xs leading-relaxed">
                    {t(tpl.descKey)}
                  </CardDescription>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-[11px] text-muted-foreground">
                      Complies with ISO 690 & APA
                    </span>
                    <Button
                      size="sm"
                      variant={isDone ? "default" : "outline"}
                      disabled={isProcessing}
                      onClick={() => handleExport(tpl.id, tpl.format)}
                      className="gap-1.5 h-8 text-xs shadow-2xs"
                    >
                      {isDone ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                          <span>Compiled</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5" />
                          <span>{isProcessing ? t("common.loading") : t("common.export")}</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
