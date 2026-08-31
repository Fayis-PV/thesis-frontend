import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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
import { EmptyState } from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { categoryApi } from "@/api/categoryApi";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().optional(),
  parentId: z.string().optional(),
});

export default function Categories() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["categories", { search }],
    queryFn: () => categoryApi.list({ search }),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  const saveMut = useMutation({
    mutationFn: ({ id, payload }) =>
      id ? categoryApi.update(id, payload) : categoryApi.create(payload),
    onSuccess: () => {
      invalidate();
      toast.success(editing?.id ? "Category updated" : "Category created");
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = useMutation({
    mutationFn: (id) => categoryApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Category deleted");
      setDeleteTarget(null);
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
  const parentId = watch("parentId");

  // Build hierarchical tree
  const tree = useMemo(() => {
    if (!data) return [];
    const roots = data.filter(
      (c) => !c.parentId || !data.some((p) => p.id === c.parentId),
    );
    const build = (parent) => ({
      ...parent,
      children: data.filter((c) => c.parentId === parent.id).map(build),
    });
    return roots.map(build);
  }, [data]);

  const openNew = (parent) => {
    setEditing(null);
    reset({ name: "", slug: "", parentId: parent?.id || "" });
    setOpen(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    reset(c);
    setOpen(true);
  };
  const onSubmit = (values) =>
    saveMut.mutate({ id: editing?.id, payload: values });

  const Row = ({ c, depth = 0 }) => (
    <>
      <div
        className="flex items-center justify-between rounded-md px-3 py-2.5 hover:bg-muted/40"
        style={{ paddingLeft: depth * 20 + 12 }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {c.children.length > 0 && (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className="font-medium truncate">{c.name}</span>
          <span className="text-xs text-muted-foreground">/{c.slug}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              •••
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEdit(c)}>
              <Pencil className="h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openNew(c)}>
              <Plus className="h-4 w-4" /> Add subcategory
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteTarget(c)}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {c.children.map((child) => (
        <Row key={child.id} c={child} depth={depth + 1} />
      ))}
    </>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Categories"
        description="Hierarchical taxonomy for theses."
        actions={
          <Button size="sm" onClick={() => openNew()}>
            <Plus className="h-4 w-4" /> Add category
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search categories…"
          className="h-9 pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Card className="p-6">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </Card>
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No categories"
          description="Add your first category."
          action={
            <Button size="sm" onClick={() => openNew()}>
              <Plus className="h-4 w-4" /> Add category
            </Button>
          }
        />
      ) : (
        <Card className="p-2">
          {tree.map((c) => (
            <Row key={c.id} c={c} />
          ))}
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? "Edit category" : "Add category"}
            </DialogTitle>
            <DialogDescription>
              Categories can be nested to form a taxonomy.
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
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input
                {...register("slug")}
                placeholder="auto-generated if empty"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Parent category</Label>
              <Select
                value={parentId || "__none"}
                onValueChange={(v) =>
                  setValue("parentId", v === "__none" ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (top-level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">None (top-level)</SelectItem>
                  {(data || [])
                    .filter((c) => c.id !== editing?.id)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete category?"
        description={`"${deleteTarget?.name}" and its subcategories will be removed.`}
        confirmLabel="Delete"
        destructive
        loading={deleteMut.isPending}
        onConfirm={() => deleteMut.mutate(deleteTarget.id)}
      />
    </div>
  );
}
