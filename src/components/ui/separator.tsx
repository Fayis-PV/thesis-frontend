import type { HTMLAttributes } from "react";

interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export function Separator({
  orientation = "horizontal",
  className = "",
  ...props
}: SeparatorProps) {
  return (
    <div
      role="separator"
      className={`${orientation === "horizontal" ? "h-px w-full" : "h-full w-px"} shrink-0 bg-gray-200 ${className}`}
      {...props}
    />
  );
}
