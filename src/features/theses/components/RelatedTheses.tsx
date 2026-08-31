import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, ArrowRight } from "lucide-react";

interface RelatedThesis {
  id: string;
  title: string;
  author_name?: string;
  submissionDate?: string | null;
  abstract?: string;
  keywords?: string[];
}

export default function RelatedTheses({
  relatedTheses,
}: {
  relatedTheses: RelatedThesis[];
}) {
  return (
    <div className="space-y-4">
      {relatedTheses.map((thesis, i) => (
        <Link key={i} to={`/thesis/${thesis.id}`} className="block group">
          <div className="p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all bg-gray-50/50">
            <h4 className="font-bold text-gray-900 group-hover:text-blue-600 line-clamp-2 mb-2">
              {thesis.title}
            </h4>

            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />{" "}
                <span className="line-clamp-1 max-w-[120px]">
                  {thesis.author_name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />{" "}
                <span>
                  {thesis.submissionDate
                    ? new Date(thesis.submissionDate).getFullYear()
                    : "Unknown"}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {thesis.abstract}
            </p>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/50">
              <div className="flex flex-wrap gap-1">
                {thesis.keywords?.slice(0, 2).map((k: string, idx: number) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-[10px] font-normal px-2 py-0 h-5"
                  >
                    {k}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center text-xs text-blue-600 font-medium">
                View{" "}
                <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
