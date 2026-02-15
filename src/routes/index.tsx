import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import CampaignPage from "../pages/CampaignPage";
import CategoryPage from "../pages/CategoryPage";
import CompanyPage from "../pages/CompanyPage";
import FinancialReportsPage from "../pages/FinancialReportsPage";
import MarketerPage from "../pages/MarketerPage";
import NotFoundPage from "../pages/NotFoundPage";
import WithdrawalRequestsPage from "../pages/WithdrawalRequestsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/campaigns",
        element: <CampaignPage />,
      },
      {
        path: "/categories",
        element: <CategoryPage />,
      },
      {
        path: "/companies",
        element: <CompanyPage />,
      },
      {
        path: "/financial-reports",
        element: <FinancialReportsPage />,
      },
      {
        path: "/marketers",
        element: <MarketerPage />,
      },
      {
        path: "/withdrawals",
        element: <WithdrawalRequestsPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
