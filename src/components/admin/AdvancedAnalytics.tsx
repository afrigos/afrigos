import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Star,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for analytics
const analyticsData = {
  overview: {
    totalRevenue: 124750,
    totalOrders: 3456,
    activeVendors: 1247,
    totalProducts: 8923,
    avgOrderValue: 36.08,
    conversionRate: 3.2,
    customerSatisfaction: 4.6,
    growthRate: 12.5
  },
  revenueData: {
    daily: [
      { date: "2024-01-01", revenue: 2840, orders: 78 },
      { date: "2024-01-02", revenue: 3120, orders: 85 },
      { date: "2024-01-03", revenue: 2980, orders: 82 },
      { date: "2024-01-04", revenue: 3450, orders: 94 },
      { date: "2024-01-05", revenue: 3780, orders: 103 },
      { date: "2024-01-06", revenue: 4120, orders: 112 },
      { date: "2024-01-07", revenue: 3950, orders: 108 }
    ],
    monthly: [
      { month: "Jan", revenue: 89000, orders: 2450 },
      { month: "Feb", revenue: 92000, orders: 2580 },
      { month: "Mar", revenue: 98000, orders: 2720 },
      { month: "Apr", revenue: 105000, orders: 2890 },
      { month: "May", revenue: 112000, orders: 3080 },
      { month: "Jun", revenue: 118000, orders: 3250 }
    ]
  },
  topCategories: [
    { name: "Food & Beverages", revenue: 45600, percentage: 36.5, growth: 8.2 },
    { name: "Fashion & Clothing", revenue: 32400, percentage: 26.0, growth: 12.4 },
    { name: "Beauty & Personal Care", revenue: 18900, percentage: 15.1, growth: 15.7 },
    { name: "Health & Wellness", revenue: 15600, percentage: 12.5, growth: 22.1 },
    { name: "Home & Garden", revenue: 12250, percentage: 9.8, growth: 5.3 }
  ],
  topVendors: [
    { name: "Mama Asha's Kitchen", revenue: 12450, orders: 342, rating: 4.8, growth: 15.2 },
    { name: "Adunni Beauty", revenue: 11890, orders: 298, rating: 4.9, growth: 12.8 },
    { name: "Kente Collections", revenue: 9870, orders: 156, rating: 4.7, growth: 8.5 },
    { name: "Afro Herbs Ltd", revenue: 8760, orders: 234, rating: 4.6, growth: 18.3 },
    { name: "Spice Masters", revenue: 7650, orders: 189, rating: 4.5, growth: 6.7 }
  ],
  customerDemographics: {
    ageGroups: [
      { age: "18-24", percentage: 15, revenue: 18700 },
      { age: "25-34", percentage: 35, revenue: 43600 },
      { age: "35-44", percentage: 28, revenue: 34900 },
      { age: "45-54", percentage: 15, revenue: 18700 },
      { age: "55+", percentage: 7, revenue: 8850 }
    ],
    locations: [
      { location: "London", percentage: 45, revenue: 56100 },
      { location: "Manchester", percentage: 18, revenue: 22450 },
      { location: "Birmingham", percentage: 12, revenue: 14970 },
      { location: "Liverpool", percentage: 8, revenue: 9980 },
      { location: "Other", percentage: 17, revenue: 21250 }
    ]
  },
  realTimeMetrics: {
    activeUsers: 1247,
    currentOrders: 23,
    pendingApprovals: 34,
    systemAlerts: 2
  }
};

export function AdvancedAnalytics() {
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
      <ArrowUpRight className="h-4 w-4 text-success" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-destructive" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Advanced Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
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
          <Button 
            size="sm"
            onClick={() => handleExportReport('Analytics')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{analyticsData.realTimeMetrics.activeUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Orders</p>
                <p className="text-2xl font-bold">{analyticsData.realTimeMetrics.currentOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold">{analyticsData.realTimeMetrics.pendingApprovals}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Alerts</p>
                <p className="text-2xl font-bold">{analyticsData.realTimeMetrics.systemAlerts}</p>
              </div>
              <Activity className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analyticsData.overview.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-success" />
                  +{analyticsData.overview.growthRate}% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.totalOrders.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-success" />
                  +8.2% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analyticsData.overview.avgOrderValue)}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-success" />
                  +3.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.overview.customerSatisfaction}/5.0</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-success" />
                  +0.2 from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Revenue performance over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Interactive Revenue Chart</p>
                  <p className="text-sm text-muted-foreground">Chart.js or Recharts integration would go here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue</CardTitle>
                <CardDescription>Revenue breakdown by day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.revenueData.daily.map((day, index) => (
                    <div key={day.date} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">{new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        <p className="text-sm text-muted-foreground">{day.orders} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(day.revenue)}</p>
                        <p className="text-sm text-muted-foreground">
                          {index > 0 ? (
                            <span className={day.revenue > analyticsData.revenueData.daily[index - 1].revenue ? 'text-success' : 'text-destructive'}>
                              {day.revenue > analyticsData.revenueData.daily[index - 1].revenue ? '+' : ''}
                              {((day.revenue - analyticsData.revenueData.daily[index - 1].revenue) / analyticsData.revenueData.daily[index - 1].revenue * 100).toFixed(1)}%
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
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue trends by month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.revenueData.monthly.map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">{month.month}</p>
                        <p className="text-sm text-muted-foreground">{month.orders.toLocaleString()} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(month.revenue)}</p>
                        <p className="text-sm text-muted-foreground">
                          {index > 0 ? (
                            <span className={month.revenue > analyticsData.revenueData.monthly[index - 1].revenue ? 'text-success' : 'text-destructive'}>
                              {month.revenue > analyticsData.revenueData.monthly[index - 1].revenue ? '+' : ''}
                              {((month.revenue - analyticsData.revenueData.monthly[index - 1].revenue) / analyticsData.revenueData.monthly[index - 1].revenue * 100).toFixed(1)}%
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Categories by Revenue</CardTitle>
              <CardDescription>Performance breakdown by product category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topCategories.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">{category.percentage}% of total revenue</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(category.revenue)}</p>
                      <p className="text-sm text-success flex items-center">
                        {getGrowthIcon(category.growth)}
                        +{category.growth}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Vendors</CardTitle>
              <CardDescription>Vendor performance metrics and rankings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topVendors.map((vendor, index) => (
                  <div key={vendor.name} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{vendor.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{vendor.orders} orders</span>
                          <span className="flex items-center">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            {vendor.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(vendor.revenue)}</p>
                      <p className="text-sm text-success flex items-center">
                        {getGrowthIcon(vendor.growth)}
                        +{vendor.growth}%
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
                <CardTitle>Customer Demographics - Age</CardTitle>
                <CardDescription>Revenue distribution by age group</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.customerDemographics.ageGroups.map((age) => (
                    <div key={age.age} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">{age.age}</p>
                        <p className="text-sm text-muted-foreground">{age.percentage}% of customers</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(age.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Customer Demographics - Location</CardTitle>
                <CardDescription>Revenue distribution by location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.customerDemographics.locations.map((location) => (
                    <div key={location.location} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">{location.location}</p>
                        <p className="text-sm text-muted-foreground">{location.percentage}% of customers</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(location.revenue)}</p>
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

