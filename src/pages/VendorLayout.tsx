import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { VendorSidebar } from "@/components/vendor/VendorSidebar";
import { VendorHeader } from "@/components/vendor/VendorHeader";
import { VendorDashboard } from "@/components/vendor/VendorDashboard";
import { VendorOrderManagement } from "@/components/vendor/VendorOrderManagement";
import ProductManagement from "@/components/vendor/ProductManagement";
import { VendorAnalytics } from "@/components/vendor/VendorAnalytics";
import { VendorEarnings } from "@/components/vendor/VendorEarnings";
import { VendorReviews } from "@/components/vendor/VendorReviews";
import { VendorProfile } from "@/components/vendor/VendorProfile";
import { VendorReports } from "@/components/vendor/VendorReports";
import { VendorShopping } from "@/components/vendor/VendorShopping";
import { VendorShipping } from "@/components/vendor/VendorShipping";

const VendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative h-full w-72 max-w-[80%] bg-background shadow-lg">
            <VendorSidebar
              className="h-full"
              showCloseButton
              onCloseMobile={() => setSidebarOpen(false)}
              onNavigate={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-h-screen">
        <div className="hidden lg:block lg:h-full">
          <VendorSidebar className="h-full" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <VendorHeader onOpenSidebar={() => setSidebarOpen(true)} />

          <main className="flex-1 bg-muted/30 px-4 py-6 sm:px-6 lg:px-8 overflow-x-hidden">
            <div className="w-full">
              <Routes>
                <Route index element={<VendorDashboard />} />
                <Route path="dashboard" element={<VendorDashboard />} />
                <Route path="orders" element={<VendorOrderManagement />} />
                <Route path="products" element={<ProductManagement />} />
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
    </div>
  );
};

export default VendorLayout;
