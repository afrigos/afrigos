import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { Routes, Route } from "react-router-dom";
import { VendorManagement } from "@/components/admin/VendorManagement";
import { ProductOversight } from "@/components/admin/ProductOversight";
import { CustomerSupport } from "@/components/admin/CustomerSupport";
import { SecurityMonitoring } from "@/components/admin/SecurityMonitoring";
import { AdminSettings } from "@/components/admin/AdminSettings";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          
          <main className="flex-1 p-6 bg-muted/30">
            <Routes>
              <Route path="/" element={<DashboardOverview />} />
              <Route path="/vendors" element={<VendorManagement />} />
              <Route path="/products" element={<ProductOversight />} />
              <Route path="/support" element={<CustomerSupport />} />
              <Route path="/security" element={<SecurityMonitoring />} />
              <Route path="/settings" element={<AdminSettings />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;