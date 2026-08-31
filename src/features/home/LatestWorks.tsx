import { Link } from "react-router-dom";
import { ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePublicTheses } from "@/features/public-search/hooks/usePublicTheses";
import type { Thesis } from "@/types/api";
import { Badge } from "@/components/ui/badge";

export const LatestWorks = () => {
  const { data, isLoading } = usePublicTheses({
    search: "",
    institution: "",
    department: "",
    category: "",
  });

  const rawData = data as {
    data?: { results?: Thesis[] };
    results?: Thesis[];
  };
  const thesisList: Thesis[] = Array.isArray(rawData)
    ? rawData
    : rawData?.data?.results || rawData?.results || [];

  const recentTheses = thesisList.slice(0, 6);

  // Safely handle potentially undefined text
  const isArabic = (text?: string) => {
    if (!text) return false;
    return /[\u0600-\u06FF]/.test(text);
  };

  return (
    <section
      id="latest"
      className="py-16 md:py-24 bg-gray-50 border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-2 bg-blue-100 rounded-full mb-3">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Editor's Choice
            </p>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3 text-gray-900">
            Curated{" "}
            <span className="text-blue-600 tracking-tight">Brilliance</span>
          </h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto mb-4 rounded-full"></div>
          <p className="max-w-3xl mx-auto text-base text-gray-600 leading-relaxed">
            Discover groundbreaking research from DHIU scholars—where timeless
            Islamic wisdom meets cutting-edge academic inquiry.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {recentTheses.map((thesis: Thesis) => {
              const titleDir = isArabic(thesis.title) ? "rtl" : "ltr";
              const abstractDir = isArabic(thesis.abstract) ? "rtl" : "ltr";

              return (
                <Card
                  key={thesis.id}
                  className="group overflow-hidden border-gray-200 hover:border-blue-300 hover:shadow-xl bg-white transition-all duration-300 flex flex-col"
                >
                  <div className="h-1 bg-blue-600 w-full transition-transform origin-left transform scale-x-0 group-hover:scale-x-100 duration-300"></div>

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 text-xs font-semibold"
                      >
                        {thesis.department?.name || "General"}
                      </Badge>
                    </div>
                    <CardTitle
                      className="text-lg font-serif line-clamp-2 group-hover:text-blue-600 transition-colors text-gray-900"
                      dir={titleDir}
                    >
                      {thesis.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1.5 flex items-center gap-1.5 text-gray-500 pt-1">
                      <span className="font-medium text-gray-700">
                        By {thesis.author_name}
                      </span>
                      <span>•</span>
                      <span>
                        {thesis.publication_date
                          ? new Date(
                              thesis.publication_date,
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })
                          : new Date(thesis.created_at).getFullYear()}
                      </span>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pb-3 flex-grow">
                    <p
                      className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-3"
                      dir={abstractDir}
                    >
                      {thesis.abstract}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(thesis.tags || [])
                        .slice(0, 3)
                        .map((tag: string, tagIndex: number) => (
                          <Badge
                            key={tagIndex}
                            variant="secondary"
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs px-2 py-0.5 font-normal"
                          >
                            {tag}
                          </Badge>
                        ))}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-2 border-t border-gray-100 bg-gray-50">
                    <Link to={`/thesis/${thesis.id}`} className="w-full">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-blue-600 hover:bg-blue-100 hover:text-blue-700 group-hover:translate-x-1 transition-all"
                      >
                        Read Full Thesis{" "}
                        <ExternalLink className="ml-2 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/search">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md hover:shadow-lg font-medium px-8"
            >
              Explore All Theses{" "}
              <ExternalLink className="ml-2 h-4 w-4 opacity-80" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
