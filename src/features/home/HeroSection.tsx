import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/search");
    }
  };

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gray-50">
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-20"
        >
          <source src="/Home_gif.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-blue-50/90 to-white/90"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12 w-full">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-serif font-bold leading-tight text-gray-900">
            Where <span className="text-blue-700 italic">Sacred Tradition</span>{" "}
            Meets <span className="text-blue-700">Academic Rigor</span>
          </h1>

          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore the intellectual legacy of{" "}
            <span className="font-semibold text-blue-600">
              Darul Huda Islamic University
            </span>
            . From postgraduate theses to global journals—unlocking the
            knowledge of tomorrow, rooted in the wisdom of the past.
          </p>

          <div className="pt-6 pb-4">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative group">
                <Input
                  placeholder="Search for 'Islamic Finance', 'Fiqh', or 'Modern Theology'..."
                  className="h-12 md:h-14 text-sm md:text-base px-5 md:px-6 pr-32 md:pr-40 border-2 border-blue-100 bg-white/80 backdrop-blur-sm focus-visible:border-blue-500 rounded-full shadow-lg transition-all duration-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 md:h-11 px-4 md:px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-300 font-medium text-xs md:text-sm shadow-md"
                >
                  <Search className="h-4 w-4 mr-1.5" /> Search
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap justify-center items-center gap-2 text-xs text-gray-500">
                <span>Popular:</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("Islamic Finance")}
                  className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-full bg-blue-50 border border-blue-100"
                >
                  Islamic Finance
                </button>
                <span className="opacity-40">•</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("Fiqh")}
                  className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-full bg-blue-50 border border-blue-100"
                >
                  Fiqh
                </button>
                <span className="opacity-40">•</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("Aqeedah")}
                  className="text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded-full bg-blue-50 border border-blue-100"
                >
                  Aqeedah
                </button>
              </div>
            </form>
          </div>

          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="p-3 backdrop-blur-sm bg-white/60 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <p className="text-2xl md:text-3xl font-serif font-bold text-blue-700">
                2,000+
              </p>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                Research Documents
              </p>
            </div>
            <div className="p-3 backdrop-blur-sm bg-white/60 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <p className="text-2xl md:text-3xl font-serif font-bold text-blue-700">
                30+
              </p>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                Years of Excellence
              </p>
            </div>
            <div className="p-3 backdrop-blur-sm bg-white/60 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <p className="text-2xl md:text-3xl font-serif font-bold text-blue-700">
                12+
              </p>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                Academic Disciplines
              </p>
            </div>
            <div className="p-3 backdrop-blur-sm bg-white/60 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <p className="text-2xl md:text-3xl font-serif font-bold text-blue-700">
                24/7
              </p>
              <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                Global Access
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent z-10"></div>
    </section>
  );
};
