import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import type { Department } from "@/types/api";
import { useDepartmentMutations } from "../hooks/useDepartmentMutations";
import { useInstitutions } from "@/features/institutions/hooks/useInstitutions";

// 🔴 CHANGED: Added 'code' to Zod schema
const schema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
  code: z.string().min(2, "Department code is required (e.g., CS)"),
  institution: z.string().uuid("Please select a valid institution"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  department?: Department | null;
}

export const DepartmentModal = ({ isOpen, onClose, department }: Props) => {
  const { createMutation, updateMutation } = useDepartmentMutations();
  const { data: institutions, isLoading: isLoadingInstitutions } =
    useInstitutions();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (department) {
      reset({
        name: department.name,
        code: department.code,
        institution:
          typeof department.institution === "object"
            ? department.institution.id
            : department.institution,
      });
    } else {
      reset({ name: "", code: "", institution: "" });
    }
  }, [department, reset, isOpen]);

  const onSubmit = async (data: FormData) => {
    try {
      const formattedPayload = {
        name: data.name,
        code: data.code,
        institution_id: data.institution,
      };

      if (department) {
        await updateMutation.mutateAsync({
          id: department.id,
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
        message: err.message || "An error occurred while saving.",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {department ? "Edit Department" : "Add Department"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Department Name
            </label>
            <input
              {...register("name")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
              placeholder="e.g. Computer Science"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* 🔴 CHANGED: Added the Code input field to the UI */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Department Code
            </label>
            <input
              {...register("code")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none uppercase"
              placeholder="e.g. CS"
            />
            {errors.code && (
              <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Institution
            </label>
            <select
              {...register("institution")}
              disabled={isLoadingInstitutions}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            >
              <option value="">Select an institution...</option>
              {institutions?.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.code})
                </option>
              ))}
            </select>
            {errors.institution && (
              <p className="mt-1 text-xs text-red-600">
                {errors.institution.message}
              </p>
            )}
          </div>

          {errors.root?.serverError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {errors.root.serverError.message}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSubmitting ? "Saving..." : "Save Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
