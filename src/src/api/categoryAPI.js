/** Category API — hierarchical taxonomy. */
import { mockRequest } from "./mockRequest";
import { categories as DATA } from "./mockData";

let store = [...DATA];

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const categoryApi = {
  async list({ search = "" } = {}) {
    // return http.get("/categories/", { search });
    return mockRequest(() => {
      let rows = store;
      if (search) {
        const s = search.toLowerCase();
        rows = rows.filter(
          (c) => c.name.toLowerCase().includes(s) || c.slug.includes(s),
        );
      }
      return rows;
    });
  },
  async create(payload) {
    return mockRequest(() => {
      const id = "c" + (store.length + 1) + Date.now().toString().slice(-3);
      const record = {
        id,
        slug: payload.slug || slugify(payload.name),
        parentId: null,
        ...payload,
      };
      store = [record, ...store];
      return record;
    });
  },
  async update(id, payload) {
    return mockRequest(() => {
      store = store.map((c) => (c.id === id ? { ...c, ...payload } : c));
      return store.find((c) => c.id === id);
    });
  },
  async remove(id) {
    return mockRequest(() => {
      store = store.filter((c) => c.id !== id && c.parentId !== id);
      return { id };
    });
  },
};
