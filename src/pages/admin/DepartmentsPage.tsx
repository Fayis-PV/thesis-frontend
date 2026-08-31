import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Building2,
  Loader2,
  MoreHorizontal,
  X,
} from "lucide-react";
import {
  useDepartments,
  useInstitutions,
  useTaxonomyMutations,
  type Department,
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

export default function DepartmentsPage() {
  const { data: departments = [], isLoading } = useDepartments();
  const { data: institutions = [] } = useInstitutions();
  const { create, update, remove } = useTaxonomyMutations(
    "departments",
    "departments",
  );

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", institution_id: "" });

  const handleOpen = (dept?: Department) => {
    if (dept) {
      setEditingId(dept.id);
      setForm({
        name: dept.name,
        code: dept.code,
        institution_id: dept.institution.id,
      });
    } else {
      setEditingId(null);
      setForm({ name: "", code: "", institution_id: "" });
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await update.mutateAsync({ id: editingId, ...form });
        toast({ title: "Department Updated" });
      } else {
        await create.mutateAsync(form);
        toast({ title: "Department Created" });
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
            <h2 className="text-3xl font-bold text-gray-900">Departments</h2>
            <p className="text-gray-500 mt-1">Manage academic branches.</p>
          </div>
          <Button
            onClick={() => handleOpen()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Department
          </Button>
        </div>

        <Card className="shadow-sm border-gray-200">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <CardTitle>Active Departments</CardTitle>
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
                    <TableHead>Department Name</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-center">Theses</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3 w-3 text-gray-400" />{" "}
                          {dept.institution?.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {dept.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-emerald-600 font-medium">
                        {dept.thesis_count}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpen(dept)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                if (confirm("Deactivate?"))
                                  remove.mutate(dept.id);
                              }}
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
            aria-label="Close department dialog"
          >
            <X className="h-5 w-5 text-gray-500 hover:text-gray-900" />
          </button>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Department" : "Add Department"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Institution</label>
              <Select
                value={form.institution_id}
                onValueChange={(v) => setForm({ ...form, institution_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Institution" />
                </SelectTrigger>
                <SelectContent>
                  {institutions.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                placeholder="e.g. CS"
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
