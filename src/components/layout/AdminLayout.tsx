import { useState, type ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Building2,
  GraduationCap,
  BarChart3,
  Upload,
  LogOut,
  Menu,
  X,
} from "lucide-react";

// Define our navigation links in one place
const NAVIGATION = [
  { name: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { name: "Theses", to: "/admin/theses", icon: BookOpen },
  { name: "Categories", to: "/admin/categories", icon: FolderTree },
  { name: "Departments", to: "/admin/departments", icon: Building2 },
  { name: "Institutions", to: "/admin/institutions", icon: GraduationCap },
  { name: "Analytics", to: "/admin/analytics", icon: BarChart3 },
  { name: "Bulk Upload", to: "/admin/upload", icon: Upload },
];

export const AdminLayout = ({ children }: { children?: ReactNode }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform flex-col border-r bg-white transition-transform duration-300 lg:static lg:flex lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0 flex" : "-translate-x-full hidden"
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="flex h-16 items-center justify-between border-b px-6">
          <span className="text-xl font-bold text-gray-900">Thesis Admin</span>
          <button
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {NAVIGATION.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.end}
              onClick={() => setIsMobileMenuOpen(false)} // Close mobile menu on click
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer (User / Logout) */}
        <div className="border-t p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm lg:px-8">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Spacer to push user info to the right on mobile */}
          <div className="flex-1 lg:hidden"></div>

          {/* User Profile Snippet */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
              {user?.first_name?.[0]}
              {user?.last_name?.[0]}
            </div>
          </div>
        </header>

        {/* Page Content Area (This is where the child routes render) */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
};
