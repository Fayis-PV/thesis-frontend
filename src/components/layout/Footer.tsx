import { Link } from "react-router-dom";
import { BookOpen, ExternalLink } from "lucide-react";

export const Footer = () => {

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-base font-semibold">
                  Scholarum
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Thesis Repository
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              A centralised academic research repository preserving, discovering
              and disseminating scholarly theses across institutions and
              disciplines.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Repository</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-foreground">
                  Explore Research
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-foreground">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">About</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground">
                  Mission
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Submission Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Scholarum Repository. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <a href="#" aria-label="GitHub" className="hover:text-foreground">
              <ExternalLink className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-foreground">
              <ExternalLink className="h-4 w-4" />
            </a>
            <a href="#" aria-label="LinkedIn" className="hover:text-foreground">
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
