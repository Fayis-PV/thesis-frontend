/**
 * Thesis API — list (server-side pagination + filters), get, create, update,
 * delete, and status transitions.
 *
 * Real endpoints (DRF):
 *   GET    /theses/?page=&page_size=&search=&status=&institution=&department=&category=&year=
 *   GET    /theses/:id/
 *   POST   /theses/
 *   PATCH  /theses/:id/
 *   DELETE /theses/:id/
 *   POST   /theses/:id/approve/ | /reject/ | /publish/
 */
import { mockRequest } from "./mockRequest";
import {
  theses as DATA,
  institutionName,
  departmentName,
  categoryName,
} from "./mockData";
import { THESIS_STATUS } from "@/types/models";

let store = [...DATA];

function matches(t, q) {
  if (!q.search) return true;
  const s = q.search.toLowerCase();
  return (
    t.title.toLowerCase().includes(s) ||
    t.author.toLowerCase().includes(s) ||
    t.supervisor.toLowerCase().includes(s) ||
    t.abstract.toLowerCase().includes(s) ||
    t.keywords.some((k) => k.toLowerCase().includes(s))
  );
}

export const thesisApi = {
  /**
   * @param {Object} q
   * @param {number} [q.page=1]
   * @param {number} [q.pageSize=12]
   * @param {string} [q.search]
   * @param {string} [q.status]
   * @param {string} [q.institutionId]
   * @param {string} [q.departmentId]
   * @param {string} [q.categoryId]
   * @param {number} [q.year]
   * @param {string} [q.sort]  // newest|views|downloads|title
   */
  async list(q = {}) {
    const page = q.page ?? 1;
    const pageSize = q.pageSize ?? 12;
    // return http.get("/theses/", { ...q });
    return mockRequest(() => {
      let rows = store.filter((t) => matches(t, q));
      if (q.status && q.status !== "all")
        rows = rows.filter((t) => t.status === q.status);
      if (q.institutionId)
        rows = rows.filter((t) => t.institutionId === q.institutionId);
      if (q.departmentId)
        rows = rows.filter((t) => t.departmentId === q.departmentId);
      if (q.categoryId)
        rows = rows.filter((t) => t.categoryId === q.categoryId);
      if (q.year)
        rows = rows.filter(
          (t) => new Date(t.publicationDate).getFullYear() === q.year,
        );

      switch (q.sort) {
        case "views":
          rows = [...rows].sort((a, b) => b.views - a.views);
          break;
        case "downloads":
          rows = [...rows].sort((a, b) => b.downloads - a.downloads);
          break;
        case "title":
          rows = [...rows].sort((a, b) => a.title.localeCompare(b.title));
          break;
        default:
          rows = [...rows].sort(
            (a, b) => new Date(b.publicationDate) - new Date(a.publicationDate),
          );
      }

      const count = rows.length;
      const totalPages = Math.max(1, Math.ceil(count / pageSize));
      const start = (page - 1) * pageSize;
      const results = rows.slice(start, start + pageSize).map(enrich);
      return { results, count, page, pageSize, totalPages };
    });
  },

  /** @param {string} slug */
  async getBySlug(slug) {
    // return http.get(`/theses/${slug}/`);
    return mockRequest(() => {
      const t = store.find((x) => x.slug === slug);
      if (!t) throw new Error("Thesis not found");
      return enrich(t);
    });
  },
  async getById(id) {
    return mockRequest(() => {
      const t = store.find((x) => x.id === id);
      if (!t) throw new Error("Thesis not found");
      return enrich(t);
    });
  },
  async create(payload) {
    // return http.post("/theses/", payload);
    return mockRequest(() => {
      const id = "t" + (store.length + 1) + Date.now().toString().slice(-3);
      const slug = payload.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80);
      const record = {
        id,
        slug,
        views: 0,
        downloads: 0,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        coSupervisors: [],
        keywords: [],
        ...payload,
      };
      store = [record, ...store];
      return enrich(record);
    });
  },
  async update(id, payload) {
    // return http.patch(`/theses/${id}/`, payload);
    return mockRequest(() => {
      store = store.map((t) =>
        t.id === id
          ? { ...t, ...payload, updatedDate: new Date().toISOString() }
          : t,
      );
      return enrich(store.find((t) => t.id === id));
    });
  },
  async remove(id) {
    // return http.delete(`/theses/${id}/`);
    return mockRequest(() => {
      store = store.filter((t) => t.id !== id);
      return { id };
    });
  },
  async setStatus(id, status, reason) {
    // return http.post(`/theses/${id}/${status}/`, { reason });
    return mockRequest(() => {
      store = store.map((t) =>
        t.id === id
          ? { ...t, status, updatedDate: new Date().toISOString() }
          : t,
      );
      return enrich(store.find((t) => t.id === id));
    });
  },
  async related(id, limit = 4) {
    return mockRequest(
      () => {
        const t = store.find((x) => x.id === id);
        if (!t) return [];
        return store
          .filter((x) => x.id !== id && x.categoryId === t.categoryId)
          .slice(0, limit)
          .map(enrich);
      },
      { latency: 200 },
    );
  },
};

function enrich(t) {
  return {
    ...t,
    institutionName: institutionName(t.institutionId),
    departmentName: departmentName(t.departmentId),
    categoryName: categoryName(t.categoryId),
  };
}

export { THESIS_STATUS };
