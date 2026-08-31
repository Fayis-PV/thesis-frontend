/** Analytics API — repository-wide metrics. */
import { mockRequest } from "./mockRequest";
import {
  theses,
  departments,
  categories,
  institutionName,
  departmentName,
  categoryName,
} from "./mockData";
import { THESIS_STATUS } from "@/types/models";

export const analyticsApi = {
  async summary({ range = "30d" } = {}) {
    // return http.get("/analytics/summary/", { range });
    return mockRequest(() => {
      const published = theses.filter(
        (t) => t.status === THESIS_STATUS.PUBLISHED,
      );
      const pending = theses.filter((t) =>
        [THESIS_STATUS.SUBMITTED, THESIS_STATUS.UNDER_REVIEW].includes(
          t.status,
        ),
      );
      const totalViews = theses.reduce((s, t) => s + t.views, 0);
      const totalDownloads = theses.reduce((s, t) => s + t.downloads, 0);

      const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
      const trends = Array.from({ length: days }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        const seed = i * 7 + 3;
        return {
          date: d.toISOString().slice(0, 10),
          submissions: Math.round(4 + 3 * Math.sin(seed / 3) + (i % 5)),
          publications: Math.round(2 + 2 * Math.cos(seed / 4) + (i % 3)),
          views: Math.round(120 + 40 * Math.sin(seed / 2) + (i % 9) * 6),
          downloads: Math.round(40 + 15 * Math.sin(seed / 2) + (i % 7) * 3),
        };
      });

      const deptMap = {};
      theses.forEach((t) => {
        deptMap[t.departmentId] = (deptMap[t.departmentId] || 0) + 1;
      });
      const departmentDistribution = Object.entries(deptMap).map(
        ([id, value]) => ({ name: departmentName(id), value }),
      );

      const catMap = {};
      theses.forEach((t) => {
        catMap[t.categoryId] = (catMap[t.categoryId] || 0) + 1;
      });
      const categoryDistribution = Object.entries(catMap).map(
        ([id, value]) => ({ name: categoryName(id), value }),
      );

      const trending = [...theses]
        .sort((a, b) => b.views + b.downloads * 2 - (a.views + a.downloads * 2))
        .slice(0, 5)
        .map((t) => ({
          id: t.id,
          title: t.title,
          author: t.author,
          views: t.views,
          downloads: t.downloads,
        }));

      const recentActivity = [
        {
          id: "a1",
          type: "submission",
          message: `"${theses[4].title}" submitted by ${theses[4].author}`,
          createdAt: "2025-08-22T10:00:00Z",
        },
        {
          id: "a2",
          type: "approval",
          message: `"${theses[5].title}" approved for publication`,
          createdAt: "2025-08-21T14:30:00Z",
        },
        {
          id: "a3",
          type: "publication",
          message: `"${theses[0].title}" published`,
          createdAt: "2025-08-20T09:15:00Z",
        },
        {
          id: "a4",
          type: "rejection",
          message: `"${theses[2].title}" rejected — missing ethics approval`,
          createdAt: "2025-08-19T16:45:00Z",
        },
        {
          id: "a5",
          type: "bulk_upload",
          message: "Bulk upload: 24 theses imported from MIT — CSAI",
          createdAt: "2025-08-18T11:20:00Z",
        },
      ];

      return {
        totalPublished: published.length,
        pendingReview: pending.length,
        totalViews,
        totalDownloads,
        drafts: theses.filter((t) => t.status === THESIS_STATUS.DRAFT).length,
        submitted: theses.filter((t) => t.status === THESIS_STATUS.SUBMITTED)
          .length,
        approved: theses.filter((t) => t.status === THESIS_STATUS.APPROVED)
          .length,
        rejected: theses.filter((t) => t.status === THESIS_STATUS.REJECTED)
          .length,
        institutions: new Set(theses.map((t) => t.institutionId)).size,
        departments: departments.length,
        trends,
        departmentDistribution,
        categoryDistribution,
        trending,
        recentActivity,
      };
    });
  },
};
