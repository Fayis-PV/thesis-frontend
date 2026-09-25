import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutGrid, List, SlidersHorizontal, BookOpen, X, TrendingUp } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

import { useDebounce } from "@/hooks/useDebounce";
import { usePublicTheses, type SearchFilters } from "../hooks/usePublicTheses";
import { useDepartments } from "@/features/departments/hooks/useDepartments";
import { useCategories } from "@/features/categories/hooks/useCategories";

import { SearchBar } from "./SearchBar";
import { FilterSection } from "./FilterSection";
import { SortOptions, type SortOrder } from "./SortOptions";
import { ThesisList } from "./ThesisList";
import type { Thesis } from "@/types/api";

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const { data: departments } = useDepartments();
  const { data: categories } = useCategories();

  // Input state for search bar
  const initialSearchTerm =
    searchParams.get("q") || searchParams.get("search") || "";
  const [inputValue, setInputValue] = useState(initialSearchTerm);
  const debouncedSearchTerm = useDebounce(inputValue, 500);

  // Derive filters and sorting directly from URL searchParams
  const filters: SearchFilters = useMemo(() => {
    const f: SearchFilters = {};
    const dept = searchParams.get("department");
    if (dept) f.department = dept;
    const cat = searchParams.get("category");
    if (cat) f.category = cat;
    const year = searchParams.get("year");
    if (year) f.year = year;
    const author = searchParams.get("author");
    if (author) f.author = author;
    const sup = searchParams.get("supervisor");
    if (sup) f.supervisor = sup;
    return f;
  }, [searchParams]);

  const orderingParam = searchParams.get("ordering") || "";
  const sortField = orderingParam.startsWith("-")
    ? orderingParam.substring(1)
    : orderingParam;
  const sortOrder: SortOrder = orderingParam.startsWith("-") ? "desc" : "asc";

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Sync debounced search input to URL searchParams
  useEffect(() => {
    const currentQ = searchParams.get("search") || searchParams.get("q") || "";
    if (debouncedSearchTerm !== currentQ) {
      const params = new URLSearchParams(searchParams);
      if (debouncedSearchTerm) {
        params.set("search", debouncedSearchTerm);
      } else {
        params.delete("search");
        params.delete("q");
      }
      params.delete("page");
      setSearchParams(params, { replace: true });
    }
  }, [debouncedSearchTerm, searchParams, setSearchParams]);

  const handleFiltersChange = (newFilters: SearchFilters) => {
    const params = new URLSearchParams(searchParams);
    ["department", "category", "year", "author", "supervisor"].forEach((k) =>
      params.delete(k),
    );
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) params.set(key, String(val));
    });
    params.delete("page");
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams);
    ["department", "category", "year", "author", "supervisor"].forEach((k) =>
      params.delete(k),
    );
    params.delete("page");
    setSearchParams(params);
  };

  const handleSortChange = (field: string, order: SortOrder) => {
    const params = new URLSearchParams(searchParams);
    if (!field) {
      params.delete("ordering");
    } else {
      params.set("ordering", order === "desc" ? `-${field}` : field);
    }
    params.delete("page");
    setSearchParams(params);
  };

  const handleRemoveSingleFilter = (key: keyof SearchFilters) => {
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    params.delete("page");
    setSearchParams(params);
  };

  const handleRemoveSort = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("ordering");
    params.delete("page");
    setSearchParams(params);
  };

  // React Query fetch
  const { data, isLoading } = usePublicTheses({
    search: debouncedSearchTerm,
    page: currentPage,
    ordering: sortField
      ? sortOrder === "desc"
        ? `-${sortField}`
        : sortField
      : undefined,
    ...filters,
  });
  const rawData = data as {
    data?: {
      results?: Thesis[];
      count?: number;
      next?: string;
      previous?: string;
    };
    results?: Thesis[];
    count?: number;
    next?: string;
    previous?: string;
  };

  const thesesList: Thesis[] = Array.isArray(rawData)
    ? rawData
    : rawData?.data?.results || rawData?.results || [];

  const totalCount = Array.isArray(rawData)
    ? rawData.length
    : rawData?.data?.count || rawData?.count || thesesList.length;

  const hasNext =
    !Array.isArray(rawData) && (rawData?.data?.next || rawData?.next);
  const hasPrevious =
    !Array.isArray(rawData) && (rawData?.data?.previous || rawData?.previous);
  // =========================================================================

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.set("search", debouncedSearchTerm);
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (sortField)
      params.set(
        "ordering",
        sortOrder === "desc" ? `-${sortField}` : sortField,
      );

    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.set(key, String(val));
    });

    setSearchParams(params, { replace: true });
  }, [
    debouncedSearchTerm,
    currentPage,
    filters,
    sortField,
    sortOrder,
    setSearchParams,
  ]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentDeptName = departments?.find(
    (d) =>
      d.id.toLowerCase() === filters.department?.toLowerCase() ||
      d.name.toLowerCase() === filters.department?.toLowerCase(),
  )?.name || filters.department;

  const currentCatName = categories?.find(
    (c) =>
      c.id.toLowerCase() === filters.category?.toLowerCase() ||
      c.name.toLowerCase() === filters.category?.toLowerCase(),
  )?.name || filters.category;

  const hasActiveFilters = Boolean(
    filters.department ||
      filters.category ||
      filters.author ||
      filters.supervisor ||
      filters.year ||
      sortField === "view_count",
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            Thesis Repository
          </h1>
          <p className="text-gray-500 mt-2">
            Search, filter, and explore published academic research.
          </p>
        </div>

        {/* Search Header Area */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                searchTerm={inputValue}
                onChange={setInputValue}
                isSearching={isLoading && inputValue !== debouncedSearchTerm}
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              className={`h-12 px-6 ${showFilters ? "bg-blue-600 shadow-md" : "border-gray-300 text-gray-700"}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
            </Button>
          </div>

          {/* Active Filter Indicators */}
          {hasActiveFilters && (
            <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-500 font-medium">Applied Filters:</span>
              {currentDeptName && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-800 rounded-md font-medium border border-blue-100">
                  <span>Department: <strong>{currentDeptName}</strong></span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSingleFilter("department")}
                    className="hover:text-blue-950 p-0.5 rounded"
                    aria-label="Remove department filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {currentCatName && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 rounded-md font-medium border border-amber-200">
                  <span>Category: <strong>{currentCatName}</strong></span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSingleFilter("category")}
                    className="hover:text-amber-950 p-0.5 rounded"
                    aria-label="Remove category filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {sortField === "view_count" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md font-medium border border-emerald-200">
                  <TrendingUp className="h-3 w-3 text-emerald-600" />
                  <span>Sorted by: <strong>Best Works (Most Viewed)</strong></span>
                  <button
                    type="button"
                    onClick={handleRemoveSort}
                    className="hover:text-emerald-950 p-0.5 rounded"
                    aria-label="Reset sorting"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-gray-500 hover:text-red-600 text-xs ml-auto underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {showFilters && (
            <div className="pt-4 border-t border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-start animate-in fade-in slide-in-from-top-2">
              <FilterSection
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
              />
              <SortOptions
                sortField={sortField}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
              />
            </div>
          )}
        </div>

        {/* Results Info & View Toggle */}
        <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 ml-2">
            <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-md mr-2">
              {totalCount}
            </span>
            {totalCount === 1 ? "Result" : "Results"}
          </h2>
          <div className="flex gap-1 bg-gray-50 p-1 rounded-md border border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={`h-8 w-8 p-0 ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"}`}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`h-8 w-8 p-0 ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-500"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* List & Pagination */}
        <ThesisList
          theses={thesesList}
          isLoading={isLoading}
          viewMode={viewMode}
        />

        {/* Pagination Buttons */}
        {totalCount > 20 && (
          <div className="flex justify-center gap-4 mt-10">
            <Button
              disabled={!hasPrevious}
              onClick={() => handlePageChange(currentPage - 1)}
              variant="outline"
              className="bg-white"
            >
              Previous Page
            </Button>
            <Button
              disabled={!hasNext}
              onClick={() => handlePageChange(currentPage + 1)}
              variant="outline"
              className="bg-white"
            >
              Next Page
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
