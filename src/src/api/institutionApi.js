/** Institution API — list, create, update, deactivate. */
import { mockRequest } from "./mockRequest";
import { institutions as DATA } from "./mockData";

let store = [...DATA];

export const institutionApi = {
  async list({ search = "", active } = {}) {
    // return http.get("/institutions/", { search, active });
    return mockRequest(() => {
      let rows = store;
      if (search) {
        const s = search.toLowerCase();
        rows = rows.filter(
          (i) =>
            i.name.toLowerCase().includes(s) ||
            i.code.toLowerCase().includes(s),
        );
      }
      if (typeof active === "boolean")
        rows = rows.filter((i) => i.active === active);
      return rows;
    });
  },
  async create(payload) {
    return mockRequest(() => {
      const id = "i" + (store.length + 1) + Date.now().toString().slice(-3);
      const record = { id, active: true, ...payload };
      store = [record, ...store];
      return record;
    });
  },
  async update(id, payload) {
    return mockRequest(() => {
      store = store.map((i) => (i.id === id ? { ...i, ...payload } : i));
      return store.find((i) => i.id === id);
    });
  },
  /** Soft-deactivate (not destructive). */
  async deactivate(id) {
    return mockRequest(() => {
      store = store.map((i) => (i.id === id ? { ...i, active: false } : i));
      return store.find((i) => i.id === id);
    });
  },
  async reactivate(id) {
    return mockRequest(() => {
      store = store.map((i) => (i.id === id ? { ...i, active: true } : i));
      return store.find((i) => i.id === id);
    });
  },
};
