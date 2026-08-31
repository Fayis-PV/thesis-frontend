import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Search, RefreshCw, Download, MoreHorizontal, Eye, Pencil, CheckCircle2, XCircle, Globe, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import PageHeader from "@/components/common/PageHeader";
import StatusBadge from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/Skeletons";
import { EmptyState, ErrorState } from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { thesisApi } from "@/api/thesisApi";
import { THESIS_STATUS, STATUS_LABELS } from "@/types/models";

const TABS = [
  { value: "all", label: "All" },
  { value: THESIS_STATUS.DRAFT, label: "Draft" },
  { value: THESIS_STATUS.SUBMITTED, label: "Submitted" },
  { value: THESIS_STATUS.UNDER_REVIEW, label: "Under Review" },
  { value: THESIS_STATUS.APPROVED, label: "Approved" },
  { value: THESIS_STATUS.PUBLISHED, label: "Published" },
  { value: THESIS_STATUS.REJECTED, label: "Rejected" },
];

export default function AdminTheses() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const args = { status: tab, search: search || undefined, page, pageSize: 10 };
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "theses", args],
    queryFn: () => thesisApi.list(args),
    placeholderData: (prev) => prev,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "theses"] });
    queryClient.invalidateQueries({ queryKey: ["theses"] });
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
  };

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => thesisApi.setStatus(id, status),
    onSuccess: () => { invalidate(); toast.success("Status updated"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = useMutation({
    mutationFn: (id) => thesisApi.remove(id),
    onSuccess: () => { invalidate(); toast.success("Thesis deleted"); setDeleteTarget(null); },
    onError: (e) => toast.error(e.message),
  });
  const bulkDeleteMut = useMutation({
    mutationFn: async (ids) => { await Promise.all(ids.map((id) => thesisApi.remove(id))); },
    onSuccess: () => { invalidate(); toast.success(`${selected.length} theses deleted`); setSelected([]); },
    onError: (e) => toast.error(e.message),
  });

  const rows = data?.results || [];
  const allSelected = rows.length > 0 && selected.length === rows.length;

  const toggleAll = (checked) => setSelected(checked ? rows.map((r) => r.id) : []);
  const toggleOne = (id, checked) =>
    setSelected((s) => (checked ? [...s, id] : s.filter((x) => x !== id)));

  const exportCsv = () => {
    const header = ["Title", "Author", "Institution", "Department", "Category", "Status", "Published", "Views", "Downloads"];
    const lines = rows.map((r) =>
      [r.title, r.author, r.institutionName, r.departmentName, r.categoryName, STATUS_LABELS[r.status], r.publicationDate, r.views, r.downloads]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "theses.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Theses"
        description="Manage, review and publish repository theses."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportCsv}><Download className="h-4 w-4" /> Export</Button>
            <Button size="sm" onClick={() => navigate("/admin/theses/new")}><Plus className="h-4 w-4" /> Add thesis</Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(1); setSelected([]); }}>
          <TabsList className="flex-wrap">
            {TABS.map((t) => <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>)}
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search theses…" className="h-9 w-56 pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => refetch()} aria-label="Refresh"><RefreshCw className="h-4 w-4" /></Button>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center justify-between rounded-md border bg-muted/40 px-4 py-2">
          <span className="text-sm">{selected.length} selected</span>
          <Button variant="destructive" size="sm" onClick={() => bulkDeleteMut.mutate(selected)} disabled={bulkDeleteMut.isPending}>
            <Trash2 className="h-4 w-4" /> Delete selected
          </Button>
        </div>
      )}

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : isLoading ? (
        <TableSkeleton rows={8} cols={8} />
      ) : rows.length === 0 ? (
        <EmptyState title="No theses found" description="Try a different filter or add a new thesis."
          action={<Button size="sm" onClick={() => navigate("/admin/theses/new")}><Plus className="h-4 w-4" /> Add thesis</Button>} />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" /></TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden lg:table-cell">Institution</TableHead>
                <TableHead className="hidden xl:table-cell">Department</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell">Published</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((t) => (
                <TableRow key={t.id} data-state={selected.includes(t.id) ? "selected" : undefined}>
                  <TableCell><Checkbox checked={selected.includes(t.id)} onCheckedChange={(c) => toggleOne(t.id, c)} aria-label={`Select ${t.title}`} /></TableCell>
                  <TableCell className="max-w-xs">
                    <Link to={`/admin/theses/${t.id}`} className="font-medium hover:text-primary line-clamp-1">{t.title}</Link>
                    <p className="text-xs text-muted-foreground">{t.author} · {t.categoryName}</p>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{t.institutionName}</TableCell>
                  <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">{t.departmentName}</TableCell>
                  <TableCell className="hidden md:table-cell"><StatusBadge status={t.status} /></TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{new Date(t.publicationDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right text-sm">{t.views.toLocaleString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => navigate(`/admin/theses/${t.id}`)}><Eye className="h-4 w-4" /> View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/admin/theses/${t.id}/edit`)}><Pencil className="h-4 w-4" /> Edit</DropdownMenuItem>
                        {t.status !== THESIS_STATUS.APPROVED && t.status !== THESIS_STATUS.PUBLISHED && (
                          <DropdownMenuItem onClick={() => statusMut.mutate({ id: t.id, status: THESIS_STATUS.APPROVED })}><CheckCircle2 className="h-4 w-4" /> Approve</DropdownMenuItem>
                        )}
                        {t.status === THESIS_STATUS.APPROVED && (
                          <DropdownMenuItem onClick={() => statusMut.mutate({ id: t.id, status: THESIS_STATUS.PUBLISHED })}><Globe className="h-4 w-4" /> Publish</DropdownMenuItem>
                        )}
                        {t.status !== THESIS_STATUS.REJECTED && (
                          <DropdownMenuItem onClick={() => statusMut.mutate({ id: t.id, status: THESIS_STATUS.REJECTED })}><XCircle className="h-4 w-4" /> Reject</DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(t)}><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {data.page} of {data.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete thesis?"
        description={`"${deleteTarget?.title}" will be permanently removed. This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleteMut.isPending}
        onConfirm={() => deleteMut.mutate(deleteTarget.id)}
      />
    </div>
  );
}