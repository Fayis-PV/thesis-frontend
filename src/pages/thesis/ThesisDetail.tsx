import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import {
  ChevronRight,
  Download,
  Share2,
  GraduationCap,
  Building2,
  User,
  Eye,
  FileText,
  Calendar,
  BookOpen,
} from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

import { useThesisDetail } from "@/features/theses/hooks/useThesisDetail";
import CitationGenerator from "@/features/theses/components/CitationGenerator";
import PdfViewer from "@/features/theses/components/PdfViewer";
import ThesisMetadata from "@/features/theses/components/ThesisMetaData";
import RelatedTheses from "@/features/theses/components/RelatedTheses";

export default function ThesisDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: thesis, isLoading, error } = useThesisDetail(id);

  const isArabic = /[\u0600-\u06FF]/.test(thesis?.title || "");
  const pdfUrl = thesis?.fileUrl || "";

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard" });
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  if (error || !thesis)
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center py-20 font-bold text-xl text-foreground">
            Thesis not found.
          </div>
        </main>
        <Footer />
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow">
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <Link to="/" className="hover:text-primary">
                Home
              </Link>{" "}
              <ChevronRight className="h-3 w-3" />
              <Link to="/search" className="hover:text-primary">
                Theses
              </Link>{" "}
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">Details</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge
                variant="outline"
                className="text-xs text-primary bg-primary/10 border-primary/20"
              >
                <GraduationCap className="mr-1 h-3 w-3" />{" "}
                {thesis.department?.name}
              </Badge>
              <Badge variant="outline" className="text-xs border-border">
                <Building2 className="mr-1 h-3 w-3" />{" "}
                {thesis.institution?.name}
              </Badge>
              {thesis.category && (
                <Badge variant="secondary" className="text-xs bg-muted text-foreground">
                  {thesis.category.name}
                </Badge>
              )}
            </div>

            <h1
              className="text-3xl md:text-4xl font-bold text-foreground leading-snug mb-4"
              dir={isArabic ? "rtl" : "ltr"}
            >
              {thesis.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary" />{" "}
                <span className="font-semibold text-foreground">
                  {thesis.author_name}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" />{" "}
                <span>{thesis.year}</span>
              </div>
              <Separator
                orientation="vertical"
                className="h-4 hidden md:block"
              />
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />{" "}
                <span>{thesis.view_count} Views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Download className="h-4 w-4" />{" "}
                <span>{thesis.download_count} Downloads</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border shadow-xs">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-2">
              <Button
                onClick={() => window.open(pdfUrl, "_blank")}
                disabled={!pdfUrl}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
              <CitationGenerator thesis={thesis} />
              <Button
                onClick={handleShare}
                variant="outline"
                className="border-border text-foreground hover:bg-muted"
              >
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-muted">
                <TabsTrigger value="overview">
                  <FileText className="mr-2 h-4 w-4" /> Overview
                </TabsTrigger>
                <TabsTrigger value="document">
                  <BookOpen className="mr-2 h-4 w-4" /> Read Document
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent
              value="overview"
              className="mt-0 grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-card text-card-foreground p-6 md:p-8 rounded-xl shadow-xs border border-border">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                    <FileText className="text-primary" /> Abstract
                  </h3>
                  <p
                    className="text-foreground/80 leading-relaxed whitespace-pre-wrap"
                    dir={isArabic ? "rtl" : "ltr"}
                  >
                    {thesis.abstract}
                  </p>
                </div>

                {thesis.tags && thesis.tags.length > 0 && (
                  <div className="bg-card text-card-foreground p-6 md:p-8 rounded-xl shadow-xs border border-border">
                    <h3 className="text-xl font-bold mb-4 text-foreground">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {thesis.tags.map((tag: string, i: number) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground font-medium px-3 py-1 border border-primary/20"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {thesis.relatedWorks && thesis.relatedWorks.length > 0 && (
                  <div className="bg-card text-card-foreground p-6 md:p-8 rounded-xl shadow-xs border border-border">
                    <h3 className="text-xl font-bold mb-4 text-foreground">Related Research</h3>
                    <RelatedTheses relatedTheses={thesis.relatedWorks} />
                  </div>
                )}
              </div>

              <div className="space-y-8">
                <ThesisMetadata thesis={thesis} />
              </div>
            </TabsContent>

            <TabsContent value="document" className="mt-0">
              <div className="bg-card rounded-xl shadow-xs border border-border overflow-hidden min-h-[800px]">
                <PdfViewer pdfUrl={pdfUrl} title={thesis.title} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
