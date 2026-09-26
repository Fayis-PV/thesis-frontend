import {
  Activity,
  BarChart2,
  Clock,
  Download,
  Eye,
  FileText,
  PieChartIcon,
  TrendingUp,
  Users,
  Building2,
} from "lucide-react";
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
  Legend,
  LineChart,
  Line,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalytics } from "@/features/admin/hooks/useAnalytics";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#64748b",
];

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  const summary = data?.summary || {};
  const statusData = summary.by_status || [];
  const deptData = (data?.by_department || []).map((d) => ({
    name: d.department__code || d.department__name,
    count: d.total,
  }));
  const yearData = (data?.by_year || []).map((y) => ({
    year: String(y.year),
    count: y.total,
  }));
  const topSupervisors = data?.top_supervisors || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="text-blue-600" /> Analytics Command Center
        </h2>
        <p className="text-gray-500 mt-1">
          Real-time PostgreSQL aggregations of repository performance.
        </p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-blue-50/50 border-blue-100">
          <CardContent className="p-4">
            <FileText className="h-5 w-5 text-blue-600 mb-2" />
            <p className="text-xs text-gray-500 font-medium">Total Theses</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary.total || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50/50 border-emerald-100">
          <CardContent className="p-4">
            <TrendingUp className="h-5 w-5 text-emerald-600 mb-2" />
            <p className="text-xs text-gray-500 font-medium">Published</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary.published || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50/50 border-amber-100">
          <CardContent className="p-4">
            <Clock className="h-5 w-5 text-amber-600 mb-2" />
            <p className="text-xs text-gray-500 font-medium">Pending Review</p>
            <p className="text-2xl font-bold text-gray-900">
              {(summary.total || 0) - (summary.published || 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50/50 border-purple-100">
          <CardContent className="p-4">
            <Eye className="h-5 w-5 text-purple-600 mb-2" />
            <p className="text-xs text-gray-500 font-medium">Total Views</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary.total_views || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-rose-50/50 border-rose-100">
          <CardContent className="p-4">
            <Download className="h-5 w-5 text-rose-600 mb-2" />
            <p className="text-xs text-gray-500 font-medium">Total Downloads</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary.total_downloads || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" /> Submissions by Year
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={yearData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="year"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Submissions"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-blue-600" /> Status
              Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {statusData.map((_, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  formatter={(value: string) => (
                    <span className="text-sm text-gray-700 capitalize">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" /> Department
              Output
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={deptData}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#e5e7eb"
                />
                <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fill: "#4b5563", fontSize: 11, fontWeight: 500 }}
                />
                <Tooltip cursor={{ fill: "#f3f4f6" }} />
                <Bar
                  dataKey="count"
                  name="Theses"
                  fill="#10b981"
                  radius={[0, 4, 4, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" /> Top Supervisors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mt-2">
              {topSupervisors.map((s, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                      #{i + 1}
                    </div>
                    <span className="font-medium text-gray-900">
                      {s.supervisor}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-white border-gray-200"
                  >
                    {s.total} Theses
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
