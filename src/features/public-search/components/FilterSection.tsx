import React, { useState } from "react";
import {
  Filter,
  X,
  Building2,
  FolderOpen,
  Calendar as CalendarIcon,
  Users,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { useDepartments } from "@/features/departments/hooks/useDepartments";
import { useCategories } from "@/features/categories/hooks/useCategories";
import type { SearchFilters } from "../hooks/usePublicTheses";

interface Props {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClearFilters: () => void;
}

export const FilterSection: React.FC<Props> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [open, setOpen] = useState(true);

  const { data: departments } = useDepartments();
  const { data: categories } = useCategories();

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  const activeFiltersCount = Object.keys(filters).filter(
    (k) => filters[k as keyof SearchFilters] !== undefined,
  ).length;

  return (
    <div className="space-y-4 w-full">
      <div className="rounded-xl border border-blue-100 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <span className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Filter className="h-5 w-5 text-blue-600" /> Advanced Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-blue-600">{activeFiltersCount}</Badge>
            )}
          </span>
          <span className="text-sm text-gray-500">
            {open ? "Hide" : "Show"}
          </span>
        </button>
        {open && (
          <div className="space-y-4 border-t border-gray-100 p-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" /> Department
                </label>
                <select
                  value={filters.department || ""}
                  onChange={(event) =>
                    handleFilterChange("department", event.target.value)
                  }
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">All Departments</option>
                  {departments?.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-blue-600" /> Category
                </label>
                <select
                  value={filters.category || ""}
                  onChange={(event) =>
                    handleFilterChange("category", event.target.value)
                  }
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">All Categories</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-blue-600" /> Year
                </label>
                <Input
                  type="number"
                  value={filters.year || ""}
                  onChange={(e) => handleFilterChange("year", e.target.value)}
                  placeholder="e.g., 2024"
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" /> Author
                </label>
                <Input
                  value={filters.author || ""}
                  onChange={(e) => handleFilterChange("author", e.target.value)}
                  placeholder="Author name"
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-blue-600" /> Supervisor
                </label>
                <Input
                  value={filters.supervisor || ""}
                  onChange={(e) =>
                    handleFilterChange("supervisor", e.target.value)
                  }
                  placeholder="Supervisor name"
                  className="bg-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="w-full border-red-200 text-red-600 hover:bg-red-50"
        >
          <X className="h-4 w-4 mr-2" /> Clear All Filters ({activeFiltersCount}
          )
        </Button>
      )}
    </div>
  );
};
