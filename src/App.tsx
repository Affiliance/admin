import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AdminProvider } from "./contexts/AdminContext";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const App = () => {
  return (
    <AdminProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </AdminProvider>
  );
};

export default App;