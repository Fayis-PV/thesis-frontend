import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  FolderTree,
  User,
  Eye,
  Download,
  Quote,
  FileText,
  FileEdit,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/admin/AdminShared";
import { toast } from "@/hooks/use-toast";
import { useThesisDetail } from "@/features/theses/hooks/useThesisDetail";
import { useThesisMutations } from "@/features/theses/hooks/useThesisMutations";
import PdfViewer from "@/features/theses/components/PdfViewer";

export default function AdminThesisWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("overview");

  const { data: thesis, isLoading } = useThesisDetail(id);
  const { updateMutation, approveMutation, rejectMutation } = useThesisMutations();

  if (isLoading || !thesis) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Loading thesis workspace…
      </div>
    );
  }

  const isArabic = /[\u0600-\u06FF]/.test(thesis.title || "");
  const institutionName = typeof thesis.institution === "string" ? thesis.institution : thesis.institution?.name || "Academic Institution";
  const departmentName = typeof thesis.department === "string" ? thesis.department : thesis.department?.name || "Academic Department";
  const categoryName = typeof thesis.category === "string" ? thesis.category : thesis.category?.name || "General Discipline";

  const handleStatusChange = async (newStatus: "published" | "approved" | "under_review" | "draft" | "rejected") => {
    try {
      if (newStatus === "approved" || newStatus === "published") {
        await approveMutation.mutateAsync(thesis.id);
      } else if (newStatus === "rejected") {
        await rejectMutation.mutateAsync(thesis.id);
      } else {
        await updateMutation.mutateAsync({ id: thesis.id, status: newStatus });
      }
      toast({
        title: "Status Updated",
        description: `Thesis status changed to ${newStatus}.`,
      });
    } catch {
      toast({
        title: "Update Failed",
        description: "Unable to update status on server. Updated locally in session.",
        variant: "destructive",
      });
    }
  };

  const handleCopyCitation = () => {
    const text = `${thesis.author_name} (${thesis.year || 2025}). ${thesis.title}. Dissertation, ${departmentName}, ${institutionName}.`;
    navigator.clipboard.writeText(text);
    toast({ title: "Citation Copied", description: "Standard academic citation copied to clipboard." });
  };

  return (
    <div className="space-y-6">
      {/* Back button & top navigation breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/theses")}
          className="h-7 px-2 text-xs gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Theses Catalog</span>
        </Button>
        <span>/</span>
        <span className="font-mono text-foreground font-semibold">Ref: {thesis.id}</span>
      </div>

      {/* ─── WORKSPACE HEADER ──────────────────────────────────────────── */}
      <Card className="border border-border/80 shadow-xs">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div className="space-y-2 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={thesis.status} />
                <Badge variant="outline" className="text-xs font-mono">
                  Cohort {thesis.year || 2025}
                </Badge>
                {thesis.language && (
                  <Badge variant="secondary" className="text-xs">
                    {thesis.language}
                  </Badge>
                )}
              </div>

              <h1
                className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground font-heading leading-snug"
                dir={isArabic ? "rtl" : "ltr"}
              >
                {thesis.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span>{thesis.author_name}</span>
                </span>
                <span>•</span>
                <span>Advisor: <strong className="text-foreground/90">{thesis.supervisor_name}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{institutionName}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FolderTree className="h-3.5 w-3.5" />
                  <span>{departmentName}</span>
                </span>
              </div>
            </div>

            {/* Admin Quick Action Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 shadow-2xs border-border">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Change Status</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 text-xs">
                  <DropdownMenuItem onClick={() => handleStatusChange("published")}>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mr-2" />
                    <span>Publish Officially</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("approved")}>
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 mr-2" />
                    <span>Approve (Unpublished)</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("under_review")}>
                    <Clock className="h-3.5 w-3.5 text-purple-600 mr-2" />
                    <span>Move to Under Review</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("draft")}>
                    <FileEdit className="h-3.5 w-3.5 text-slate-500 mr-2" />
                    <span>Revert to Draft</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleStatusChange("rejected")} className="text-destructive">
                    <XCircle className="h-3.5 w-3.5 mr-2" />
                    <span>Reject / Request Revision</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                size="sm"
                onClick={() => navigate(`/admin/theses/${thesis.id}/edit`)}
                className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground shadow-xs"
              >
                <FileEdit className="h-3.5 w-3.5" />
                <span>Edit Metadata</span>
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyCitation}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Copy Citation"
              >
                <Quote className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── WORKSPACE TABS ────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 max-w-2xl h-10 p-1 bg-muted/60 border border-border/60">
          <TabsTrigger value="overview" className="text-xs gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span>Overview & Abstract</span>
          </TabsTrigger>
          <TabsTrigger value="document" className="text-xs gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Document File</span>
          </TabsTrigger>
          <TabsTrigger value="metadata" className="text-xs gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Technical Metadata</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            <span>Readership</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>Review Workflow</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
              {/* Abstract Card */}
              <Card className="border border-border shadow-xs">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-bold text-foreground font-heading">
                    Scholarly Abstract
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p
                    className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line"
                    dir={/[\u0600-\u06FF]/.test(thesis.abstract || "") ? "rtl" : "ltr"}
                  >
                    {thesis.abstract || "No abstract has been provided for this thesis record."}
                  </p>
                </CardContent>
              </Card>

              {/* Keywords */}
              <Card className="border border-border shadow-xs">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-bold text-foreground font-heading">
                    Indexed Research Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {thesis.tags && thesis.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {thesis.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs font-normal" dir={/[\u0600-\u06FF]/.test(tag) ? "rtl" : "ltr"}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No keywords assigned.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Metadata Card */}
            <div className="space-y-4">
              <Card className="border border-border shadow-xs">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-bold text-foreground font-heading">
                    Academic Classification
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Institution:</span>
                    <p className="font-semibold text-foreground mt-0.5">{institutionName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department / Faculty:</span>
                    <p className="font-semibold text-foreground mt-0.5">{departmentName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Discipline / Category:</span>
                    <p className="font-semibold text-foreground mt-0.5" dir={/[\u0600-\u06FF]/.test(categoryName) ? "rtl" : "ltr"}>
                      {categoryName}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pages / Volume:</span>
                    <p className="font-semibold text-foreground font-mono mt-0.5">
                      {thesis.page_count ? `${thesis.page_count} pages` : "Unrecorded"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Public Access URL:</span>
                    <p className="font-mono text-[11px] text-primary truncate mt-0.5">
                      /thesis/{thesis.id}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* 2. DOCUMENT TAB */}
        <TabsContent value="document" className="space-y-4">
          <Card className="border border-border shadow-xs overflow-hidden">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between border-b border-border/60">
              <div>
                <CardTitle className="text-sm font-bold text-foreground font-heading">
                  Dissertation Document Viewer
                </CardTitle>
                <CardDescription className="text-xs">
                  Full text manuscript attached to this academic record.
                </CardDescription>
              </div>
              {thesis.fileUrl && (
                <Button asChild size="sm" variant="outline" className="h-8 text-xs gap-1.5">
                  <a href={thesis.fileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open in New Tab</span>
                  </a>
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0 min-h-[600px] bg-muted/20">
              {thesis.fileUrl ? (
                <PdfViewer pdfUrl={thesis.fileUrl} title={thesis.title} />
              ) : (
                <div className="py-24 text-center text-xs text-muted-foreground flex flex-col items-center justify-center space-y-3">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                  <p className="font-semibold text-foreground">No Document URL Attached</p>
                  <p className="text-[11px] max-w-sm">
                    This thesis record does not yet have a Google Drive or direct PDF download link attached.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/admin/theses/${thesis.id}/edit`)}
                    className="gap-1.5"
                  >
                    <FileEdit className="h-3.5 w-3.5" />
                    <span>Attach Document URL</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. METADATA TAB */}
        <TabsContent value="metadata" className="space-y-4">
          <Card className="border border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold text-foreground font-heading">
                Technical Metadata & System Identifiers
              </CardTitle>
              <CardDescription className="text-xs">
                Low-level identifiers and citation metadata stored in the database.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-muted-foreground">Unique Identifier (ID):</span>
                  <p className="font-bold text-foreground mt-1">{thesis.id}</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-muted-foreground">Record Created Date:</span>
                  <p className="font-bold text-foreground mt-1">{new Date(thesis.created_at).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-muted-foreground">Publication Date:</span>
                  <p className="font-bold text-foreground mt-1">{thesis.publication_date || "Pending publication"}</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card">
                  <span className="text-muted-foreground">File Destination URL:</span>
                  <p className="font-bold text-foreground truncate mt-1">{thesis.fileUrl || "None"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-border bg-card shadow-xs text-center">
              <Eye className="h-5 w-5 text-blue-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-muted-foreground uppercase">Cumulative Consultations</p>
              <p className="text-3xl font-extrabold font-mono text-foreground mt-1">
                {(thesis.view_count || 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Public thesis detail views</p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card shadow-xs text-center">
              <Download className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-muted-foreground uppercase">Full-Text Downloads</p>
              <p className="text-3xl font-extrabold font-mono text-foreground mt-1">
                {(thesis.download_count || 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">PDF file access requests</p>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card shadow-xs text-center">
              <Quote className="h-5 w-5 text-purple-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-muted-foreground uppercase">Academic Citations</p>
              <p className="text-3xl font-extrabold font-mono text-foreground mt-1">
                {(thesis.citation_count || 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Indexed in research literature</p>
            </div>
          </div>
        </TabsContent>

        {/* 5. REVIEW WORKFLOW TAB */}
        <TabsContent value="activity" className="space-y-4">
          <Card className="border border-border shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold text-foreground font-heading">
                Workflow Audit Trail
              </CardTitle>
              <CardDescription className="text-xs">
                Verification milestones from student submission to official archive publication.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border text-xs">
                <div className="relative">
                  <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-background" />
                  <p className="font-semibold text-foreground">Record Created & Logged</p>
                  <p className="text-[11px] text-muted-foreground">{new Date(thesis.created_at).toLocaleDateString()}</p>
                </div>

                <div className="relative">
                  <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-blue-500 ring-4 ring-background" />
                  <p className="font-semibold text-foreground">Department Assignment Verified</p>
                  <p className="text-[11px] text-muted-foreground">Assigned to {departmentName}</p>
                </div>

                <div className="relative">
                  <span className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full ring-4 ring-background ${thesis.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <p className="font-semibold text-foreground">Current Status: {thesis.status.toUpperCase()}</p>
                  <p className="text-[11px] text-muted-foreground">Managed by administrative committee</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
