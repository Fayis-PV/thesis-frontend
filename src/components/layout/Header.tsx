import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Menu, X, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming you have shadcn button installed

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Search Theses", href: "/search" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white group-hover:bg-blue-700 transition-colors">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">
              DHIU{" "}
              <span className="text-blue-600 font-serif font-medium">
                Theses
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {item.name}
              </Link>
            ))}

            <div className="h-5 w-px bg-gray-300 mx-2"></div>

            <Link to="/admin">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 text-sm font-medium"
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Admin Portal
              </Button>
            </Link>
            <Link to="/search">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm">
                <Search className="h-4 w-4 mr-2" />
                Explore
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 pt-2 pb-6 space-y-2 shadow-xl">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-3 rounded-md text-base font-medium ${
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
              <Link to="/search" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full justify-center bg-blue-600 text-white">
                  <Search className="h-4 w-4 mr-2" /> Explore Theses
                </Button>
              </Link>
              <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full justify-center text-gray-700"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" /> Admin Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
