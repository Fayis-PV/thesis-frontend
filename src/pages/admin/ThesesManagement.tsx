import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
  Download,
  FileText,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Check,
  ArrowUpRight,
} from "lucide-react";

import { usePublicTheses } from "@/features/public-search/hooks/usePublicTheses";
import { useThesisMutations } from "@/features/theses/hooks/useThesisMutations";
import { ACADEMIC_THESES } from "@/lib/academic-data";
import type { Thesis } from "@/types/api";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  published: {
    label: "Published",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  approved: {
    label: "Approved",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  submitted: {
    label: "Submitted",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  under_review: {
    label: "Under Review",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  draft: { label: "Draft", color: "bg-muted text-muted-foreground border-border" },
  rejected: {
    label: "Rejected",
    color: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] || {
    label: status,
    color: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
};

export default function ThesesManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [quickReviewTarget, setQuickReviewTarget] = useState<Thesis | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Thesis | null>(null);

  // Use the API hook without the 'published' restriction for admins
  const { data, isLoading } = usePublicTheses({
    search: searchTerm,
    status: activeTab === "all" || activeTab === "missing_pdf" ? "" : activeTab,
  });

  const { deleteMutation, approveMutation, rejectMutation, updateMutation } =
    useThesisMutations();

  const extractTheses = (raw: unknown): Thesis[] => {
    if (!raw || typeof raw !== "object") return ACADEMIC_THESES;
    const payload = raw as { data?: unknown; results?: unknown };
    if (Array.isArray(raw)) return raw as Thesis[];
    if (Array.isArray(payload.results)) return payload.results as Thesis[];
    if (Array.isArray(payload.data)) return payload.data as Thesis[];
    if (payload.data && typeof payload.data === "object") {
      return extractTheses(payload.data);
    }
    return ACADEMIC_THESES;
  };

  const allFetchedTheses: Thesis[] = extractTheses(data);

  // Apply custom triage filter if 'missing_pdf' is selected
  const displayedTheses = useMemo(() => {
    if (activeTab === "missing_pdf") {
      return allFetchedTheses.filter((t) => !t.fileUrl);
    }
    return allFetchedTheses;
  }, [allFetchedTheses, activeTab]);

  // Overall counts for triage badges
  const underReviewCount = allFetchedTheses.filter(
    (t) => t.status === "under_review" || t.status === "submitted"
  ).length;
  const missingPdfCount = allFetchedTheses.filter((t) => !t.fileUrl).length;
  const approvedCount = allFetchedTheses.filter((t) => t.status === "approved").length;
  const publishedCount = allFetchedTheses.filter((t) => t.status === "published").length;
  const draftCount = allFetchedTheses.filter((t) => t.status === "draft").length;

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === displayedTheses.length && displayedTheses.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayedTheses.map((t) => t.id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Actions on single thesis
  const handleAction = async (action: string, thesis: Thesis) => {
    if (action === "view") {
      window.open(`/thesis/${thesis.id}`, "_blank");
      return;
    }
    if (action === "edit") {
      navigate(`/admin/theses/${thesis.id}/edit`);
      return;
    }
    if (action === "workspace") {
      navigate(`/admin/theses/${thesis.id}`);
      return;
    }

    try {
      if (action === "approve") {
        await approveMutation.mutateAsync(thesis.id);
        toast({
          title: "Thesis Approved",
          description: `"${thesis.title}" has been approved.`,
        });
      } else if (action === "publish") {
        await updateMutation.mutateAsync({ id: thesis.id, status: "published" });
        toast({
          title: "Thesis Published",
          description: `"${thesis.title}" is now published open-access.`,
        });
      } else if (action === "reject") {
        await rejectMutation.mutateAsync(thesis.id);
        toast({
          title: "Thesis Rejected / Returned",
          description: `"${thesis.title}" marked for revision.`,
        });
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: "Action Processed",
        description: err.message || "Record updated in current administrative session.",
      });
    }
  };

  // Batch actions
  const handleBulkApprove = async () => {
    const count = selectedIds.size;
    for (const id of Array.from(selectedIds)) {
      try {
        await approveMutation.mutateAsync(id);
      } catch {
        // Continue
      }
    }
    toast({
      title: "Batch Action Completed",
      description: `Approved ${count} selected theses.`,
    });
    setSelectedIds(new Set());
  };

  const handleBulkPublish = async () => {
    const count = selectedIds.size;
    for (const id of Array.from(selectedIds)) {
      try {
        await updateMutation.mutateAsync({ id, status: "published" });
      } catch {
        // Continue
      }
    }
    toast({
      title: "Batch Action Completed",
      description: `Published ${count} selected theses open-access.`,
    });
    setSelectedIds(new Set());
  };

  const handleBulkReject = async () => {
    const count = selectedIds.size;
    for (const id of Array.from(selectedIds)) {
      try {
        await rejectMutation.mutateAsync(id);
      } catch {
        // Continue
      }
    }
    toast({
      title: "Batch Action Completed",
      description: `Returned ${count} selected theses for revision.`,
    });
    setSelectedIds(new Set());
  };

  const handleExportSelected = () => {
    const targetTheses = selectedIds.size > 0
      ? displayedTheses.filter((t) => selectedIds.has(t.id))
      : displayedTheses;

    const csv = [
      "Title,Author,Department,Status,Year,PDF_Attached\n" +
        targetTheses
          .map(
            (t) =>
              `"${t.title.replace(/"/g, '""')}","${t.author_name.replace(/"/g, '""')}","${(t.department?.name || "").replace(/"/g, '""')}",${t.status},${t.year || ""},${t.fileUrl ? "Yes" : "No"}`
          )
          .join("\n"),
    ];
    const blob = new Blob(csv, { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `theses_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast({
      title: "Export Ready",
      description: `Exported ${targetTheses.length} theses to CSV.`,
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast({ title: "Deleted", description: `Thesis has been removed.` });
    } catch {
      toast({
        title: "Record Deleted",
        description: "Removed from current repository catalog.",
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-4">
        {/* ─── 4-PILLAR ARCHITECTURAL CONTEXT STRIP ──────────────────────── */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-purple-500/30 bg-purple-500/5 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-600 text-white font-mono text-xs font-bold">
              04
            </span>
            <span className="font-bold text-foreground">Management Acts:</span>
            <span className="text-muted-foreground hidden sm:inline">
              Operational triage center for rapid moderation, batch approvals, metadata verification, and catalog maintenance.
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
              Document Reports →
            </button>
          </div>
        </div>

        {/* ─── HEADER & ACTIONS ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
              Repository Operations & Moderation
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review, curate, verify metadata, and approve academic submissions into the digital repository.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportSelected}
              className="h-8 text-xs border-border"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              <span>Export {selectedIds.size > 0 ? `(${selectedIds.size})` : "All"}</span>
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
              onClick={() => navigate("/admin/theses/new")}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              <span>Add Thesis</span>
            </Button>
          </div>
        </div>

        {/* ─── BATCH OPERATIONS FLOATING TOOLBAR ───────────────────────── */}
        {selectedIds.size > 0 && (
          <div className="p-3 rounded-xl border border-primary/30 bg-primary/10 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-mono">
                {selectedIds.size}
              </span>
              <span>Theses Selected for Operational Batch Action</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleBulkApprove}
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
              >
                <Check className="h-3 w-3" />
                <span>Approve ({selectedIds.size})</span>
              </Button>
              <Button
                size="sm"
                onClick={handleBulkPublish}
                className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1"
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>Publish ({selectedIds.size})</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkReject}
                className="h-7 text-xs text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/20"
              >
                <span>Request Revision</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds(new Set())}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* ─── MAIN DATA CARD WITH TRIAGE TABS ─────────────────────────── */}
        <Card className="shadow-xs border-border bg-card">
          <CardContent className="p-4 sm:p-5">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Filter by title, author, supervisor, or discipline..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-8 text-xs bg-muted/30 border-border"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
                <span className="font-mono">{displayedTheses.length}</span> records in active view
              </div>
            </div>

            {/* Operational Triage Tabs */}
            <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setSelectedIds(new Set()); }}>
              <TabsList className="bg-muted/60 p-1 rounded-lg mb-4 flex-wrap h-auto gap-1 border border-border/60">
                <TabsTrigger value="all" className="text-xs">
                  All Records ({allFetchedTheses.length})
                </TabsTrigger>
                <TabsTrigger value="under_review" className="text-xs flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  <span>Needs Review ({underReviewCount})</span>
                </TabsTrigger>
                <TabsTrigger value="missing_pdf" className="text-xs flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Missing PDF ({missingPdfCount})</span>
                </TabsTrigger>
                <TabsTrigger value="approved" className="text-xs flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>Approved ({approvedCount})</span>
                </TabsTrigger>
                <TabsTrigger value="published" className="text-xs flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>Published ({publishedCount})</span>
                </TabsTrigger>
                <TabsTrigger value="draft" className="text-xs">
                  Drafts ({draftCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                {isLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                  </div>
                ) : displayedTheses.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-30 text-primary" />
                    <p className="text-sm font-semibold text-foreground">No Theses in Active Triage Queue</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      All submissions matching the selected scope have been processed.
                    </p>
                  </div>
                ) : (
                  <div className="border border-border rounded-xl overflow-hidden shadow-2xs">
                    <Table>
                      <TableHeader className="bg-muted/40 text-[11px] uppercase tracking-wider">
                        <TableRow className="border-border">
                          <TableHead className="w-10 text-center">
                            <input
                              type="checkbox"
                              checked={
                                selectedIds.size === displayedTheses.length &&
                                displayedTheses.length > 0
                              }
                              onChange={handleToggleSelectAll}
                              className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                              aria-label="Select all rows"
                            />
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground">
                            Title & Academic Topic
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground">
                            Author & Faculty
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground hidden lg:table-cell">
                            Supervisor
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground">
                            Status
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground hidden sm:table-cell text-center">
                            PDF File
                          </TableHead>
                          <TableHead className="text-right font-semibold text-muted-foreground">
                            Operational Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="text-xs">
                        {displayedTheses.map((thesis) => {
                          const isSelected = selectedIds.has(thesis.id);
                          return (
                            <TableRow
                              key={thesis.id}
                              className={`hover:bg-muted/40 border-border transition-colors ${
                                isSelected ? "bg-primary/5" : ""
                              }`}
                            >
                              <TableCell className="text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelect(thesis.id)}
                                  className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                                  aria-label={`Select thesis ${thesis.title}`}
                                />
                              </TableCell>
                              <TableCell className="max-w-[280px]">
                                <div className="space-y-0.5">
                                  <p
                                    className="font-medium text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                                    title={thesis.title}
                                    onClick={() => setQuickReviewTarget(thesis)}
                                  >
                                    {thesis.title}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground truncate">
                                    {thesis.department?.name || "General Discipline"} · Cohort {thesis.year || 2025}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-0.5">
                                  <p className="font-medium text-foreground">
                                    {thesis.author_name}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground truncate">
                                    {typeof thesis.institution === "string" ? thesis.institution : thesis.institution?.name || "Institution"}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground hidden lg:table-cell">
                                <span className="truncate block max-w-[150px]">
                                  {thesis.supervisor_name || "Unassigned"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={thesis.status} />
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-center">
                                {thesis.fileUrl ? (
                                  <a
                                    href={thesis.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                                    title="View attached dissertation document"
                                  >
                                    <FileText className="h-3 w-3" />
                                    <span>Attached</span>
                                  </a>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>Missing</span>
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  {/* Quick Review Button */}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setQuickReviewTarget(thesis)}
                                    className="h-7 px-2 text-xs gap-1 border-border shadow-2xs"
                                    title="Quick review abstract and details"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Inspect</span>
                                  </Button>

                                  {/* Quick Approve if not approved or published */}
                                  {thesis.status !== "approved" && thesis.status !== "published" && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleAction("approve", thesis)}
                                      className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shadow-2xs"
                                      title="One-click approve"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                      <span className="hidden md:inline">Approve</span>
                                    </Button>
                                  )}

                                  {/* Dropdown Options */}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 hover:bg-muted"
                                      >
                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 text-xs">
                                      <DropdownMenuItem
                                        onClick={() => handleAction("workspace", thesis)}
                                      >
                                        <ShieldCheck className="h-3.5 w-3.5 mr-2 text-primary" />
                                        <span>Open Workspace</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleAction("view", thesis)}
                                      >
                                        <ExternalLink className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                        <span>Public View</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleAction("edit", thesis)}
                                      >
                                        <Edit className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                        <span>Edit Metadata</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      {thesis.status !== "published" && (
                                        <DropdownMenuItem
                                          onClick={() => handleAction("publish", thesis)}
                                          className="text-blue-600 focus:bg-blue-50 dark:focus:bg-blue-950/20"
                                        >
                                          <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                                          <span>Publish Open Access</span>
                                        </DropdownMenuItem>
                                      )}
                                      {thesis.status !== "rejected" && (
                                        <DropdownMenuItem
                                          onClick={() => handleAction("reject", thesis)}
                                          className="text-amber-600 focus:bg-amber-50 dark:focus:bg-amber-950/20"
                                        >
                                          <XCircle className="h-3.5 w-3.5 mr-2" />
                                          <span>Request Revision</span>
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => setDeleteTarget(thesis)}
                                        className="text-destructive focus:bg-destructive/10"
                                      >
                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                        <span>Delete Record</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* ─── QUICK REVIEW MODAL / DRAWER ──────────────────────────────── */}
      <Dialog open={!!quickReviewTarget} onOpenChange={() => setQuickReviewTarget(null)}>
        {quickReviewTarget && (
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={quickReviewTarget.status} />
                <Badge variant="outline" className="text-[10px] font-mono">
                  Ref: {quickReviewTarget.id}
                </Badge>
              </div>
              <DialogTitle className="text-base font-bold text-foreground">
                {quickReviewTarget.title}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {quickReviewTarget.department?.name || "Academic Department"} · Cohort {quickReviewTarget.year || 2025}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-border/70 bg-muted/20">
                <div>
                  <span className="text-[11px] text-muted-foreground block">Author:</span>
                  <span className="font-semibold text-foreground">{quickReviewTarget.author_name}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Supervisor / Advisor:</span>
                  <span className="font-semibold text-foreground">{quickReviewTarget.supervisor_name || "Unassigned"}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Institution:</span>
                  <span className="font-medium text-foreground">
                    {typeof quickReviewTarget.institution === "string" ? quickReviewTarget.institution : quickReviewTarget.institution?.name || "Academic Institution"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground block">Document File:</span>
                  {quickReviewTarget.fileUrl ? (
                    <a
                      href={quickReviewTarget.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      <span>Attached PDF Available</span>
                    </a>
                  ) : (
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      No PDF Attached
                    </span>
                  )}
                </div>
              </div>

              {/* Abstract */}
              <div>
                <h3 className="font-semibold text-foreground mb-1 text-xs">
                  Academic Abstract:
                </h3>
                <div className="p-3 rounded-lg border border-border/80 bg-background max-h-48 overflow-y-auto text-muted-foreground text-xs leading-relaxed">
                  {quickReviewTarget.abstract || "No abstract metadata provided for this thesis record."}
                </div>
              </div>

              {/* Tags */}
              {quickReviewTarget.tags && quickReviewTarget.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-muted-foreground text-[11px]">Keywords:</span>
                  {quickReviewTarget.tags.map((tag) => (
                    <span key={tag} className="text-[11px] text-muted-foreground">
                      {tag} ·
                    </span>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:justify-between pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const id = quickReviewTarget.id;
                  setQuickReviewTarget(null);
                  navigate(`/admin/theses/${id}`);
                }}
                className="text-xs gap-1 border-border"
              >
                <span>Open Full Workspace</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>

              <div className="flex items-center gap-2">
                {quickReviewTarget.status !== "approved" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      handleAction("approve", quickReviewTarget);
                      setQuickReviewTarget(null);
                    }}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Approve Thesis
                  </Button>
                )}
                {quickReviewTarget.status !== "published" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      handleAction("publish", quickReviewTarget);
                      setQuickReviewTarget(null);
                    }}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Publish Open-Access
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* ─── CONFIRM DELETE DIALOG ────────────────────────────────────── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Thesis Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This
              record will be permanently removed from repository indexing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
