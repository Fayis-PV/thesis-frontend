/** Department API — list, create, update, deactivate. */
import { mockRequest } from "./mockRequest";
import { departments as DATA } from "./mockData";

let store = [...DATA];

export const departmentApi = {
  async list({ search = "", institutionId, active } = {}) {
    // return http.get("/departments/", { search, institution, active });
    return mockRequest(() => {
      let rows = store;
      if (search) {
        const s = search.toLowerCase();
        rows = rows.filter(
          (d) =>
            d.name.toLowerCase().includes(s) ||
            d.code.toLowerCase().includes(s),
        );
      }
      if (institutionId)
        rows = rows.filter((d) => d.institutionId === institutionId);
      if (typeof active === "boolean")
        rows = rows.filter((d) => d.active === active);
      return rows;
    });
  },
  async create(payload) {
    return mockRequest(() => {
      const id = "d" + (store.length + 1) + Date.now().toString().slice(-3);
      const record = { id, active: true, driveFolderLink: "", ...payload };
      store = [record, ...store];
      return record;
    });
  },
  async update(id, payload) {
    return mockRequest(() => {
      store = store.map((d) => (d.id === id ? { ...d, ...payload } : d));
      return store.find((d) => d.id === id);
    });
  },
  async deactivate(id) {
    return mockRequest(() => {
      store = store.map((d) => (d.id === id ? { ...d, active: false } : d));
      return store.find((d) => d.id === id);
    });
  },
  async reactivate(id) {
    return mockRequest(() => {
      store = store.map((d) => (d.id === id ? { ...d, active: true } : d));
      return store.find((d) => d.id === id);
    });
  },
};
