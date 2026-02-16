import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Megaphone,
  Tags,
  Building2,
  FileText,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Menu,
} from "lucide-react";
import { motion } from "motion/react";
import { useAdmin } from "@/contexts/AdminContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet.tsx";
import { useTheme } from "@/components/theme-provider";
import axios from "axios";
import { toast } from "sonner";

const SideBar = () => {
  const { setAdminData } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const { setTheme, theme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Campaigns", href: "/campaigns", icon: Megaphone },
    { name: "Categories", href: "/categories", icon: Tags },
    { name: "Companies", href: "/companies", icon: Building2 },
    { name: "Financial Reports", href: "/financial-reports", icon: FileText },
    { name: "Marketers", href: "/marketers", icon: Users },
    { name: "Withdrawals", href: "/withdrawals", icon: CreditCard },
  ];

  const handleLogout = async () => {
    try {
      await axios.post("http://affilliance.runasp.net/api/Account/logout");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.removeItem("token");
      setAdminData(null);
      navigate("/login");
      toast.success("Logged out successfully");
    }
  };

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const NavContent = () => (
    <>
      <div className="flex h-16 items-center px-6">
        {/* Replace with actual logo if available */}
        <span className="text-xl font-bold text-brand-primary">Affiliance</span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground relative group",
                  isActive
                    ? "bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 hover:text-brand-primary"
                    : "text-muted-foreground"
                )
              }
              viewTransition
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn("h-4 w-4", isActive ? "text-brand-primary" : "")}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="border-t p-4">
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Manage your preferences and workspace settings.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    className="w-full justify-start gap-2"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-4 w-4" /> Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    className="w-full justify-start gap-2"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-4 w-4" /> Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    className="w-full justify-start gap-2"
                    onClick={() => setTheme("system")}
                  >
                    <Monitor className="h-4 w-4" /> System
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-destructive">Danger Zone</Label>
                <Button
                  variant="destructive"
                  className="w-full justify-start gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" /> Logout
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col h-full bg-card text-card-foreground">
              <NavContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-screen w-64 flex-col border-r bg-card text-card-foreground shadow-sm sticky top-0">
        <NavContent />
      </div>
    </>
  );
};

export default SideBar;