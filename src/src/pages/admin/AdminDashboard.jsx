import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  FileCheck2,
  Clock,
  Eye,
  Download,
  FileText,
  FilePlus2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { analyticsApi } from "@/api/analyticsApi";
import { StatCardSkeleton } from "@/components/common/Skeletons";
import { ErrorState } from "@/components/common/EmptyState";
import { Link } from "react-router-dom";

const PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const ACTIVITY_STYLES = {
  submission: { icon: FilePlus2, tone: "text-blue-600" },
  approval: { icon: CheckCircle2, tone: "text-emerald-600" },
  publication: { icon: FileCheck2, tone: "text-primary" },
  rejection: { icon: XCircle, tone: "text-destructive" },
  bulk_upload: { icon: FileText, tone: "text-amber-600" },
};

export default function AdminDashboard() {
  const [range, setRange] = useState("30d");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["analytics", "summary", range],
    queryFn: () => analyticsApi.summary({ range }),
  });

  if (isError) return <ErrorState onRetry={refetch} />;

  const kpis = data
    ? [
        {
          label: "Published",
          value: data.totalPublished,
          icon: FileCheck2,
          tone: "text-primary",
        },
        {
          label: "Pending Review",
          value: data.pendingReview,
          icon: Clock,
          tone: "text-amber-600",
        },
        {
          label: "Total Views",
          value: data.totalViews,
          icon: Eye,
          tone: "text-blue-600",
        },
        {
          label: "Total Downloads",
          value: data.totalDownloads,
          icon: Download,
          tone: "text-emerald-600",
        },
      ]
    : [];

  const statusMetrics = data
    ? [
        { label: "Drafts", value: data.drafts, icon: FileText },
        { label: "Submitted", value: data.submitted, icon: FilePlus2 },
        { label: "Approved", value: data.approved, icon: CheckCircle2 },
        { label: "Rejected", value: data.rejected, icon: XCircle },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Repository activity and performance overview
          </p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : kpis.map((k) => (
              <Card key={k.label}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{k.label}</p>
                    <k.icon className={`h-4 w-4 ${k.tone}`} />
                  </div>
                  <p className="mt-3 font-display text-3xl font-semibold">
                    {k.value.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Status metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))
          : statusMetrics.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 rounded-lg border bg-card p-4"
              >
                <s.icon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="font-semibold">{s.value}</p>
                </div>
              </div>
            ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Submission & publication trend"
          description="Theses submitted vs published over time"
          isLoading={isLoading}
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data?.trends || []}>
              <defs>
                <linearGradient id="gSub" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="gPub" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(d) => d.slice(5)}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                className="text-muted-foreground"
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="submissions"
                stroke="hsl(var(--chart-1))"
                fill="url(#gSub)"
                name="Submissions"
              />
              <Area
                type="monotone"
                dataKey="publications"
                stroke="hsl(var(--chart-2))"
                fill="url(#gPub)"
                name="Publications"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Views & downloads"
          description="Engagement over time"
          isLoading={isLoading}
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data?.trends || []}>
              <defs>
                <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-3))"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-3))"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="gDl" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-4))"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-4))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(d) => d.slice(5)}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="views"
                stroke="hsl(var(--chart-3))"
                fill="url(#gViews)"
                name="Views"
              />
              <Area
                type="monotone"
                dataKey="downloads"
                stroke="hsl(var(--chart-4))"
                fill="url(#gDl)"
                name="Downloads"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Department distribution"
          description="Theses by department"
          isLoading={isLoading}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={data?.departmentDistribution || []}
              layout="vertical"
              margin={{ left: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10 }}
                width={120}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="value"
                fill="hsl(var(--chart-1))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Category distribution"
          description="Theses by category"
          isLoading={isLoading}
        >
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data?.categoryDistribution || []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {(data?.categoryDistribution || []).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Trending + Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top engaging theses</CardTitle>
            <CardDescription>Most viewed and downloaded</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Downloads</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.trending.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">
                        <Link
                          to={`/thesis/${t.id}`}
                          className="hover:text-primary line-clamp-1"
                        >
                          {t.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {t.author}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        {t.views.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {t.downloads.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
            <CardDescription>Latest repository events</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <ul className="space-y-1">
                {data.recentActivity.map((a) => {
                  const cfg =
                    ACTIVITY_STYLES[a.type] || ACTIVITY_STYLES.submission;
                  return (
                    <li
                      key={a.id}
                      className="flex items-start gap-3 rounded-md px-2 py-2.5 hover:bg-muted/40"
                    >
                      <cfg.icon
                        className={`mt-0.5 h-4 w-4 shrink-0 ${cfg.tone}`}
                      />
                      <div>
                        <p className="text-sm text-foreground">{a.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(a.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.5rem",
  fontSize: "12px",
  color: "hsl(var(--popover-foreground))",
};

function ChartCard({ title, description, isLoading, children }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-[260px] w-full" /> : children}
      </CardContent>
    </Card>
  );
}
