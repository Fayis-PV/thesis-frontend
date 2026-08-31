import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Thesis } from "@/types/api";

export interface SearchFilters {
  search?: string;
  institution?: string;
  department?: string;
  category?: string;
  year?: string;
  author?: string;
  supervisor?: string;
  status?: string;
  ordering?: string;
  page?: number;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Thesis[];
}

export const usePublicTheses = (filters: SearchFilters) => {
  return useQuery({
    queryKey: ["public-theses", filters],
    queryFn: async (): Promise<PaginatedResponse> => {
      // Axios automatically removes keys with `undefined` values from the URL
      const response = await api.get<unknown, { data: PaginatedResponse }>(
        "/thesis/theses/",
        {
          params: {
            search: filters.search || undefined,
            institution: filters.institution || undefined,
            department: filters.department || undefined,
            category: filters.category || undefined,
            year: filters.year || undefined,
            author: filters.author || undefined,
            supervisor: filters.supervisor || undefined,
            status: filters.status || "published", // Default public view to published
            ordering: filters.ordering || undefined,
            page: filters.page || 1,
          },
        },
      );
      return response.data;
    },
    // Keep previous data on screen while fetching new data for smooth UI
    placeholderData: (previousData) => previousData,
  });
};
