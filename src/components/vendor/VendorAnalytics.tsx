import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Package,
  Star,
  Users,
  Eye,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  LineChart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock analytics data for vendor
const vendorAnalyticsData = {
  overview: {
    totalRevenue: 12450,
    totalOrders: 156,
    totalProducts: 24,
    avgRating: 4.8,
    growthRate: 12.5,
    orderGrowth: 8.2,
    productGrowth: 15.3,
    ratingGrowth: 0.2,
    commissionEarned: 1867.50,
    netRevenue: 10582.50
  },
  salesData: {
    daily: [
      { date: "2024-01-15", revenue: 284, orders: 8 },
      { date: "2024-01-16", revenue: 312, orders: 9 },
      { date: "2024-01-17", revenue: 298, orders: 7 },
      { date: "2024-01-18", revenue: 345, orders: 10 },
      { date: "2024-01-19", revenue: 378, orders: 11 },
      { date: "2024-01-20", revenue: 412, orders: 12 },
      { date: "2024-01-21", revenue: 395, orders: 11 }
    ],
    monthly: [
      { month: "Jan", revenue: 8900, orders: 245 },
      { month: "Feb", revenue: 9200, orders: 258 },
      { month: "Mar", revenue: 9800, orders: 272 },
      { month: "Apr", revenue: 10500, orders: 289 },
      { month: "May", revenue: 11200, orders: 308 },
      { month: "Jun", revenue: 11800, orders: 325 }
    ]
  },
  topProducts: [
    { name: "Jollof Rice Spice Mix", revenue: 3036.66, sales: 234, rating: 4.8, growth: 15.2 },
    { name: "Shea Butter Hair Care Set", revenue: 3898.44, sales: 156, rating: 4.9, growth: 22.1 },
    { name: "Traditional Kente Cloth Scarf", revenue: 4049.55, sales: 45, rating: 4.7, growth: 8.5 },
    { name: "Plantain Chips", revenue: 1606.50, sales: 189, rating: 4.6, growth: 12.4 },
    { name: "Moringa Leaf Powder", revenue: 1665.00, sales: 90, rating: 4.5, growth: 18.3 }
  ],
  categoryPerformance: [
    { name: "Food & Beverages", revenue: 5308.16, percentage: 42.6, growth: 12.4 },
    { name: "Beauty & Personal Care", revenue: 3898.44, percentage: 31.3, growth: 18.7 },
    { name: "Fashion & Clothing", revenue: 4049.55, percentage: 32.5, growth: 8.2 },
    { name: "Health & Wellness", revenue: 1665.00, percentage: 13.4, growth: 22.1 }
  ],
  customerInsights: {
    repeatCustomers: 67,
    newCustomers: 89,
    avgOrderValue: 79.81,
    customerSatisfaction: 4.8,
    topCustomerSegments: [
      { segment: "Food Enthusiasts", percentage: 35, revenue: 4357.50 },
      { segment: "Beauty & Wellness", percentage: 28, revenue: 3486.00 },
      { segment: "Fashion Conscious", percentage: 22, revenue: 2739.00 },
      { segment: "Health Conscious", percentage: 15, revenue: 1867.50 }
    ]
  },
  commissionBreakdown: {
    totalCommission: 1867.50,
    commissionRate: 15,
    breakdown: [
      { category: "Food & Beverages", commission: 796.22, percentage: 42.6 },
      { category: "Beauty & Personal Care", commission: 584.77, percentage: 31.3 },
      { category: "Fashion & Clothing", commission: 607.43, percentage: 32.5 },
      { category: "Health & Wellness", commission: 249.75, percentage: 13.4 }
    ]
  }
};

export function VendorAnalytics() {
  const [timeRange, setTimeRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setRefreshKey(prev => prev + 1);
      toast({
        title: "Data Refreshed",
        description: "Analytics data has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async (type: string) => {
    try {
      // Mock export
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Export Successful",
        description: `${type} report has been exported successfully.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground">Comprehensive insights into your store performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
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
            <div className="text-2xl font-bold">{formatCurrency(vendorAnalyticsData.overview.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {getGrowthIcon(vendorAnalyticsData.overview.growthRate)}
              +{vendorAnalyticsData.overview.growthRate}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(vendorAnalyticsData.overview.netRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              After {vendorAnalyticsData.overview.commissionEarned} commission
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorAnalyticsData.overview.totalOrders}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {getGrowthIcon(vendorAnalyticsData.overview.orderGrowth)}
              +{vendorAnalyticsData.overview.orderGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorAnalyticsData.overview.avgRating}/5.0</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {getGrowthIcon(vendorAnalyticsData.overview.ratingGrowth)}
              +{vendorAnalyticsData.overview.ratingGrowth} from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vendorAnalyticsData.salesData.daily.map((day, index) => (
                    <div key={day.date} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">{new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        <p className="text-sm text-muted-foreground">{day.orders} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(day.revenue)}</p>
                        <p className="text-sm text-muted-foreground">
                          {index > 0 ? (
                            <span className={day.revenue > vendorAnalyticsData.salesData.daily[index - 1].revenue ? 'text-green-600' : 'text-red-600'}>
                              {day.revenue > vendorAnalyticsData.salesData.daily[index - 1].revenue ? '+' : ''}
                              {((day.revenue - vendorAnalyticsData.salesData.daily[index - 1].revenue) / vendorAnalyticsData.salesData.daily[index - 1].revenue * 100).toFixed(1)}%
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Revenue by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendorAnalyticsData.categoryPerformance.map((category) => (
                    <div key={category.name} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">{category.percentage}% of total revenue</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(category.revenue)}</p>
                        <p className="text-sm text-green-600 flex items-center">
                          {getGrowthIcon(category.growth)}
                          +{category.growth}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Sales</CardTitle>
                <CardDescription>Revenue trends by month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vendorAnalyticsData.salesData.monthly.map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">{month.month}</p>
                        <p className="text-sm text-muted-foreground">{month.orders.toLocaleString()} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(month.revenue)}</p>
                        <p className="text-sm text-muted-foreground">
                          {index > 0 ? (
                            <span className={month.revenue > vendorAnalyticsData.salesData.monthly[index - 1].revenue ? 'text-green-600' : 'text-red-600'}>
                              {month.revenue > vendorAnalyticsData.salesData.monthly[index - 1].revenue ? '+' : ''}
                              {((month.revenue - vendorAnalyticsData.salesData.monthly[index - 1].revenue) / vendorAnalyticsData.salesData.monthly[index - 1].revenue * 100).toFixed(1)}%
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Insights</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Average Order Value</p>
                      <p className="text-sm text-muted-foreground">Per customer order</p>
                    </div>
                    <p className="font-bold">{formatCurrency(vendorAnalyticsData.customerInsights.avgOrderValue)}</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Repeat Customers</p>
                      <p className="text-sm text-muted-foreground">Loyal customer base</p>
                    </div>
                    <p className="font-bold">{vendorAnalyticsData.customerInsights.repeatCustomers}</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">New Customers</p>
                      <p className="text-sm text-muted-foreground">This period</p>
                    </div>
                    <p className="font-bold">{vendorAnalyticsData.customerInsights.newCustomers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Your best-selling products this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendorAnalyticsData.topProducts.map((product, index) => (
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

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>Revenue by customer type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendorAnalyticsData.customerInsights.topCustomerSegments.map((segment) => (
                    <div key={segment.segment} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">{segment.segment}</p>
                        <p className="text-sm text-muted-foreground">{segment.percentage}% of customers</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(segment.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Satisfaction</CardTitle>
                <CardDescription>Overall customer experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Overall Rating</p>
                      <p className="text-sm text-muted-foreground">Average customer rating</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{vendorAnalyticsData.customerInsights.customerSatisfaction}/5.0</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Repeat Purchase Rate</p>
                      <p className="text-sm text-muted-foreground">Customer loyalty</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{Math.round((vendorAnalyticsData.customerInsights.repeatCustomers / (vendorAnalyticsData.customerInsights.repeatCustomers + vendorAnalyticsData.customerInsights.newCustomers)) * 100)}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Commission Tab */}
        <TabsContent value="commission" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Commission Overview</CardTitle>
                <CardDescription>Platform commission breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Total Commission</p>
                      <p className="text-sm text-muted-foreground">Platform fees</p>
                    </div>
                    <p className="font-bold text-red-600">{formatCurrency(vendorAnalyticsData.commissionBreakdown.totalCommission)}</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Commission Rate</p>
                      <p className="text-sm text-muted-foreground">Platform percentage</p>
                    </div>
                    <p className="font-bold">{vendorAnalyticsData.commissionBreakdown.commissionRate}%</p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Net Revenue</p>
                      <p className="text-sm text-muted-foreground">After commission</p>
                    </div>
                    <p className="font-bold text-green-600">{formatCurrency(vendorAnalyticsData.overview.netRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commission by Category</CardTitle>
                <CardDescription>Commission breakdown by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendorAnalyticsData.commissionBreakdown.breakdown.map((item) => (
                    <div key={item.category} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">{item.category}</p>
                        <p className="text-sm text-muted-foreground">{item.percentage}% of commission</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{formatCurrency(item.commission)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

