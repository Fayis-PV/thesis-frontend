import { useState } from "react";
import { useDepartments } from "../hooks/useDepartments";
import { useDepartmentMutations } from "../hooks/useDepartmentMutations";
import { DepartmentModal } from "./DepartmentModal";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import { useInstitutions } from "@/features/institutions/hooks/useInstitutions";
import type { Department } from "@/types/api";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";

export const DepartmentList = () => {
  const { data: departments, isLoading } = useDepartments();
  const { data: institutions } = useInstitutions();
  const { deleteMutation } = useDepartmentMutations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] =
    useState<Department | null>(null);

  const institutionName = (department: Department) => {
    const institutionId =
      typeof department.institution === "string"
        ? department.institution
        : department.institution.id;
    return institutions?.find((institution) => institution.id === institutionId)
      ?.name;
  };

  const confirmDelete = async () => {
    if (!departmentToDelete) return;
    await deleteMutation.mutateAsync(departmentToDelete.id);
    setIsDeleteDialogOpen(false);
    setDepartmentToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Departments
          </h2>
          <p className="text-sm text-gray-500">
            Manage academic departments and their institutions.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedDepartment(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Department
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-6 py-4 font-semibold">Department</th>
              <th className="px-6 py-4 font-semibold">Code</th>
              <th className="px-6 py-4 font-semibold">Institution</th>
              <th className="px-6 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-600">
            {departments?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No departments found.
                </td>
              </tr>
            ) : (
              departments?.map((department) => (
                <tr
                  key={department.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {department.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{department.code}</td>
                  <td className="px-6 py-4">
                    {institutionName(department) || "Unknown institution"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedDepartment(department);
                          setIsModalOpen(true);
                        }}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDepartmentToDelete(department);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        department={selectedDepartment}
      />
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
        title="Delete Department"
        description={
          <>
            Are you sure you want to delete{" "}
            <strong className="text-gray-900">
              {departmentToDelete?.name}
            </strong>
            ?
          </>
        }
      />
    </div>
  );
};
