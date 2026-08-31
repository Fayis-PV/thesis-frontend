import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Power, PowerOff, Globe } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import PageHeader from "@/components/common/PageHeader";
import { TableSkeleton } from "@/components/common/Skeletons";
import { EmptyState } from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { institutionApi } from "@/api/institutionApi";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().min(2, "Code is required"),
  country: z.string().min(2, "Country is required"),
  website: z.string().url("Enter a valid URL").or(z.literal("")),
  active: z.boolean(),
});

export default function Institutions() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["institutions", { search }],
    queryFn: () => institutionApi.list({ search }),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["institutions"] });

  const saveMut = useMutation({
    mutationFn: ({ id, payload }) =>
      id ? institutionApi.update(id, payload) : institutionApi.create(payload),
    onSuccess: () => {
      invalidate();
      toast.success(
        editing?.id ? "Institution updated" : "Institution created",
      );
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });
  const toggleMut = useMutation({
    mutationFn: ({ id, active }) =>
      active ? institutionApi.deactivate(id) : institutionApi.reactivate(id),
    onSuccess: () => {
      invalidate();
      toast.success("Status updated");
      setDeactivateTarget(null);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const openNew = () => {
    setEditing(null);
    reset({ name: "", code: "", country: "", website: "", active: true });
    setOpen(true);
  };
  const openEdit = (i) => {
    setEditing(i);
    reset(i);
    setOpen(true);
  };

  const onSubmit = (values) =>
    saveMut.mutate({ id: editing?.id, payload: values });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Institutions"
        description="Manage affiliated institutions."
        actions={
          <Button size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" /> Add institution
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search institutions…"
          className="h-9 pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No institutions"
          description="Add your first institution to get started."
          action={
            <Button size="sm" onClick={openNew}>
              <Plus className="h-4 w-4" /> Add institution
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="hidden md:table-cell">Country</TableHead>
                <TableHead className="hidden lg:table-cell">Website</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{i.code}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {i.country}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {i.website ? (
                      <a
                        href={i.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <Globe className="h-3.5 w-3.5" /> Visit
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={i.active ? "secondary" : "outline"}
                      className={i.active ? "" : "text-muted-foreground"}
                    >
                      {i.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          •••
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(i)}>
                          <Pencil className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeactivateTarget(i)}
                        >
                          {i.active ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                          {i.active ? "Deactivate" : "Reactivate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? "Edit institution" : "Add institution"}
            </DialogTitle>
            <DialogDescription>
              Manage the institution record.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input {...register("name")} />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Code</Label>
                <Input {...register("code")} />
                {errors.code && (
                  <p className="text-xs text-destructive">
                    {errors.code.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input {...register("country")} />
                {errors.country && (
                  <p className="text-xs text-destructive">
                    {errors.country.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Website</Label>
              <Input {...register("website")} placeholder="https://…" />
              {errors.website && (
                <p className="text-xs text-destructive">
                  {errors.website.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saveMut.isPending}>
                {saveMut.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deactivateTarget}
        onOpenChange={(o) => !o && setDeactivateTarget(null)}
        title={
          deactivateTarget?.active
            ? "Deactivate institution?"
            : "Reactivate institution?"
        }
        description={
          deactivateTarget?.active
            ? "This is a soft-deactivation. The institution and its data are preserved and can be reactivated later."
            : "This institution will become active again."
        }
        confirmLabel={deactivateTarget?.active ? "Deactivate" : "Reactivate"}
        loading={toggleMut.isPending}
        onConfirm={() =>
          toggleMut.mutate({
            id: deactivateTarget.id,
            active: deactivateTarget.active,
          })
        }
      />
    </div>
  );
}
