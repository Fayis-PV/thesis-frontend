import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  GraduationCap,
  User,
  Users,
  Calendar,
  FileText,
  Globe,
  Eye,
  Download,
  Quote,
} from "lucide-react";
import type { Thesis } from "@/types/api";

export default function ThesisMetadata({ thesis }: { thesis: Thesis }) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "published":
        return "bg-emerald-100 text-emerald-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-card text-card-foreground p-6 rounded-xl shadow-xs border border-border">
      <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" /> Thesis Information
      </h2>

      {thesis.status && (
        <Badge className={`mb-4 capitalize ${getStatusColor(thesis.status)}`}>
          {thesis.status}
        </Badge>
      )}

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Building2 className="h-4 w-4 text-muted-foreground mt-1" />
          <div>
            <p className="text-xs text-muted-foreground">Institution</p>
            <p className="text-sm font-medium text-foreground">{thesis.institution?.name}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <GraduationCap className="h-4 w-4 text-muted-foreground mt-1" />
          <div>
            <p className="text-xs text-muted-foreground">Department</p>
            <p className="text-sm font-medium text-foreground">{thesis.department?.name}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <User className="h-4 w-4 text-muted-foreground mt-1" />
          <div>
            <p className="text-xs text-muted-foreground">Author</p>
            <p className="text-sm font-medium text-foreground">{thesis.author_name}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Users className="h-4 w-4 text-muted-foreground mt-1" />
          <div>
            <p className="text-xs text-muted-foreground">Supervisor</p>
            <p className="text-sm font-medium text-foreground">{thesis.supervisor_name}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
          <div>
            <p className="text-xs text-muted-foreground">Publication Year</p>
            <p className="text-sm font-medium text-foreground">{thesis.year}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Globe className="h-4 w-4 text-muted-foreground mt-1" />
          <div>
            <p className="text-xs text-muted-foreground">Language</p>
            <p className="text-sm font-medium uppercase text-foreground">
              {thesis.language || "EN"}
            </p>
          </div>
        </div>
      </div>

      <Separator className="my-5" />

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3 bg-muted/30 rounded-lg border border-border/40">
          <Eye className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-lg font-bold text-foreground font-mono tabular-nums">
            {thesis.view_count || 0}
          </p>
          <p className="text-[10px] text-muted-foreground">Views</p>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg border border-border/40">
          <Download className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-lg font-bold text-foreground font-mono tabular-nums">
            {thesis.download_count || 0}
          </p>
          <p className="text-[10px] text-muted-foreground">Downloads</p>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg border border-border/40">
          <Quote className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
          <p className="text-lg font-bold text-foreground font-mono tabular-nums">
            {thesis.citation_count || 0}
          </p>
          <p className="text-[10px] text-muted-foreground">Citations</p>
        </div>
      </div>
    </div>
  );
}
