import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/common/PageHeader";
import { thesisApi } from "@/api/thesisApi";
import { institutionApi } from "@/api/institutionApi";
import { departmentApi } from "@/api/departmentApi";
import { categoryApi } from "@/api/categoryApi";
import { THESIS_STATUS, STATUS_LABELS } from "@/types/models";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  abstract: z.string().min(20, "Abstract must be at least 20 characters"),
  keywords: z.string().min(1, "Add at least one keyword"),
  author: z.string().min(2, "Author is required"),
  supervisor: z.string().min(2, "Supervisor is required"),
  coSupervisors: z.string().optional(),
  institutionId: z.string().min(1, "Select an institution"),
  departmentId: z.string().min(1, "Select a department"),
  categoryId: z.string().min(1, "Select a category"),
  publicationDate: z.string().min(1, "Publication date is required"),
  fileUrl: z.string().optional(),
  status: z.enum([THESIS_STATUS.DRAFT, THESIS_STATUS.SUBMITTED]),
});

export default function ThesisForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: institutions } = useQuery({
    queryKey: ["institutions"],
    queryFn: () => institutionApi.list(),
  });
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.list(),
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { status: THESIS_STATUS.DRAFT, coSupervisors: "" },
  });

  const institutionId = watch("institutionId");

  const { data: departments } = useQuery({
    queryKey: ["departments", institutionId],
    queryFn: () => departmentApi.list({ institutionId }),
    enabled: !!institutionId,
  });

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ["thesis", "edit", id],
    queryFn: () => thesisApi.getById(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        abstract: existing.abstract,
        keywords: existing.keywords.join(", "),
        author: existing.author,
        supervisor: existing.supervisor,
        coSupervisors: existing.coSupervisors.join(", "),
        institutionId: existing.institutionId,
        departmentId: existing.departmentId,
        categoryId: existing.categoryId,
        publicationDate: existing.publicationDate.slice(0, 10),
        fileUrl: existing.fileUrl || "",
        status:
          existing.status === THESIS_STATUS.DRAFT
            ? THESIS_STATUS.DRAFT
            : THESIS_STATUS.SUBMITTED,
      });
    }
  }, [existing, reset]);

  // hierarchical category options grouped by parent
  const categoryOptions = useMemo(() => {
    if (!categories) return [];
    const roots = categories.filter((c) => !c.parentId);
    return roots.map((r) => ({
      ...r,
      children: categories.filter((c) => c.parentId === r.id),
    }));
  }, [categories]);

  const mutation = useMutation({
    mutationFn: (payload) =>
      isEdit ? thesisApi.update(id, payload) : thesisApi.create(payload),
    onSuccess: (t) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "theses"] });
      queryClient.invalidateQueries({ queryKey: ["theses"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success(isEdit ? "Thesis updated" : "Thesis created");
      navigate(`/admin/theses/${t.id}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const onSubmit = (values) => {
    const payload = {
      ...values,
      keywords: values.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      coSupervisors: values.coSupervisors
        ? values.coSupervisors
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
        : [],
    };
    mutation.mutate(payload);
  };

  if (isEdit && loadingExisting) return <Skeleton className="h-96 w-full" />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit thesis" : "New thesis"}
        description={
          isEdit ? "Update the thesis record" : "Create a new thesis record"
        }
        actions={
          <>
            <Button type="button" variant="outline" asChild>
              <Link to="/admin/theses">
                <ArrowLeft className="h-4 w-4" /> Cancel
              </Link>
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setValue("status", THESIS_STATUS.DRAFT);
                handleSubmit(onSubmit)();
              }}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4" /> Save draft
            </Button>
            <Button
              type="button"
              onClick={() => {
                setValue("status", THESIS_STATUS.SUBMITTED);
                handleSubmit(onSubmit)();
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving…" : "Submit"}
            </Button>
          </>
        }
      />

      {isDirty && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
          You have unsaved changes.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Core information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Title" error={errors.title} required>
              <Input {...register("title")} placeholder="Thesis title" />
            </Field>
            <Field label="Abstract" error={errors.abstract} required>
              <Textarea
                rows={6}
                {...register("abstract")}
                placeholder="Abstract…"
              />
            </Field>
            <Field
              label="Keywords (comma-separated)"
              error={errors.keywords}
              required
            >
              <Input
                {...register("keywords")}
                placeholder="machine learning, transformers"
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Authorship</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Author" error={errors.author} required>
              <Input {...register("author")} placeholder="Author name" />
            </Field>
            <Field label="Supervisor" error={errors.supervisor} required>
              <Input
                {...register("supervisor")}
                placeholder="Supervisor name"
              />
            </Field>
            <Field
              label="Co-supervisors (comma-separated)"
              error={errors.coSupervisors}
            >
              <Input
                {...register("coSupervisors")}
                placeholder="Dr. A, Prof. B"
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Taxonomy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Institution" error={errors.institutionId} required>
              <Controller
                control={control}
                name="institutionId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select institution" />
                    </SelectTrigger>
                    <SelectContent>
                      {(institutions || []).map((i) => (
                        <SelectItem key={i.id} value={i.id}>
                          {i.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Department" error={errors.departmentId} required>
              <Controller
                control={control}
                name="departmentId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!institutionId}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          institutionId
                            ? "Select department"
                            : "Select institution first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(departments || []).map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Category" error={errors.categoryId} required>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((r) => (
                        <SelectGroup key={r.id}>
                          <SelectItem value={r.id}>{r.name}</SelectItem>
                          {r.children.map((c) => (
                            <SelectItem
                              key={c.id}
                              value={c.id}
                              className="pl-6"
                            >
                              — {c.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Publication & document</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field
              label="Publication date"
              error={errors.publicationDate}
              required
            >
              <Input type="date" {...register("publicationDate")} />
            </Field>
            <Field
              label="Document URL (Google Drive /view link)"
              error={errors.fileUrl}
            >
              <Input
                {...register("fileUrl")}
                placeholder="https://drive.google.com/file/d/…/view"
              />
            </Field>
            <Field label="Status">
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={THESIS_STATUS.DRAFT}>
                        {STATUS_LABELS.draft}
                      </SelectItem>
                      <SelectItem value={THESIS_STATUS.SUBMITTED}>
                        {STATUS_LABELS.submitted}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

function Field({ label, error, required, children }) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}

function SelectGroup({ children }) {
  return <div className="py-1">{children}</div>;
}
