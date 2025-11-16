import { useState, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package,
  Star,
  Users,
  Eye,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Truck
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
  recentOrders: Array<{
    id: string;
    customer: string;
    products: string[];
    total: string;
    status: string;
    date: string;
    time: string;
  }>;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
    rating: number;
    growth: number;
  }>;
  orderStatuses: Record<string, number>;
}

// API function to fetch vendor dashboard data
const fetchVendorDashboardData = async (): Promise<VendorDashboardData> => {
  const response = await fetch(`${API_BASE_URL}/vendor/dashboard`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('afrigos-token')}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch vendor dashboard data');
  }

  const result = await response.json();
  return result.data;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'new': return 'bg-blue-100 text-blue-800';
    case 'confirmed': return 'bg-yellow-100 text-yellow-800';
    case 'processing': return 'bg-orange-100 text-orange-800';
    case 'ready_for_handover': return 'bg-purple-100 text-purple-800';
    case 'in_transit': return 'bg-indigo-100 text-indigo-800';
    case 'delivered': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'new': return <Clock className="h-4 w-4" />;
    case 'confirmed': return <CheckCircle className="h-4 w-4" />;
    case 'processing': return <AlertTriangle className="h-4 w-4" />;
    case 'ready_for_handover': return <Truck className="h-4 w-4" />;
    case 'in_transit': return <Truck className="h-4 w-4" />;
    case 'delivered': return <CheckCircle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};

export function VendorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch vendor dashboard data using TanStack Query
  const { data: vendorData, isLoading, error } = useQuery<VendorDashboardData, Error>({
    queryKey: ['vendor-dashboard'],
    queryFn: fetchVendorDashboardData,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowUpRight className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-600" />
    );
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'Add Product':
        navigate('/vendor/products');
        break;
      case 'View Orders':
        navigate('/vendor/orders');
        break;
      case 'Analytics':
        navigate('/vendor/analytics');
        break;
      case 'Settings':
        navigate('/vendor/profile');
        break;
      default:
        toast({ title: "Unknown action" });
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span>Loading dashboard data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load dashboard</h3>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!vendorData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No data available</h3>
            <p className="text-muted-foreground">Start by adding your first product!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full sm:w-auto"
            onClick={() => navigate('/vendor/products')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
          <Button 
            size="sm" 
            className="w-full sm:w-auto"
            onClick={() => {
              if (user?.vendorId) {
                window.open(`/store/${user.vendorId}`, '_blank');
              } else {
                toast({
                  title: "Error",
                  description: "Vendor ID not found",
                  variant: "destructive"
                });
              }
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Store
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(vendorData.overview.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {getGrowthIcon(vendorData.overview.growthRate)}
              +{vendorData.overview.growthRate}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorData.overview.totalOrders}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {getGrowthIcon(vendorData.overview.orderGrowth)}
              +{vendorData.overview.orderGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorData.overview.totalProducts}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {getGrowthIcon(vendorData.overview.productGrowth)}
              +{vendorData.overview.productGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorData.overview.avgRating}/5.0</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {getGrowthIcon(vendorData.overview.ratingGrowth)}
              +{vendorData.overview.ratingGrowth} from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
          <TabsTrigger className="text-sm sm:text-base" value="overview">
            Overview
          </TabsTrigger>
          <TabsTrigger className="text-sm sm:text-base" value="orders">
            Recent Orders
          </TabsTrigger>
          <TabsTrigger className="text-sm sm:text-base" value="products">
            Top Products
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Order Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status Overview</CardTitle>
                <CardDescription>Current order distribution by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(vendorData.orderStatuses).length > 0 ? (
                    Object.entries(vendorData.orderStatuses).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(status)}
                          <span className="capitalize font-medium">{status.replace('_', ' ')}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                      <p>No orders yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center text-xs sm:text-sm"
                    onClick={() => handleQuickAction('Add Product')}
                  >
                    <Plus className="h-6 w-6 mb-2" />
                    <span>Add Product</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center text-xs sm:text-sm"
                    onClick={() => handleQuickAction('View Orders')}
                  >
                    <ShoppingCart className="h-6 w-6 mb-2" />
                    <span>View Orders</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center text-xs sm:text-sm"
                    onClick={() => handleQuickAction('Analytics')}
                  >
                    <TrendingUp className="h-6 w-6 mb-2" />
                    <span>Analytics</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center text-xs sm:text-sm"
                    onClick={() => handleQuickAction('Settings')}
                  >
                    <Package className="h-6 w-6 mb-2" />
                    <span>Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recent Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendorData.recentOrders.length > 0 ? (
                  vendorData.recentOrders.map((order) => (
                  <div key={order.id} className="flex flex-col gap-4 rounded-lg bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.products.join(', ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.date} at {order.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-bold">{order.total}</p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                    <p>No recent orders</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Your best-selling products this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendorData.topProducts.length > 0 ? (
                  vendorData.topProducts.map((product, index) => (
                  <div key={product.name} className="flex flex-col gap-4 rounded-lg bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-orange-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{product.sales} sales</span>
                          <span className="flex items-center">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            {product.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-bold">{formatCurrency(product.revenue)}</p>
                      <p className="text-sm text-green-600 flex items-center sm:justify-end">
                        {getGrowthIcon(product.growth)}
                        +{product.growth}%
                      </p>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2" />
                    <p>No products yet</p>
                    <p className="text-sm">Add your first product to see it here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

