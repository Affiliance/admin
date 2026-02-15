import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { jwtDecode } from "jwt-decode";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdmin } from "@/contexts/AdminContext";

interface LoginFormInputs {
  email: string;
  passWord: string;
}

const LoginPage = () => {
  const { adminData, setAdminData } = useAdmin();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  if (adminData) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    try {
      const response = await axios.post("http://affilliance.runasp.net/api/Account/login", data);

      const token = response.data.data.token;

      const decoded: any = jwtDecode(token);

      console.log("Decoded Token:", decoded);

      const adminData = {
        id: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
        role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      };

      localStorage.setItem("token", token);
      setAdminData(adminData);
      toast.success("Login successful");
      navigate("/");
    } catch (error: any) {
      console.error("Login failed:", error);
      const errorMessage = error.response?.data?.message || "Invalid email or password";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-brand-primary">
            Admin Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text" // Changed from 'email' to 'text' to be more flexible if username is allowed, or keep 'email'
                placeholder="m@example.com"
                autoComplete="off"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-sm text-brand-error">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("passWord", { required: "Password is required" })}
              />
              {errors.passWord && (
                <p className="text-sm text-brand-error">
                  {errors.passWord.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-brand-primary text-brand-white hover:bg-brand-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;