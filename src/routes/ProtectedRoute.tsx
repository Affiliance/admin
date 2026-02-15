import { Navigate, Outlet } from "react-router-dom";
import { useAdmin } from "../contexts/AdminContext";
import SideBar from "@/components/SideBar";

const ProtectedRoute = () => {
  const { adminData, isLoading } = useAdmin();

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  if (!adminData) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg">
      <SideBar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedRoute;
