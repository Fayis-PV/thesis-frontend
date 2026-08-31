import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Power, PowerOff } from "lucide-react";
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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
import { departmentApi } from "@/api/departmentApi";
import { institutionApi } from "@/api/institutionApi";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  code: z.string().min(2, "Code is required"),
  institutionId: z.string().min(1, "Select an institution"),
  driveFolderLink: z.string().optional(),
});

export default function Departments() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["departments", { search }],
    queryFn: () => departmentApi.list({ search }),
  });
  const { data: institutions } = useQuery({
    queryKey: ["institutions"],
    queryFn: () => institutionApi.list(),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["departments"] });
  const saveMut = useMutation({
    mutationFn: ({ id, payload }) =>
      id ? departmentApi.update(id, payload) : departmentApi.create(payload),
    onSuccess: () => {
      invalidate();
      toast.success(editing?.id ? "Department updated" : "Department created");
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });
  const toggleMut = useMutation({
    mutationFn: ({ id, active }) =>
      active ? departmentApi.deactivate(id) : departmentApi.reactivate(id),
    onSuccess: () => {
      invalidate();
      toast.success("Status updated");
      setTarget(null);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });
  const instId = watch("institutionId");

  const openNew = () => {
    setEditing(null);
    reset({ name: "", code: "", institutionId: "", driveFolderLink: "" });
    setOpen(true);
  };
  const openEdit = (d) => {
    setEditing(d);
    reset(d);
    setOpen(true);
  };
  const onSubmit = (values) =>
    saveMut.mutate({ id: editing?.id, payload: values });

  const instName = (id) => institutions?.find((i) => i.id === id)?.name || "—";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Departments"
        description="Manage departments within institutions."
        actions={
          <Button size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" /> Add department
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search departments…"
          className="h-9 pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No departments"
          description="Add your first department."
          action={
            <Button size="sm" onClick={openNew}>
              <Plus className="h-4 w-4" /> Add department
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
                <TableHead className="hidden md:table-cell">
                  Institution
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{d.code}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {instName(d.institutionId)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={d.active ? "secondary" : "outline"}
                      className={d.active ? "" : "text-muted-foreground"}
                    >
                      {d.active ? "Active" : "Inactive"}
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
                        <DropdownMenuItem onClick={() => openEdit(d)}>
                          <Pencil className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTarget(d)}>
                          {d.active ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                          {d.active ? "Deactivate" : "Reactivate"}
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
              {editing?.id ? "Edit department" : "Add department"}
            </DialogTitle>
            <DialogDescription>
              Departments belong to an institution.
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
                <Label>Institution</Label>
                <Select
                  value={instId}
                  onValueChange={(v) => setValue("institutionId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {(institutions || []).map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.institutionId && (
                  <p className="text-xs text-destructive">
                    {errors.institutionId.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Drive folder link</Label>
              <Input
                {...register("driveFolderLink")}
                placeholder="https://drive.google.com/…"
              />
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
        open={!!target}
        onOpenChange={(o) => !o && setTarget(null)}
        title={
          target?.active ? "Deactivate department?" : "Reactivate department?"
        }
        description={
          target?.active
            ? "Soft-deactivation preserves all data."
            : "This department will become active again."
        }
        confirmLabel={target?.active ? "Deactivate" : "Reactivate"}
        loading={toggleMut.isPending}
        onConfirm={() =>
          toggleMut.mutate({ id: target.id, active: target.active })
        }
      />
    </div>
  );
}
