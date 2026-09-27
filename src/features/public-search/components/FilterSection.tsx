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
      <div className="rounded-xl border border-border bg-card shadow-xs">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <span className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Filter className="h-5 w-5 text-primary" /> Advanced Filters
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-primary text-primary-foreground">{activeFiltersCount}</Badge>
            )}
          </span>
          <span className="text-sm text-muted-foreground">
            {open ? "Hide" : "Show"}
          </span>
        </button>
        {open && (
          <div className="space-y-4 border-t border-border p-4 pt-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> Department
                </label>
                <select
                  value={filters.department || ""}
                  onChange={(event) =>
                    handleFilterChange("department", event.target.value)
                  }
                  className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-primary" /> Category
                </label>
                <select
                  value={filters.category || ""}
                  onChange={(event) =>
                    handleFilterChange("category", event.target.value)
                  }
                  className="w-full rounded-md border border-border bg-card text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" /> Year
                </label>
                <Input
                  type="number"
                  value={filters.year || ""}
                  onChange={(e) => handleFilterChange("year", e.target.value)}
                  placeholder="e.g., 2024"
                  className="bg-card text-foreground border-border"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Author
                </label>
                <Input
                  value={filters.author || ""}
                  onChange={(e) => handleFilterChange("author", e.target.value)}
                  placeholder="Author name"
                  className="bg-card text-foreground border-border"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" /> Supervisor
                </label>
                <Input
                  value={filters.supervisor || ""}
                  onChange={(e) =>
                    handleFilterChange("supervisor", e.target.value)
                  }
                  placeholder="Supervisor name"
                  className="bg-card text-foreground border-border"
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
          className="w-full border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/10"
        >
          <X className="h-4 w-4 mr-2" /> Clear All Filters ({activeFiltersCount}
          )
        </Button>
      )}
    </div>
  );
};
