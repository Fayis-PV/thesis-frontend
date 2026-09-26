import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search, ShieldCheck, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavLinkItem {
  to: string;
  label: string;
  hash?: string;
}

const navLinks: NavLinkItem[] = [
  { to: "/", label: "Home" },
  { to: "/#departments-section", label: "Departments", hash: "departments-section" },
  { to: "/#categories-section", label: "Disciplines", hash: "categories-section" },
];

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("/");
  const location = useLocation();

  const isHomePage = location.pathname === "/";
  // "stretch by width on hero page. transparent bg."
  const isHeroTop = isHomePage && !isScrolled;

  // Track scroll position to determine floating state & active page sections
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 24);

      if (location.pathname !== "/") {
        setActiveSection(location.pathname);
        return;
      }

      const deptEl = document.getElementById("departments-section");
      const catEl = document.getElementById("categories-section");

      const deptTop = deptEl ? deptEl.offsetTop - 140 : Infinity;
      const catTop = catEl ? catEl.offsetTop - 140 : Infinity;

      if (scrollY >= catTop && catTop !== Infinity) {
        setActiveSection("/#categories-section");
      } else if (scrollY >= deptTop && deptTop !== Infinity) {
        setActiveSection("/#departments-section");
      } else {
        setActiveSection("/");
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Handle smooth scroll for anchor links
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: NavLinkItem) => {
    if (item.hash) {
      if (isHomePage) {
        e.preventDefault();
        const element = document.getElementById(item.hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          window.history.pushState(null, "", `#${item.hash}`);
          setActiveSection(item.to);
        }
      }
    } else if (item.to === "/" && isHomePage) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveSection("/");
    }
  };

  const currentActiveTab = hoveredTab || activeSection;

  return (
    <header
      style={{
        width: isHeroTop ? "min(1280px, calc(100% - 2rem))" : "800.2px",
        height: "61.8px",
        paddingTop: "0px",
        paddingBottom: "0px",
        borderRadius: "20px",
        marginLeft: "auto",
        marginRight: "auto",
        borderColor: "#ffffff",
      }}
      className={cn(
        "sticky top-3.5 z-50 flex items-center justify-between px-3.5 sm:px-6 transition-all duration-300 ease-out border shadow-sm max-w-[calc(100%-1rem)]",
        isHeroTop
          ? "bg-transparent backdrop-blur-[2px] shadow-none border-white/40"
          : "bg-background/65 dark:bg-card/45 backdrop-blur-md shadow-lg shadow-black/5 border-white",
      )}
    >
      {/* Brand Logo */}
      <Link
        to="/"
        className="flex items-center gap-2.5 transition-transform duration-200 hover:scale-[1.02] shrink-0"
        onClick={() => {
          if (isHomePage) {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20">
          <BookOpen className="h-4.5 w-4.5" />
        </span>
        <div className="leading-tight hidden sm:block">
          <p className="font-display font-semibold tracking-tight text-base sm:text-lg text-foreground">
            DRP
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
            Thesis Repository
          </p>
        </div>
      </Link>

      {/* Floating Centered Navigation with Sliding Tab Indicator */}
      <nav
        className="hidden md:flex items-center gap-0.5 p-1 rounded-full bg-muted/40 border border-border/40"
        onMouseLeave={() => setHoveredTab(null)}
      >
        {navLinks.map((item) => {
          const isActive = activeSection === item.to;
          const isHighlighted = currentActiveTab === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={(e) => handleNavClick(e, item)}
              onMouseEnter={() => setHoveredTab(item.to)}
              className={cn(
                "relative px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors duration-200 rounded-full select-none",
                isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {/* Smooth Animated Tab Pill Indicator */}
              {isHighlighted && (
                <motion.div
                  layoutId="header-active-pill"
                  className="absolute inset-0 rounded-full bg-card shadow-sm border border-border/60 -z-10"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right Actions */}
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-8 text-xs font-medium rounded-full px-3 text-muted-foreground hover:text-foreground hover:bg-muted/60"
        >
          <Link to="/search">
            <Search className="h-3.5 w-3.5 mr-1 text-primary" /> Search
          </Link>
        </Button>
        <Button
          asChild
          size="sm"
          className="h-8 text-xs font-medium rounded-full px-3.5 shadow-sm"
        >
          <Link to="/login">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Admin
          </Link>
        </Button>
      </div>

      {/* Mobile Navigation Toggle */}
      <button
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-card/60 text-foreground md:hidden transition-colors hover:bg-muted focus:outline-none"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle navigation"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Mobile Menu Dropdown Island */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-[calc(100%+8px)] left-0 right-0 rounded-2xl border border-white/80 dark:border-white/10 bg-background/95 backdrop-blur-xl p-4 shadow-xl md:hidden z-50"
          >
            <div className="space-y-1">
              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={(e) => {
                    handleNavClick(e, item);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                    activeSection === item.to
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="pt-3 mt-2 border-t border-border flex gap-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl h-9 text-xs"
                >
                  <Link to="/search" onClick={() => setOpen(false)}>
                    <Search className="h-3.5 w-3.5 mr-1" /> Search
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="flex-1 rounded-xl h-9 text-xs"
                >
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Admin
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
