import { useState } from "react";
import { useTheses } from "../hooks/useTheses";
import { useThesisMutations } from "../hooks/useThesisMutations";
import { ThesisModal } from "./ThesisModal";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import type { Thesis } from "@/types/api";
import { BookOpen, Plus, Pencil, Trash2, FileSpreadsheet } from "lucide-react";
import { ThesisExcelUploadModal } from "./ThesisExcelUploadModal";

export const ThesisList = () => {
  const { data: theses, isLoading } = useTheses();
  const { deleteMutation } = useThesisMutations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedThesis, setSelectedThesis] = useState<Thesis | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [thesisToDelete, setThesisToDelete] = useState<Thesis | null>(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const confirmDelete = async () => {
    if (thesisToDelete) {
      await deleteMutation.mutateAsync(thesisToDelete.id);
      setIsDeleteDialogOpen(false);
      setThesisToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Theses Archive
          </h2>
          <p className="text-sm text-gray-500">
            Manage all submitted research papers and dissertations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Bulk Upload
          </button>
          <button
            onClick={() => {
              setSelectedThesis(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Thesis
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-6 py-4 font-semibold">Title & Author</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-600">
            {theses?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No theses found.
                </td>
              </tr>
            ) : (
              theses?.map((thesis) => (
                <tr
                  key={thesis.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {thesis.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          By {thesis.author_name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    {new Date(thesis.publication_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border
                      ${
                        thesis.status === "approved"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : thesis.status === "rejected"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }`}
                    >
                      {thesis.status.charAt(0).toUpperCase() +
                        thesis.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedThesis(thesis);
                          setIsModalOpen(true);
                        }}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setThesisToDelete(thesis);
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

      <ThesisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        thesis={selectedThesis}
      />
      <ThesisExcelUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
        title="Delete Thesis"
        description={
          <>
            Are you sure you want to delete{" "}
            <strong className="text-gray-900">{thesisToDelete?.title}</strong>?
            This cannot be undone.
          </>
        }
      />
    </div>
  );
};
