import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Store, Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function PendingApproval() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user) {
      navigate("/auth/vendor-login");
      return;
    }

    // If user is admin, redirect to admin dashboard (admins don't need approval)
    if (user.role === 'admin') {
      navigate("/admin");
      return;
    }
    
    // If user is not a vendor, redirect to appropriate login
    if (user.role !== 'vendor') {
      navigate("/auth/login");
      return;
    }

    // If vendor is active and verified, redirect to vendor dashboard
    if (user.role === 'vendor' && user.isActive && user.isVerified) {
      navigate("/vendor");
      return;
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/auth/vendor-login");
  };

  const handleRefresh = () => {
    // Refresh the page to check for updates
    window.location.reload();
  };

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Store className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">AfriGos</h1>
          </div>
          <p className="text-gray-600">Vendor Portal</p>
        </div>

        {/* Pending Approval Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-orange-600">
              Account Pending Approval
            </CardTitle>
            <CardDescription>
              Your vendor account is currently under review
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Store className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Status Alert */}
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Review in Progress:</strong> Our team is currently reviewing your vendor application. 
                This process typically takes 1-3 business days.
              </AlertDescription>
            </Alert>

            {/* What Happens Next */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">What happens next?</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-orange-600">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Application Review</p>
                    <p className="text-sm text-gray-500">Our team reviews your business information and documents</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-orange-600">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Notification</p>
                    <p className="text-sm text-gray-500">You'll receive an email once your account is approved</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-orange-600">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Access Dashboard</p>
                    <p className="text-sm text-gray-500">Start managing your products and orders</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Status
              </Button>
              
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>

            {/* Support Info */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Mail className="h-4 w-4" />
                <span>Questions? Contact us at</span>
                <a 
                  href="mailto:support@afrigos.com" 
                  className="text-orange-600 hover:underline"
                >
                  support@afrigos.com
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
