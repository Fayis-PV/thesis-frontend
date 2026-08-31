import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

import type { Thesis } from "@/types/api";
import { useThesisMutations } from "../hooks/useThesisMutations";
import { useInstitutions } from "@/features/institutions/hooks/useInstitutions";
import { useDepartments } from "@/features/departments/hooks/useDepartments";
import { useCategories } from "@/features/categories/hooks/useCategories";

// 1. Added keywords to the Zod Schema
const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  abstract: z.string().min(20, "Abstract must be at least 20 characters"),
  author_name: z.string().min(2, "Author name is required"),
  supervisor_name: z.string().min(2, "Supervisor name is required"),
  publication_date: z.string().min(1, "Date is required"),
  institution: z.string().uuid("Select an institution"),
  department: z.string().uuid("Select a department"),
  category: z.string().uuid("Select a category"),
  keywords: z.string().optional(), // Added for the JSON array
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  thesis?: Thesis | null;
}

export const ThesisModal = ({ isOpen, onClose, thesis }: Props) => {
  const { createMutation, updateMutation } = useThesisMutations();

  const { data: institutions } = useInstitutions();
  const { data: allDepartments } = useDepartments();
  const { data: categories } = useCategories();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const selectedInstitutionId = useWatch({ control, name: "institution" });
  const filteredDepartments = allDepartments?.filter(
    (dept) =>
      (typeof dept.institution === "string"
        ? dept.institution
        : dept.institution?.id) === selectedInstitutionId,
  );

  // 2. Safely extract IDs from the backend's nested objects when editing
  useEffect(() => {
    if (thesis) {
      reset({
        title: thesis.title,
        abstract: thesis.abstract,
        author_name: thesis.author_name,
        supervisor_name: thesis.supervisor_name,
        publication_date: thesis.publication_date || "",
        institution: thesis.institution?.id || "",
        department: thesis.department?.id || "",
        category: thesis.category?.id || "",
        keywords: thesis.tags ? thesis.tags.join(", ") : "", // Convert array to string for input
      });
    } else {
      reset({
        title: "",
        abstract: "",
        author_name: "",
        supervisor_name: "",
        publication_date: "",
        institution: "",
        department: "",
        category: "",
        keywords: "",
      });
    }
  }, [thesis, reset, isOpen]);

  // 3. Format payload to perfectly match Django ThesisWriteSerializer
  const onSubmit = async (data: FormData) => {
    try {
      const formattedPayload = {
        title: data.title,
        abstract: data.abstract,
        author_name: data.author_name,
        supervisor_name: data.supervisor_name,
        publication_date: data.publication_date,
        institution_id: data.institution, // Append _id
        department_id: data.department, // Append _id
        category_id: data.category, // Append _id
        // Convert comma-string into a clean array for Django JSONField
        keywords: data.keywords
          ? data.keywords
              .split(",")
              .map((k) => k.trim())
              .filter((k) => k !== "")
          : [],
      };

      if (thesis) {
        await updateMutation.mutateAsync({
          id: thesis.id,
          ...formattedPayload,
        });
      } else {
        await createMutation.mutateAsync(formattedPayload);
      }
      onClose();
    } catch (error: unknown) {
      const err = error as { message?: string };
      setError("root.serverError", {
        type: "server",
        message: err.message || "Error saving thesis.",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-xl bg-white p-6 shadow-2xl my-8">
        <div className="mb-5 flex items-center justify-between border-b pb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {thesis ? "Edit Thesis" : "Add New Thesis"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Thesis Title
                </label>
                <input
                  {...register("title")}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {errors.title && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Author
                  </label>
                  <input
                    {...register("author_name")}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  {errors.author_name && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.author_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Supervisor
                  </label>
                  <input
                    {...register("supervisor_name")}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  {errors.supervisor_name && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.supervisor_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Publication Date
                </label>
                <input
                  type="date"
                  {...register("publication_date")}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {errors.publication_date && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.publication_date.message}
                  </p>
                )}
              </div>

              {/* 4. Added Keywords Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Keywords (Comma separated)
                </label>
                <input
                  {...register("keywords")}
                  placeholder="AI, Machine Learning, Healthcare"
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Institution
                </label>
                <select
                  {...register("institution")}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select Institution...</option>
                  {institutions?.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
                {errors.institution && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.institution.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select
                    {...register("department")}
                    disabled={!selectedInstitutionId}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm bg-white disabled:bg-gray-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Dept...</option>
                    {filteredDepartments?.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.department.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    {...register("category")}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Category...</option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Abstract
                </label>
                <textarea
                  {...register("abstract")}
                  rows={5}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {errors.abstract && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.abstract.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {errors.root?.serverError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {errors.root.serverError.message}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSubmitting ? "Saving..." : "Save Thesis"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
