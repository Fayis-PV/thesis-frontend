import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, Calendar } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function ThesisCard({ thesis, to }) {
  const href = to || `/thesis/${thesis.slug}`;
  return (
    <Card className="group h-full overflow-hidden transition-all hover:shadow-md hover:border-primary/30">
      <Link to={href} className="flex h-full flex-col">
        <div className="flex items-center gap-2 px-5 pt-5">
          <Badge
            variant="outline"
            className="text-[11px] font-medium text-muted-foreground"
          >
            {thesis.categoryName}
          </Badge>
          <StatusBadge status={thesis.status} />
        </div>
        <CardContent className="flex-1 px-5 pt-3">
          <h3 className="font-display text-lg leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {thesis.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {thesis.abstract}
          </p>
          <div className="mt-3 space-y-1 text-sm">
            <p className="font-medium text-foreground">{thesis.author}</p>
            <p className="text-muted-foreground">{thesis.institutionName}</p>
            <p className="text-muted-foreground text-xs">
              {thesis.departmentName}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {thesis.keywords.slice(0, 3).map((k) => (
              <span
                key={k}
                className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {k}
              </span>
            ))}
          </div>
        </CardContent>
        <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(thesis.publicationDate).getFullYear()}
          </span>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {thesis.views.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />{" "}
              {thesis.downloads.toLocaleString()}
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
