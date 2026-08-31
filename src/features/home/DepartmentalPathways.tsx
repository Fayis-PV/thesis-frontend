import {
  BookMarked,
  Scale,
  Landmark,
  TrendingUp,
  Users,
  Brain,
  Building,
  BookText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DepartmentalPathways = () => {
  const navigate = useNavigate();

  const departments = [
    {
      name: "Qur'anic Studies",
      description: "Exploring the Divine Speech",
      icon: <BookMarked className="h-8 w-8" />,
      gradient: "from-emerald-600 to-teal-600",
    },
    {
      name: "Hadith & Related Sciences",
      description: "Tracing the Prophetic Path",
      icon: <BookText className="h-8 w-8" />,
      gradient: "from-amber-500 to-yellow-500",
    },
    {
      name: "Fiqh & Usul al-Fiqh",
      description: "Navigating Modern Jurisprudence",
      icon: <Scale className="h-8 w-8" />,
      gradient: "from-blue-600 to-indigo-600",
    },
    {
      name: "Islamic Economics & Finance",
      description: "Ethical Economics & Banking",
      icon: <TrendingUp className="h-8 w-8" />,
      gradient: "from-green-600 to-emerald-600",
    },
    {
      name: "Studies of Religion",
      description: "Dialogue & Understanding",
      icon: <Users className="h-8 w-8" />,
      gradient: "from-purple-600 to-pink-600",
    },
    {
      name: "Aqeeda & Philosophy",
      description: "Foundations of Faith & Reason",
      icon: <Brain className="h-8 w-8" />,
      gradient: "from-cyan-600 to-blue-600",
    },
    {
      name: "Societal Development",
      description: "Society & Islamic Perspectives",
      icon: <Building className="h-8 w-8" />,
      gradient: "from-rose-600 to-red-600",
    },
    {
      name: "Civilizational Studies",
      description: "Civic Engagement & Governance",
      icon: <Landmark className="h-8 w-8" />,
      gradient: "from-slate-600 to-gray-600",
    },
  ];

  return (
    <section
      id="departments"
      className="py-16 md:py-24 bg-gray-50 border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-3 text-gray-900">
            Explore Theses by <span className="text-blue-600">Department</span>
          </h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto mb-4 rounded-full"></div>
          <p className="max-w-3xl mx-auto text-base text-gray-600 leading-relaxed">
            Browse research organized by academic discipline. Click any
            department to discover theses and dissertations.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {departments.map((dept, index) => (
            <div
              key={index}
              onClick={() =>
                navigate(`/search?department=${encodeURIComponent(dept.name)}`)
              }
              className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="relative p-5 min-h-[180px] flex flex-col">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${dept.gradient} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md`}
                >
                  <div className="text-white">{dept.icon}</div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-base font-serif font-semibold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {dept.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center text-blue-600 transition-colors">
                  <span className="text-xs font-medium">View Theses</span>
                  <svg
                    className="ml-1.5 h-3 w-3 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
