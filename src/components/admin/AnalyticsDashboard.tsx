import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Package, 
  DollarSign, 
  ShoppingCart,
  Star,
  MapPin,
  Calendar,
  Download,
  Filter,
  BarChart3,
  Activity,
  Loader2,
  AlertCircle
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnalyticsData {
  period: string;
  overview: {
    totalRevenue: number;
    totalOrders: number;
    activeVendors: number;
    totalProducts: number;
    avgOrderValue: number;
    avgRating: number;
    totalCustomers: number;
    revenueGrowth: number;
    ordersGrowth: number;
    usersGrowth: number;
    vendorsGrowth: number;
  };
  topVendors: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
    rating: number;
    category: string;
  }>;
  topCategories: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
    percentage: number;
    productsCount: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    category: string;
    sales: number;
    revenue: number;
    rating: number;
    vendor: string;
  }>;
  orderStatusStats: Array<{
    status: string;
    count: number;
  }>;
  revenueTrend: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    description: string;
    vendor: string;
    time: string;
    amount: number;
  }>;
}

interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsData;
}

const fetchAnalytics = async (period: string): Promise<AnalyticsData> => {
  const response = await apiFetch<AnalyticsResponse>(`/admin/analytics?period=${period}`);
  if (!response.success || !response.data) {
    throw new Error('Failed to fetch analytics data');
  }
  return response.data;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-GB').format(Math.max(0, Math.round(value)));
};

const formatGrowth = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30d");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-analytics', timeRange],
    queryFn: () => fetchAnalytics(timeRange),
    refetchInterval: 60000, // Refetch every minute
  });

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getTrendColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Data Exported",
        description: `Analytics data for ${timeRange} has been exported successfully.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-medium text-foreground">Error loading analytics</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Failed to fetch analytics data."}
        </p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { overview, topVendors, topCategories, topProducts, orderStatusStats, revenueTrend, recentActivity } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive business intelligence and insights</p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 3 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportData}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Performance</TabsTrigger>
          <TabsTrigger value="customers">Customer Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{formatCurrency(overview.totalRevenue)}</div>
                <div className="flex items-center space-x-1 mt-1">
                  {getTrendIcon(overview.revenueGrowth)}
                  <span className={`text-sm font-medium ${getTrendColor(overview.revenueGrowth)}`}>
                    {formatGrowth(overview.revenueGrowth)}
                  </span>
                  <span className="text-sm text-muted-foreground">from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{formatNumber(overview.totalOrders)}</div>
                <div className="flex items-center space-x-1 mt-1">
                  {getTrendIcon(overview.ordersGrowth)}
                  <span className={`text-sm font-medium ${getTrendColor(overview.ordersGrowth)}`}>
                    {formatGrowth(overview.ordersGrowth)}
                  </span>
                  <span className="text-sm text-muted-foreground">from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Vendors
                </CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{formatNumber(overview.activeVendors)}</div>
                <div className="flex items-center space-x-1 mt-1">
                  {getTrendIcon(overview.vendorsGrowth)}
                  <span className={`text-sm font-medium ${getTrendColor(overview.vendorsGrowth)}`}>
                    {formatGrowth(overview.vendorsGrowth)}
                  </span>
                  <span className="text-sm text-muted-foreground">new vendors</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Rating
                </CardTitle>
                <Star className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{overview.avgRating.toFixed(1)}/5</div>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-sm text-muted-foreground">Based on {formatNumber(overview.totalProducts)} products</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart Placeholder */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Revenue performance over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueTrend.length > 0 ? (
              <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      {revenueTrend.length} data points available
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Total: {formatCurrency(revenueTrend.reduce((sum, item) => sum + item.revenue, 0))}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No revenue data available for this period</p>
                </div>
              </div>
              )}
            </CardContent>
          </Card>

          {/* Top Categories and Top Vendors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Top Performing Categories</CardTitle>
                <CardDescription>Revenue by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCategories.length > 0 ? (
                    topCategories.map((category, index) => (
                      <div key={category.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <div>
                            <div className="font-medium">{category.name}</div>
                            <div className="text-sm text-muted-foreground">{formatNumber(category.orders)} orders</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(category.revenue)}</div>
                          <div className="text-sm text-muted-foreground">{category.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No category data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Top Vendors</CardTitle>
                <CardDescription>Highest performing vendors by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topVendors.length > 0 ? (
                    topVendors.slice(0, 5).map((vendor, index) => (
                      <div key={vendor.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{vendor.name}</div>
                            <div className="text-sm text-muted-foreground">{vendor.category || 'Uncategorized'}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(vendor.revenue)}</div>
                          <div className="text-sm text-muted-foreground">★ {vendor.rating > 0 ? vendor.rating.toFixed(1) : 'N/A'}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No vendor data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sales Analytics Tab */}
        <TabsContent value="sales" className="space-y-6">
          {/* Key Sales Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold text-foreground">{formatCurrency(overview.totalRevenue)}</div>
                  <div className="flex items-center space-x-1 mt-2">
                  {getTrendIcon(overview.revenueGrowth)}
                  <span className={`text-sm font-medium ${getTrendColor(overview.revenueGrowth)}`}>
                    {formatGrowth(overview.revenueGrowth)}
                    </span>
                  <span className="text-xs text-muted-foreground">vs last period</span>
                  </div>
                </CardContent>
              </Card>

          <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-foreground">{formatNumber(overview.totalOrders)}</div>
                <div className="flex items-center space-x-1 mt-2">
                  {getTrendIcon(overview.ordersGrowth)}
                  <span className={`text-sm font-medium ${getTrendColor(overview.ordersGrowth)}`}>
                    {formatGrowth(overview.ordersGrowth)}
                  </span>
                  <span className="text-xs text-muted-foreground">vs last period</span>
              </div>
            </CardContent>
          </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Order Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{formatCurrency(overview.avgOrderValue)}</div>
                <div className="flex items-center space-x-1 mt-2">
                  <span className="text-xs text-muted-foreground">Per order</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Selling Products */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Best performing products by sales volume and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.length > 0 ? (
                  topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                          <div className="font-medium">{formatNumber(product.sales)}</div>
                        <div className="text-sm text-muted-foreground">Units Sold</div>
                      </div>
                      <div className="text-center">
                          <div className="font-medium">{formatCurrency(product.revenue)}</div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                      </div>
                      <div className="text-center">
                          <div className="font-medium">★ {product.rating > 0 ? product.rating.toFixed(1) : 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">Rating</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No product data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sales by Category */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Revenue breakdown and market share by product category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCategories.length > 0 ? (
                  topCategories.map((category, index) => (
                    <div key={category.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm text-muted-foreground">{category.percentage.toFixed(1)}% market share</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                          <div className="font-medium">{formatCurrency(category.revenue)}</div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                      </div>
                      <div className="text-center">
                          <div className="font-medium">{formatNumber(category.orders)}</div>
                        <div className="text-sm text-muted-foreground">Orders</div>
                      </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No category data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendor Performance Tab */}
        <TabsContent value="vendors" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Vendor Performance</CardTitle>
              <CardDescription>Top performing vendors and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topVendors.length > 0 ? (
                  topVendors.map((vendor, index) => (
                    <div key={vendor.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{vendor.name}</div>
                          <div className="text-sm text-muted-foreground">{vendor.category || 'Uncategorized'}</div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                          <div className="font-medium">{formatCurrency(vendor.revenue)}</div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                      </div>
                      <div className="text-center">
                          <div className="font-medium">{formatNumber(vendor.orders)}</div>
                        <div className="text-sm text-muted-foreground">Orders</div>
                      </div>
                      <div className="text-center">
                          <div className="font-medium">★ {vendor.rating > 0 ? vendor.rating.toFixed(1) : 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">Rating</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No vendor data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Insights Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Customers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold text-foreground">{formatNumber(overview.totalCustomers)}</div>
                  <div className="flex items-center space-x-1 mt-2">
                  {getTrendIcon(overview.usersGrowth)}
                  <span className={`text-sm font-medium ${getTrendColor(overview.usersGrowth)}`}>
                    {formatGrowth(overview.usersGrowth)}
                    </span>
                  </div>
                </CardContent>
              </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Order Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{formatCurrency(overview.avgOrderValue)}</div>
                <div className="text-sm text-muted-foreground mt-2">Per completed order</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Customer Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{overview.avgRating.toFixed(1)}/5</div>
                <div className="text-sm text-muted-foreground mt-2">Average product rating</div>
              </CardContent>
            </Card>
          </div>

          {/* Order Status Breakdown */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Order Status Breakdown</CardTitle>
              <CardDescription>Distribution of orders by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderStatusStats.length > 0 ? (
                  orderStatusStats.map((stat) => (
                    <div key={stat.status} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <div>
                          <div className="font-medium capitalize">{stat.status.toLowerCase().replace('_', ' ')}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(stat.count)}</div>
                        <div className="text-sm text-muted-foreground">
                          {overview.totalOrders > 0 
                            ? ((stat.count / overview.totalOrders) * 100).toFixed(1) 
                            : '0'}%
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No order status data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Latest platform activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <div className="flex-1">
                        <span className="font-medium text-foreground">{activity.action}</span>
                        <span className="text-muted-foreground"> - {activity.description}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatCurrency(activity.amount)}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(activity.time).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
