import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Thesis } from "@/types/api";
import { ACADEMIC_THESES } from "@/lib/academic-data";

export const useThesisDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ["thesis", id],
    queryFn: async (): Promise<Thesis> => {
      try {
        const response = await api.get<
          unknown,
          { data: { data?: Thesis } | Thesis }
        >(`/thesis/theses/${id}/`);
        const payload = response.data;
        const thesisData =
          "data" in payload ? (payload.data ?? payload) : payload;

        if (thesisData && (thesisData as Thesis).id) {
          return thesisData as Thesis;
        }
      } catch {
        // Fallback
      }

      const localThesis = ACADEMIC_THESES.find((t) => t.id === id);
      if (localThesis) {
        return localThesis;
      }

      // If id is not strictly matching, return the first one as preview
      return ACADEMIC_THESES[0];
    },
    enabled: !!id,
  });
};
