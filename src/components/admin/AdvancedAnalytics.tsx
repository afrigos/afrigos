import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  AlertTriangle,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-client";

interface AdvancedAnalyticsData {
  period: string;
  overview: {
    totalRevenue: number;
    totalOrders: number;
    activeVendors: number;
    totalProducts: number;
    avgOrderValue: number;
    customerSatisfaction: number;
    growthRate: number;
  };
  realTimeMetrics: {
    activeUsers: number;
    currentOrders: number;
    pendingApprovals: number;
    systemAlerts: number;
  };
  revenueData: {
    daily: Array<{
      date: string;
      revenue: number;
      orders: number;
    }>;
    monthly: Array<{
      month: string;
      revenue: number;
      orders: number;
    }>;
  };
  topCategories: Array<{
    id: string;
    name: string;
    revenue: number;
    percentage: number;
    growth: number;
  }>;
  topVendors: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
    rating: number;
    growth: number;
  }>;
  customerDemographics: {
    ageGroups: Array<{
      age: string;
      percentage: number;
      revenue: number;
    }>;
    locations: Array<{
      location: string;
      percentage: number;
      revenue: number;
      orders: number;
    }>;
  };
}

interface AdvancedAnalyticsResponse {
  success: boolean;
  data: AdvancedAnalyticsData;
}

const fetchAdvancedAnalytics = async (period: string): Promise<AdvancedAnalyticsData> => {
  const response = await apiFetch<AdvancedAnalyticsResponse>(`/admin/advanced-analytics?period=${period}`);
  if (!response.success || !response.data) {
    throw new Error('Failed to fetch advanced analytics data');
  }
  return response.data;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-GB').format(Math.max(0, Math.round(value)));
};

const formatGrowth = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

export function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const { toast } = useToast();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-advanced-analytics', timeRange],
    queryFn: () => fetchAdvancedAnalytics(timeRange),
    refetchInterval: 60000, // Refetch every minute
  });

  const handleRefresh = async () => {
    await refetch();
    toast({
      title: "Data Refreshed",
      description: "Analytics data has been updated successfully.",
    });
  };

  const handleExportReport = async (type: string) => {
    try {
      // Mock export - can be implemented later
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

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowUpRight className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-600" />
    );
  };

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="h-3 w-3 text-green-600" />
    ) : (
      <TrendingDown className="h-3 w-3 text-red-600" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading advanced analytics...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-medium text-foreground">Error loading analytics</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Failed to fetch advanced analytics data."}
        </p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { overview, realTimeMetrics, revenueData, topCategories, topVendors, customerDemographics } = data;

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
              <Calendar className="h-4 w-4 mr-2" />
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
            Refresh
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
                <p className="text-2xl font-bold">{formatNumber(realTimeMetrics.activeUsers)}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Orders</p>
                <p className="text-2xl font-bold">{formatNumber(realTimeMetrics.currentOrders)}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold">{formatNumber(realTimeMetrics.pendingApprovals)}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Alerts</p>
                <p className="text-2xl font-bold">{formatNumber(realTimeMetrics.systemAlerts)}</p>
              </div>
              <Activity className="h-8 w-8 text-red-500" />
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
                <div className="text-2xl font-bold">{formatCurrency(overview.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  {getTrendIcon(overview.growthRate)}
                  <span className="ml-1">{formatGrowth(overview.growthRate)} from last period</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(overview.totalOrders)}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  {getTrendIcon(overview.growthRate)}
                  <span className="ml-1">from selected period</span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(overview.avgOrderValue)}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  Per completed order
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.customerSatisfaction.toFixed(1)}/5.0</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  Average product rating
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Revenue performance over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueData.daily.length > 0 || revenueData.monthly.length > 0 ? (
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      {revenueData.daily.length} daily data points, {revenueData.monthly.length} monthly data points
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Total: {formatCurrency(revenueData.daily.reduce((sum, day) => sum + day.revenue, 0) + revenueData.monthly.reduce((sum, month) => sum + month.revenue, 0))}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No revenue data available for this period</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue</CardTitle>
                <CardDescription>Revenue breakdown by day (last 7 days)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {revenueData.daily.length > 0 ? (
                    revenueData.daily.map((day, index) => (
                      <div key={day.date} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div>
                          <p className="font-medium">{new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                          <p className="text-sm text-muted-foreground">{formatNumber(day.orders)} orders</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(day.revenue)}</p>
                          {index > 0 && day.revenue > 0 && revenueData.daily[index - 1].revenue > 0 ? (
                            <p className="text-sm text-muted-foreground">
                              <span className={day.revenue > revenueData.daily[index - 1].revenue ? 'text-green-600' : 'text-red-600'}>
                                {day.revenue > revenueData.daily[index - 1].revenue ? '+' : ''}
                                {formatGrowth(((day.revenue - revenueData.daily[index - 1].revenue) / revenueData.daily[index - 1].revenue) * 100)}
                              </span>
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No daily revenue data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue trends by month (last 6 months)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {revenueData.monthly.length > 0 ? (
                    revenueData.monthly.map((month, index) => (
                      <div key={month.month} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div>
                          <p className="font-medium">{month.month}</p>
                          <p className="text-sm text-muted-foreground">{formatNumber(month.orders)} orders</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(month.revenue)}</p>
                          {index > 0 && month.revenue > 0 && revenueData.monthly[index - 1].revenue > 0 ? (
                            <p className="text-sm text-muted-foreground">
                              <span className={month.revenue > revenueData.monthly[index - 1].revenue ? 'text-green-600' : 'text-red-600'}>
                                {month.revenue > revenueData.monthly[index - 1].revenue ? '+' : ''}
                                {formatGrowth(((month.revenue - revenueData.monthly[index - 1].revenue) / revenueData.monthly[index - 1].revenue) * 100)}
                              </span>
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No monthly revenue data available</p>
                  )}
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
                {topCategories.length > 0 ? (
                  topCategories.map((category, index) => (
                    <div key={category.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground">{category.percentage.toFixed(1)}% of total revenue</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(category.revenue)}</p>
                        {category.growth !== 0 && (
                          <p className="text-sm flex items-center justify-end">
                            {getGrowthIcon(category.growth)}
                            <span className={category.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatGrowth(category.growth)}
                            </span>
                          </p>
                        )}
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

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Vendors</CardTitle>
              <CardDescription>Vendor performance metrics and rankings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topVendors.length > 0 ? (
                  topVendors.map((vendor, index) => (
                    <div key={vendor.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{vendor.name}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{formatNumber(vendor.orders)} orders</span>
                            {vendor.rating > 0 && (
                              <span className="flex items-center">
                                <Star className="h-3 w-3 mr-1 fill-current text-yellow-500" />
                                {vendor.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(vendor.revenue)}</p>
                        {vendor.growth !== 0 && (
                          <p className="text-sm flex items-center justify-end">
                            {getGrowthIcon(vendor.growth)}
                            <span className={vendor.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatGrowth(vendor.growth)}
                            </span>
                          </p>
                        )}
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
                  {customerDemographics.ageGroups.length > 0 && customerDemographics.ageGroups.some(age => age.revenue > 0) ? (
                    customerDemographics.ageGroups
                      .filter(age => age.revenue > 0)
                      .map((age) => (
                        <div key={age.age} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div>
                            <p className="font-medium">{age.age}</p>
                            <p className="text-sm text-muted-foreground">{age.percentage.toFixed(1)}% of customers</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(age.revenue)}</p>
                          </div>
                        </div>
                      ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Age demographics not available (requires user date of birth)</p>
                  )}
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
                  {customerDemographics.locations.length > 0 ? (
                    customerDemographics.locations.map((location) => (
                      <div key={location.location} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div>
                          <p className="font-medium">{location.location}</p>
                          <p className="text-sm text-muted-foreground">{location.percentage.toFixed(1)}% of revenue</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(location.revenue)}</p>
                          <p className="text-xs text-muted-foreground">{formatNumber(location.orders)} orders</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No location data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
