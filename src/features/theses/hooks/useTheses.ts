import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { APIResponse, Thesis } from "@/types/api";
import { ACADEMIC_THESES } from "@/lib/academic-data";

export const useTheses = () => {
  return useQuery({
    queryKey: ["theses"],
    queryFn: async (): Promise<Thesis[]> => {
      try {
        const response = await api.get<unknown, APIResponse<Thesis[]>>(
          "/thesis/theses/",
        );
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }
      } catch {
        // Fallback to local academic dataset
      }
      return ACADEMIC_THESES;
    },
  });
};
