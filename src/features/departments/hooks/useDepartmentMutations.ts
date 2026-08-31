import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface CreateData {
  name: string;
  code: string;
  institution_id: string;
}

interface UpdateData extends CreateData {
  id: string;
}

export const useDepartmentMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: CreateData) => {
      return await api.post("/thesis/departments/", data);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateData) => {
      const { id, ...payload } = data;
      return await api.put(`/thesis/departments/${id}/`, payload);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/thesis/departments/${id}/`);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });

  return { createMutation, updateMutation, deleteMutation };
};
