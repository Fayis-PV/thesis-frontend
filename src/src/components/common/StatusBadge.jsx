import React from "react";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, STATUS_STYLES } from "@/types/models";

export default function StatusBadge({ status, className }) {
  return (
    <Badge
      variant="outline"
      className={`${STATUS_STYLES[status] || STATUS_STYLES.draft} font-medium ${className || ""}`}
    >
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}
