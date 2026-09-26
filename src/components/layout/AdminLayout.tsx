import { useState, useEffect, type ReactNode } from "react";
import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { useTheme } from "@/lib/theme/ThemeContext";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { DemoModeIndicator } from "@/components/layout/DemoModeIndicator";
import {
  LayoutDashboard,
  FileText,
  FilePlus2,
  Upload,
  Building2,
  FolderTree,
  Tags,
  BarChart3,
  BookOpen,
  X,
  Menu,
  Search,
  Bell,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Settings,
  PanelLeftClose,
  PanelLeft,
  FileBarChart,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

// Centralized navigation configuration based on Prompt 1 audit
interface NavItem {
  to: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
  badge?: string;
}

interface NavGroup {
  groupKey: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupKey: "nav.thesisManagement",
    items: [
      { to: "/admin/theses", labelKey: "nav.theses", icon: FileText },
      { to: "/admin/theses/create", labelKey: "nav.addThesis", icon: FilePlus2 },
      { to: "/admin/upload", labelKey: "nav.bulkUpload", icon: Upload },
    ],
  },
  {
    groupKey: "nav.academicStructure",
    items: [
      { to: "/admin/institutions", labelKey: "nav.institutions", icon: Building2 },
      { to: "/admin/departments", labelKey: "nav.departments", icon: FolderTree },
      { to: "/admin/categories", labelKey: "nav.categories", icon: Tags },
    ],
  },
  {
    groupKey: "nav.researchIntelligence",
    items: [
      { to: "/admin/analytics", labelKey: "nav.analytics", icon: BarChart3 },
      { to: "/admin/reports", labelKey: "nav.reports", icon: FileBarChart },
    ],
  },
  {
    groupKey: "settings.title",
    items: [
      { to: "/admin/settings", labelKey: "nav.settings", icon: Settings },
    ],
  },
];

export const AdminLayout = ({ children }: { children?: ReactNode }) => {
  const { user, logout } = useAuth();
  const { t, isRTL, dir } = useLanguage();
  useTheme();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("drp_sidebar_collapsed") === "true";
  });
  const [globalSearch, setGlobalSearch] = useState("");

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("drp_sidebar_collapsed", String(next));
      return next;
    });
  };

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
      // Keyboard shortcut Ctrl+K or Cmd+K for search focus
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("admin-global-search");
        searchInput?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const initials = (user?.first_name || user?.email || "Admin")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/search?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground" dir={dir}>
      {/* Skip to Main Content Link for Accessibility */}
      <a
        href="#main-admin-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ─── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside
        id="admin-sidebar"
        aria-label="Admin Navigation"
        className={cn(
          "fixed inset-y-0 start-0 z-40 flex flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground",
          "transition-[width,transform] duration-300 ease-in-out shadow-sm",
          isSidebarCollapsed ? "lg:w-18" : "lg:w-64",
          // Mobile responsive drawer positioning:
          "w-72 max-w-[85vw]",
          isMobileMenuOpen
            ? "translate-x-0"
            : isRTL
            ? "translate-x-full lg:translate-x-0"
            : "-translate-x-full lg:translate-x-0",
          "lg:static"
        )}
      >
        {/* Sidebar Header / Brand */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-sidebar-border px-4",
            isSidebarCollapsed ? "lg:justify-center" : "justify-between"
          )}
        >
          <Link
            to="/admin"
            className="flex items-center gap-3 min-w-0 group"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
              <BookOpen className="h-5 w-5" />
            </span>
            {(!isSidebarCollapsed || isMobileMenuOpen) && (
              <div className="min-w-0 leading-tight">
                <p className="font-heading text-sm font-bold tracking-tight text-foreground truncate">
                  DRP Portal
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {t("app.adminPanel")}
                </p>
              </div>
            )}
          </Link>

          {/* Desktop Sidebar Collapse Toggle */}
          <Button
            size="icon"
            variant="ghost"
            className="hidden lg:flex h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
            onClick={toggleSidebar}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>

          {/* Mobile Close Button */}
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden h-8 w-8 text-muted-foreground"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-5">
          {/* Top-Level Command Center / Dashboard */}
          <div>
            <NavLink
              to="/admin"
              end
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg py-2.5 text-xs font-semibold transition-all relative",
                  isSidebarCollapsed && !isMobileMenuOpen ? "justify-center px-2" : "px-3",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
              }
              title={isSidebarCollapsed ? t("nav.dashboard") : undefined}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              {(!isSidebarCollapsed || isMobileMenuOpen) && (
                <span className="truncate">{t("nav.dashboard")}</span>
              )}
            </NavLink>
          </div>

          {/* Nav Groups */}
          {NAV_GROUPS.map((group) => (
            <div key={group.groupKey} className="space-y-1">
              {(!isSidebarCollapsed || isMobileMenuOpen) ? (
                <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  {t(group.groupKey)}
                </p>
              ) : (
                <div className="my-2 border-t border-sidebar-border/60" />
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg py-2 text-xs font-medium transition-all relative group",
                        isSidebarCollapsed && !isMobileMenuOpen
                          ? "justify-center px-2 h-9"
                          : "px-3",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-2xs border-s-2 border-primary"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                      )
                    }
                    title={isSidebarCollapsed ? t(item.labelKey) : undefined}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {(!isSidebarCollapsed || isMobileMenuOpen) && (
                      <span className="truncate">{t(item.labelKey)}</span>
                    )}
                    {item.badge && (!isSidebarCollapsed || isMobileMenuOpen) && (
                      <span className="ms-auto rounded-full bg-primary/10 text-primary px-2 py-0.2 text-[10px] font-bold">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer — Public Site & User Preview */}
        <div className="shrink-0 border-t border-sidebar-border p-3 space-y-2">
          {(!isSidebarCollapsed || isMobileMenuOpen) ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 h-8 text-xs border-sidebar-border/80 shadow-2xs"
            >
              <Link to="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{t("nav.viewPublicSite")}</span>
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="w-full h-8"
              title={t("nav.viewPublicSite")}
            >
              <Link to="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
          )}

          {/* User Preview in Sidebar */}
          {(!isSidebarCollapsed || isMobileMenuOpen) && (
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-sidebar-accent/50 text-xs">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="font-semibold truncate text-foreground">
                  {user?.first_name || user?.email?.split("@")[0] || "Admin"}
                </p>
                <p className="text-[10px] text-muted-foreground capitalize truncate">
                  {user?.role || "Staff"}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ─── MAIN APP WRAPPER ──────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Demo Banner if in mock mode */}
        <DemoModeIndicator variant="banner" />

        {/* ─── TOP HEADER ─────────────────────────────────────────────────── */}
        <header
          role="banner"
          className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border/80 bg-background/90 px-4 sm:px-6 backdrop-blur-md"
        >
          {/* Mobile hamburger drawer toggle */}
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden h-9 w-9 text-muted-foreground hover:text-foreground shrink-0"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Route Breadcrumbs */}
          <div className="hidden sm:flex items-center min-w-0">
            <Breadcrumbs />
          </div>

          {/* Global Search Input */}
          <form
            onSubmit={handleGlobalSearchSubmit}
            className="relative hidden md:flex items-center flex-1 max-w-sm ms-2 me-auto"
          >
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="admin-global-search"
              type="search"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder={`${t("common.search")}… (Ctrl+K)`}
              className="h-9 ps-9 pe-16 text-xs bg-muted/40 border-border/70 focus:bg-background"
            />
            <kbd className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
              Ctrl+K
            </kbd>
          </form>

          {/* Right Header Utility Controls */}
          <div className="ms-auto flex items-center gap-2">
            {/* Demo / Live Status Pill */}
            <DemoModeIndicator variant="pill" className="hidden lg:flex" />

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle (Light / Dark) */}
            <ThemeToggle />

            {/* Notifications Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={t("user.notifications")}
                  className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute end-2 top-2 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-background" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-2" align={isRTL ? "start" : "end"}>
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/60">
                  <span className="text-xs font-bold text-foreground font-heading">
                    {t("notifications.title")}
                  </span>
                  <span className="text-[10px] text-primary font-medium hover:underline cursor-pointer">
                    {t("notifications.markAllRead")}
                  </span>
                </div>
                <div className="py-2 space-y-1.5 text-xs">
                  <div className="p-2 rounded-md bg-muted/40 hover:bg-muted/70 transition-colors space-y-1 cursor-pointer">
                    <div className="flex items-center gap-1.5 text-foreground font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{t("notifications.thesisSubmitted")}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground ps-5">
                      10 minutes ago • Academic Review
                    </p>
                  </div>

                  <div className="p-2 rounded-md hover:bg-muted/40 transition-colors space-y-1 cursor-pointer">
                    <div className="flex items-center gap-1.5 text-foreground font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span>{t("notifications.importComplete")}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground ps-5">
                      1 hour ago • 24 records imported
                    </p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Account Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted/70 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label="User account menu"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-xs">
                    {initials}
                  </div>
                  <div className="hidden sm:block text-start leading-tight">
                    <p className="text-xs font-semibold text-foreground max-w-[120px] truncate">
                      {user?.first_name || user?.email?.split("@")[0] || "Admin"}
                    </p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {user?.role || "Staff"}
                    </p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 p-1.5" align={isRTL ? "start" : "end"}>
                <div className="px-2.5 py-2 border-b border-border/60">
                  <p className="text-xs font-bold text-foreground">
                    {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.email}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[9px] font-semibold uppercase tracking-wider rounded bg-primary/10 text-primary px-1.5 py-0.5">
                    {user?.role || "Staff"}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    to="/admin/settings"
                    className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs text-foreground hover:bg-accent/15 transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{t("settings.title")}</span>
                  </Link>

                  <button
                    onClick={() => navigate("/admin/settings")}
                    className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs text-foreground hover:bg-accent/15 transition-colors"
                  >
                    <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{t("user.profile")}</span>
                  </button>
                </div>

                <div className="border-t border-border/60 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{t("user.signOut")}</span>
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ─── PAGE CONTENT OUTLET ────────────────────────────────────────── */}
        <main
          id="main-admin-content"
          role="main"
          className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-6 lg:px-8 py-6"
        >
          <div className="mx-auto max-w-7xl">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};
