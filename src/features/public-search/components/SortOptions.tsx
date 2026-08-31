import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SortOrder = "asc" | "desc";

interface Props {
  sortField: string;
  sortOrder: SortOrder;
  onSortChange: (field: string, order: SortOrder) => void;
}

export const SortOptions: React.FC<Props> = ({
  sortField,
  sortOrder,
  onSortChange,
}) => {
  const options = [
    { value: "title", label: "Title" },
    { value: "created_at", label: "Date Added" },
    { value: "view_count", label: "Most Viewed" },
    { value: "download_count", label: "Most Downloaded" },
  ];

  return (
    <div className="flex gap-2 items-center w-full md:w-auto">
      <ArrowUpDown className="h-5 w-5 text-gray-400 hidden lg:block" />
      <div className="flex-1 lg:w-48">
        <select
          value={sortField || "none"}
          onChange={(event) =>
            onSortChange(
              event.target.value === "none" ? "" : event.target.value,
              sortOrder,
            )
          }
          className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
        >
          <option value="none">Default Order</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {sortField && (
        <Button
          variant="outline"
          onClick={() =>
            onSortChange(sortField, sortOrder === "asc" ? "desc" : "asc")
          }
          className="w-10 px-0 bg-white"
        >
          {sortOrder === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
};
