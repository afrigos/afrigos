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
import VendorSignup from "./pages/auth/VendorSignup";
import CustomerLogin from "./pages/auth/CustomerLogin";
import CustomerSignup from "./pages/auth/CustomerSignup";
import PendingApproval from "./pages/auth/PendingApproval";
import OrderTracking from "./pages/OrderTracking";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { CustomerLayout } from "./components/customer/CustomerLayout";
import Marketplace from "./pages/Marketplace";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import CustomerAccount from "./pages/CustomerAccount";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Shipping from "./pages/Shipping";
import Returns from "./pages/Returns";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import VendorStorePage from "./pages/VendorStorePage";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

// Vendor Protected Route Component
const VendorProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isVendor, user } = useAuth();
  
  if (!isAuthenticated || !isVendor) {
    return <Navigate to="/auth/vendor-login" replace />;
  }
  
  // If vendor is not active, redirect to pending approval
  if (user && !user.isActive) {
    return <Navigate to="/auth/pending-approval" replace />;
  }
  
  return <>{children}</>;
};

// Admin Protected Route Component
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  
  console.log('AdminProtectedRoute check:', { isAuthenticated, isAdmin, user });
  
  if (!isAuthenticated || !isAdmin) {
    console.log('Redirecting to login - not authenticated or not admin');
    return <Navigate to="/auth/login" replace />;
  }
  
  // Admins can access the platform even if pending approval
  console.log('Admin access granted');
  return <>{children}</>;
};

// Customer Protected Route Component (for checkout)
const CustomerProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    const currentPath = window.location.pathname;
    return <Navigate to={`/auth/customer-login?redirect=${encodeURIComponent(currentPath)}`} replace />;
  }
  
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Authentication Routes */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/vendor-login" element={<VendorLogin />} />
              <Route path="/auth/vendor-signup" element={<VendorSignup />} />
              <Route path="/auth/customer-login" element={<CustomerLogin />} />
              <Route path="/auth/customer-signup" element={<CustomerSignup />} />
              <Route path="/auth/pending-approval" element={<PendingApproval />} />
              <Route path="/auth/signup" element={<Signup />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              
              {/* Customer Marketplace Routes */}
              <Route path="/" element={<CustomerLayout><Marketplace /></CustomerLayout>} />
              <Route path="/products" element={<CustomerLayout><ProductListing /></CustomerLayout>} />
              <Route path="/category/:categoryId" element={<CustomerLayout><ProductListing /></CustomerLayout>} />
              <Route path="/product/:productId" element={<CustomerLayout><ProductDetail /></CustomerLayout>} />
              <Route path="/cart" element={<CustomerLayout><Cart /></CustomerLayout>} />
              <Route 
                path="/checkout" 
                element={
                  <CustomerProtectedRoute>
                    <CustomerLayout><Checkout /></CustomerLayout>
                  </CustomerProtectedRoute>
                } 
              />
              <Route 
                path="/order/:orderId/confirmation" 
                element={
                  <CustomerProtectedRoute>
                    <CustomerLayout><OrderConfirmation /></CustomerLayout>
                  </CustomerProtectedRoute>
                } 
              />
              
              {/* Customer Account Routes */}
              <Route 
                path="/account" 
                element={
                  <CustomerProtectedRoute>
                    <CustomerLayout><CustomerAccount /></CustomerLayout>
                  </CustomerProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <CustomerProtectedRoute>
                    <CustomerLayout><CustomerAccount /></CustomerLayout>
                  </CustomerProtectedRoute>
                } 
              />
              
              {/* Public Routes */}
              <Route path="/track" element={<CustomerLayout><OrderTracking /></CustomerLayout>} />
              <Route path="/store/:vendorId" element={<CustomerLayout><VendorStorePage /></CustomerLayout>} />
              <Route path="/about" element={<CustomerLayout><About /></CustomerLayout>} />
              <Route path="/contact" element={<CustomerLayout><Contact /></CustomerLayout>} />
              <Route path="/faq" element={<CustomerLayout><FAQ /></CustomerLayout>} />
              <Route path="/shipping" element={<CustomerLayout><Shipping /></CustomerLayout>} />
              <Route path="/returns" element={<CustomerLayout><Returns /></CustomerLayout>} />
              <Route path="/terms" element={<CustomerLayout><Terms /></CustomerLayout>} />
              <Route path="/privacy" element={<CustomerLayout><Privacy /></CustomerLayout>} />
              
              {/* Protected Admin Routes */}
              <Route path="/admin/*" element={<AdminProtectedRoute><Index /></AdminProtectedRoute>} />
              
              {/* Protected Vendor Routes */}
              <Route path="/vendor/*" element={<VendorProtectedRoute><VendorLayout /></VendorProtectedRoute>} />
              
              {/* Catch-all route */}
              <Route path="*" element={<CustomerLayout><NotFound /></CustomerLayout>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
