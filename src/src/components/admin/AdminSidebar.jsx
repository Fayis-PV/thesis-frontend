import React from "react";
import { NavLink, Link } from "react-router-dom";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/theses", label: "Theses", icon: FileText },
  { to: "/admin/theses/new", label: "Add Thesis", icon: FilePlus2 },
  { to: "/admin/upload", label: "Bulk Upload", icon: Upload },
  { to: "/admin/institutions", label: "Institutions", icon: Building2 },
  { to: "/admin/departments", label: "Departments", icon: FolderTree },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AdminSidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-5">
          <Link to="/admin" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <BookOpen className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="font-display text-sm font-semibold">Scholarum</p>
              <p className="text-[10px] text-muted-foreground">Admin Panel</p>
            </div>
          </Link>
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t p-3">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to="/">View public site</Link>
          </Button>
        </div>
      </aside>
    </>
  );
}
