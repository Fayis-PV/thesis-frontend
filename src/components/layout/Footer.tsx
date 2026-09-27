import { Link } from "react-router-dom";
import { BookOpen, ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <BookOpen className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-base font-semibold text-foreground">
                  Scholarum
                </p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Thesis Repository
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
              A centralised academic research repository preserving, discovering
              and disseminating scholarly theses across institutions and
              disciplines.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Repository</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-foreground transition-colors">
                  Explore Research
                </Link>
              </li>
              <li>
                <Link to="/#departments-section" className="hover:text-foreground transition-colors">
                  Departments
                </Link>
              </li>
              <li>
                <Link to="/#categories-section" className="hover:text-foreground transition-colors">
                  Disciplines
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-foreground transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Preferences & Theme</h4>
            <div className="mt-3 space-y-3">
              <p className="text-xs text-muted-foreground">
                Customize appearance for comfortable reading:
              </p>
              <ThemeToggle variant="pill" showLabel className="bg-card shadow-xs" />
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Scholarum Repository. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <a href="#" aria-label="GitHub" className="hover:text-foreground transition-colors">
              <ExternalLink className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-foreground transition-colors">
              <ExternalLink className="h-4 w-4" />
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-foreground transition-colors">
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
