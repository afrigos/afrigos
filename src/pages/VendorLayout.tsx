import { Routes, Route } from "react-router-dom";
import { VendorSidebar } from "@/components/vendor/VendorSidebar";
import { VendorHeader } from "@/components/vendor/VendorHeader";
import { VendorDashboard } from "@/components/vendor/VendorDashboard";
import { VendorOrderManagement } from "@/components/vendor/VendorOrderManagement";
import { VendorProductManagement } from "@/components/vendor/VendorProductManagement";
import { VendorAnalytics } from "@/components/vendor/VendorAnalytics";
import { VendorEarnings } from "@/components/vendor/VendorEarnings";
import { VendorReviews } from "@/components/vendor/VendorReviews";
import { VendorProfile } from "@/components/vendor/VendorProfile";
import { VendorReports } from "@/components/vendor/VendorReports";
import { VendorShopping } from "@/components/vendor/VendorShopping";
import { VendorShipping } from "@/components/vendor/VendorShipping";

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
              <Route path="orders" element={<VendorOrderManagement />} />
              <Route path="products" element={<VendorProductManagement />} />
              <Route path="analytics" element={<VendorAnalytics />} />
              <Route path="earnings" element={<VendorEarnings />} />
              <Route path="reviews" element={<VendorReviews />} />
              <Route path="reports" element={<VendorReports />} />
              <Route path="profile" element={<VendorProfile />} />
              <Route path="shopping" element={<VendorShopping />} />
              <Route path="shipping" element={<VendorShipping />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
