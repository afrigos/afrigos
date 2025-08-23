import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock password reset logic (frontend only)
    setTimeout(() => {
      toast({
        title: "Reset Link Sent",
        description: "Check your email for password reset instructions",
      });
      setEmailSent(true);
      setIsLoading(false);
    }, 1500);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-dashboard-accent rounded-xl mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Check Your Email</h1>
            <p className="text-muted-foreground">Reset instructions sent</p>
          </div>

          <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6 text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Reset Link Sent</h3>
                <p className="text-muted-foreground">
                  We've sent password reset instructions to:
                </p>
                <p className="font-medium text-foreground">{email}</p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
                <p>
                  If you don't see the email, check your spam folder or try again with a different email address.
                </p>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={() => setEmailSent(false)}
                  variant="outline" 
                  className="w-full"
                >
                  Try Different Email
                </Button>
                <Button 
                  onClick={() => navigate("/auth/login")}
                  className="w-full bg-gradient-to-r from-primary to-dashboard-accent"
                >
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-dashboard-accent rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">AC</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Forgot Password</h1>
          <p className="text-muted-foreground">Reset your admin password</p>
        </div>

        <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Enter your email address and we'll send you instructions to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-dashboard-accent hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? "Sending Instructions..." : "Send Reset Instructions"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                to="/auth/login" 
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/auth/login" className="text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}