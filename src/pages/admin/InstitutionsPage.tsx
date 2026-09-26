import { useState } from "react";
import { Plus, Edit, Trash2, Loader2, MoreHorizontal, X } from "lucide-react";
import {
  useInstitutions,
  useTaxonomyMutations,
  type Institution,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

export default function InstitutionsPage() {
  const { data: institutions = [], isLoading } = useInstitutions();
  const { create, update, remove } = useTaxonomyMutations(
    "institutions",
    "institutions",
  );

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    country: "India",
    code: "",
    website: "",
  });

  const totalTheses = institutions.reduce(
    (sum, i) => sum + (i.thesis_count || 0),
    0,
  );

  const handleOpen = (inst?: Institution) => {
    if (inst) {
      setEditingId(inst.id);
      setForm({
        name: inst.name,
        country: inst.country,
        code: inst.code,
        website: inst.website || "",
      });
    } else {
      setEditingId(null);
      setForm({ name: "", country: "India", code: "", website: "" });
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await update.mutateAsync({ id: editingId, ...form });
        toast({ title: "Institution Updated" });
      } else {
        await create.mutateAsync(form);
        toast({ title: "Institution Created" });
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this institution?"))
      return;
    try {
      await remove.mutateAsync(id);
      toast({ title: "Institution Deactivated" });
    } catch {
      toast({
        title: "Error",
        description: "Could not deactivate institution.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Institutions</h2>
            <p className="text-gray-500 mt-1">
              Manage academic universities and partners.
            </p>
          </div>
          <Button
            onClick={() => handleOpen()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Institution
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm text-gray-500 font-medium">
                Total Institutions
              </p>
              <p className="text-3xl font-bold mt-2 text-blue-600">
                {institutions.length}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm text-gray-500 font-medium">Total Theses</p>
              <p className="text-3xl font-bold mt-2 text-emerald-600">
                {totalTheses}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm border-gray-200">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <CardTitle>Active Institutions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-10 flex justify-center">
                <Loader2 className="animate-spin text-blue-600" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead className="text-center">Depts</TableHead>
                    <TableHead className="text-center">Theses</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {institutions.map((inst) => (
                    <TableRow key={inst.id}>
                      <TableCell className="font-medium">{inst.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {inst.code}
                        </Badge>
                      </TableCell>
                      <TableCell>{inst.country}</TableCell>
                      <TableCell className="text-center text-blue-600 font-medium">
                        {inst.department_count}
                      </TableCell>
                      <TableCell className="text-center text-emerald-600 font-medium">
                        {inst.thesis_count}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpen(inst)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(inst.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Deactivate
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
            aria-label="Close institution dialog"
          >
            <X className="h-5 w-5 text-gray-500 hover:text-gray-900" />
          </button>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Institution" : "Add Institution"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Institution Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Input
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Short Code</label>
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  required
                  placeholder="e.g. UOC"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Website</label>
              <Input
                type="url"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={create.isPending || update.isPending}
                className="bg-blue-600 hover:bg-blue-700 w-full"
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
