import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Settings,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  Menu,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import { API_BASE_URL } from '@/lib/api-config';

interface VendorDashboardData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    avgRating: number;
    growthRate: number;
    orderGrowth: number;
    productGrowth: number;
    ratingGrowth: number;
  };
}

// Fetch vendor dashboard data
const fetchVendorDashboard = async (): Promise<VendorDashboardData> => {
  const response = await fetch(`${API_BASE_URL}/vendor/dashboard`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('afrigos-token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch vendor dashboard data');
  }
  
  const data = await response.json();
  return data.data;
};

type VendorHeaderProps = {
  onOpenSidebar?: () => void;
};

export function VendorHeader({ onOpenSidebar }: VendorHeaderProps) {
  const { user } = useAuth();
  const [notifications] = useState(3); // Mock notification count

  // Fetch vendor dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['vendor-dashboard'],
    queryFn: fetchVendorDashboard,
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
      {/* Left */}
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onOpenSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation</span>
        </Button>
        <div className="flex items-center space-x-3">
          <img
            src="/afrigos.jpg"
            alt="AfriGos"
            className="h-9 w-9 rounded-lg object-cover shadow-sm md:h-10 md:w-10"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Afrigos Vendor
            </span>
            <span className="text-base font-semibold text-foreground md:text-lg">
              Dashboard
            </span>
          </div>
        </div>
      </div>

      {/* Right side - Actions and user info */}
      <div className="flex items-center space-x-4">
        {/* Quick Stats */}
        <div className="hidden md:flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Package className="h-4 w-4" />
            <span>{isLoading ? '...' : `${dashboardData?.overview?.totalProducts || 0} Products`}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ShoppingCart className="h-4 w-4" />
            <span>{isLoading ? '...' : `${dashboardData?.overview?.totalOrders || 0} Orders`}</span>
          </div>
          <div className="flex items-center space-x-1">
            <DollarSign className="h-4 w-4" />
            <span>{isLoading ? '...' : `£${(dashboardData?.overview?.totalRevenue || 0).toFixed(2)} Revenue`}</span>
          </div>
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {notifications}
            </Badge>
          )}
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="sm">
          <Settings className="h-5 w-5" />
        </Button>

        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user?.vendorName || user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <img
            src="/afrigos.jpg"
            alt="AfriGos"
            className="h-9 w-9 rounded-full object-cover shadow-sm"
          />
        </div>
      </div>
    </header>
  );
}

