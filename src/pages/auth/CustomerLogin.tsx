import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';
import { useToast } from '@/hooks/use-toast';

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token?: string;
    isPendingApproval?: boolean;
  };
}

const customerLoginApi = async (data: LoginData): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
};

export default function CustomerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const customerLoginMutation = useMutation({
    mutationFn: customerLoginApi,
    onSuccess: (data) => {
      if (data.data.token) {
        localStorage.setItem('afrigos-token', data.data.token);
        localStorage.setItem('afrigos-user', JSON.stringify(data.data.user));
        
        // Transform user data to match AuthContext interface
        const transformedUser = {
          id: data.data.user.id,
          email: data.data.user.email,
          name: `${data.data.user.firstName} ${data.data.user.lastName}`,
          role: data.data.user.role.toLowerCase() as 'admin' | 'vendor' | 'customer',
          avatar: null,
          isActive: data.data.user.isActive,
          isVerified: data.data.user.isVerified
        };
        
        // Update AuthContext with the logged-in user
        setUser(transformedUser);
      }
      
      // Redirect non-customers to appropriate portals
      if (data.data.user.role.toLowerCase() === 'admin') {
        toast({
          title: "Access Denied",
          description: "Admins should use the admin login portal.",
          variant: "destructive",
        });
        navigate("/auth/login");
        return;
      }
      
      if (data.data.user.role.toLowerCase() === 'vendor') {
        toast({
          title: "Access Denied",
          description: "Vendors should use the vendor login portal.",
          variant: "destructive",
        });
        navigate("/auth/vendor-login");
        return;
      }
      
      toast({
        title: "Welcome back!",
        description: "Successfully logged into your account",
      });
      
      // Check for redirect parameter
      const redirectTo = searchParams.get('redirect');
      navigate(redirectTo || '/account');
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    customerLoginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <img 
            src="/afrigos.jpg" 
            alt="AfriGos Logo" 
            className="w-16 h-16 rounded-xl mx-auto mb-4 object-cover"
          />
          <h1 className="text-2xl font-bold text-foreground">AfriGos</h1>
          <p className="text-muted-foreground">Customer Login</p>
        </div>

        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue shopping
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <Label htmlFor="remember" className="text-sm">Remember me</Label>
                </div>
                <Link to="/auth/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-orange-500 hover:opacity-90"
                disabled={customerLoginMutation.isPending}
              >
                {customerLoginMutation.isPending ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/auth/customer-signup" className="text-primary hover:underline font-medium">
                  Sign Up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Are you a vendor?{" "}
            <Link to="/auth/vendor-login" className="text-orange-600 hover:underline font-medium">
              Vendor Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

