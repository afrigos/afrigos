import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Star,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Filter,
  Search,
  Eye,
  Printer,
  Share,
  Mail,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Globe,
  MapPin,
  CreditCard,
  Truck,
  MessageSquare,
  Layers,
  TrendingUp as GrowthIcon,
  Percent,
  Zap,
  Award,
  Shield,
  Settings,
  Database,
  Cpu,
  Wifi,
  Smartphone,
  Monitor,
  Headphones,
  Gift,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bell,
  Bookmark,
  Archive,
  Layers3,
  PieChart as PieChartIcon,
  BarChart4,
  LineChart as LineChartIcon,
  Scatter,
  AreaChart,
  Candlestick,
  Radar,
  Gauge,
  Thermometer,
  Wind,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  Tornado
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock comprehensive reports data
const reportsData = {
  overview: {
    totalRevenue: 45670.50,
    totalOrders: 1247,
    totalCustomers: 892,
    avgOrderValue: 36.63,
    conversionRate: 3.2,
    growthRate: 15.8,
    orderGrowth: 12.4,
    customerGrowth: 18.7,
    revenueGrowth: 15.8,
    // Enhanced metrics
    totalViews: 15670,
    bounceRate: 42.3,
    avgSessionDuration: "3m 24s",
    repeatPurchaseRate: 28.5,
    customerLifetimeValue: 156.78,
    inventoryTurnover: 4.2,
    returnRate: 2.1,
    refundRate: 1.8,
    profitMargin: 78.8,
    netProfit: 35988.43,
    grossProfit: 42820.50,
    operatingExpenses: 6832.07,
    marketingSpend: 1250.00,
    shippingCosts: 890.50,
    processingFees: 234.25,
    packagingCosts: 456.75,
    staffCosts: 2800.00,
    rentAndUtilities: 1200.50
  },
  salesPerformance: {
    daily: [
      { date: "2024-01-15", revenue: 284.50, orders: 8, customers: 7 },
      { date: "2024-01-16", revenue: 312.75, orders: 9, customers: 8 },
      { date: "2024-01-17", revenue: 298.25, orders: 7, customers: 6 },
      { date: "2024-01-18", revenue: 345.00, orders: 10, customers: 9 },
      { date: "2024-01-19", revenue: 378.50, orders: 11, customers: 10 },
      { date: "2024-01-20", revenue: 412.25, orders: 12, customers: 11 },
      { date: "2024-01-21", revenue: 395.75, orders: 11, customers: 10 }
    ],
    monthly: [
      { month: "Jul 2023", revenue: 3200, orders: 89, growth: -5.2 },
      { month: "Aug 2023", revenue: 3800, orders: 105, growth: 18.8 },
      { month: "Sep 2023", revenue: 4200, orders: 118, growth: 10.5 },
      { month: "Oct 2023", revenue: 4800, orders: 134, growth: 14.3 },
      { month: "Nov 2023", revenue: 5200, orders: 145, growth: 8.3 },
      { month: "Dec 2023", revenue: 6800, orders: 189, growth: 30.8 },
      { month: "Jan 2024", revenue: 7200, orders: 201, growth: 5.9 }
    ],
    hourly: [
      { hour: "00:00", orders: 2, revenue: 45.50 },
      { hour: "01:00", orders: 1, revenue: 23.99 },
      { hour: "02:00", orders: 0, revenue: 0 },
      { hour: "03:00", orders: 1, revenue: 34.99 },
      { hour: "04:00", orders: 0, revenue: 0 },
      { hour: "05:00", orders: 1, revenue: 28.50 },
      { hour: "06:00", orders: 3, revenue: 89.99 },
      { hour: "07:00", orders: 5, revenue: 156.75 },
      { hour: "08:00", orders: 8, revenue: 234.50 },
      { hour: "09:00", orders: 12, revenue: 378.25 },
      { hour: "10:00", orders: 15, revenue: 456.75 },
      { hour: "11:00", orders: 18, revenue: 567.50 },
      { hour: "12:00", orders: 22, revenue: 678.25 },
      { hour: "13:00", orders: 25, revenue: 789.50 },
      { hour: "14:00", orders: 28, revenue: 890.75 },
      { hour: "15:00", orders: 24, revenue: 756.25 },
      { hour: "16:00", orders: 20, revenue: 634.50 },
      { hour: "17:00", orders: 18, revenue: 567.75 },
      { hour: "18:00", orders: 16, revenue: 489.25 },
      { hour: "19:00", orders: 14, revenue: 412.50 },
      { hour: "20:00", orders: 12, revenue: 356.75 },
      { hour: "21:00", orders: 10, revenue: 298.50 },
      { hour: "22:00", orders: 8, revenue: 234.25 },
      { hour: "23:00", orders: 5, revenue: 156.99 }
    ]
  },
  productAnalysis: {
    topProducts: [
      { name: "Jollof Rice Spice Mix", revenue: 3036.66, sales: 234, growth: 15.2, margin: 45.5 },
      { name: "Shea Butter Hair Care Set", revenue: 3898.44, sales: 156, growth: 22.1, margin: 52.3 },
      { name: "Traditional Kente Cloth Scarf", revenue: 4049.55, sales: 45, growth: 8.5, margin: 38.7 },
      { name: "Plantain Chips", revenue: 1606.50, sales: 189, growth: 12.4, margin: 41.2 },
      { name: "Moringa Leaf Powder", revenue: 1665.00, sales: 90, growth: 18.3, margin: 48.9 }
    ],
    categoryPerformance: [
      { category: "Food & Beverages", revenue: 5308.16, orders: 423, growth: 12.4, avgOrderValue: 12.55 },
      { category: "Beauty & Personal Care", revenue: 3898.44, orders: 156, growth: 18.7, avgOrderValue: 24.99 },
      { category: "Fashion & Clothing", revenue: 4049.55, orders: 45, growth: 8.2, avgOrderValue: 89.99 },
      { category: "Health & Wellness", revenue: 1665.00, orders: 90, growth: 22.1, avgOrderValue: 18.50 }
    ],
    inventory: {
      lowStock: 8,
      outOfStock: 2,
      totalProducts: 24,
      stockValue: 15670.50
    }
  },
  customerInsights: {
    demographics: {
      ageGroups: [
        { age: "18-24", percentage: 15, customers: 134 },
        { age: "25-34", percentage: 35, customers: 312 },
        { age: "35-44", percentage: 28, customers: 250 },
        { age: "45-54", percentage: 15, customers: 134 },
        { age: "55+", percentage: 7, customers: 62 }
      ],
      locations: [
        { location: "London", percentage: 45, customers: 401, revenue: 20551.73 },
        { location: "Manchester", percentage: 18, customers: 161, revenue: 8220.69 },
        { location: "Birmingham", percentage: 12, customers: 107, revenue: 5480.46 },
        { location: "Leeds", percentage: 8, customers: 71, revenue: 3653.64 },
        { location: "Liverpool", percentage: 6, customers: 54, revenue: 2740.23 },
        { location: "Other", percentage: 11, customers: 98, revenue: 5023.75 }
      ]
    },
    behavior: {
      repeatCustomers: 67,
      newCustomers: 89,
      avgOrderValue: 36.63,
      customerLifetimeValue: 156.78,
      retentionRate: 78.5,
      churnRate: 21.5
    },
    satisfaction: {
      avgRating: 4.8,
      totalReviews: 247,
      responseRate: 89.2,
      avgResponseTime: "2 hours"
    }
  },
  financialReports: {
    revenue: {
      gross: 45670.50,
      net: 38819.93,
      commission: 6850.58,
      taxes: 0,
      refunds: 1250.00
    },
    expenses: {
      marketing: 1250.00,
      shipping: 890.50,
      packaging: 456.75,
      processing: 234.25,
      total: 2831.50
    },
    profit: {
      gross: 42820.50,
      net: 35988.43,
      margin: 78.8
    }
  },
    operationalMetrics: {
      fulfillment: {
        onTimeDelivery: 98.5,
        avgProcessingTime: "2.3 hours",
        avgShippingTime: "3.2 days",
        returnRate: 2.1
      },
      support: {
        totalTickets: 45,
        resolved: 42,
        avgResponseTime: "1.8 hours",
        satisfaction: 4.7
      }
    },
    // Enhanced detailed analytics
    trafficAnalytics: {
      sources: [
        { source: "Direct", visitors: 4567, percentage: 35.2, conversion: 4.1 },
        { source: "Organic Search", visitors: 3245, percentage: 25.1, conversion: 3.8 },
        { source: "Social Media", visitors: 2890, percentage: 22.3, conversion: 2.9 },
        { source: "Email Marketing", visitors: 1567, percentage: 12.1, conversion: 5.2 },
        { source: "Paid Ads", visitors: 641, percentage: 5.0, conversion: 2.1 }
      ],
      devices: [
        { device: "Desktop", visitors: 6789, percentage: 52.4 },
        { device: "Mobile", visitors: 4567, percentage: 35.3 },
        { device: "Tablet", visitors: 1615, percentage: 12.3 }
      ],
      browsers: [
        { browser: "Chrome", visitors: 7890, percentage: 60.9 },
        { browser: "Safari", visitors: 2345, percentage: 18.1 },
        { browser: "Firefox", visitors: 1567, percentage: 12.1 },
        { browser: "Edge", visitors: 789, percentage: 6.1 },
        { browser: "Other", visitors: 380, percentage: 2.8 }
      ]
    },
    seasonality: {
      monthlyTrends: [
        { month: "Jan", revenue: 3200, orders: 89, trend: "down" },
        { month: "Feb", revenue: 3800, orders: 105, trend: "up" },
        { month: "Mar", revenue: 4200, orders: 118, trend: "up" },
        { month: "Apr", revenue: 4800, orders: 134, trend: "up" },
        { month: "May", revenue: 5200, orders: 145, trend: "up" },
        { month: "Jun", revenue: 6800, orders: 189, trend: "up" },
        { month: "Jul", revenue: 7200, orders: 201, trend: "up" },
        { month: "Aug", revenue: 6900, orders: 195, trend: "down" },
        { month: "Sep", revenue: 6100, orders: 167, trend: "down" },
        { month: "Oct", revenue: 5800, orders: 156, trend: "down" },
        { month: "Nov", revenue: 7200, orders: 201, trend: "up" },
        { month: "Dec", revenue: 8900, orders: 245, trend: "up" }
      ]
    },
    inventoryAnalytics: {
      stockLevels: [
        { product: "Jollof Rice Spice Mix", currentStock: 45, minStock: 20, maxStock: 100, status: "healthy" },
        { product: "Shea Butter Hair Care Set", currentStock: 12, minStock: 15, maxStock: 50, status: "low" },
        { product: "Traditional Kente Cloth Scarf", currentStock: 8, minStock: 10, maxStock: 30, status: "low" },
        { product: "Plantain Chips", currentStock: 67, minStock: 25, maxStock: 150, status: "healthy" },
        { product: "Moringa Leaf Powder", currentStock: 23, minStock: 20, maxStock: 80, status: "healthy" }
      ],
      turnoverRates: [
        { category: "Food & Beverages", turnoverRate: 4.2, avgDays: 87 },
        { category: "Beauty & Personal Care", turnoverRate: 3.8, avgDays: 96 },
        { category: "Fashion & Clothing", turnoverRate: 2.1, avgDays: 174 },
        { category: "Health & Wellness", turnoverRate: 5.1, avgDays: 71 }
      ]
    },
    customerJourney: {
      funnel: [
        { stage: "Visitors", count: 12900, percentage: 100 },
        { stage: "Product Views", count: 8765, percentage: 67.9 },
        { stage: "Add to Cart", count: 2345, percentage: 18.2 },
        { stage: "Checkout Started", count: 1234, percentage: 9.6 },
        { stage: "Purchase Completed", count: 892, percentage: 6.9 }
      ],
      retention: {
        day1: 78.5,
        day7: 45.2,
        day30: 28.7,
        day90: 15.3
      }
    },
    performanceKPIs: {
      sales: {
        revenuePerVisitor: 3.54,
        revenuePerCustomer: 51.20,
        ordersPerCustomer: 1.40,
        avgTimeToPurchase: "12 days"
      },
      marketing: {
        costPerAcquisition: 8.50,
        returnOnAdSpend: 4.2,
        emailOpenRate: 24.8,
        clickThroughRate: 3.2
      },
      operations: {
        orderFulfillmentTime: "2.3 hours",
        customerServiceResponseTime: "1.8 hours",
        inventoryAccuracy: 98.7,
        shippingAccuracy: 99.2
      }
    },
    competitorBenchmark: {
      marketShare: 12.5,
      priceCompetitiveness: 8.7,
      qualityRating: 4.8,
      customerSatisfaction: 4.7,
      brandRecognition: 34.2,
      socialMediaEngagement: 2.8,
      websiteTraffic: 15670,
      conversionRate: 3.2
    }
};

export function VendorReports() {
  const [timeRange, setTimeRange] = useState("30d");
  const [reportType, setReportType] = useState("overview");
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Data Refreshed",
        description: "Reports have been updated with the latest data.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh reports. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportReport = async (format: string) => {
    setIsExporting(true);
    try {
      // Mock export
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast({
        title: "Export Successful",
        description: `Report exported as ${format.toUpperCase()} successfully.`,
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

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Business Reports</h1>
          <p className="text-muted-foreground">Comprehensive insights and analytics for your business</p>
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
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Report</DialogTitle>
                <DialogDescription>
                  Choose the format for your report export
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleExportReport('pdf')}
                  disabled={isExporting}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleExportReport('excel')}
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export as Excel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportsData.overview.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {getGrowthIcon(reportsData.overview.revenueGrowth)}
              <span className={getGrowthColor(reportsData.overview.revenueGrowth)}>
                +{reportsData.overview.revenueGrowth}% from last period
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportsData.overview.totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {getGrowthIcon(reportsData.overview.orderGrowth)}
              <span className={getGrowthColor(reportsData.overview.orderGrowth)}>
                +{reportsData.overview.orderGrowth}% from last period
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportsData.overview.totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {getGrowthIcon(reportsData.overview.customerGrowth)}
              <span className={getGrowthColor(reportsData.overview.customerGrowth)}>
                +{reportsData.overview.customerGrowth}% from last period
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportsData.overview.avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Conversion rate: {reportsData.overview.conversionRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportsData.overview.profitMargin}%</div>
            <p className="text-xs text-muted-foreground">
              Net Profit: {formatCurrency(reportsData.overview.netProfit)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer LTV</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportsData.overview.customerLifetimeValue)}</div>
            <p className="text-xs text-muted-foreground">
              Repeat Rate: {reportsData.overview.repeatPurchaseRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Reports Tabs */}
      <Tabs value={reportType} onValueChange={setReportType} className="space-y-4">
        <TabsList className="grid w-full grid-cols-12">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="seasonality">Seasonality</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="detailed">Export</TabsTrigger>
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
                  {reportsData.salesPerformance.daily.map((day, index) => (
                    <div key={day.date} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">{new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                        <p className="text-sm text-muted-foreground">{day.orders} orders • {day.customers} customers</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(day.revenue)}</p>
                        <p className="text-sm text-muted-foreground">
                          {index > 0 ? (
                            <span className={day.revenue > reportsData.salesPerformance.daily[index - 1].revenue ? 'text-green-600' : 'text-red-600'}>
                              {day.revenue > reportsData.salesPerformance.daily[index - 1].revenue ? '+' : ''}
                              {((day.revenue - reportsData.salesPerformance.daily[index - 1].revenue) / reportsData.salesPerformance.daily[index - 1].revenue * 100).toFixed(1)}%
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
                <CardTitle>Top Products</CardTitle>
                <CardDescription>Best performing products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportsData.productAnalysis.topProducts.slice(0, 3).map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-orange-600">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.sales} sales</p>
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
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Sales Performance</CardTitle>
                <CardDescription>Revenue trends by month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportsData.salesPerformance.monthly.map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">{month.month}</p>
                        <p className="text-sm text-muted-foreground">{month.orders.toLocaleString()} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(month.revenue)}</p>
                        <p className={`text-sm flex items-center ${getGrowthColor(month.growth)}`}>
                          {getGrowthIcon(month.growth)}
                          {month.growth > 0 ? '+' : ''}{month.growth}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak Hours Analysis</CardTitle>
                <CardDescription>Order distribution by hour of day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportsData.salesPerformance.hourly.slice(6, 22).map((hour) => (
                    <div key={hour.hour} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium w-12">{hour.hour}</span>
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full" 
                            style={{ width: `${(hour.orders / 25) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{hour.orders} orders</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(hour.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>Detailed product analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Sales</TableHead>
                      <TableHead>Growth</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportsData.productAnalysis.topProducts.map((product) => (
                      <TableRow key={product.name}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{formatCurrency(product.revenue)}</TableCell>
                        <TableCell>{product.sales}</TableCell>
                        <TableCell>
                          <span className={getGrowthColor(product.growth)}>
                            +{product.growth}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>Revenue by product category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportsData.productAnalysis.categoryPerformance.map((category) => (
                    <div key={category.category} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">{category.category}</p>
                        <p className="text-sm text-muted-foreground">{category.orders} orders • AOV: {formatCurrency(category.avgOrderValue)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(category.revenue)}</p>
                        <p className={`text-sm flex items-center ${getGrowthColor(category.growth)}`}>
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

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Demographics</CardTitle>
                <CardDescription>Age group distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportsData.customerInsights.demographics.ageGroups.map((ageGroup) => (
                    <div key={ageGroup.age} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{ageGroup.age}</span>
                        <span>{ageGroup.percentage}% ({ageGroup.customers} customers)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${ageGroup.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Customer locations and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportsData.customerInsights.demographics.locations.map((location) => (
                    <div key={location.location} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">{location.location}</p>
                        <p className="text-sm text-muted-foreground">{location.customers} customers ({location.percentage}%)</p>
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

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Income analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Gross Revenue</span>
                  <span className="font-medium">{formatCurrency(reportsData.financialReports.revenue.gross)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Commission</span>
                  <span className="font-medium text-red-600">-{formatCurrency(reportsData.financialReports.revenue.commission)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Refunds</span>
                  <span className="font-medium text-red-600">-{formatCurrency(reportsData.financialReports.revenue.refunds)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Net Revenue</span>
                  <span className="font-bold">{formatCurrency(reportsData.financialReports.revenue.net)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expenses</CardTitle>
                <CardDescription>Business costs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Marketing</span>
                  <span className="font-medium">{formatCurrency(reportsData.financialReports.expenses.marketing)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Shipping</span>
                  <span className="font-medium">{formatCurrency(reportsData.financialReports.expenses.shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Packaging</span>
                  <span className="font-medium">{formatCurrency(reportsData.financialReports.expenses.packaging)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Processing</span>
                  <span className="font-medium">{formatCurrency(reportsData.financialReports.expenses.processing)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total Expenses</span>
                  <span className="font-bold">{formatCurrency(reportsData.financialReports.expenses.total)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit Analysis</CardTitle>
                <CardDescription>Profitability metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Gross Profit</span>
                  <span className="font-medium">{formatCurrency(reportsData.financialReports.profit.gross)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Net Profit</span>
                  <span className="font-bold text-green-600">{formatCurrency(reportsData.financialReports.profit.net)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Profit Margin</span>
                  <span className="font-bold text-green-600">{reportsData.financialReports.profit.margin}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Fulfillment Metrics</CardTitle>
                <CardDescription>Order processing and delivery</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p className="font-medium">On-Time Delivery</p>
                    <p className="text-sm text-muted-foreground">Delivery performance</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{reportsData.operationalMetrics.fulfillment.onTimeDelivery}%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p className="font-medium">Avg Processing Time</p>
                    <p className="text-sm text-muted-foreground">Order fulfillment speed</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{reportsData.operationalMetrics.fulfillment.avgProcessingTime}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p className="font-medium">Avg Shipping Time</p>
                    <p className="text-sm text-muted-foreground">Delivery duration</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{reportsData.operationalMetrics.fulfillment.avgShippingTime}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p className="font-medium">Return Rate</p>
                    <p className="text-sm text-muted-foreground">Product returns</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">{reportsData.operationalMetrics.fulfillment.returnRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Support</CardTitle>
                <CardDescription>Support metrics and performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p className="font-medium">Total Tickets</p>
                    <p className="text-sm text-muted-foreground">Support requests</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{reportsData.operationalMetrics.support.totalTickets}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p className="font-medium">Resolved</p>
                    <p className="text-sm text-muted-foreground">Completed tickets</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{reportsData.operationalMetrics.support.resolved}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p className="font-medium">Avg Response Time</p>
                    <p className="text-sm text-muted-foreground">Support speed</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{reportsData.operationalMetrics.support.avgResponseTime}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div>
                    <p className="font-medium">Satisfaction</p>
                    <p className="text-sm text-muted-foreground">Customer rating</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{reportsData.operationalMetrics.support.satisfaction}/5.0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Traffic Analytics Tab */}
        <TabsContent value="traffic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Traffic Sources</span>
                </CardTitle>
                <CardDescription>Visitor acquisition by source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportsData.trafficAnalytics.sources.map((source) => (
                    <div key={source.source} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{source.source}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">{source.visitors.toLocaleString()} visitors</span>
                          <Badge variant="outline">{source.percentage}%</Badge>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${source.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Conversion Rate: {source.conversion}%</span>
                        <span>Quality Score: {source.conversion > 4 ? 'High' : source.conversion > 3 ? 'Medium' : 'Low'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>Device Analytics</span>
                </CardTitle>
                <CardDescription>Traffic by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportsData.trafficAnalytics.devices.map((device) => (
                    <div key={device.device} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {device.device === 'Desktop' && <Monitor className="h-5 w-5 text-blue-600" />}
                        {device.device === 'Mobile' && <Smartphone className="h-5 w-5 text-green-600" />}
                        {device.device === 'Tablet' && <Monitor className="h-5 w-5 text-purple-600" />}
                        <span className="font-medium">{device.device}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{device.visitors.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{device.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Browser Analytics</span>
              </CardTitle>
              <CardDescription>Traffic distribution by browser</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Browser</TableHead>
                    <TableHead>Visitors</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Market Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportsData.trafficAnalytics.browsers.map((browser) => (
                    <TableRow key={browser.browser}>
                      <TableCell className="font-medium">{browser.browser}</TableCell>
                      <TableCell>{browser.visitors.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full" 
                              style={{ width: `${browser.percentage}%` }}
                            ></div>
                          </div>
                          <span>{browser.percentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={browser.percentage > 50 ? "default" : "secondary"}>
                          {browser.percentage > 50 ? "Dominant" : "Minor"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Analytics Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Stock Levels</span>
                </CardTitle>
                <CardDescription>Current inventory status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportsData.inventoryAnalytics.stockLevels.map((item) => (
                    <div key={item.product} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{item.product}</span>
                        <Badge 
                          variant={item.status === 'healthy' ? 'default' : 'destructive'}
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Current: {item.currentStock}</span>
                          <span>Min: {item.minStock}</span>
                          <span>Max: {item.maxStock}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              item.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${(item.currentStock / item.maxStock) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Turnover Rates</span>
                </CardTitle>
                <CardDescription>Inventory turnover by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportsData.inventoryAnalytics.turnoverRates.map((category) => (
                    <div key={category.category} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">{category.category}</p>
                        <p className="text-sm text-muted-foreground">Avg {category.avgDays} days</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{category.turnoverRate}x</p>
                        <p className="text-sm text-muted-foreground">per year</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Marketing Analytics Tab */}
        <TabsContent value="marketing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Customer Journey</span>
                </CardTitle>
                <CardDescription>Conversion funnel analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportsData.customerJourney.funnel.map((stage, index) => (
                    <div key={stage.stage} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{stage.stage}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold">{stage.count.toLocaleString()}</span>
                          <Badge variant="outline">{stage.percentage}%</Badge>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${stage.percentage}%` }}
                        ></div>
                      </div>
                      {index > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Drop-off: {reportsData.customerJourney.funnel[index-1].percentage - stage.percentage}%
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>Customer Retention</span>
                </CardTitle>
                <CardDescription>Retention rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                    <span className="font-medium">Day 1</span>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{reportsData.customerJourney.retention.day1}%</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                    <span className="font-medium">Day 7</span>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{reportsData.customerJourney.retention.day7}%</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                    <span className="font-medium">Day 30</span>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">{reportsData.customerJourney.retention.day30}%</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                    <span className="font-medium">Day 90</span>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{reportsData.customerJourney.retention.day90}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Performance KPIs</span>
                </CardTitle>
                <CardDescription>Key marketing metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cost per Acquisition</span>
                    <span className="font-bold">{formatCurrency(reportsData.performanceKPIs.marketing.costPerAcquisition)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">ROAS</span>
                    <span className="font-bold text-green-600">{reportsData.performanceKPIs.marketing.returnOnAdSpend}x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Email Open Rate</span>
                    <span className="font-bold">{reportsData.performanceKPIs.marketing.emailOpenRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Click Through Rate</span>
                    <span className="font-bold">{reportsData.performanceKPIs.marketing.clickThroughRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Seasonality Tab */}
        <TabsContent value="seasonality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Monthly Trends</span>
              </CardTitle>
              <CardDescription>Revenue and order patterns throughout the year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportsData.seasonality.monthlyTrends.map((month) => (
                  <div key={month.month} className={`p-4 rounded-lg border ${
                    month.trend === 'up' ? 'bg-green-50 border-green-200' : 
                    month.trend === 'down' ? 'bg-red-50 border-red-200' : 
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{month.month}</span>
                      {month.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                      {month.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Revenue:</span>
                        <span className="font-bold">{formatCurrency(month.revenue)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Orders:</span>
                        <span className="font-bold">{month.orders}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Competitive Benchmarks</span>
                </CardTitle>
                <CardDescription>How you compare to market standards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Percent className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Market Share</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{reportsData.competitorBenchmark.marketShare}%</p>
                      <p className="text-sm text-muted-foreground">Industry avg: 8.2%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Price Competitiveness</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{reportsData.competitorBenchmark.priceCompetitiveness}/10</p>
                      <p className="text-sm text-muted-foreground">Above average</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Star className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium">Quality Rating</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{reportsData.competitorBenchmark.qualityRating}/5</p>
                      <p className="text-sm text-muted-foreground">Excellent</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Heart className="h-5 w-5 text-red-600" />
                      <span className="font-medium">Customer Satisfaction</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{reportsData.competitorBenchmark.customerSatisfaction}/5</p>
                      <p className="text-sm text-muted-foreground">Industry leading</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance Metrics</span>
                </CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Sales Performance</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Revenue per Visitor:</span>
                        <span className="font-bold">{formatCurrency(reportsData.performanceKPIs.sales.revenuePerVisitor)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Revenue per Customer:</span>
                        <span className="font-bold">{formatCurrency(reportsData.performanceKPIs.sales.revenuePerCustomer)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Orders per Customer:</span>
                        <span className="font-bold">{reportsData.performanceKPIs.sales.ordersPerCustomer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time to Purchase:</span>
                        <span className="font-bold">{reportsData.performanceKPIs.sales.avgTimeToPurchase}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Operational Excellence</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Fulfillment Time:</span>
                        <span className="font-bold">{reportsData.performanceKPIs.operations.orderFulfillmentTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span className="font-bold">{reportsData.performanceKPIs.operations.customerServiceResponseTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Inventory Accuracy:</span>
                        <span className="font-bold">{reportsData.performanceKPIs.operations.inventoryAccuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping Accuracy:</span>
                        <span className="font-bold">{reportsData.performanceKPIs.operations.shippingAccuracy}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Detailed Tab */}
        <TabsContent value="detailed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive Data Export</CardTitle>
              <CardDescription>Download detailed reports in various formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => handleExportReport('pdf')}
                  disabled={isExporting}
                >
                  <FileText className="h-6 w-6" />
                  <span>PDF Report</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => handleExportReport('excel')}
                  disabled={isExporting}
                >
                  <Download className="h-6 w-6" />
                  <span>Excel Spreadsheet</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  onClick={() => handleExportReport('csv')}
                  disabled={isExporting}
                >
                  <FileText className="h-6 w-6" />
                  <span>CSV Data</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
