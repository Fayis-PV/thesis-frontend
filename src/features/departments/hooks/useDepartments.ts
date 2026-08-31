import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { APIResponse, Department } from "@/types/api";

export const useDepartments = () => {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async (): Promise<Department[]> => {
      const response = await api.get<unknown, APIResponse<Department[]>>(
        "/thesis/departments/",
      );
      return response.data;
    },
  });
};
