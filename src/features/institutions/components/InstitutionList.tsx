import { useState } from "react";
import { useInstitutions } from "../hooks/useInstitutions";
import { useInstitutionMutations } from "../hooks/useInstitutionMutations"; // Import the mutations here
import { InstitutionModal } from "./InstitutionModal";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import type { Institution } from "@/types/api";
import { Building2, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";

export const InstitutionList = () => {
  const { data: institutions, isLoading, isError } = useInstitutions();
  const { deleteMutation } = useInstitutionMutations(); // Extract the delete logic

  // Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] =
    useState<Institution | null>(null);

  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [institutionToDelete, setInstitutionToDelete] =
    useState<Institution | null>(null);

  const handleAdd = () => {
    setSelectedInstitution(null);
    setIsModalOpen(true);
  };

  const handleEdit = (inst: Institution) => {
    setSelectedInstitution(inst);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (inst: Institution) => {
    setInstitutionToDelete(inst);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (institutionToDelete) {
      try {
        await deleteMutation.mutateAsync(institutionToDelete.id);
        setIsDeleteDialogOpen(false);
        setInstitutionToDelete(null);
      } catch (error) {
        console.error("Failed to delete institution", error);
        // You could hook up your shadcn Toaster here to show a red error popup
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-red-700">
        Failed to load institutions. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Institutions
          </h2>
          <p className="text-sm text-gray-500">
            Manage universities and academic bodies.
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          Add Institution
        </button>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Code</th>
              <th className="px-6 py-4 font-semibold">Country</th>
              <th className="px-6 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-600">
            {institutions?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No institutions found. Click "Add Institution" to create one.
                </td>
              </tr>
            ) : (
              institutions?.map((inst) => (
                <tr
                  key={inst.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{inst.name}</p>
                        {inst.website && (
                          <a
                            href={inst.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          >
                            Visit Website <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                      {inst.code}
                    </span>
                  </td>
                  <td className="px-6 py-4">{inst.country}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(inst)}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(inst)}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition-colors"
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
      <InstitutionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        institution={selectedInstitution}
      />
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
        title="Delete Institution"
        description={
          <>
            Are you sure you want to delete <strong className="text-gray-900">{institutionToDelete?.name}</strong>? 
            This action will permanently delete all associated departments and theses. This cannot be undone.
          </>
        }
      />
    
    </div>
  );
};
