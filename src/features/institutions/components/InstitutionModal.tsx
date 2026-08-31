import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import type { Institution } from "@/types/api";
import { useInstitutionMutations } from "../hooks/useInstitutionMutations";

// 1. Zod Validation Schema
const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters (e.g., UOC)"),
  country: z.string().min(2, "Country is required"),
  website: z
    .union([z.string().url("Must be a valid URL"), z.literal(""), z.null()])
    .optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  institution?: Institution | null; // If passed, we are Editing. If null, we are Creating.
}

export const InstitutionModal = ({ isOpen, onClose, institution }: Props) => {
  const { createMutation, updateMutation } = useInstitutionMutations();

  // 2. Form Setup
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      country: "India", // Default value
      website: "",
    },
  });

  // 3. Populate form when Edit mode triggers
  useEffect(() => {
    if (institution) {
      reset({
        name: institution.name,
        code: institution.code,
        country: institution.country,
        website: institution.website || "",
      });
    } else {
      reset({ name: "", code: "", country: "India", website: "" });
    }
  }, [institution, reset, isOpen]);

  // 4. Submit Handler
  const onSubmit = async (data: FormData) => {
    try {
      const payload = { ...data, website: data.website || null };

      if (institution) {
        await updateMutation.mutateAsync({ id: institution.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose(); // Close modal on success
    } catch (error: unknown) {
      const err = error as { message?: string };
      // Display backend errors (e.g., "Institution with this code already exists.")
      setError("root.serverError", {
        type: "server",
        message: err.message || "An error occurred while saving.",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">
            {institution ? "Edit Institution" : "Add Institution"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Institution Name
            </label>
            <input
              {...register("name")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g. University of Calicut"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Short Code
              </label>
              <input
                {...register("code")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm uppercase"
                placeholder="e.g. UOC"
              />
              {errors.code && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.code.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                {...register("country")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              />
              {errors.country && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.country.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Website{" "}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              {...register("website")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
              placeholder="https://..."
            />
            {errors.website && (
              <p className="mt-1 text-xs text-red-600">
                {errors.website.message}
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
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSubmitting ? "Saving..." : "Save Institution"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
