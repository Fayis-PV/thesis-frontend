import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { APIResponse, ThesisCategory } from "@/types/api";
import { ACADEMIC_CATEGORIES } from "@/lib/academic-data";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<ThesisCategory[]> => {
      try {
        const response = await api.get<unknown, APIResponse<ThesisCategory[]>>(
          "/thesis/categories/",
        );
        if (response?.data && response.data.length > 0) {
          return response.data;
        }
      } catch {
        // Fallback to local academic categories dataset when backend is offline
      }
      return ACADEMIC_CATEGORIES;
    },
  });
};
