import { useState } from "react";
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
import { toast } from "@/hooks/use-toast";
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
  Download,
  FileText,
} from "lucide-react";

import { usePublicTheses } from "@/features/public-search/hooks/usePublicTheses";
import { useThesisMutations } from "@/features/theses/hooks/useThesisMutations";
import type { Thesis } from "@/types/api";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  published: {
    label: "Published",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  approved: {
    label: "Approved",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  submitted: {
    label: "Submitted",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  under_review: {
    label: "Under Review",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700 border-gray-200" },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-700 border-red-200",
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] || {
    label: status,
    color: "bg-gray-100 text-gray-700 border-gray-200",
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
  const [deleteTarget, setDeleteTarget] = useState<Thesis | null>(null);

  // Use the API hook without the 'published' restriction for admins
  const { data, isLoading } = usePublicTheses({
    search: searchTerm,
    status: activeTab === "all" ? "" : activeTab,
  });
  const { deleteMutation, approveMutation, rejectMutation } =
    useThesisMutations();

  const extractTheses = (raw: unknown): Thesis[] => {
    if (!raw || typeof raw !== "object") return [];
    const payload = raw as { data?: unknown; results?: unknown };
    if (Array.isArray(raw)) return raw as Thesis[];
    if (Array.isArray(payload.results)) return payload.results as Thesis[];
    if (Array.isArray(payload.data)) return payload.data as Thesis[];
    if (payload.data && typeof payload.data === "object") {
      return extractTheses(payload.data);
    }
    return [];
  };

  const theses: Thesis[] = extractTheses(data);

  const handleAction = async (action: string, thesis: Thesis) => {
    if (action === "view") {
      window.open(`/thesis/${thesis.id}`, "_blank");
      return;
    }
    if (action === "edit") {
      navigate(`/admin/theses/${thesis.id}/edit`);
      return;
    }

    try {
      if (action === "approve") {
        await approveMutation.mutateAsync(thesis.id);
        toast({
          title: "Approved",
          description: `"${thesis.title}" has been approved.`,
        });
      } else if (action === "reject") {
        await rejectMutation.mutateAsync(thesis.id);
        toast({
          title: "Rejected",
          description: `"${thesis.title}" has been rejected.`,
        });
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: "Action Failed",
        description: err.message || "Server error",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast({ title: "Deleted", description: `Thesis has been removed.` });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete thesis.",
        variant: "destructive",
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleExport = () => {
    const csv = [
      "Title,Author,Department,Status,Year\n" +
        theses
          .map(
            (t) =>
              `"${t.title}","${t.author_name}","${t.department?.name || ""}",${t.status},${t.year || ""}`,
          )
          .join("\n"),
    ];
    const blob = new Blob(csv, { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `theses-export.csv`;
    a.click();
  };

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Thesis Management
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Review, approve, and curate academic submissions.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExport}
              className="border-gray-200"
            >
              <Download size={16} className="mr-2" /> Export
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate("/admin/theses/create")}
            >
              <Plus size={16} className="mr-2" /> Add Thesis
            </Button>
          </div>
        </div>

        <Card className="shadow-sm border-gray-200">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by title, author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-gray-50"
                />
              </div>
              <Button variant="outline" className="border-gray-200">
                <Filter size={16} className="mr-2" /> Filters
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-gray-100 p-1 rounded-lg mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="submitted">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="published">Published</TabsTrigger>
                <TabsTrigger value="draft">Drafts</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {isLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
                  </div>
                ) : theses.length === 0 ? (
                  <div className="text-center py-20 text-gray-500">
                    <FileText size={40} className="mx-auto mb-4 opacity-30" />
                    <p>No theses found.</p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="font-semibold text-gray-600">
                            Title
                          </TableHead>
                          <TableHead className="font-semibold text-gray-600">
                            Author
                          </TableHead>
                          <TableHead className="font-semibold text-gray-600 hidden md:table-cell">
                            Department
                          </TableHead>
                          <TableHead className="font-semibold text-gray-600">
                            Status
                          </TableHead>
                          <TableHead className="text-right font-semibold text-gray-600">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {theses.map((thesis) => (
                          <TableRow
                            key={thesis.id}
                            className="hover:bg-gray-50/50"
                          >
                            <TableCell
                              className="font-medium text-gray-900 max-w-[300px] truncate"
                              title={thesis.title}
                            >
                              {thesis.title}
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {thesis.author_name}
                            </TableCell>
                            <TableCell className="text-gray-600 hidden md:table-cell">
                              {thesis.department?.name || "—"}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={thesis.status} />
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-gray-100"
                                  >
                                    <MoreHorizontal size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-44"
                                >
                                  <DropdownMenuItem
                                    onClick={() => handleAction("view", thesis)}
                                  >
                                    <Eye size={14} className="mr-2" /> View
                                    Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleAction("edit", thesis)}
                                  >
                                    <Edit size={14} className="mr-2" /> Edit
                                    Metadata
                                  </DropdownMenuItem>
                                  {thesis.status !== "approved" &&
                                    thesis.status !== "published" && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleAction("approve", thesis)
                                        }
                                        className="text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
                                      >
                                        <CheckCircle2
                                          size={14}
                                          className="mr-2"
                                        />{" "}
                                        Approve
                                      </DropdownMenuItem>
                                    )}
                                  {thesis.status !== "rejected" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleAction("reject", thesis)
                                      }
                                      className="text-amber-600 focus:bg-amber-50 focus:text-amber-700"
                                    >
                                      <XCircle size={14} className="mr-2" />{" "}
                                      Reject
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setDeleteTarget(thesis)}
                                    className="text-red-600 focus:bg-red-50 focus:text-red-700"
                                  >
                                    <Trash2 size={14} className="mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Thesis</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
