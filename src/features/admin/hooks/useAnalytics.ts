import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DRP_MOCK_ANALYTICS } from "@/lib/mock/drp-mock-data";

export interface DepartmentStat {
  department__code?: string;
  department__name?: string;
  total: number;
}

export interface BatchStat {
  batch_number: number;
  total: number;
}

export interface SupervisorStat {
  supervisor: string;
  total: number;
}

export interface YearStat {
  year: number;
  total: number;
}

export interface AnalyticsData {
  summary?: {
    total?: number;
    published?: number;
    total_views?: number;
    total_downloads?: number;
    total_citations?: number;
    by_status?: Array<{ status: string; count: number }>;
  };
  by_department?: DepartmentStat[];
  by_batch?: BatchStat[];
  by_year?: YearStat[];
  top_supervisors?: SupervisorStat[];
}

const FALLBACK_ANALYTICS: AnalyticsData = DRP_MOCK_ANALYTICS;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const extractAnalytics = (response: unknown): AnalyticsData => {
  let payload = response;
  if (isRecord(payload) && "data" in payload) payload = payload.data;
  if (isRecord(payload) && "data" in payload && isRecord(payload.data)) {
    payload = payload.data;
  }
  if (isRecord(payload) && payload.summary) {
    return payload as AnalyticsData;
  }
  return FALLBACK_ANALYTICS;
};

export const useAnalytics = () => {
  return useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async (): Promise<AnalyticsData> => {
      try {
        const response = await api.get<unknown>("/thesis/theses/analytics/");
        return extractAnalytics(response);
      } catch {
        return FALLBACK_ANALYTICS;
      }
    },
    retry: false,
    refetchInterval: 300000,
  });
};
