import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { APIResponse, Thesis } from "@/types/api";

export const useTheses = () => {
  return useQuery({
    queryKey: ["theses"],
    queryFn: async (): Promise<Thesis[]> => {
      const response = await api.get<unknown, APIResponse<Thesis[]>>(
        "/thesis/theses/",
      );
      return response.data;
    },
  });
};
