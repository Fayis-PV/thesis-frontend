import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { LoginPage } from "@/features/auth/LoginPage";
import { AdminLayout } from "@/components/layout/AdminLayout";
import ThesesManagement from "@/pages/admin/ThesesManagement";
import CategoriesPage from "@/pages/admin/CategoriesPage";
import DepartmentsPage from "@/pages/admin/DepartmentsPage";
import InstitutionsPage from "@/pages/admin/InstitutionsPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import ExcelUploadPage from "@/pages/admin/ExcelUploadPage";
import { SearchPage } from "@/features/public-search/components/SearchPage";
import LandingPage from "@/pages/public/LandingPage";
import ThesisDetail from "@/pages/thesis/ThesisDetail";
import SubmitThesis from "@/pages/thesis/SubmitThesis";
import AdminDashboard from "@/pages/admin/AdminDashboard";

export const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/search",
    element: <SearchPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/thesis/:id",
    element: <ThesisDetail />,
  },
  {
    path: "/admin",
    element: <ProtectedRoute />, // 1. Security Check
    children: [
      {
        element: <AdminLayout />, // 2. If secure, render the Layout
        children: [
          // 3. Render the specific page inside the Layout's Outlet
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: "theses",
            element: <ThesesManagement />,
          },
          {
            path: "theses/create",
            element: <SubmitThesis />,
          },
          {
            path: "theses/:id/edit",
            element: <SubmitThesis />,
          },
          {
            path: "categories",
            element: <CategoriesPage />,
          },
          {
            path: "departments",
            element: <DepartmentsPage />,
          },
          {
            path: "institutions",
            element: <InstitutionsPage />,
          },
          {
            path: "analytics",
            element: <AnalyticsPage />,
          },
          {
            path: "upload",
            element: <ExcelUploadPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
