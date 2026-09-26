import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Download,
  TrendingUp,
  Users,
  ArrowUpRight,
  BookOpen,
  Search,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAnalytics } from "@/features/admin/hooks/useAnalytics";

// Aesthetic Colors matching your UI inspiration
const COLORS = [
  "#818cf8",
  "#34d399",
  "#fbbf24",
  "#f87171",
  "#a78bfa",
  "#f472b6",
];

// Strict TypeScript Interfaces to replace 'any'
interface DepartmentStat {
  department__code?: string;
  department__name?: string;
  total: number;
}

interface BatchStat {
  batch_number: number;
  total: number;
}

interface SupervisorStat {
  supervisor: string;
  total: number;
}

interface AnalyticsData {
  summary?: {
    total?: number;
    published?: number;
    total_views?: number;
    total_downloads?: number;
    by_status?: { status: string; count: number }[];
  };
  by_department?: DepartmentStat[];
  by_batch?: BatchStat[];
  by_year?: { year: number; total: number }[];
  top_supervisors?: SupervisorStat[];
}

interface TrendingThesis {
  id: string;
  title: string;
  author_name: string;
  department?: { name: string };
  view_count: number;
  download_count: number;
}

export default function AdminDashboard() {
  // 1. Fetch Aggregated Analytics
  const { data, isLoading: analyticsLoading } = useAnalytics();
  const analytics = data as AnalyticsData | undefined;

  // 2. Fetch Trending Theses for the bottom table safely
  const { data: trendingTheses, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending-theses"],
    queryFn: async (): Promise<TrendingThesis[]> => {
      const res = await api.get<
        unknown,
        {
          data:
            | TrendingThesis[]
            | { results?: TrendingThesis[]; data?: TrendingThesis[] };
        }
      >("/thesis/theses/trending/");
      const responseData = res.data;
      if (Array.isArray(responseData)) return responseData;
      if (
        responseData &&
        "results" in responseData &&
        Array.isArray(responseData.results)
      )
        return responseData.results;
      if (
        responseData &&
        "data" in responseData &&
        Array.isArray(responseData.data)
      )
        return responseData.data;
      return [];
    },
  });

  if (analyticsLoading) {
    return (
      <>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-indigo-600"></div>
        </div>
      </>
    );
  }

  // Safely extract backend data
  const summary = analytics?.summary || {};
  const deptData = (analytics?.by_department || []).map(
    (d: DepartmentStat) => ({
      name: d.department__code || d.department__name || "Unknown",
      value: d.total,
    }),
  );
  const batchData = (analytics?.by_batch || []).map((b: BatchStat) => ({
    name: `Batch ${b.batch_number}`,
    count: b.total,
  }));
  const topSupervisors = analytics?.top_supervisors || [];

  // Static fallback sparkline data to avoid impure Math.random() in render
  const fallbackSparkline = [
    { count: 12 },
    { count: 28 },
    { count: 15 },
    { count: 35 },
    { count: 22 },
    { count: 45 },
    { count: 25 },
    { count: 42 },
    { count: 30 },
    { count: 48 },
  ];
  const sparklineData = batchData.length > 0 ? batchData : fallbackSparkline;

  // Helper for Avatar initials
  const getInitials = (name: string) => {
    return (
      name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase() || "NA"
    );
  };

  return (
    <>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Overview
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Detailed information about your repository
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-full bg-white">
              <Search className="h-4 w-4 text-gray-500" />
            </Button>
            <Link to="/admin/theses/create">
              <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700">
                Add New Thesis
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT COLUMN (Takes up 2/3 of the space) */}
          <div className="xl:col-span-2 space-y-6">
            {/* Top Bar Chart: Submission Analytics */}
            <Card className="rounded-2xl border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-800">
                    Submission Analytics
                  </CardTitle>
                  <p className="text-xs text-gray-400 mt-1 font-medium">
                    By Academic Cohort
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-600 hover:bg-gray-100"
                >
                  All Time
                </Badge>
              </CardHeader>
              <CardContent className="h-[280px] pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={batchData}
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f3f4f6"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: "#f9fafb" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#a78bfa"
                      radius={[6, 6, 0, 0]}
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Split Row: Donut Chart & List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Donut Chart: Departments */}
              <Card className="rounded-2xl border-gray-100 shadow-sm">
                <CardHeader className="pb-0">
                  <CardTitle className="text-base font-bold text-gray-800">
                    Top departments
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-[260px]">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={deptData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {deptData.map((_: unknown, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {deptData
                      .slice(0, 3)
                      .map((d: { name: string; value: number }, i: number) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 text-xs text-gray-500 font-medium"
                        >
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: COLORS[i % COLORS.length],
                            }}
                          ></div>
                          {d.name}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* List: Top Supervisors */}
              <Card className="rounded-2xl border-gray-100 shadow-sm flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-bold text-gray-800">
                      Top Supervisors
                    </CardTitle>
                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto pr-2">
                  <div className="space-y-4 mt-2">
                    {topSupervisors.map((sup: SupervisorStat, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-sm">
                          {getInitials(sup.supervisor)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {sup.supervisor}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            {sup.total} Theses
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant="secondary"
                            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50"
                          >
                            #{i + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Table: Trending Theses */}
            <Card className="rounded-2xl border-gray-100 shadow-sm">
              <CardHeader className="flex flex-row justify-between items-center pb-2">
                <CardTitle className="text-base font-bold text-gray-800">
                  Trending Research
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 font-medium border-b border-gray-100">
                      <tr>
                        <th className="pb-3 font-medium">Thesis Title</th>
                        <th className="pb-3 font-medium">Department</th>
                        <th className="pb-3 font-medium text-center">Views</th>
                        <th className="pb-3 font-medium text-center">
                          Downloads
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {trendingLoading ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-8 text-center text-gray-400"
                          >
                            Loading trends...
                          </td>
                        </tr>
                      ) : (
                        (trendingTheses || [])
                          .slice(0, 4)
                          .map((thesis: TrendingThesis) => (
                            <tr
                              key={thesis.id}
                              className="hover:bg-gray-50/50 transition-colors"
                            >
                              <td className="py-3 pr-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                    <BookOpen className="h-5 w-5 text-gray-500" />
                                  </div>
                                  <div className="min-w-0">
                                    <Link
                                      to={`/thesis/${thesis.id}`}
                                      className="font-bold text-gray-900 hover:text-indigo-600 truncate block max-w-[250px]"
                                    >
                                      {thesis.title}
                                    </Link>
                                    <p className="text-xs text-gray-500 truncate max-w-[250px]">
                                      {thesis.author_name}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 text-gray-600 font-medium">
                                {thesis.department?.name || "—"}
                              </td>
                              <td className="py-3 text-center text-emerald-600 font-bold bg-emerald-50/50 rounded-lg">
                                {thesis.view_count}
                              </td>
                              <td className="py-3 text-center text-gray-900 font-bold">
                                {thesis.download_count}
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN (Takes up 1/3 of the space - Stat Cards) */}
          <div className="xl:col-span-1 space-y-6">
            {/* Dark Card: Repository Size */}
            <Card className="rounded-3xl bg-[#1e293b] text-white border-none shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm font-medium text-slate-300">
                    Total Theses
                  </p>
                  <Users className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex items-end gap-3 mb-6">
                  <h2 className="text-5xl font-bold tracking-tight">
                    {summary.total || 0}
                  </h2>
                  <span className="flex items-center text-emerald-400 text-sm font-bold mb-1 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                    <TrendingUp className="h-3 w-3 mr-1" /> Published:{" "}
                    {summary.published || 0}
                  </span>
                </div>
                {/* Mini Progress Bar representation */}
                <div className="flex h-12 gap-2 mt-4">
                  <div
                    className="bg-white/20 rounded-lg h-full"
                    style={{ width: "40%" }}
                  ></div>
                  <div
                    className="bg-white/10 rounded-lg h-full"
                    style={{ width: "60%" }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-xs font-medium text-slate-400">
                  <span>Pending</span>
                  <span>Published</span>
                </div>
              </CardContent>
            </Card>

            {/* Gradient Card: Global Views */}
            <Card className="rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-medium text-indigo-100">
                    Total Views
                  </p>
                  <Eye className="h-4 w-4 text-indigo-200" />
                </div>
                <h2 className="text-4xl font-bold tracking-tight mb-1">
                  {summary.total_views?.toLocaleString() || 0}
                </h2>
                <p className="text-xs text-indigo-200 font-medium mb-6">
                  Across all documents
                </p>

                {/* Mini Bar Chart */}
                <div className="h-[60px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sparklineData}>
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.1)" }}
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "none",
                          color: "#fff",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="rgba(255,255,255,0.8)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Light Card: Downloads & Actions */}
            <Card className="rounded-3xl border-gray-100 shadow-sm bg-orange-50/30">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-bold text-gray-800">
                    Total Downloads
                  </p>
                  <Download className="h-4 w-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
                    {summary.total_downloads?.toLocaleString() || 0}
                  </h2>
                </div>

                {/* Mini Line Area Chart */}
                <div className="h-[80px] w-full mt-2 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparklineData}>
                      <defs>
                        <linearGradient
                          id="colorCount"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#f59e0b"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#f59e0b"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Tooltip
                        contentStyle={{ borderRadius: "8px", border: "none" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorCount)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-auto">
                  <Button className="w-full rounded-xl bg-[#1e293b] hover:bg-slate-800 text-white h-12 text-sm font-bold shadow-md">
                    <Download className="mr-2 h-4 w-4" /> Export Statistics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
