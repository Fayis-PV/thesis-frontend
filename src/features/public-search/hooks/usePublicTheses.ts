import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Thesis } from "@/types/api";
import { ACADEMIC_THESES } from "@/lib/academic-data";

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

function filterLocalTheses(filters: SearchFilters): PaginatedResponse {
  let list = [...ACADEMIC_THESES];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.author_name.toLowerCase().includes(q) ||
        t.supervisor_name.toLowerCase().includes(q) ||
        t.abstract.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q)),
    );
  }

  if (filters.department) {
    const deptFilter = filters.department.toLowerCase();
    list = list.filter(
      (t) =>
        t.department?.id.toLowerCase() === deptFilter ||
        t.department?.name.toLowerCase() === deptFilter,
    );
  }

  if (filters.category) {
    const catFilter = filters.category.toLowerCase();
    list = list.filter(
      (t) =>
        t.category?.id.toLowerCase() === catFilter ||
        t.category?.name.toLowerCase() === catFilter,
    );
  }

  if (filters.year) {
    const y = parseInt(filters.year, 10);
    if (!isNaN(y)) {
      list = list.filter((t) => t.year === y);
    }
  }

  if (filters.author) {
    const a = filters.author.toLowerCase();
    list = list.filter((t) => t.author_name.toLowerCase().includes(a));
  }

  if (filters.supervisor) {
    const s = filters.supervisor.toLowerCase();
    list = list.filter((t) => t.supervisor_name.toLowerCase().includes(s));
  }

  // Ordering
  if (filters.ordering) {
    const isDesc = filters.ordering.startsWith("-");
    const field = isDesc ? filters.ordering.substring(1) : filters.ordering;

    list.sort((a, b) => {
      let valA: unknown = 0;
      let valB: unknown = 0;

      if (field === "view_count") {
        valA = a.view_count ?? 0;
        valB = b.view_count ?? 0;
      } else if (field === "download_count") {
        valA = a.download_count ?? 0;
        valB = b.download_count ?? 0;
      } else if (field === "title") {
        valA = a.title;
        valB = b.title;
      } else if (field === "created_at" || field === "publication_date") {
        valA = new Date(a.publication_date || a.created_at).getTime();
        valB = new Date(b.publication_date || b.created_at).getTime();
      }

      if (typeof valA === "number" && typeof valB === "number") {
        return isDesc ? valB - valA : valA - valB;
      }
      if (typeof valA === "string" && typeof valB === "string") {
        return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
      }
      return 0;
    });
  }

  const pageSize = 12;
  const page = Math.max(1, filters.page || 1);
  const start = (page - 1) * pageSize;
  const pageResults = list.slice(start, start + pageSize);

  return {
    count: list.length,
    next: start + pageSize < list.length ? `page=${page + 1}` : null,
    previous: page > 1 ? `page=${page - 1}` : null,
    results: pageResults,
  };
}

export const usePublicTheses = (filters: SearchFilters) => {
  return useQuery({
    queryKey: ["public-theses", filters],
    queryFn: async (): Promise<PaginatedResponse> => {
      try {
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
              status: filters.status || "published",
              ordering: filters.ordering || undefined,
              page: filters.page || 1,
            },
          },
        );
        if (response?.data?.results) {
          return response.data;
        }
      } catch {
        // Fallback to local academic filtered dataset
      }
      return filterLocalTheses(filters);
    },
    // Keep previous data on screen while fetching new data for smooth UI
    placeholderData: (previousData) => previousData,
  });
};
