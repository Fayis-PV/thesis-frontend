import { useState } from "react";
import { Plus, Edit, Trash2, Loader2, MoreHorizontal, X } from "lucide-react";
import {
  useCategories,
  useTaxonomyMutations,
  type Category,
} from "@/features/taxonomy/hooks/useTaxonomies";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const { create, update, remove } = useTaxonomyMutations(
    "categories",
    "categories",
  );

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", parent_id: "none" });

  // Flattens the nested children array from Django into a single array for the table
  const flattenCategories = (cats: Category[], prefix = ""): Category[] => {
    let flat: Category[] = [];
    cats.forEach((c) => {
      flat.push({ ...c, name: `${prefix}${c.name}` });
      if (c.children && c.children.length > 0)
        flat = flat.concat(flattenCategories(c.children, prefix + "— "));
    });
    return flat;
  };

  const flatCategories = flattenCategories(categories);

  const handleOpen = (cat?: Category) => {
    if (cat) {
      setEditingId(cat.id);
      setForm({
        name: cat.name.replace(/— /g, ""),
        slug: cat.slug,
        parent_id: cat.parent || "none",
      });
    } else {
      setEditingId(null);
      setForm({ name: "", slug: "", parent_id: "none" });
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        slug: form.slug || form.name.toLowerCase().replace(/ /g, "-"),
        parent_id: form.parent_id === "none" ? null : form.parent_id,
      };

      if (editingId) {
        await update.mutateAsync({ id: editingId, ...payload });
        toast({ title: "Category Updated" });
      } else {
        await create.mutateAsync(payload);
        toast({ title: "Category Created" });
      }
      setIsOpen(false);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: "Error",
        description: err.message || "Operation failed",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Categories</h2>
            <p className="text-muted-foreground mt-1">
              Organize research by subject area.
            </p>
          </div>
          <Button
            onClick={() => handleOpen()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>

        <Card className="shadow-xs border-border bg-card">
          <CardHeader className="bg-muted/40 border-b border-border">
            <CardTitle className="text-foreground">Category Tree</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-10 flex justify-center">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Hierarchy</TableHead>
                    <TableHead className="text-center">Theses Tagged</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flatCategories.map((cat) => (
                    <TableRow key={cat.id} className="border-border">
                      <TableCell
                        className={`font-medium ${cat.parent ? "text-muted-foreground" : "text-foreground font-semibold"}`}
                      >
                        {cat.name}
                      </TableCell>
                      <TableCell>
                        {cat.parent ? (
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary border-primary/20"
                          >
                            Subcategory
                          </Badge>
                        ) : (
                          <Badge
                            className="bg-muted text-foreground border-border"
                            variant="outline"
                          >
                            Root Category
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-emerald-600 dark:text-emerald-400 font-medium">
                        {cat.thesis_count}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpen(cat)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                if (confirm("Delete?")) remove.mutate(cat.id);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
            aria-label="Close category dialog"
          >
            <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </button>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Parent Category</label>
              <Select
                value={form.parent_id}
                onValueChange={(v) => setForm({ ...form, parent_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    -- No Parent (Make Root) --
                  </SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={create.isPending || update.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
              >
                {editingId ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
