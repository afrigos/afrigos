import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Store, 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  User, 
  DollarSign,
  Star,
  Truck,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const vendorNavItems = [
  {
    title: "Dashboard",
    href: "/vendor/dashboard",
    icon: LayoutDashboard,
    description: "Overview of your store performance"
  },
  {
    title: "Orders",
    href: "/vendor/orders",
    icon: ShoppingCart,
    description: "Manage customer orders and tracking"
  },
  {
    title: "Products",
    href: "/vendor/products",
    icon: Package,
    description: "Add and manage your products"
  },
  {
    title: "Analytics",
    href: "/vendor/analytics",
    icon: BarChart3,
    description: "Sales reports and performance metrics"
  },
  {
    title: "Earnings",
    href: "/vendor/earnings",
    icon: DollarSign,
    description: "Commission tracking and payouts"
  },
  {
    title: "Reviews",
    href: "/vendor/reviews",
    icon: Star,
    description: "Customer feedback and ratings"
  },
  {
    title: "Shipping",
    href: "/vendor/shipping",
    icon: Truck,
    description: "Delivery settings and tracking"
  },
  {
    title: "Reports",
    href: "/vendor/reports",
    icon: FileText,
    description: "Detailed business reports"
  },
  {
    title: "Profile",
    href: "/vendor/profile",
    icon: User,
    description: "Store information and settings"
  }
];

export function VendorSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/auth/vendor-login");
  };

  return (
    <div className={cn(
      "flex h-screen border-r bg-background transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex w-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Store className="h-6 w-6 text-orange-600" />
              <span className="font-semibold">Vendor Portal</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Vendor Info */}
        {!isCollapsed && (
          <div className="border-b p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Store className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.vendorName || user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-2">
            {vendorNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-10",
                    isActive && "bg-orange-100 text-orange-700 hover:bg-orange-100"
                  )}
                  onClick={() => navigate(item.href)}
                >
                  <item.icon className={cn(
                    "h-4 w-4",
                    isCollapsed ? "mx-auto" : "mr-3"
                  )} />
                  {!isCollapsed && (
                    <span className="truncate">{item.title}</span>
                  )}
                </Button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className={cn(
              "h-4 w-4",
              isCollapsed ? "mx-auto" : "mr-3"
            )} />
            {!isCollapsed && "Sign Out"}
          </Button>
        </div>
      </div>
    </div>
  );
}

