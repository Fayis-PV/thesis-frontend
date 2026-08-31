import { BookOpen, Network, Globe } from "lucide-react";

export const AboutSection = () => {
  return (
    <section
      id="about"
      className="py-16 md:py-24 bg-white border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-gray-900">
            More Than an Archive.
            <span className="block text-blue-700 mt-2">
              A Continuum of Thought.
            </span>
          </h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mt-12">
          <div className="group p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
              <BookOpen className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
              The Preservation
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Every thought matters. We digitize and safeguard the intellectual
              labor of our scholars, ensuring their insights never fade into
              history.
            </p>
          </div>

          <div className="group p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
              <Network className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
              The Integration
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Synthesizing textual evidence with contextual reality. Discover
              research that bridges religious text with modern sociology,
              economics, and science.
            </p>
          </div>

          <div className="group p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
              <Globe className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
              The Global Access
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Knowledge has no borders. Access groundbreaking research from the
              DHIU campus, available to the Ummah and the academic world
              instantly.
            </p>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-8 items-center">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
            <img
              src="/DHIU_Main_Block.jpg"
              alt="DHIU Main Campus"
              className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-white font-serif text-lg font-semibold">
                Darul Huda Islamic University
              </p>
              <p className="text-white/90 text-sm">
                Chemmad, Kerala • Since 1986
              </p>
            </div>
          </div>

          <div className="relative py-8 px-6 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm">
            <div className="absolute -top-4 left-6 bg-white px-4 py-1 rounded-full border border-gray-200">
              <span className="text-3xl text-blue-600 leading-none">“</span>
            </div>
            <blockquote className="text-lg md:text-xl font-serif italic text-gray-900 font-medium mt-2">
              The pursuit of knowledge is obligatory upon every Muslim
            </blockquote>
            <p className="mt-3 text-sm text-gray-600 font-medium">
              — Prophet Muhammad ﷺ
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
