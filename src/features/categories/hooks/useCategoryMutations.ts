import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface CreateData {
  name: string;
  description?: string;
}

interface UpdateData extends CreateData {
  id: string;
}

export const useCategoryMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: CreateData) => {
      return await api.post("/thesis/categories/", data);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateData) => {
      const { id, ...payload } = data;
      return await api.put(`/thesis/categories/${id}/`, payload);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/thesis/categories/${id}/`);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  return { createMutation, updateMutation, deleteMutation };
};
