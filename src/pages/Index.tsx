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
import { Analytics } from "@/pages/admin/Analytics";
import { VendorApproval } from "@/pages/admin/VendorApproval";
import { OrderManagement } from "@/components/admin/OrderManagement";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { ProductApprovalQueue } from "@/components/admin/ProductApprovalQueue";
import { CustomerManagement } from "@/components/admin/CustomerManagement";
import { CategoryManagement } from "@/components/admin/CategoryManagement";
import { FinancialManagement } from "@/components/admin/FinancialManagement";
import { NotificationCenter } from "@/components/admin/NotificationCenter";
import { AdvancedAnalytics } from "@/components/admin/AdvancedAnalytics";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { VendorStore } from "@/pages/admin/VendorStore";
import { CommissionManagement } from "@/components/admin/CommissionManagement";
import { PlatformFinancialDashboard } from "@/components/admin/PlatformFinancialDashboard";
import { VendorSalesReporting } from "@/components/admin/VendorSalesReporting";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen grid grid-cols-[auto_1fr] w-full bg-background">
        <AdminSidebar />
        
        <div className="flex flex-col min-w-0">
          <AdminHeader />
          
          <main className="flex-1 p-6 bg-muted/30 overflow-auto">
            <div className="w-full">
            <Routes>
              <Route index element={<DashboardOverview />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="advanced-analytics" element={<AdvancedAnalytics />} />
              <Route path="vendors" element={<VendorManagement />} />
              <Route path="vendor-approval" element={<VendorApproval />} />
              <Route path="products" element={<ProductOversight />} />
              <Route path="product-approval" element={<ProductApprovalQueue />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="financial" element={<FinancialManagement />} />
              <Route path="platform-financial" element={<PlatformFinancialDashboard />} />
              <Route path="commission" element={<CommissionManagement />} />
              <Route path="vendor-sales" element={<VendorSalesReporting />} />
              <Route path="notifications" element={<NotificationCenter />} />
              <Route path="admin-users" element={<AdminUserManagement />} />
              <Route path="vendor-store/:vendorId" element={<VendorStore />} />
              <Route path="support" element={<CustomerSupport />} />
              <Route path="security" element={<SecurityMonitoring />} />
              <Route path="settings" element={<AdminSettings />} />
            </Routes>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;