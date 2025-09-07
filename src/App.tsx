import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import VendorLayout from "./pages/VendorLayout";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import VendorLogin from "./pages/auth/VendorLogin";
import OrderTracking from "./pages/OrderTracking";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AuthRedirect } from "./components/AuthRedirect";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

// Vendor Protected Route Component
const VendorProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isVendor } = useAuth();
  return isAuthenticated && isVendor ? <>{children}</> : <Navigate to="/auth/vendor-login" replace />;
};

// Admin Protected Route Component
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  return isAuthenticated && isAdmin ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Authentication Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/vendor-login" element={<VendorLogin />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            
            {/* Public Routes */}
            <Route path="/track" element={<OrderTracking />} />
            
            {/* Protected Admin Routes */}
            <Route path="/admin/*" element={<AdminProtectedRoute><Index /></AdminProtectedRoute>} />
            
            {/* Protected Vendor Routes */}
            <Route path="/vendor/*" element={<VendorProtectedRoute><VendorLayout /></VendorProtectedRoute>} />
            
            {/* Default Route */}
            <Route path="/" element={<AuthRedirect />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
