import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Package, 
  DollarSign, 
  Eye,
  Download,
  Calendar,
  Filter
} from "lucide-react";

const analyticsData = {
  overview: {
    totalRevenue: { value: "£284,590", change: "+12.5%", trend: "up" },
    totalOrders: { value: "8,942", change: "+8.3%", trend: "up" },
    activeVendors: { value: "1,247", change: "+15.2%", trend: "up" },
    avgOrderValue: { value: "£31.84", change: "-2.1%", trend: "down" },
  },
  topVendors: [
    { name: "Mama Asha's Kitchen", revenue: "£45,230", orders: 892, growth: "+23%" },
    { name: "Adunni Beauty", revenue: "£38,950", orders: 756, growth: "+18%" },
    { name: "Kente Collections", revenue: "£32,180", orders: 634, growth: "+15%" },
    { name: "Afro Herbs Ltd", revenue: "£28,740", orders: 598, growth: "+12%" },
  ],
  topCategories: [
    { name: "Food & Beverages", revenue: "£98,450", percentage: "34.6%" },
    { name: "Beauty & Personal Care", revenue: "£87,230", percentage: "30.7%" },
    { name: "Clothing & Accessories", revenue: "£56,180", percentage: "19.7%" },
    { name: "Herbal Products", revenue: "£42,730", percentage: "15.0%" },
  ],
  recentActivity: [
    { action: "New vendor registration", vendor: "Lagos Delights", time: "2 hours ago" },
    { action: "Product approval", vendor: "Ankara Styles", time: "4 hours ago" },
    { action: "Large order placed", vendor: "Mama Asha's Kitchen", time: "6 hours ago" },
    { action: "Vendor document updated", vendor: "Afro Herbs Ltd", time: "8 hours ago" },
  ]
};

export function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive marketplace insights and metrics</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analyticsData.overview.totalRevenue.value}</div>
            <div className="flex items-center space-x-1 mt-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-sm text-success font-medium">{analyticsData.overview.totalRevenue.change}</span>
              <span className="text-sm text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analyticsData.overview.totalOrders.value}</div>
            <div className="flex items-center space-x-1 mt-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-sm text-success font-medium">{analyticsData.overview.totalOrders.change}</span>
              <span className="text-sm text-muted-foreground">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Vendors</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analyticsData.overview.activeVendors.value}</div>
            <div className="flex items-center space-x-1 mt-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span className="text-sm text-success font-medium">{analyticsData.overview.activeVendors.change}</span>
              <span className="text-sm text-muted-foreground">growth rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analyticsData.overview.avgOrderValue.value}</div>
            <div className="flex items-center space-x-1 mt-1">
              <TrendingDown className="h-3 w-3 text-destructive" />
              <span className="text-sm text-destructive font-medium">{analyticsData.overview.avgOrderValue.change}</span>
              <span className="text-sm text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vendors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-card">
          <TabsTrigger value="vendors">Top Vendors</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="vendors" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Top Performing Vendors</span>
              </CardTitle>
              <CardDescription>Revenue leaders this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topVendors.map((vendor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-dashboard-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{vendor.name}</h4>
                        <p className="text-sm text-muted-foreground">{vendor.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-lg font-bold text-foreground">{vendor.revenue}</div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3 text-success" />
                        <span className="text-sm text-success">{vendor.growth}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-primary" />
                <span>Category Performance</span>
              </CardTitle>
              <CardDescription>Revenue breakdown by product categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topCategories.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{category.name}</span>
                      <div className="text-right">
                        <span className="font-mono font-bold text-foreground">{category.revenue}</span>
                        <Badge variant="outline" className="ml-2">{category.percentage}</Badge>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-dashboard-accent rounded-full"
                        style={{ width: category.percentage }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>Sales by UK regions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-foreground">£98,450</div>
                  <div className="text-sm text-muted-foreground">London</div>
                  <Badge className="bg-success text-success-foreground">34.6%</Badge>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-foreground">£67,230</div>
                  <div className="text-sm text-muted-foreground">Manchester</div>
                  <Badge className="bg-primary text-primary-foreground">23.6%</Badge>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-foreground">£54,890</div>
                  <div className="text-sm text-muted-foreground">Birmingham</div>
                  <Badge className="bg-warning text-warning-foreground">19.3%</Badge>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-foreground">£64,020</div>
                  <div className="text-sm text-muted-foreground">Other Cities</div>
                  <Badge variant="outline">22.5%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-primary" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>Latest platform activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <div className="flex-1">
                      <span className="font-medium text-foreground">{activity.action}</span>
                      <span className="text-muted-foreground"> - {activity.vendor}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{activity.time}</span>
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