import { Routes, Route } from "react-router-dom";
import { VendorSidebar } from "@/components/vendor/VendorSidebar";
import { VendorHeader } from "@/components/vendor/VendorHeader";
import { VendorDashboard } from "@/components/vendor/VendorDashboard";
import { VendorOrderManagement } from "@/components/vendor/VendorOrderManagement";
import { VendorProductManagement } from "@/components/vendor/VendorProductManagement";
import { VendorAnalytics } from "@/components/vendor/VendorAnalytics";
import { VendorEarnings } from "@/components/vendor/VendorEarnings";
import { VendorReviews } from "@/components/vendor/VendorReviews";

const VendorLayout = () => {
  return (
    <div className="min-h-screen grid grid-cols-[auto_1fr] w-full bg-background">
      <VendorSidebar />
      
      <div className="flex flex-col min-w-0">
        <VendorHeader />
        
        <main className="flex-1 p-6 bg-muted/30 overflow-auto">
          <div className="w-full">
            <Routes>
              <Route index element={<VendorDashboard />} />
              <Route path="dashboard" element={<VendorDashboard />} />
              {/* Additional vendor routes will be added here */}
              <Route path="orders" element={<VendorOrderManagement />} />
              <Route path="products" element={<VendorProductManagement />} />
              <Route path="analytics" element={<VendorAnalytics />} />
              <Route path="earnings" element={<VendorEarnings />} />
              <Route path="reviews" element={<VendorReviews />} />
              <Route path="shipping" element={<div>Vendor Shipping (Coming Soon)</div>} />
              <Route path="reports" element={<div>Vendor Reports (Coming Soon)</div>} />
              <Route path="profile" element={<div>Vendor Profile (Coming Soon)</div>} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
