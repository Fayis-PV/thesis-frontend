import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Pencil,
  CheckCircle2,
  XCircle,
  Globe,
  ArrowLeft,
  User,
  Users,
  Building2,
  FolderTree,
  Calendar,
  Tag,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { thesisApi } from "@/api/thesisApi";
import { THESIS_STATUS } from "@/types/models";
import { drivePreviewUrl } from "@/lib/citations";

export default function ThesisReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState(null); // {action, label}

  const { data: thesis, isLoading } = useQuery({
    queryKey: ["thesis", "review", id],
    queryFn: () => thesisApi.getById(id),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["thesis", "review", id] });
    queryClient.invalidateQueries({ queryKey: ["admin", "theses"] });
    queryClient.invalidateQueries({ queryKey: ["analytics"] });
  };

  const statusMut = useMutation({
    mutationFn: ({ id, status, reason: r }) =>
      thesisApi.setStatus(id, status, r),
    onSuccess: () => {
      invalidate();
      toast.success("Status updated");
      setConfirm(null);
      setRejectOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!thesis)
    return <p className="text-muted-foreground">Thesis not found.</p>;

  const previewUrl = drivePreviewUrl(thesis.fileUrl);
  const history = [
    { status: THESIS_STATUS.DRAFT, date: thesis.createdDate, note: "Created" },
    { status: thesis.status, date: thesis.updatedDate, note: "Last update" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
            <Link to="/admin/theses">
              <ArrowLeft className="h-4 w-4" /> Back to theses
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-semibold tracking-tight line-clamp-1">
              {thesis.title}
            </h1>
            <StatusBadge status={thesis.status} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/theses/${id}/edit`)}
          >
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          {thesis.status !== THESIS_STATUS.APPROVED &&
            thesis.status !== THESIS_STATUS.PUBLISHED && (
              <Button
                size="sm"
                onClick={() =>
                  setConfirm({
                    action: THESIS_STATUS.APPROVED,
                    label: "approve",
                  })
                }
              >
                <CheckCircle2 className="h-4 w-4" /> Approve
              </Button>
            )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRejectOpen(true)}
          >
            <XCircle className="h-4 w-4" /> Reject
          </Button>
          {thesis.status === THESIS_STATUS.APPROVED && (
            <Button
              size="sm"
              onClick={() =>
                setConfirm({
                  action: THESIS_STATUS.PUBLISHED,
                  label: "publish",
                })
              }
            >
              <Globe className="h-4 w-4" /> Publish
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Abstract</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {thesis.abstract}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Document preview</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {previewUrl ? (
                <div className="aspect-[4/3] w-full overflow-hidden rounded-b-xl">
                  <iframe
                    src={previewUrl}
                    title="preview"
                    className="h-full w-full"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No document attached
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Meta icon={User} label="Author" value={thesis.author} />
              <Meta icon={User} label="Supervisor" value={thesis.supervisor} />
              <Meta
                icon={Users}
                label="Co-supervisors"
                value={
                  thesis.coSupervisors.length
                    ? thesis.coSupervisors.join(", ")
                    : "—"
                }
              />
              <Meta
                icon={Building2}
                label="Institution"
                value={thesis.institutionName}
              />
              <Meta
                icon={FolderTree}
                label="Department"
                value={thesis.departmentName}
              />
              <Meta icon={Tag} label="Category" value={thesis.categoryName} />
              <Meta
                icon={Calendar}
                label="Published"
                value={new Date(thesis.publicationDate).toLocaleDateString()}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {thesis.keywords.map((k) => (
                  <Badge key={k} variant="secondary">
                    {k}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">History</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {history.map((h, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium capitalize">{h.note}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(h.date).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject dialog with reason */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject thesis</DialogTitle>
            <DialogDescription>
              Please provide a reason. This will be recorded with the thesis.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection…"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                statusMut.mutate({ id, status: THESIS_STATUS.REJECTED, reason })
              }
              disabled={statusMut.isPending || !reason.trim()}
            >
              {statusMut.isPending ? "Rejecting…" : "Reject thesis"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={`Confirm ${confirm?.label}`}
        description={`Are you sure you want to ${confirm?.label} this thesis?`}
        confirmLabel="Confirm"
        loading={statusMut.isPending}
        onConfirm={() => statusMut.mutate({ id, status: confirm.action })}
      />
    </div>
  );
}

function Meta({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
