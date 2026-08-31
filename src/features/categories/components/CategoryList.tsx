import { useState } from "react";
import { useCategories } from "../hooks/useCategories";
import { useCategoryMutations } from "../hooks/useCategoryMutations";
import { CategoryModal } from "./CategoryModal";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import type { ThesisCategory } from "@/types/api";
import { FolderTree, Plus, Pencil, Trash2 } from "lucide-react";

export const CategoryList = () => {
  const { data: categories, isLoading } = useCategories();
  const { deleteMutation } = useCategoryMutations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ThesisCategory | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<ThesisCategory | null>(null);

  const confirmDelete = async () => {
    if (categoryToDelete) {
      await deleteMutation.mutateAsync(categoryToDelete.id);
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
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
            Thesis Categories
          </h2>
          <p className="text-sm text-gray-500">
            Organize theses by domain or research area.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-6 py-4 font-semibold">Category Name</th>
              <th className="px-6 py-4 font-semibold">Description</th>
              <th className="px-6 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-600">
            {categories?.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  No categories found.
                </td>
              </tr>
            ) : (
              categories?.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                        <FolderTree className="h-5 w-5" />
                      </div>
                      <p className="font-medium text-gray-900">{cat.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="max-w-xs truncate text-gray-500">
                      {cat.description || (
                        <span className="italic text-gray-400">
                          No description
                        </span>
                      )}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsModalOpen(true);
                        }}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setCategoryToDelete(cat);
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

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
      />
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
        title="Delete Category"
        description={
          <>
            Are you sure you want to delete the{" "}
            <strong className="text-gray-900">{categoryToDelete?.name}</strong>{" "}
            category? Theses associated with this category may be affected.
          </>
        }
      />
    </div>
  );
};
