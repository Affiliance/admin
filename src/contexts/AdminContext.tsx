import { createContext, useContext, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

interface AdminData {
  id: string;
  role: string
}

interface AdminContextType {
  adminData: AdminData | null;
  setAdminData: React.Dispatch<React.SetStateAction<AdminData | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [adminData, setAdminData] = useState<AdminData | null>(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return {
          id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
          role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        }
      } catch (error) {
        localStorage.removeItem("token");
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false); // Can be used for initial auth check

  return (
    <AdminContext.Provider value={{ adminData, setAdminData, isLoading, setIsLoading }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
