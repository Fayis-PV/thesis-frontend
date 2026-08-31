import { api } from "@/lib/api";
import type { APIResponse, Institution } from "@/types/api";

export const getInstitutions = async (): Promise<Institution[]> => {
  // Our Axios interceptor automatically unwraps the outer Axios response,
  // so this returns your custom APIResponse object.
  const response = await api.get<unknown, APIResponse<Institution[]>>(
    "/thesis/institutions/",
  );

  // Return the actual array of institutions
  return response.data;
};
