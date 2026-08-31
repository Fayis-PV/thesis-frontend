import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface ThesisPayload {
  title: string;
  abstract: string;
  author_name: string;
  supervisor_name: string;
  institution_id: string;
  department_id: string;
  category_id: string;
  keywords: string[];
  publication_date?: string;
  file_url?: string;
}

export const useThesisMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["public-theses"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const createMutation = useMutation({
    mutationFn: async (data: ThesisPayload) =>
      api.post("/thesis/theses/", data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<ThesisPayload> & { id: string }) =>
      api.patch(`/thesis/theses/${id}/`, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/thesis/theses/${id}/`),
    onSuccess: invalidate,
  });

  const uploadExcelMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post("/thesis/upload-excel/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: invalidate,
  });

  // WORKFLOW MUTATIONS
  const approveMutation = useMutation({
    mutationFn: async (id: string) => api.post(`/thesis/theses/${id}/approve/`),
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) =>
      api.patch(`/thesis/theses/${id}/`, { status: "rejected" }),
    onSuccess: invalidate,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    uploadExcelMutation,
    approveMutation,
    rejectMutation,
  };
};
