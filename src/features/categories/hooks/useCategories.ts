import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { APIResponse, ThesisCategory } from "@/types/api";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<ThesisCategory[]> => {
      const response = await api.get<unknown, APIResponse<ThesisCategory[]>>(
        "/thesis/categories/",
      );
      return response.data;
    },
  });
};
