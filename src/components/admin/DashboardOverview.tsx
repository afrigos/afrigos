import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  ShoppingCart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const kpiCards = [
  {
    title: "Total Revenue",
    value: "£284,590",
    change: "+12.5%",
    trend: "up",
    description: "from last month",
    icon: DollarSign
  },
  {
    title: "Active Vendors",
    value: "1,247",
    change: "+8.2%",
    trend: "up", 
    description: "from last month",
    icon: Users
  },
  {
    title: "Products Listed",
    value: "12,847",
    change: "+15.3%",
    trend: "up",
    description: "from last month", 
    icon: Package
  },
  {
    title: "Customer Orders",
    value: "8,942",
    change: "+6.7%",
    trend: "up",
    description: "this month",
    icon: TrendingUp
  }
];

const recentVendors = [
  { name: "Mama Asha's Kitchen", type: "Food", status: "pending", location: "London", rating: 4.8 },
  { name: "Adunni Beauty", type: "Beauty", status: "approved", location: "Manchester", rating: 4.9 },
  { name: "Kente Collections", type: "Clothing", status: "pending", location: "Birmingham", rating: 4.6 },
  { name: "Afro Herbs Ltd", type: "Herbal", status: "review", location: "Leeds", rating: 4.7 },
];

const pendingTasks = [
  { task: "Review 12 new vendor applications", priority: "high", type: "vendor" },
  { task: "Approve 34 product listings", priority: "medium", type: "product" },
  { task: "Resolve 3 customer complaints", priority: "high", type: "support" },
  { task: "Security audit report review", priority: "medium", type: "security" },
];

export function DashboardOverview() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Report Exported",
        description: "Dashboard report has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate("/admin/analytics");
    } catch (error) {
      toast({
        title: "Navigation Failed",
        description: "Failed to navigate to analytics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "vendors":
        navigate("/admin/vendor-approval");
        break;
      case "products":
        navigate("/admin/product-approval");
        break;
      case "orders":
        navigate("/admin/orders");
        break;
      case "analytics":
        navigate("/admin/analytics");
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground">Monitor your AfriGos marketplace</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportReport}
            disabled={isExporting}
          >
            {isExporting ? "Exporting..." : "Export Report"}
          </Button>
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-primary to-dashboard-accent"
            onClick={handleViewAnalytics}
            disabled={isLoadingAnalytics}
          >
            {isLoadingAnalytics ? "Loading..." : "View Analytics"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-success font-medium">{kpi.change}</span>
                <span className="text-sm text-muted-foreground">{kpi.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Vendor Applications */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Recent Vendor Applications</span>
            </CardTitle>
            <CardDescription>Latest vendor registration requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVendors.map((vendor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{vendor.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{vendor.type}</span>
                      <span>•</span>
                      <span>{vendor.location}</span>
                      <span>•</span>
                      <span>★ {vendor.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={vendor.status === 'approved' ? 'default' : 'secondary'}
                      className={
                        vendor.status === 'approved' ? 'bg-success text-success-foreground' :
                        vendor.status === 'pending' ? 'bg-warning text-warning-foreground' :
                        'bg-muted text-muted-foreground'
                      }
                    >
                      {vendor.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Pending Tasks</span>
            </CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'high' ? 'bg-destructive' : 'bg-warning'
                    }`} />
                    <span className="text-sm font-medium text-foreground">{task.task}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {task.type}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2" 
              onClick={() => handleQuickAction("vendors")}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">Review Vendors</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2" 
              onClick={() => handleQuickAction("products")}
            >
              <Package className="h-6 w-6" />
              <span className="text-sm">Review Products</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2" 
              onClick={() => handleQuickAction("orders")}
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="text-sm">Manage Orders</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2" 
              onClick={() => handleQuickAction("analytics")}
            >
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}