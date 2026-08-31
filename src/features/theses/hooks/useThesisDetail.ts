import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Thesis } from "@/types/api";

export const useThesisDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ["thesis", id],
    queryFn: async (): Promise<Thesis> => {
      const response = await api.get<
        unknown,
        { data: { data?: Thesis } | Thesis }
      >(`/thesis/theses/${id}/`);
      const payload = response.data;
      const thesisData =
        "data" in payload ? (payload.data ?? payload) : payload;

      return thesisData as Thesis;
    },
    enabled: !!id,
  });
};
