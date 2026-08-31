import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// --- Types ---
export interface Institution {
  id: string;
  name: string;
  code: string;
  country: string;
  website?: string;
  thesis_count?: number;
  department_count?: number;
}
export interface Department {
  id: string;
  name: string;
  code: string;
  website?: string;
  institution: Institution;
  thesis_count?: number;
}
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string | null;
  thesis_count?: number;
  children?: Category[];
}

export interface TaxonomyMutationData {
  [key: string]: string | null | undefined;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const extractArray = (response: unknown): unknown[] => {
  let payload = response;
  if (isRecord(payload) && "data" in payload) payload = payload.data;
  if (Array.isArray(payload)) return payload;
  if (isRecord(payload)) {
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.results)) return payload.results;
  }
  return [];
};

// --- Queries ---
export const useInstitutions = () =>
  useQuery({
    queryKey: ["institutions"],
    queryFn: async (): Promise<Institution[]> =>
      extractArray(await api.get("/thesis/institutions/")) as Institution[],
  });

export const useDepartments = () =>
  useQuery({
    queryKey: ["departments"],
    queryFn: async (): Promise<Department[]> =>
      extractArray(await api.get("/thesis/departments/")) as Department[],
  });

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> =>
      extractArray(await api.get("/thesis/categories/")) as Category[],
  });

// --- Mutations ---
export const useTaxonomyMutations = (queryKey: string, endpoint: string) => {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [queryKey] });

  return {
    create: useMutation({
      mutationFn: async (data: TaxonomyMutationData) =>
        api.post(`/thesis/${endpoint}/`, data),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: async ({
        id,
        ...data
      }: TaxonomyMutationData & { id: string }) =>
        api.patch(`/thesis/${endpoint}/${id}/`, data),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: async (id: string) =>
        api.delete(`/thesis/${endpoint}/${id}/`),
      onSuccess: invalidate,
    }),
  };
};
