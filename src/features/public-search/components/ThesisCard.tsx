import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  BookOpen,
  Tag,
  User,
  ArrowRight,
  Download,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Thesis } from "@/types/api";

interface Props {
  thesis: Thesis;
  viewMode?: "grid" | "list";
}

export const ThesisCard: React.FC<Props> = ({ thesis, viewMode = "list" }) => {
  const isGrid = viewMode === "grid";
  const isArabic = /[\u0600-\u06FF]/.test(thesis.title || "");
  const displayYear =
    (thesis as Thesis & { year?: number }).year ||
    new Date(thesis.created_at).getFullYear();

  return (
    <Card
      className={`group transition-all duration-300 hover:shadow-lg border-border overflow-hidden bg-card text-card-foreground hover:border-primary/50 ${isGrid ? "h-full flex flex-col" : ""}`}
    >
      <CardHeader className={`pb-3 ${isGrid ? "flex-shrink-0" : ""}`}>
        <CardTitle
          className={`font-bold text-foreground group-hover:text-primary transition-colors ${isGrid ? "text-lg line-clamp-2" : "text-xl"}`}
          dir={isArabic ? "rtl" : "ltr"}
        >
          <Link to={`/thesis/${thesis.id}`} className="hover:underline">
            {thesis.title}
          </Link>
        </CardTitle>

        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1.5 text-primary" />{" "}
            <span className="truncate max-w-[150px]">{thesis.author_name}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1.5 text-primary" /> {displayYear}
          </div>
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 mr-1.5 text-primary" />{" "}
            <span className="truncate max-w-[200px]">
              {thesis.department?.name || "General"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent
        className={`space-y-3 ${isGrid ? "flex-1 flex flex-col" : ""}`}
      >
        <p
          className={`text-muted-foreground leading-relaxed ${isGrid ? "line-clamp-3" : "line-clamp-2"}`}
          dir={/[\u0600-\u06FF]/.test(thesis.abstract) ? "rtl" : "ltr"}
        >
          {thesis.abstract}
        </p>

        {thesis.tags && thesis.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {thesis.tags.slice(0, 3).map((tag, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="bg-muted text-foreground border border-border/60 font-normal"
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t border-border bg-muted/20 flex justify-between">
        <Link to={`/thesis/${thesis.id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/90 hover:bg-primary/10"
          >
            <Eye className="mr-1.5 h-4 w-4" /> View Details{" "}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
        {thesis.fileUrl && (
          <Button
            variant="outline"
            size="sm"
            className="border-border text-foreground bg-card hover:bg-muted"
            asChild
          >
            <a href={thesis.fileUrl} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4 mr-1.5" /> PDF
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
