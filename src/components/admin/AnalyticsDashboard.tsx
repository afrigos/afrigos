import { useState } from "react";
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
  PieChart,
  Activity
} from "lucide-react";

// Mock data for analytics
const revenueData = [
  { month: "Jan", revenue: 45000, orders: 1200, customers: 800 },
  { month: "Feb", revenue: 52000, orders: 1400, customers: 950 },
  { month: "Mar", revenue: 48000, orders: 1300, customers: 900 },
  { month: "Apr", revenue: 61000, orders: 1600, customers: 1100 },
  { month: "May", revenue: 55000, orders: 1500, customers: 1000 },
  { month: "Jun", revenue: 67000, orders: 1800, customers: 1200 }
];

// Enhanced sales analytics data
const salesMetrics = [
  { metric: "Total Revenue", value: "£328,000", change: "+12.5%", trend: "up", period: "vs last month" },
  { metric: "Total Orders", value: "8,880", change: "+8.2%", trend: "up", period: "vs last month" },
  { metric: "Average Order Value", value: "£36.95", change: "+6.7%", trend: "up", period: "vs last month" },
  { metric: "Conversion Rate", value: "3.2%", change: "+0.8%", trend: "up", period: "vs last month" },
  { metric: "Customer Lifetime Value", value: "£156.80", change: "+15.3%", trend: "up", period: "vs last month" },
  { metric: "Return Rate", value: "2.1%", change: "-0.3%", trend: "down", period: "vs last month" }
];

const salesTrends = [
  { period: "Today", revenue: "£2,450", orders: 67, customers: 45, growth: "+18.5%" },
  { period: "This Week", revenue: "£18,920", orders: 512, customers: 389, growth: "+12.3%" },
  { period: "This Month", revenue: "£67,450", orders: 1823, customers: 1245, growth: "+8.7%" },
  { period: "This Quarter", revenue: "£189,230", orders: 5120, customers: 3456, growth: "+15.2%" }
];

const topSellingProducts = [
  { name: "Jollof Rice Spice Mix", category: "Food", sales: 234, revenue: "£2,808", growth: "+25.3%" },
  { name: "Shea Butter Hair Care Set", category: "Beauty", sales: 189, revenue: "£4,722", growth: "+18.7%" },
  { name: "Kente Cloth Scarf", category: "Clothing", sales: 156, revenue: "£14,040", growth: "+32.1%" },
  { name: "Moringa Leaf Powder", category: "Herbal", sales: 145, revenue: "£2,682", growth: "+12.4%" },
  { name: "Nigerian Pepper Soup Mix", category: "Food", sales: 134, revenue: "£1,206", growth: "+8.9%" }
];

const salesByCategory = [
  { category: "Food & Beverages", revenue: "£98,450", orders: 2340, growth: "+18.5%", marketShare: "30.0%" },
  { category: "Clothing & Fashion", revenue: "£76,230", orders: 1890, growth: "+12.3%", marketShare: "23.2%" },
  { category: "Beauty & Personal Care", revenue: "£54,120", orders: 1456, growth: "+15.7%", marketShare: "16.5%" },
  { category: "Health & Wellness", revenue: "£42,890", orders: 1123, growth: "+8.9%", marketShare: "13.1%" },
  { category: "Home & Lifestyle", revenue: "£35,670", orders: 892, growth: "+6.4%", marketShare: "10.9%" },
  { category: "Electronics & Tech", revenue: "£20,640", orders: 456, growth: "+4.2%", marketShare: "6.3%" }
];

const salesChannels = [
  { channel: "Direct Website", revenue: "£189,450", orders: 5120, conversion: "4.2%", growth: "+15.3%" },
  { channel: "Mobile App", revenue: "£98,230", orders: 2340, conversion: "3.8%", growth: "+22.1%" },
  { channel: "Social Media", revenue: "£28,890", orders: 567, conversion: "2.1%", growth: "+8.7%" },
  { channel: "Email Marketing", revenue: "£11,430", orders: 234, conversion: "5.6%", growth: "+12.4%" }
];

const salesInsights = [
  { insight: "Peak sales time is 7-9 PM", impact: "High", trend: "Consistent" },
  { insight: "Food category drives 30% of revenue", impact: "High", trend: "Growing" },
  { insight: "Mobile app conversion rate improving", impact: "Medium", trend: "Positive" },
  { insight: "Customer retention rate at 68%", impact: "High", trend: "Stable" },
  { insight: "Average order value increasing", impact: "Medium", trend: "Growing" }
];

const topVendors = [
  { name: "Mama Asha's Kitchen", revenue: "£12,450", orders: 156, rating: 4.8, category: "Food" },
  { name: "Adunni Beauty", revenue: "£8,920", orders: 89, rating: 4.9, category: "Beauty" },
  { name: "Kente Collections", revenue: "£15,680", orders: 234, rating: 4.6, category: "Clothing" },
  { name: "Afro Herbs Ltd", revenue: "£6,340", orders: 67, rating: 4.7, category: "Herbal" },
  { name: "Nigerian Spices Co", revenue: "£9,120", orders: 123, rating: 4.5, category: "Food" }
];

const categoryPerformance = [
  { category: "Food", revenue: "£28,450", orders: 456, growth: "+15.2%" },
  { category: "Clothing", revenue: "£22,120", orders: 234, growth: "+8.7%" },
  { category: "Beauty", revenue: "£18,340", orders: 189, growth: "+12.3%" },
  { category: "Herbal", revenue: "£12,670", orders: 145, growth: "+6.8%" },
  { category: "Services", revenue: "£8,920", orders: 89, growth: "+4.2%" }
];

const customerInsights = [
  { metric: "Total Customers", value: "8,942", change: "+12.5%", trend: "up" },
  { metric: "New Customers", value: "1,234", change: "+8.2%", trend: "up" },
  { metric: "Repeat Customers", value: "3,456", change: "+15.3%", trend: "up" },
  { metric: "Average Order Value", value: "£45.67", change: "+6.7%", trend: "up" },
  { metric: "Customer Satisfaction", value: "4.7/5", change: "+2.1%", trend: "up" }
];

const geographicData = [
  { region: "London", orders: 2340, revenue: "£45,670", customers: 1890 },
  { region: "Manchester", orders: 1234, revenue: "£23,450", customers: 980 },
  { region: "Birmingham", orders: 890, revenue: "£16,780", customers: 720 },
  { region: "Leeds", orders: 567, revenue: "£10,230", customers: 450 },
  { region: "Liverpool", orders: 445, revenue: "£8,120", customers: 380 }
];

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("6months");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? <TrendingUp className="h-4 w-4 text-success" /> : <TrendingDown className="h-4 w-4 text-destructive" />;
  };

  const getTrendColor = (trend: string) => {
    return trend === "up" ? "text-success" : "text-destructive";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive business intelligence and insights</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
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
          <TabsTrigger value="geographic">Geographic Data</TabsTrigger>
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
                <div className="text-2xl font-bold text-foreground">£328,000</div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm text-success font-medium">+12.5%</span>
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
                <div className="text-2xl font-bold text-foreground">8,880</div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm text-success font-medium">+8.2%</span>
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
                <div className="text-2xl font-bold text-foreground">1,247</div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm text-success font-medium">+15.3%</span>
                  <span className="text-sm text-muted-foreground">from last period</span>
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
                <div className="text-2xl font-bold text-foreground">4.7/5</div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm text-success font-medium">+2.1%</span>
                  <span className="text-sm text-muted-foreground">from last period</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart Placeholder */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue performance over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Revenue chart visualization</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Top Performing Categories</CardTitle>
                <CardDescription>Revenue by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryPerformance.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <div>
                          <div className="font-medium">{category.category}</div>
                          <div className="text-sm text-muted-foreground">{category.orders} orders</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{category.revenue}</div>
                        <div className="text-sm text-success">{category.growth}</div>
                      </div>
                    </div>
                  ))}
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
                  {topVendors.slice(0, 5).map((vendor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{vendor.name}</div>
                          <div className="text-sm text-muted-foreground">{vendor.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{vendor.revenue}</div>
                        <div className="text-sm text-muted-foreground">★ {vendor.rating}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sales Analytics Tab */}
        <TabsContent value="sales" className="space-y-6">
          {/* Key Sales Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salesMetrics.map((metric, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.metric}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                  <div className="flex items-center space-x-1 mt-2">
                    {getTrendIcon(metric.trend)}
                    <span className={`text-sm font-medium ${getTrendColor(metric.trend)}`}>
                      {metric.change}
                    </span>
                    <span className="text-xs text-muted-foreground">{metric.period}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sales Trends by Period */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Sales Trends by Period</CardTitle>
              <CardDescription>Revenue and order performance across different time periods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {salesTrends.map((trend, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-2">{trend.period}</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Revenue:</span>
                        <span className="font-medium">{trend.revenue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Orders:</span>
                        <span className="font-medium">{trend.orders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Customers:</span>
                        <span className="font-medium">{trend.customers}</span>
                      </div>
                      <div className="flex items-center justify-center space-x-1 mt-2 pt-2 border-t">
                        <TrendingUp className="h-3 w-3 text-success" />
                        <span className="text-xs text-success font-medium">{trend.growth}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Selling Products */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Best performing products by sales volume and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSellingProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
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
                        <div className="font-medium">{product.sales}</div>
                        <div className="text-sm text-muted-foreground">Units Sold</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{product.revenue}</div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-success font-medium">{product.growth}</div>
                        <div className="text-xs text-muted-foreground">Growth</div>
                      </div>
                    </div>
                  </div>
                ))}
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
                {salesByCategory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{category.category}</div>
                        <div className="text-sm text-muted-foreground">{category.marketShare} market share</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="font-medium">{category.revenue}</div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{category.orders}</div>
                        <div className="text-sm text-muted-foreground">Orders</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-success font-medium">{category.growth}</div>
                        <div className="text-xs text-muted-foreground">Growth</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sales Channels Performance */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Sales Channels Performance</CardTitle>
              <CardDescription>Revenue and conversion rates by sales channel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesChannels.map((channel, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{channel.channel}</div>
                        <div className="text-sm text-muted-foreground">{channel.conversion} conversion rate</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="font-medium">{channel.revenue}</div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{channel.orders}</div>
                        <div className="text-sm text-muted-foreground">Orders</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-success font-medium">{channel.growth}</div>
                        <div className="text-xs text-muted-foreground">Growth</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sales Insights */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Sales Insights & Recommendations</CardTitle>
              <CardDescription>Key insights and actionable recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesInsights.map((insight, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        insight.impact === 'High' ? 'bg-success' : 
                        insight.impact === 'Medium' ? 'bg-warning' : 'bg-muted'
                      }`}></div>
                      <div>
                        <div className="font-medium">{insight.insight}</div>
                        <div className="text-sm text-muted-foreground">Impact: {insight.impact} | Trend: {insight.trend}</div>
                      </div>
                    </div>
                    <Badge variant={insight.trend === 'Growing' ? 'default' : 'secondary'}>
                      {insight.trend}
                    </Badge>
                  </div>
                ))}
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
                {topVendors.map((vendor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{vendor.name}</div>
                        <div className="text-sm text-muted-foreground">{vendor.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="font-medium">{vendor.revenue}</div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{vendor.orders}</div>
                        <div className="text-sm text-muted-foreground">Orders</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">★ {vendor.rating}</div>
                        <div className="text-sm text-muted-foreground">Rating</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Insights Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customerInsights.map((insight, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {insight.metric}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{insight.value}</div>
                  <div className="flex items-center space-x-1 mt-2">
                    {getTrendIcon(insight.trend)}
                    <span className={`text-sm font-medium ${getTrendColor(insight.trend)}`}>
                      {insight.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Geographic Data Tab */}
        <TabsContent value="geographic" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Geographic Performance</CardTitle>
              <CardDescription>Orders and revenue by region</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {geographicData.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">{region.region}</div>
                        <div className="text-sm text-muted-foreground">{region.customers} customers</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="font-medium">{region.orders}</div>
                        <div className="text-sm text-muted-foreground">Orders</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{region.revenue}</div>
                        <div className="text-sm text-muted-foreground">Revenue</div>
                      </div>
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
