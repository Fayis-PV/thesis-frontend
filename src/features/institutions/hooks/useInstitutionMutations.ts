import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface CreateData {
  name: string;
  code: string;
  country: string;
  website: string | null;
}

interface UpdateData extends CreateData {
  id: string;
}

export const useInstitutionMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: CreateData) => {
      return await api.post("/thesis/institutions/", data);
    },
    onSuccess: () => {
      // Instantly refresh the table by invalidating the cache
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateData) => {
      const { id, ...payload } = data;
      return await api.put(`/thesis/institutions/${id}/`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/thesis/institutions/${id}/`);
    },
    onSuccess: () => {
      // Instantly remove the row from the table
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
};
