import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen } from "lucide-react";

export const JournalSpotlight = () => {
  return (
    <section
      id="journal"
      className="py-16 md:py-24 bg-white border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-emerald-600/20 rounded-full blur-3xl"></div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-amber-500 rounded-2xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300 blur-sm opacity-50"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden transform group-hover:-translate-y-2 transition-transform duration-300 border-4 border-blue-100">
                <div className="bg-blue-800 p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="h-8 w-8" />
                    <div>
                      <p className="text-sm font-light opacity-90">
                        Academic Excellence Since 1986
                      </p>
                      <h3 className="text-2xl font-serif font-bold">
                        DHIU Journal
                      </h3>
                    </div>
                  </div>
                  <div className="h-1 w-24 bg-amber-500"></div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-blue-800 mb-1">
                        Featured Article
                      </h4>
                      <p className="text-sm text-gray-600">
                        Contemporary Fiqh Responses to Climate Change
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-grow">
                      <h4 className="font-semibold text-blue-800 mb-1">
                        Research Paper
                      </h4>
                      <p className="text-sm text-gray-600">
                        Digital Methodologies in Quranic Studies
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 border-t-2 border-gray-100">
                  <p className="text-center text-sm font-semibold text-blue-800">
                    Volume 49, Issue 1 • Winter 2026
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-5">
            <div>
              <div className="inline-block px-4 py-2 bg-blue-100 rounded-full mb-3">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Peer-Reviewed Excellence
                </p>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3 text-gray-900">
                The DHIU <span className="text-blue-600">Academic Journal</span>
              </h2>
              <div className="w-16 h-1.5 bg-blue-600 mb-4 rounded-full"></div>
            </div>

            <div className="space-y-3">
              <p className="text-base text-gray-600 leading-relaxed">
                <span className="font-semibold text-blue-600">
                  Peer-reviewed. Intellectually stimulating.
                </span>{" "}
                The official voice of Darul Huda's academic rigor.
              </p>
              <p className="text-base text-gray-600 leading-relaxed">
                Read the latest volume featuring ground-breaking papers on{" "}
                <span className="font-semibold text-gray-900">
                  Islamic Ethics in Technology
                </span>
                , contemporary Fiqh applications, and intersectional research
                bridging tradition with modernity.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 py-4">
              <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                <p className="text-xl font-serif font-bold text-blue-700 mb-0.5">
                  30+
                </p>
                <p className="text-xs text-gray-500">Years Publishing</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                <p className="text-xl font-serif font-bold text-blue-700 mb-0.5">
                  2 Issues
                </p>
                <p className="text-xs text-gray-500">Per Year</p>
              </div>
            </div>

            <div className="pt-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-5 text-sm rounded-full shadow-md hover:shadow-lg transition-all group">
                Read the Latest Issue
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
