import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Store, Eye, EyeOff, ArrowLeft, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/api-config';

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

const vendorLoginApi = async (data: LoginData): Promise<AuthResponse> => {
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

export default function VendorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const vendorLoginMutation = useMutation({
    mutationFn: vendorLoginApi,
    onSuccess: (data) => {
      if (data.data.token) {
        localStorage.setItem('afrigos-token', data.data.token);
        localStorage.setItem('afrigos-user', JSON.stringify(data.data.user));
        
        // Transform user data to match AuthContext interface
        const transformedUser = {
          id: data.data.user.id,
          email: data.data.user.email,
          name: `${data.data.user.firstName} ${data.data.user.lastName}`,
          role: data.data.user.role.toLowerCase() as 'admin' | 'vendor',
          avatar: null,
          vendorId: data.data.user.id,
          vendorName: `${data.data.user.firstName} ${data.data.user.lastName}'s Store`,
          isActive: data.data.user.isActive,
          isVerified: data.data.user.isVerified
        };
        
        // Update AuthContext with the logged-in user
        setUser(transformedUser);
      }
      
      // Check if user is trying to login as vendor but is actually an admin
      if (data.data.user.role.toLowerCase() === 'admin') {
        toast({
          title: "Access Denied",
          description: "Admins should use the admin login portal.",
          variant: "destructive",
        });
        navigate("/auth/login");
        return;
      }
      
      if (data.data.isPendingApproval) {
        toast({
          title: "Login Successful",
          description: data.message || "Your vendor account is pending approval. Limited access granted.",
        });
        navigate("/auth/pending-approval");
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully logged into AfriGos Vendor Portal",
        });
        navigate("/vendor");
      }
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
    vendorLoginMutation.mutate({ email, password });
  };

  const handleDemoLogin = async () => {
    vendorLoginMutation.mutate({ 
      email: "mamaasha@afrigos.com", 
      password: "vendor123" 
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Store className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">AfriGos</h1>
          </div>
          <p className="text-gray-600">Vendor Portal</p>
        </div>

        {/* Login/Signup Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Vendor Portal</CardTitle>
            <CardDescription className="text-center">
              Access your vendor dashboard or create a new vendor account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-orange-600 hover:bg-orange-700"
                disabled={vendorLoginMutation.isPending}
              >
                {vendorLoginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or try demo
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full h-11"
              onClick={handleDemoLogin}
              disabled={vendorLoginMutation.isPending}
            >
              <Store className="h-4 w-4 mr-2" />
              Demo Vendor Login
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>Demo Credentials:</p>
              <p className="font-mono text-xs mt-1">
                mamaasha@afrigos.com / vendor123
              </p>
            </div>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Join as a Vendor</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your vendor account and start selling on AfriGos
                    </p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Store className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div className="text-sm text-orange-800">
                        <p className="font-medium">Pending Approval Process</p>
                        <p className="mt-1">
                          Your vendor account will be reviewed by our team. You'll receive an email notification once approved.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => navigate("/auth/vendor-signup")}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    <Store className="h-4 w-4 mr-2" />
                    Create Vendor Account
                  </Button>
                </TabsContent>
              </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/auth/login")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Login
          </Button>
          <p className="text-xs text-muted-foreground">
            Need help? Contact support at support@afrigos.com
          </p>
        </div>
      </div>
    </div>
  );
}

