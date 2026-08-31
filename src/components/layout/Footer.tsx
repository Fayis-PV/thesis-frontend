import { Link } from "react-router-dom";
import { BookOpen, MapPin, Mail, Phone, ExternalLink } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-white">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="font-bold text-2xl tracking-tight">
                DHIU{" "}
                <span className="text-blue-500 font-serif font-medium">
                  Theses
                </span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mt-4 max-w-xs">
              The central digital repository for postgraduate dissertations and
              academic research at Darul Huda Islamic University.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide uppercase text-sm">
              Repository
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className="hover:text-blue-400 transition-colors"
                >
                  Search Theses
                </Link>
              </li>
              <li>
                <Link
                  to="/search?category=recent"
                  className="hover:text-blue-400 transition-colors"
                >
                  Latest Works
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="hover:text-blue-400 transition-colors"
                >
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* External Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide uppercase text-sm">
              University
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://dhiu.in"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center hover:text-blue-400 transition-colors"
                >
                  Main Website{" "}
                  <ExternalLink className="h-3 w-3 ml-1.5 opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href="https://dhiu.in/academics"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center hover:text-blue-400 transition-colors"
                >
                  Academics{" "}
                  <ExternalLink className="h-3 w-3 ml-1.5 opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href="https://dhiu.in/admissions"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center hover:text-blue-400 transition-colors"
                >
                  Admissions{" "}
                  <ExternalLink className="h-3 w-3 ml-1.5 opacity-70" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide uppercase text-sm">
              Contact Us
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <span className="text-gray-400 leading-relaxed">
                  Darul Huda Islamic University
                  <br />
                  Chemmad, Tirurangadi PO
                  <br />
                  Malappuram, Kerala 676306
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-blue-500 shrink-0" />
                <a
                  href="tel:+914942463155"
                  className="hover:text-white transition-colors"
                >
                  +91 494 2463155
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-blue-500 shrink-0" />
                <a
                  href="mailto:info@dhiu.in"
                  className="hover:text-white transition-colors"
                >
                  info@dhiu.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>
            © {currentYear} Darul Huda Islamic University. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
