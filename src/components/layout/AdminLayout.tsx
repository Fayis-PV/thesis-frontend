import { useState, useEffect, type ReactNode } from "react";
import { NavLink, Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { useTheme } from "@/lib/theme/ThemeContext";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
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
  ChevronDown,
  Settings,
  PanelLeftClose,
  PanelLeft,
  FileBarChart,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileEdit,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  to: string;
  label: string;
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
    groupKey: "Thesis Management",
    items: [
      { to: "/admin/theses", label: "All Theses", icon: FileText, end: true },
      { to: "/admin/theses?status=under_review", label: "Pending Review", icon: Clock },
      { to: "/admin/theses?status=published", label: "Published", icon: CheckCircle2 },
      { to: "/admin/theses?status=draft", label: "Drafts", icon: FileEdit },
      { to: "/admin/theses/create", label: "Add Thesis", icon: FilePlus2 },
      { to: "/admin/upload", label: "Bulk Upload", icon: Upload },
    ],
  },
  {
    groupKey: "Academic Structure",
    items: [
      { to: "/admin/institutions", label: "Institutions", icon: Building2 },
      { to: "/admin/departments", label: "Departments", icon: FolderTree },
      { to: "/admin/categories", label: "Categories", icon: Tags },
    ],
  },
  {
    groupKey: "Research Intelligence",
    items: [
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/admin/reports", label: "Reports", icon: FileBarChart },
    ],
  },
  {
    groupKey: "System",
    items: [
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export const AdminLayout = ({ children }: { children?: ReactNode }) => {
  const { user, logout } = useAuth();
  useTheme();
  const navigate = useNavigate();
  const location = useLocation();

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
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
      navigate(`/admin/theses?search=${encodeURIComponent(globalSearch.trim())}`);
    }
  };

  const isLinkActive = (itemTo: string) => {
    const currentFull = location.pathname + location.search;
    if (itemTo.includes("?")) {
      return currentFull === itemTo;
    }
    return location.pathname === itemTo && !location.search;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground" dir="ltr">
      <a
        href="#main-admin-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Mobile Drawer Backdrop */}
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
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
          "transition-[width,transform] duration-300 ease-in-out shadow-sm",
          isSidebarCollapsed ? "lg:w-16" : "lg:w-60",
          "w-72 max-w-[85vw]",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "lg:static"
        )}
      >
        {/* Brand / Logo */}
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-sidebar-border px-3.5",
            isSidebarCollapsed ? "lg:justify-center" : "justify-between"
          )}
        >
          <Link
            to="/admin"
            className="flex items-center gap-2.5 min-w-0 group"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs group-hover:scale-105 transition-transform">
              <BookOpen className="h-4.5 w-4.5" />
            </span>
            {(!isSidebarCollapsed || isMobileMenuOpen) && (
              <div className="min-w-0 leading-tight">
                <p className="font-heading text-sm font-bold tracking-tight text-foreground truncate">
                  DRP Portal
                </p>
                <p className="text-[10px] text-muted-foreground truncate uppercase font-mono tracking-wider">
                  Admin Command
                </p>
              </div>
            )}
          </Link>

          {/* Desktop Sidebar Toggle */}
          <Button
            size="icon"
            variant="ghost"
            className="hidden lg:flex h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
            onClick={toggleSidebar}
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <PanelLeft className="h-3.5 w-3.5" />
            ) : (
              <PanelLeftClose className="h-3.5 w-3.5" />
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

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-2.5 py-3 space-y-4">
          {/* Dashboard Command Center */}
          <div>
            <NavLink
              to="/admin"
              end
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-md py-2 text-xs font-semibold transition-all",
                  isSidebarCollapsed && !isMobileMenuOpen ? "justify-center px-1.5" : "px-2.5",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
              }
              title={isSidebarCollapsed ? "Dashboard" : undefined}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              {(!isSidebarCollapsed || isMobileMenuOpen) && (
                <span className="truncate">Dashboard</span>
              )}
            </NavLink>
          </div>

          {/* Nav Groups */}
          {NAV_GROUPS.map((group) => (
            <div key={group.groupKey} className="space-y-0.5">
              {(!isSidebarCollapsed || isMobileMenuOpen) ? (
                <p className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  {group.groupKey}
                </p>
              ) : (
                <div className="my-1.5 border-t border-sidebar-border/60" />
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isLinkActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md py-1.5 text-xs font-medium transition-all group",
                        isSidebarCollapsed && !isMobileMenuOpen
                          ? "justify-center px-1.5 h-8"
                          : "px-2.5",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-l-2 border-primary shadow-2xs"
                          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                      )}
                      title={isSidebarCollapsed ? item.label : undefined}
                    >
                      <item.icon className="h-3.5 w-3.5 shrink-0" />
                      {(!isSidebarCollapsed || isMobileMenuOpen) && (
                        <span className="truncate">{item.label}</span>
                      )}
                      {item.badge && (!isSidebarCollapsed || isMobileMenuOpen) && (
                        <span className="ml-auto rounded bg-primary/10 text-primary px-1.5 py-0.2 text-[9px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="shrink-0 border-t border-sidebar-border p-2.5 space-y-1.5">
          {(!isSidebarCollapsed || isMobileMenuOpen) ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 h-7.5 text-xs border-sidebar-border/80 shadow-2xs"
            >
              <Link to="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="truncate">View Public Archive</span>
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="w-full h-7.5"
              title="View Public Archive"
            >
              <Link to="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            </Button>
          )}

          {(!isSidebarCollapsed || isMobileMenuOpen) && (
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-sidebar-accent/40 text-xs">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="font-semibold truncate text-foreground text-[11px]">
                  {user?.first_name || user?.email?.split("@")[0] || "Admin"}
                </p>
                <p className="text-[9px] text-muted-foreground capitalize truncate">
                  {user?.role || "Repository Admin"}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ─── MAIN CONTENT WRAPPER ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <DemoModeIndicator variant="banner" />

        {/* ─── TOP COMMAND BAR ───────────────────────────────────────────── */}
        <header
          role="banner"
          className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border/80 bg-background/95 px-4 sm:px-6 backdrop-blur-md"
        >
          {/* Mobile drawer toggle */}
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-4.5 w-4.5" />
          </Button>

          {/* Breadcrumbs */}
          <div className="hidden sm:flex items-center min-w-0">
            <Breadcrumbs />
          </div>

          {/* Global Search with shortcut */}
          <form
            onSubmit={handleGlobalSearchSubmit}
            className="relative hidden md:flex items-center flex-1 max-w-xs ms-2 me-auto"
          >
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="admin-global-search"
              type="search"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search repository… (Ctrl+K)"
              className="h-8 pl-8 pr-14 text-xs bg-muted/30 border-border/70 focus:bg-background"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1 font-mono text-[9px] text-muted-foreground">
              Ctrl+K
            </kbd>
          </form>

          {/* Right Header Actions */}
          <div className="ml-auto flex items-center gap-2">
            {/* Quick Add Button */}
            <Button
              size="sm"
              className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground shadow-xs hidden sm:inline-flex"
              onClick={() => navigate("/admin/theses/create")}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Thesis</span>
            </Button>

            {/* Status / Live Indicator */}
            <DemoModeIndicator variant="pill" className="hidden lg:flex" />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Notifications"
                  className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-background" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-2" align="end">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/60">
                  <span className="text-xs font-bold text-foreground font-heading">
                    Repository Notifications
                  </span>
                  <span className="text-[10px] text-primary font-medium hover:underline cursor-pointer">
                    Mark all read
                  </span>
                </div>
                <div className="py-2 space-y-1.5 text-xs">
                  <div
                    onClick={() => navigate("/admin/theses?status=under_review")}
                    className="p-2 rounded-md bg-muted/40 hover:bg-muted/70 transition-colors space-y-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-foreground font-medium">
                      <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>Theses Awaiting Review</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground pl-5">
                      New postgraduate submissions ready for faculty committee review.
                    </p>
                  </div>

                  <div
                    onClick={() => navigate("/admin/theses")}
                    className="p-2 rounded-md hover:bg-muted/40 transition-colors space-y-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-foreground font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span>Metadata Quality Index Updated</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground pl-5">
                      Repository completeness verified across all cataloged records.
                    </p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Account Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-md p-1 hover:bg-muted/70 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label="User account menu"
                >
                  <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-xs">
                    {initials}
                  </div>
                  <div className="hidden sm:block text-left leading-tight">
                    <p className="text-xs font-semibold text-foreground max-w-[110px] truncate">
                      {user?.first_name || user?.email?.split("@")[0] || "Admin"}
                    </p>
                    <p className="text-[9px] text-muted-foreground capitalize">
                      {user?.role || "Staff"}
                    </p>
                  </div>
                  <ChevronDown className="h-3 w-3 opacity-60 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 p-1.5" align="end">
                <div className="px-2.5 py-2 border-b border-border/60">
                  <p className="text-xs font-bold text-foreground">
                    {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.email}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[9px] font-semibold uppercase tracking-wider rounded bg-primary/10 text-primary px-1.5 py-0.5">
                    {user?.role || "Repository Admin"}
                  </span>
                </div>

                <div className="py-1">
                  <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                    <Settings className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <span>Settings</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate("/admin/reports")}>
                    <FileBarChart className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <span>Reports & Exports</span>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="h-3.5 w-3.5 mr-2" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ─── PAGE CONTENT OUTLET ────────────────────────────────────────── */}
        <main
          id="main-admin-content"
          role="main"
          className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-6 lg:px-8 py-5"
        >
          <div className="mx-auto max-w-7xl">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};
