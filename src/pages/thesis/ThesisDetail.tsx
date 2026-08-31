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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </main>
      </div>
    );
  }

  if (error || !thesis)
    return (
      <div className="text-center py-20 font-bold text-xl">
        Thesis not found.
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <Link to="/" className="hover:text-blue-600">
                Home
              </Link>{" "}
              <ChevronRight className="h-3 w-3" />
              <Link to="/search" className="hover:text-blue-600">
                Theses
              </Link>{" "}
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-900 font-medium">Details</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge
                variant="outline"
                className="text-xs text-blue-700 bg-blue-50 border-blue-200"
              >
                <GraduationCap className="mr-1 h-3 w-3" />{" "}
                {thesis.department?.name}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Building2 className="mr-1 h-3 w-3" />{" "}
                {thesis.institution?.name}
              </Badge>
              {thesis.category && (
                <Badge variant="secondary" className="text-xs">
                  {thesis.category.name}
                </Badge>
              )}
            </div>

            <h1
              className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug mb-4"
              dir={isArabic ? "rtl" : "ltr"}
            >
              {thesis.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-blue-600" />{" "}
                <span className="font-semibold text-gray-900">
                  {thesis.author_name}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-blue-600" />{" "}
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

        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-2">
              <Button
                onClick={() => window.open(pdfUrl, "_blank")}
                disabled={!pdfUrl}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
              <CitationGenerator thesis={thesis} />
              <Button
                onClick={handleShare}
                variant="outline"
                className="border-gray-300"
              >
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-gray-100">
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
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FileText className="text-blue-600" /> Abstract
                  </h3>
                  <p
                    className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                    dir={isArabic ? "rtl" : "ltr"}
                  >
                    {thesis.abstract}
                  </p>
                </div>

                {thesis.tags && thesis.tags.length > 0 && (
                  <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold mb-4">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {thesis.tags.map((tag: string, i: number) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-blue-50 text-blue-700 font-medium px-3 py-1"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {thesis.relatedWorks && thesis.relatedWorks.length > 0 && (
                  <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-xl font-bold mb-4">Related Research</h3>
                    <RelatedTheses relatedTheses={thesis.relatedWorks} />
                  </div>
                )}
              </div>

              <div className="space-y-8">
                <ThesisMetadata thesis={thesis} />
              </div>
            </TabsContent>

            <TabsContent value="document" className="mt-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[800px]">
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
