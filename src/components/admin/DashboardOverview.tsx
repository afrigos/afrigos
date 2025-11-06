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
  ShoppingCart,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

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

// Fetch recent vendors
const fetchRecentVendors = async () => {
  const response = await apiFetch<{
    success: boolean;
    data: Array<{
      id: string;
      vendorProfileId?: string;
      name: string;
      email: string;
      businessType?: string;
      status: string;
      joinDate: string;
      isActive: boolean;
      isVerified: boolean;
    }>;
  }>('/admin/vendors');
  
  // Sort by joinDate (most recent first) and take top 4
  return response.data
    .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
    .slice(0, 4);
};

// Fetch pending tasks counts
const fetchPendingTasks = async () => {
  const [vendorsResponse, productsResponse] = await Promise.all([
    apiFetch<{ success: boolean; data: Array<{ isActive: boolean }> }>('/admin/vendors'),
    apiFetch<{ success: boolean; data: Array<{ status: string }> }>('/admin/products?status=PENDING')
  ]);

  const pendingVendors = vendorsResponse.data.filter(v => !v.isActive).length;
  const pendingProducts = productsResponse.data.length;

  const tasks = [];
  
  if (pendingVendors > 0) {
    tasks.push({
      task: `Review ${pendingVendors} new vendor application${pendingVendors > 1 ? 's' : ''}`,
      priority: 'high' as const,
      type: 'vendor' as const,
      count: pendingVendors,
      action: '/admin/vendor-approval'
    });
  }

  if (pendingProducts > 0) {
    tasks.push({
      task: `Approve ${pendingProducts} product listing${pendingProducts > 1 ? 's' : ''}`,
      priority: 'medium' as const,
      type: 'product' as const,
      count: pendingProducts,
      action: '/admin/product-approval'
    });
  }

  // If no pending tasks, show a message
  if (tasks.length === 0) {
    tasks.push({
      task: 'All caught up! No pending tasks.',
      priority: 'low' as const,
      type: 'info' as const,
      count: 0,
      action: null
    });
  }

  return tasks;
};

export function DashboardOverview() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  // Fetch recent vendors
  const { data: recentVendors = [], isLoading: loadingVendors } = useQuery({
    queryKey: ['recent-vendors'],
    queryFn: fetchRecentVendors,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch pending tasks
  const { data: pendingTasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['pending-tasks'],
    queryFn: fetchPendingTasks,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

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

  const handleViewVendor = (vendor: { id: string; vendorProfileId?: string }) => {
    // Use vendorProfileId if available, otherwise fall back to id
    const profileId = vendor.vendorProfileId || vendor.id;
    navigate(`/admin/vendor-store/${profileId}`);
  };

  const handleTaskAction = (action: string | null) => {
    if (action) {
      navigate(action);
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
            {loadingVendors ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : recentVendors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No vendors found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentVendors.map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{vendor.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>{vendor.businessType || 'N/A'}</span>
                        <span>•</span>
                        <span>{new Date(vendor.joinDate).toLocaleDateString()}</span>
                        {vendor.isVerified && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-xs">Verified</Badge>
                          </>
                        )}
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
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewVendor(vendor)}
                        title="View vendor details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            {loadingTasks ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTasks.map((task, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 bg-muted/30 rounded-lg ${
                      task.action ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''
                    }`}
                    onClick={() => task.action && handleTaskAction(task.action)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        task.priority === 'high' ? 'bg-destructive' : 
                        task.priority === 'medium' ? 'bg-warning' : 
                        'bg-muted'
                      }`} />
                      <span className="text-sm font-medium text-foreground">{task.task}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {task.type}
                      </Badge>
                      {task.action && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTaskAction(task.action!);
                          }}
                          title="View task"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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