import { useState, useEffect } from "react";
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

// Mock data for vendor dashboard
const vendorData = {
  overview: {
    totalRevenue: 12450,
    totalOrders: 156,
    totalProducts: 24,
    avgRating: 4.8,
    growthRate: 12.5,
    orderGrowth: 8.2,
    productGrowth: 15.3,
    ratingGrowth: 0.2
  },
  recentOrders: [
    {
      id: "ORD001",
      customer: "Sarah Johnson",
      products: ["Jollof Rice Spice Mix", "Plantain Chips"],
      total: "£34.48",
      status: "processing",
      date: "2024-01-20",
      time: "14:30"
    },
    {
      id: "ORD002",
      customer: "Michael Chen",
      products: ["Shea Butter Hair Care Set"],
      total: "£24.99",
      status: "confirmed",
      date: "2024-01-20",
      time: "13:15"
    },
    {
      id: "ORD003",
      customer: "Emma Wilson",
      products: ["Traditional Kente Cloth Scarf"],
      total: "£89.99",
      status: "ready_for_handover",
      date: "2024-01-20",
      time: "12:45"
    }
  ],
  topProducts: [
    {
      name: "Jollof Rice Spice Mix",
      sales: 234,
      revenue: 3036.66,
      rating: 4.8,
      growth: 15.2
    },
    {
      name: "Plantain Chips",
      sales: 189,
      revenue: 1606.50,
      rating: 4.6,
      growth: 8.5
    },
    {
      name: "Shea Butter Hair Care Set",
      sales: 156,
      revenue: 3898.44,
      rating: 4.9,
      growth: 22.1
    }
  ],
  orderStatuses: {
    new: 5,
    confirmed: 8,
    processing: 12,
    ready_for_handover: 6,
    in_transit: 3,
    delivered: 122
  }
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
  const [isLoading, setIsLoading] = useState(false);

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
    toast({
      title: "Action Initiated",
      description: `${action} action has been started.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
          <Button size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Store
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Order Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status Overview</CardTitle>
                <CardDescription>Current order distribution by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(vendorData.orderStatuses).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(status)}
                        <span className="capitalize font-medium">{status.replace('_', ' ')}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
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
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => handleQuickAction('Add Product')}
                  >
                    <Plus className="h-6 w-6 mb-2" />
                    <span className="text-sm">Add Product</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => handleQuickAction('View Orders')}
                  >
                    <ShoppingCart className="h-6 w-6 mb-2" />
                    <span className="text-sm">View Orders</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => handleQuickAction('Analytics')}
                  >
                    <TrendingUp className="h-6 w-6 mb-2" />
                    <span className="text-sm">Analytics</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => handleQuickAction('Settings')}
                  >
                    <Package className="h-6 w-6 mb-2" />
                    <span className="text-sm">Settings</span>
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
                {vendorData.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-4">
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
                    <div className="text-right">
                      <p className="font-bold">{order.total}</p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
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
                {vendorData.topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-4">
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
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(product.revenue)}</p>
                      <p className="text-sm text-green-600 flex items-center">
                        {getGrowthIcon(product.growth)}
                        +{product.growth}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

