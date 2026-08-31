import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link as LinkIcon, Loader2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

import { useThesisMutations } from "@/features/theses/hooks/useThesisMutations";
import { useThesisDetail } from "@/features/theses/hooks/useThesisDetail";
import {
  useCategories,
  useDepartments,
  useInstitutions,
} from "@/features/taxonomy/hooks/useTaxonomies";
import ExcelUploadModal from "@/components/admin/ExcelUploader";

const schema = z.object({
  title: z.string().min(5, "Title is required"),
  author_name: z.string().min(2, "Author name is required"),
  supervisor_name: z.string().min(2, "Supervisor is required"),
  institution_id: z.string().min(1, "Please select an institution"),
  department_id: z.string().min(1, "Please select a department"),
  category_id: z.string().min(1, "Please select a category"),
  publication_date: z.string().optional().or(z.literal("")),
  abstract: z.string().min(20, "Abstract is required"),
  keywords: z.string().min(2, "At least one keyword is required"),
  file_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

export default function SubmitThesis() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  const { createMutation, updateMutation } = useThesisMutations();
  const { data: institutions } = useInstitutions();
  const { data: allDepartments } = useDepartments();
  const { data: categories } = useCategories();
  const { data: existingThesis, isLoading: isLoadingThesis } =
    useThesisDetail(id);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const selectedInstitutionId = useWatch({ control, name: "institution_id" });

  const filteredDepartments = allDepartments?.filter((d) =>
    typeof d.institution === "string"
      ? d.institution === selectedInstitutionId
      : d.institution.id === selectedInstitutionId,
  );

  useEffect(() => {
    if (existingThesis) {
      reset({
        title: existingThesis.title,
        abstract: existingThesis.abstract,
        author_name: existingThesis.author_name,
        supervisor_name: existingThesis.supervisor_name,
        publication_date: existingThesis.publication_date || "",
        institution_id: existingThesis.institution?.id || "",
        department_id: existingThesis.department?.id || "",
        category_id: existingThesis.category?.id || "",
        keywords: existingThesis.tags ? existingThesis.tags.join(", ") : "",
        file_url: existingThesis.fileUrl || "",
      });
    }
  }, [existingThesis, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        keywords: data.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        file_url: data.file_url || undefined,
        publication_date: data.publication_date || undefined,
      };

      if (id) {
        await updateMutation.mutateAsync({ id, ...payload });
        toast({
          title: "Updated",
          description: "Thesis updated successfully.",
        });
      } else {
        await createMutation.mutateAsync(payload);
        toast({
          title: "Success",
          description: "Thesis published successfully.",
        });
      }
      navigate("/admin/theses");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: "Action Failed",
        description: err.message || "Please check your inputs.",
        variant: "destructive",
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (id && isLoadingThesis) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {id ? "Edit Thesis" : "Submit New Thesis"}
            </h1>
            <p className="text-gray-500 mt-1">
              Publish academic research directly to the central database.
            </p>
          </div>
          {!id && (
            <Button
              variant="outline"
              className="border-blue-200 text-blue-700 bg-blue-50"
              onClick={() => setIsExcelModalOpen(true)}
            >
              <UploadCloud className="mr-2 h-4 w-4" /> Bulk Excel Upload
            </Button>
          )}
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-8"
        >
          <div className="space-y-6">
            <h2 className="text-lg font-semibold border-b border-gray-100 pb-2">
              Core Information
            </h2>

            <div className="space-y-2">
              <Label>Thesis Title</Label>
              <Input
                {...register("title")}
                placeholder="Complete research title"
                className="bg-gray-50 border-gray-200"
              />
              {errors.title && (
                <p className="text-xs text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Author Name</Label>
                <Input
                  {...register("author_name")}
                  placeholder="Student/Researcher Name"
                  className="bg-gray-50 border-gray-200"
                />
                {errors.author_name && (
                  <p className="text-xs text-red-500">
                    {errors.author_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Supervisor Name</Label>
                <Input
                  {...register("supervisor_name")}
                  placeholder="Primary Guide"
                  className="bg-gray-50 border-gray-200"
                />
                {errors.supervisor_name && (
                  <p className="text-xs text-red-500">
                    {errors.supervisor_name.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-semibold border-b border-gray-100 pb-2">
              Academic Taxonomy
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Institution</Label>
                <Controller
                  name="institution_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="bg-gray-50">
                        <SelectValue placeholder="Select institution" />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        className="z-[100] max-h-64"
                      >
                        {institutions?.map((i) => (
                          <SelectItem key={i.id} value={i.id}>
                            {i.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.institution_id && (
                  <p className="text-xs text-red-500">
                    {errors.institution_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <Controller
                  name="department_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      disabled={!selectedInstitutionId}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="bg-gray-50">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        className="z-[100] max-h-64"
                      >
                        {filteredDepartments?.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.department_id && (
                  <p className="text-xs text-red-500">
                    {errors.department_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Research Category</Label>
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="bg-gray-50">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        className="z-[100] max-h-64"
                      >
                        {categories?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category_id && (
                  <p className="text-xs text-red-500">
                    {errors.category_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Publication Date</Label>
                <Input
                  type="date"
                  {...register("publication_date")}
                  className="bg-gray-50 border-gray-200"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-semibold border-b border-gray-100 pb-2">
              Content & Document
            </h2>

            <div className="space-y-2">
              <Label>Abstract</Label>
              <Textarea
                {...register("abstract")}
                rows={6}
                placeholder="Comprehensive summary..."
                className="bg-gray-50 border-gray-200 resize-none"
              />
              {errors.abstract && (
                <p className="text-xs text-red-500">
                  {errors.abstract.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Keywords (Comma separated)</Label>
              <Input
                {...register("keywords")}
                placeholder="e.g. Fiqh, Machine Learning, Sociology"
                className="bg-gray-50 border-gray-200"
              />
              {errors.keywords && (
                <p className="text-xs text-red-500">
                  {errors.keywords.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-blue-600" /> Document URL
                (Google Drive / Direct PDF)
              </Label>
              <Input
                {...register("file_url")}
                placeholder="https://drive.google.com/..."
                className="bg-gray-50 border-gray-200"
              />
              {errors.file_url && (
                <p className="text-xs text-red-500">
                  {errors.file_url.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Ensure all metadata is correct before publishing.
            </p>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 px-8 h-11 shadow-sm"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {id ? "Update Thesis" : "Publish Thesis"}
            </Button>
          </div>
        </form>
      </div>

      <ExcelUploadModal
        isOpen={isExcelModalOpen}
        onOpenChange={setIsExcelModalOpen}
        onUploadComplete={() => {
          setIsExcelModalOpen(false);
          navigate("/admin/theses");
        }}
      />
    </>
  );
}
