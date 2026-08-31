import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import {
  Calendar,
  Eye,
  Download,
  FileText,
  Quote,
  User,
  Users,
  Building2,
  FolderTree,
  Tag,
  ArrowLeft,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { thesisApi } from "@/api/thesisApi";
import StatusBadge from "@/components/common/StatusBadge";
import CitationDialog from "@/components/common/CitationDialog";
import ThesisCard from "@/components/common/ThesisCard";
import { drivePreviewUrl } from "@/lib/citations";

export default function ThesisDetail() {
  const { slug } = useParams();
  const [citeOpen, setCiteOpen] = useState(false);

  const {
    data: thesis,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["thesis", slug],
    queryFn: () => thesisApi.getBySlug(slug),
  });
  const { data: related } = useQuery({
    queryKey: ["thesis", slug, "related"],
    queryFn: () => thesisApi.related(thesis?.id, 4),
    enabled: !!thesis,
  });

  if (isLoading) return <DetailSkeleton />;
  if (isError || !thesis) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl font-semibold">
          Thesis not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The thesis you are looking for may have been moved or removed.
        </p>
        <Button asChild className="mt-6">
          <Link to="/search">
            <ArrowLeft className="h-4 w-4" /> Back to search
          </Link>
        </Button>
      </div>
    );
  }

  const previewUrl = drivePreviewUrl(thesis.fileUrl);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link to="/search">
          <ArrowLeft className="h-4 w-4" /> Back to search
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main */}
        <div className="space-y-8">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-muted-foreground">
                {thesis.categoryName}
              </Badge>
              <StatusBadge status={thesis.status} />
            </div>
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-balance sm:text-4xl">
              {thesis.title}
            </h1>
          </div>

          {/* Authors / taxonomy */}
          <Card>
            <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
              <Meta icon={User} label="Author" value={thesis.author} />
              <Meta icon={User} label="Supervisor" value={thesis.supervisor} />
              <Meta
                icon={Users}
                label="Co-supervisors"
                value={
                  thesis.coSupervisors.length
                    ? thesis.coSupervisors.join(", ")
                    : "—"
                }
              />
              <Meta
                icon={Building2}
                label="Institution"
                value={thesis.institutionName}
              />
              <Meta
                icon={FolderTree}
                label="Department"
                value={thesis.departmentName}
              />
              <Meta
                icon={Calendar}
                label="Published"
                value={new Date(thesis.publicationDate).toLocaleDateString(
                  "en-US",
                  { year: "numeric", month: "long", day: "numeric" },
                )}
              />
            </CardContent>
          </Card>

          {/* Abstract */}
          <section>
            <h2 className="font-display text-xl font-semibold">Abstract</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {thesis.abstract}
            </p>
          </section>

          {/* Keywords */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
              <Tag className="h-5 w-5" /> Keywords
            </h2>
            <div className="flex flex-wrap gap-2">
              {thesis.keywords.map((k) => (
                <Link key={k} to={`/search?search=${encodeURIComponent(k)}`}>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/70"
                  >
                    {k}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>

          {/* Document preview */}
          <section>
            <h2 className="mb-3 font-display text-xl font-semibold">
              Document
            </h2>
            <Card>
              <CardContent className="p-0">
                {previewUrl ? (
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-b-xl">
                    <iframe
                      src={previewUrl}
                      title="Document preview"
                      className="h-full w-full"
                      allowFullScreen
                      onError={() => {}}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        Document preview unavailable
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        No accessible document was provided for this thesis.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Related */}
          {related && related.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-xl font-semibold">
                Related research
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {related.map((t) => (
                  <ThesisCard key={t.id} thesis={t} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Metric icon={Eye} label="Views" value={thesis.views} />
              <Metric
                icon={Download}
                label="Downloads"
                value={thesis.downloads}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 p-4">
              <Button className="w-full" onClick={() => setCiteOpen(true)}>
                <Quote className="h-4 w-4" /> Generate citation
              </Button>
              {thesis.fileUrl && (
                <Button asChild variant="outline" className="w-full">
                  <a href={thesis.fileUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" /> Open document
                  </a>
                </Button>
              )}
              <Button asChild variant="outline" className="w-full">
                <Link to="/search">
                  <ArrowLeft className="h-4 w-4" /> Back to search
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      <CitationDialog
        thesis={thesis}
        open={citeOpen}
        onOpenChange={setCiteOpen}
      />
    </div>
  );
}

function Meta({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </span>
      <span className="font-semibold">{value.toLocaleString()}</span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="mb-6 h-8 w-32" />
      <Skeleton className="mb-3 h-6 w-24" />
      <Skeleton className="mb-2 h-10 w-3/4" />
      <Skeleton className="h-10 w-1/2" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
