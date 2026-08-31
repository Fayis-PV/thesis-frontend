import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface AnalyticsData {
  summary?: {
    total?: number;
    published?: number;
    total_views?: number;
    total_downloads?: number;
    by_status?: Array<{ status: string; count: number }>;
  };
  by_department?: Array<{
    department__code?: string;
    department__name?: string;
    total: number;
  }>;
  by_year?: Array<{ year: number; total: number }>;
  top_supervisors?: Array<{ supervisor: string; total: number }>;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const extractAnalytics = (response: unknown): AnalyticsData => {
  let payload = response;
  if (isRecord(payload) && "data" in payload) payload = payload.data;
  if (isRecord(payload) && "data" in payload && isRecord(payload.data)) {
    payload = payload.data;
  }
  return isRecord(payload) ? (payload as AnalyticsData) : {};
};

export const useAnalytics = () => {
  return useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async (): Promise<AnalyticsData> => {
      const response = await api.get<unknown>("/thesis/theses/analytics/");
      return extractAnalytics(response);
    },
    retry: false,
    refetchInterval: 300000, // Silently update stats every 5 minutes
  });
};
