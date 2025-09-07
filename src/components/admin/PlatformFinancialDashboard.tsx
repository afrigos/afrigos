import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Calculator,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Package,
  CreditCard,
  Banknote,
  Receipt,
  Percent,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Platform financial data
const platformFinancialData = {
  grossRevenue: 284590,
  totalRemittance: 241901.50, // Payouts to vendors
  platformProfit: 42688.50, // Net commission earned
  vendorSubscriptionRevenue: 12470, // Monthly vendor subscriptions
  serviceFeeRevenue: 8560, // Additional service fees
  transactionFees: 7114.75, // 2.5% transaction fees
  operationalCosts: 15200, // Platform operational costs
  netProfit: 27488.50, // Platform profit after all costs
  profitMargin: 9.66 // Net profit margin percentage
};

const revenueSources = [
  {
    source: "Commission Revenue",
    amount: 42688.50,
    percentage: 15.0,
    growth: 12.8,
    trend: 'up'
  },
  {
    source: "Vendor Subscriptions",
    amount: 12470,
    percentage: 4.4,
    growth: 4.9,
    trend: 'up'
  },
  {
    source: "Service Fees",
    amount: 8560,
    percentage: 3.0,
    growth: 8.5,
    trend: 'up'
  },
  {
    source: "Transaction Fees",
    amount: 7114.75,
    percentage: 2.5,
    growth: 12.8,
    trend: 'up'
  }
];

const vendorPayouts = [
  {
    vendor: "Mama Asha's Kitchen",
    grossRevenue: 12450,
    commission: 1867.50,
    netPayout: 10582.50,
    status: "paid",
    paidDate: "2024-02-01"
  },
  {
    vendor: "Adunni Beauty",
    grossRevenue: 8920,
    commission: 1338.00,
    netPayout: 7582.00,
    status: "paid",
    paidDate: "2024-02-01"
  },
  {
    vendor: "Kente Collections",
    grossRevenue: 15680,
    commission: 2352.00,
    netPayout: 13328.00,
    status: "paid",
    paidDate: "2024-02-01"
  },
  {
    vendor: "Afro Herbs Ltd",
    grossRevenue: 6340,
    commission: 951.00,
    netPayout: 5389.00,
    status: "pending",
    paidDate: null
  }
];

export function PlatformFinancialDashboard() {
  const [timeRange, setTimeRange] = useState("1m");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Data Refreshed",
        description: "Financial data has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh financial data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Export Successful",
        description: "Financial report has been exported successfully.",
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

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      case 'stable': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Platform Financial Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive financial overview and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
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
          <Button size="sm" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(platformFinancialData.grossRevenue)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {getGrowthIcon(12.8)}
              +12.8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Remittance</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(platformFinancialData.totalRemittance)}</div>
            <p className="text-xs text-muted-foreground">
              {((platformFinancialData.totalRemittance / platformFinancialData.grossRevenue) * 100).toFixed(1)}% of gross revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(platformFinancialData.netProfit)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {getGrowthIcon(16.3)}
              +16.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformFinancialData.profitMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Net profit margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Platform revenue sources and distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueSources.map((source) => (
                    <div key={source.source} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">{source.source}</p>
                        <p className="text-sm text-muted-foreground">{source.percentage}% of total revenue</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(source.amount)}</p>
                        <p className={`text-sm flex items-center ${getTrendColor(source.trend)}`}>
                          {getGrowthIcon(source.growth)}
                          {source.growth >= 0 ? '+' : ''}{source.growth}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Key financial metrics and ratios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Gross Revenue</p>
                      <p className="text-sm text-muted-foreground">Total platform revenue</p>
                    </div>
                    <p className="font-bold">{formatCurrency(platformFinancialData.grossRevenue)}</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Vendor Payouts</p>
                      <p className="text-sm text-muted-foreground">Total remittance to vendors</p>
                    </div>
                    <p className="font-bold text-red-600">-{formatCurrency(platformFinancialData.totalRemittance)}</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Platform Commission</p>
                      <p className="text-sm text-muted-foreground">Net commission earned</p>
                    </div>
                    <p className="font-bold text-green-600">+{formatCurrency(platformFinancialData.platformProfit)}</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Operational Costs</p>
                      <p className="text-sm text-muted-foreground">Platform operational expenses</p>
                    </div>
                    <p className="font-bold text-red-600">-{formatCurrency(platformFinancialData.operationalCosts)}</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">Net Profit</p>
                      <p className="text-sm text-green-600">Final platform profit</p>
                    </div>
                    <p className="font-bold text-green-800">{formatCurrency(platformFinancialData.netProfit)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Sources</CardTitle>
              <CardDescription>Detailed breakdown of platform revenue streams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Revenue Source</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Growth</TableHead>
                      <TableHead>Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueSources.map((source) => (
                      <TableRow key={source.source}>
                        <TableCell className="font-medium">{source.source}</TableCell>
                        <TableCell className="font-bold">{formatCurrency(source.amount)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{source.percentage}%</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`flex items-center ${getTrendColor(source.trend)}`}>
                            {getGrowthIcon(source.growth)}
                            {source.growth >= 0 ? '+' : ''}{source.growth}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={source.trend === 'up' ? 'default' : source.trend === 'down' ? 'destructive' : 'secondary'}
                          >
                            {source.trend}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Payouts</CardTitle>
              <CardDescription>Recent vendor payouts and remittance details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Gross Revenue</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Net Payout</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Paid Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorPayouts.map((payout) => (
                      <TableRow key={payout.vendor}>
                        <TableCell className="font-medium">{payout.vendor}</TableCell>
                        <TableCell>{formatCurrency(payout.grossRevenue)}</TableCell>
                        <TableCell className="text-red-600">-{formatCurrency(payout.commission)}</TableCell>
                        <TableCell className="font-bold">{formatCurrency(payout.netPayout)}</TableCell>
                        <TableCell>
                          <Badge variant={payout.status === 'paid' ? 'default' : 'secondary'}>
                            {payout.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payout.paidDate ? (
                            new Date(payout.paidDate).toLocaleDateString('en-GB')
                          ) : (
                            <span className="text-muted-foreground">Pending</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Operational Costs</CardTitle>
                <CardDescription>Platform operational expenses breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Transaction Fees</p>
                      <p className="text-sm text-muted-foreground">Payment processing fees</p>
                    </div>
                    <p className="font-bold text-red-600">-{formatCurrency(platformFinancialData.transactionFees)}</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Operational Costs</p>
                      <p className="text-sm text-muted-foreground">Platform maintenance & staff</p>
                    </div>
                    <p className="font-bold text-red-600">-{formatCurrency(platformFinancialData.operationalCosts)}</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Total Costs</p>
                      <p className="text-sm text-muted-foreground">Combined operational expenses</p>
                    </div>
                    <p className="font-bold text-red-600">-{formatCurrency(platformFinancialData.transactionFees + platformFinancialData.operationalCosts)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profitability Analysis</CardTitle>
                <CardDescription>Profit margins and financial ratios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Gross Profit Margin</p>
                      <p className="text-sm text-muted-foreground">Platform commission margin</p>
                    </div>
                    <p className="font-bold text-green-600">15.0%</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Net Profit Margin</p>
                      <p className="text-sm text-muted-foreground">After all costs</p>
                    </div>
                    <p className="font-bold text-green-600">{platformFinancialData.profitMargin.toFixed(1)}%</p>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Cost to Revenue Ratio</p>
                      <p className="text-sm text-muted-foreground">Operational efficiency</p>
                    </div>
                    <p className="font-bold text-blue-600">
                      {(((platformFinancialData.transactionFees + platformFinancialData.operationalCosts) / platformFinancialData.grossRevenue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
