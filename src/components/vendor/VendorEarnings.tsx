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
  CreditCard,
  Banknote,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Receipt,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock earnings data for vendor
const vendorEarningsData = {
  overview: {
    totalEarnings: 10582.50,
    pendingPayout: 2345.75,
    totalCommission: 1867.50,
    totalRevenue: 12450.00,
    thisMonth: 3456.78,
    lastMonth: 2987.45,
    growthRate: 15.7
  },
  payouts: [
    {
      id: "PAY001",
      period: "January 2024",
      grossRevenue: 3456.78,
      commission: 518.52,
      netPayout: 2938.26,
      status: "paid",
      paidDate: "2024-02-01",
      orders: 45,
      paymentMethod: "bank_transfer",
      reference: "PAY-2024-001"
    },
    {
      id: "PAY002",
      period: "December 2023",
      grossRevenue: 2987.45,
      commission: 448.12,
      netPayout: 2539.33,
      status: "paid",
      paidDate: "2024-01-01",
      orders: 38,
      paymentMethod: "bank_transfer",
      reference: "PAY-2023-012"
    },
    {
      id: "PAY003",
      period: "November 2023",
      grossRevenue: 2678.90,
      commission: 401.84,
      netPayout: 2277.06,
      status: "paid",
      paidDate: "2023-12-01",
      orders: 34,
      paymentMethod: "bank_transfer",
      reference: "PAY-2023-011"
    },
    {
      id: "PAY004",
      period: "February 2024",
      grossRevenue: 2345.75,
      commission: 351.86,
      netPayout: 1993.89,
      status: "pending",
      paidDate: null,
      orders: 29,
      paymentMethod: "bank_transfer",
      reference: "PAY-2024-002"
    }
  ],
  commissionBreakdown: [
    {
      category: "Food & Beverages",
      revenue: 5308.16,
      commission: 796.22,
      percentage: 15,
      orders: 89
    },
    {
      category: "Beauty & Personal Care",
      revenue: 3898.44,
      commission: 584.77,
      percentage: 15,
      orders: 67
    },
    {
      category: "Fashion & Clothing",
      revenue: 4049.55,
      commission: 607.43,
      percentage: 15,
      orders: 45
    },
    {
      category: "Health & Wellness",
      revenue: 1665.00,
      commission: 249.75,
      percentage: 15,
      orders: 23
    }
  ],
  monthlyEarnings: [
    { month: "Jan", earnings: 2938.26, commission: 518.52, orders: 45 },
    { month: "Dec", earnings: 2539.33, commission: 448.12, orders: 38 },
    { month: "Nov", earnings: 2277.06, commission: 401.84, orders: 34 },
    { month: "Oct", earnings: 1989.45, commission: 298.42, orders: 28 },
    { month: "Sep", earnings: 2156.78, commission: 323.52, orders: 31 },
    { month: "Aug", earnings: 1897.34, commission: 284.60, orders: 26 }
  ],
  paymentMethods: [
    {
      method: "Bank Transfer",
      account: "****1234",
      bank: "Barclays Bank",
      isDefault: true,
      lastUsed: "2024-02-01"
    },
    {
      method: "PayPal",
      account: "mamaasha@paypal.com",
      bank: "PayPal",
      isDefault: false,
      lastUsed: "2023-11-15"
    }
  ]
};

export function VendorEarnings() {
  const [timeRange, setTimeRange] = useState("6m");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Data Refreshed",
        description: "Earnings data has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh earnings data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportStatement = async () => {
    try {
      // Mock export
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Export Successful",
        description: "Earnings statement has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export statement. Please try again.",
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

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'paid': return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'pending': return { color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'processing': return { color: 'bg-blue-100 text-blue-800', icon: Clock };
      default: return { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle };
    }
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
          <h1 className="text-3xl font-bold text-foreground">Earnings & Payouts</h1>
          <p className="text-muted-foreground">Track your earnings, commissions, and payout history</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
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
          <Button size="sm" onClick={handleExportStatement}>
            <Download className="h-4 w-4 mr-2" />
            Export Statement
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(vendorEarningsData.overview.totalEarnings)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {getGrowthIcon(vendorEarningsData.overview.growthRate)}
              +{vendorEarningsData.overview.growthRate}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(vendorEarningsData.overview.pendingPayout)}</div>
            <p className="text-xs text-muted-foreground">
              Next payout: March 1, 2024
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(vendorEarningsData.overview.totalCommission)}</div>
            <p className="text-xs text-muted-foreground">
              15% platform fee
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(vendorEarningsData.overview.thisMonth)}</div>
            <p className="text-xs text-muted-foreground">
              Net earnings after commission
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="payouts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
        </TabsList>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>Your payout history and scheduled payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Gross Revenue</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Net Payout</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorEarningsData.payouts.map((payout) => {
                      const statusInfo = getStatusInfo(payout.status);
                      const StatusIcon = statusInfo.icon;
                      
                      return (
                        <TableRow key={payout.id}>
                          <TableCell className="font-medium">{payout.period}</TableCell>
                          <TableCell>{formatCurrency(payout.grossRevenue)}</TableCell>
                          <TableCell className="text-red-600">{formatCurrency(payout.commission)}</TableCell>
                          <TableCell className="font-bold">{formatCurrency(payout.netPayout)}</TableCell>
                          <TableCell>{payout.orders}</TableCell>
                          <TableCell>
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
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
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Receipt className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commission Tab */}
        <TabsContent value="commission" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Breakdown</CardTitle>
              <CardDescription>Commission breakdown by product category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Commission Rate</TableHead>
                      <TableHead>Commission Amount</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Net Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorEarningsData.commissionBreakdown.map((item) => (
                      <TableRow key={item.category}>
                        <TableCell className="font-medium">{item.category}</TableCell>
                        <TableCell>{formatCurrency(item.revenue)}</TableCell>
                        <TableCell>{item.percentage}%</TableCell>
                        <TableCell className="text-red-600">{formatCurrency(item.commission)}</TableCell>
                        <TableCell>{item.orders}</TableCell>
                        <TableCell className="font-bold text-green-600">
                          {formatCurrency(item.revenue - item.commission)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Earnings Trend</CardTitle>
                <CardDescription>Your earnings over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vendorEarningsData.monthlyEarnings.map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">{month.month}</p>
                        <p className="text-sm text-muted-foreground">{month.orders} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(month.earnings)}</p>
                        <p className="text-sm text-red-600">
                          -{formatCurrency(month.commission)} commission
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Earnings Summary</CardTitle>
                <CardDescription>Key financial metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Average Monthly Earnings</p>
                      <p className="text-sm text-muted-foreground">Last 6 months</p>
                    </div>
                    <p className="font-bold">
                      {formatCurrency(vendorEarningsData.monthlyEarnings.reduce((sum, month) => sum + month.earnings, 0) / 6)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Total Commission Paid</p>
                      <p className="text-sm text-muted-foreground">Platform fees</p>
                    </div>
                    <p className="font-bold text-red-600">
                      {formatCurrency(vendorEarningsData.monthlyEarnings.reduce((sum, month) => sum + month.commission, 0))}
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="font-medium">Total Orders</p>
                      <p className="text-sm text-muted-foreground">Last 6 months</p>
                    </div>
                    <p className="font-bold">
                      {vendorEarningsData.monthlyEarnings.reduce((sum, month) => sum + month.orders, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payout methods</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendorEarningsData.paymentMethods.map((method) => (
                  <div key={method.method} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        {method.method === "Bank Transfer" ? (
                          <Banknote className="h-5 w-5 text-orange-600" />
                        ) : (
                          <CreditCard className="h-5 w-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{method.method}</p>
                        <p className="text-sm text-muted-foreground">
                          {method.account} • {method.bank}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last used: {new Date(method.lastUsed).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {method.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

