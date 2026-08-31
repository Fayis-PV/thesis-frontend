import { Button } from "@/components/ui/button";
import { Target, Lightbulb, Heart, ExternalLink, BookOpen } from "lucide-react";

export const VisionMission = () => {
  return (
    <section
      id="vision"
      className="py-16 md:py-24 bg-white relative overflow-hidden border-b border-gray-100"
    >
      <div className="absolute inset-0 opacity-5">
        <img
          src="/DHIU_Main_Block.jpg"
          alt="DHIU Campus"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
            <BookOpen className="h-5 w-5 text-blue-700" />
            <p className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
              About DHIU
            </p>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-gray-900">
            Darul Huda Islamic <span className="text-blue-600">University</span>
          </h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto mb-6 rounded-full"></div>
          <p className="max-w-3xl mx-auto text-base text-gray-600 leading-relaxed">
            Pioneering Islamic higher education since 1986, committed to
            academic excellence and scholarly research
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-6 my-auto">
            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white group">
              <img
                src="/DHIU_Main_Block.jpg"
                alt="DHIU Main Campus"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="bg-gradient-to-r from-emerald-800 to-amber-600 p-4 text-white">
                <p className="font-serif text-lg font-semibold">
                  Darul Huda Islamic University
                </p>
                <p className="text-sm opacity-90">
                  Chemmad, Malappuram, Kerala • Established 1986
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-serif font-semibold text-blue-700 mb-3">
                DHIU Website
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                This digital portal provides comprehensive access to
                postgraduate theses and dissertations from DHIU's 12 academic
                departments.
              </p>
              <Button
                variant="outline"
                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 transition-all font-medium"
                onClick={() => window.open("https://dhiu.in", "_blank")}
              >
                <span className="text-sm">Learn More About DHIU</span>
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-semibold text-gray-900 mb-2">
                    Our Vision
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    To be a world-class center of Islamic learning that produces
                    scholars equipped with both deep religious knowledge and
                    contemporary academic expertise.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-semibold text-gray-900 mb-2">
                    Our Mission
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    To provide comprehensive Islamic education integrated with
                    contemporary disciplines:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>
                        Preserve and disseminate authentic Islamic knowledge
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Promote rigorous academic research</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Heart className="h-6 w-6 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-semibold text-gray-900 mb-2">
                    Core Values
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">
                        Authenticity
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">
                        Excellence
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
