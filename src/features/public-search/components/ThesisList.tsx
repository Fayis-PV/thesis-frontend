import React from "react";
import { AlertCircle } from "lucide-react";
import { ThesisCard } from "./ThesisCard";
import type { Thesis } from "@/types/api";

interface Props {
  theses: Thesis[];
  isLoading: boolean;
  viewMode: "grid" | "list";
}

export const ThesisList: React.FC<Props> = ({
  theses,
  isLoading,
  viewMode,
}) => {
  if (isLoading) {
    return (
      <div
        className={`grid gap-4 md:gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm h-64"
          >
            <div className="p-6 pb-3 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="p-6 pt-2 space-y-4 flex-1">
              <div className="h-16 bg-gray-100 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (theses.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center text-center shadow-sm">
        <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-bold text-gray-900">No theses found</h3>
        <p className="text-gray-500 mt-1">
          Try adjusting your search terms or clearing some filters.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-4 md:gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
    >
      {theses.map((thesis) => (
        <div
          key={thesis.id}
          className="animate-in fade-in slide-in-from-bottom-2"
        >
          <ThesisCard thesis={thesis} viewMode={viewMode} />
        </div>
      ))}
    </div>
  );
};
