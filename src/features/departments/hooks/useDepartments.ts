import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { APIResponse, Department } from "@/types/api";

export const useDepartments = () => {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async (): Promise<Department[]> => {
      try {
        const response = await api.get<unknown, APIResponse<Department[]>>(
          "/thesis/departments/",
        );
        console.log("Fetched departments from backend:", response.data);
        if (response?.data && response.data.length > 0) {
          return response.data;
        }
      } catch {
        // Fallback to local academic departments dataset when backend is offline
      }
      throw new Error("Failed to fetch departments from the backend. Using local dataset instead.");
    },
  });
};
