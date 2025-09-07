import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Users,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Calculator,
  Banknote,
  Wallet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock financial data
const financialData = {
  overview: {
    totalRevenue: 124750,
    totalCommissions: 18712,
    pendingPayments: 4560,
    refundsIssued: 2340,
    avgOrderValue: 36.08,
    commissionRate: 15,
    growthRate: 12.5,
    profitMargin: 28.3
  },
  payments: [
    {
      id: "PAY001",
      vendorId: "V001",
      vendorName: "Mama Asha's Kitchen",
      amount: 1245.50,
      commission: 186.83,
      status: "pending",
      dueDate: "2024-01-25",
      orders: 45,
      period: "Jan 2024",
      paymentMethod: "bank_transfer"
    },
    {
      id: "PAY002",
      vendorId: "V002",
      vendorName: "Adunni Beauty",
      amount: 987.30,
      commission: 148.10,
      status: "paid",
      dueDate: "2024-01-20",
      orders: 32,
      period: "Jan 2024",
      paymentMethod: "bank_transfer"
    },
    {
      id: "PAY003",
      vendorId: "V003",
      vendorName: "Kente Collections",
      amount: 567.80,
      commission: 85.17,
      status: "processing",
      dueDate: "2024-01-22",
      orders: 18,
      period: "Jan 2024",
      paymentMethod: "paypal"
    }
  ],
  refunds: [
    {
      id: "REF001",
      orderId: "ORD-2024-001",
      customerName: "John Smith",
      amount: 89.99,
      reason: "Product damaged",
      status: "approved",
      requestedDate: "2024-01-19",
      processedDate: "2024-01-20",
      vendorId: "V003"
    },
    {
      id: "REF002",
      orderId: "ORD-2024-002",
      customerName: "Sarah Johnson",
      amount: 24.99,
      reason: "Wrong item received",
      status: "pending",
      requestedDate: "2024-01-20",
      processedDate: null,
      vendorId: "V002"
    }
  ],
  transactions: [
    {
      id: "TXN001",
      type: "commission",
      amount: 186.83,
      vendor: "Mama Asha's Kitchen",
      date: "2024-01-20",
      status: "completed",
      description: "Commission payment for Jan 2024"
    },
    {
      id: "TXN002",
      type: "refund",
      amount: -89.99,
      vendor: "Kente Collections",
      date: "2024-01-20",
      status: "completed",
      description: "Refund for damaged product"
    },
    {
      id: "TXN003",
      type: "platform_fee",
      amount: 45.50,
      vendor: "System",
      date: "2024-01-19",
      status: "completed",
      description: "Platform processing fee"
    }
  ],
  commissionRates: [
    { category: "Food & Beverages", rate: 12, minOrder: 10 },
    { category: "Fashion & Clothing", rate: 15, minOrder: 25 },
    { category: "Beauty & Personal Care", rate: 18, minOrder: 15 },
    { category: "Health & Wellness", rate: 20, minOrder: 20 },
    { category: "Home & Garden", rate: 14, minOrder: 30 }
  ]
};

export function FinancialManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleProcessPayment = async (paymentId: string) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Payment Processed",
        description: "Payment has been processed successfully.",
      });
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveRefund = async (refundId: string) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Refund Approved",
        description: "Refund has been approved and processed.",
      });
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "Failed to approve refund. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectRefund = async (refundId: string, reason: string) => {
    setIsLoading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Refund Rejected",
        description: "Refund has been rejected with reason provided.",
      });
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject refund. Please try again.",
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      case "paid":
        return <Badge className="bg-success text-success-foreground">Paid</Badge>;
      case "processing":
        return <Badge className="bg-primary text-primary-foreground">Processing</Badge>;
      case "approved":
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-destructive text-destructive-foreground">Rejected</Badge>;
      case "completed":
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowUpRight className="h-4 w-4 text-success" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-destructive" />
    );
  };

  const filteredPayments = financialData.payments.filter(payment => {
    const matchesSearch = payment.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || payment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredRefunds = financialData.refunds.filter(refund => {
    const matchesSearch = refund.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         refund.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || refund.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Management</h1>
          <p className="text-muted-foreground">Manage payments, commissions, refunds, and financial reporting</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExportReport("financial")}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowPaymentDialog(true)}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Process Payment
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialData.overview.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {getGrowthIcon(financialData.overview.growthRate)}
              +{financialData.overview.growthRate}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialData.overview.totalCommissions)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {financialData.overview.commissionRate}% commission rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialData.overview.pendingPayments)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <AlertTriangle className="h-3 w-3 mr-1 text-warning" />
              Requires attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialData.overview.profitMargin}%</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <Target className="h-3 w-3 mr-1 text-success" />
              Target: 25%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Commission Rates by Category</CardTitle>
                <CardDescription>Current commission structure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financialData.commissionRates.map((rate) => (
                    <div key={rate.category} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">{rate.category}</p>
                        <p className="text-sm text-muted-foreground">Min order: {formatCurrency(rate.minOrder)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{rate.rate}%</p>
                        <p className="text-sm text-muted-foreground">Commission</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest financial activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {financialData.transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'commission' ? 'bg-success/10' :
                          transaction.type === 'refund' ? 'bg-destructive/10' :
                          'bg-primary/10'
                        }`}>
                          {transaction.type === 'commission' ? (
                            <Calculator className="h-4 w-4 text-success" />
                          ) : transaction.type === 'refund' ? (
                            <ArrowDownRight className="h-4 w-4 text-destructive" />
                          ) : (
                            <DollarSign className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{transaction.vendor}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${transaction.amount < 0 ? 'text-destructive' : 'text-success'}`}>
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payments by vendor or ID..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExportReport("payments")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payments List */}
          <div className="space-y-2">
            {filteredPayments.map((payment) => (
              <Card key={payment.id} className="cursor-pointer hover:bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{payment.vendorName}</h4>
                        <p className="text-sm text-muted-foreground">ID: {payment.id} • {payment.period}</p>
                        <p className="text-sm text-muted-foreground">{payment.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-muted-foreground">Commission: {formatCurrency(payment.commission)}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(payment.status)}
                        {payment.status === "pending" && (
                          <Button 
                            size="sm"
                            onClick={() => handleProcessPayment(payment.id)}
                            disabled={isLoading}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Process
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Refunds Tab */}
        <TabsContent value="refunds" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search refunds by customer or order ID..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExportReport("refunds")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Refunds List */}
          <div className="space-y-2">
            {filteredRefunds.map((refund) => (
              <Card key={refund.id} className="cursor-pointer hover:bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                        <ArrowDownRight className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <h4 className="font-medium">{refund.customerName}</h4>
                        <p className="text-sm text-muted-foreground">Order: {refund.orderId}</p>
                        <p className="text-sm text-muted-foreground">Reason: {refund.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-destructive">{formatCurrency(refund.amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(refund.requestedDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(refund.status)}
                        {refund.status === "pending" && (
                          <div className="flex space-x-1">
                            <Button 
                              size="sm"
                              onClick={() => handleApproveRefund(refund.id)}
                              disabled={isLoading}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectRefund(refund.id, "Invalid reason")}
                              disabled={isLoading}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Complete financial transaction log</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {financialData.transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'commission' ? 'bg-success/10' :
                        transaction.type === 'refund' ? 'bg-destructive/10' :
                        'bg-primary/10'
                      }`}>
                        {transaction.type === 'commission' ? (
                          <Calculator className="h-5 w-5 text-success" />
                        ) : transaction.type === 'refund' ? (
                          <ArrowDownRight className="h-5 w-5 text-destructive" />
                        ) : (
                          <DollarSign className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{transaction.description}</h4>
                        <p className="text-sm text-muted-foreground">{transaction.vendor}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${transaction.amount < 0 ? 'text-destructive' : 'text-success'}`}>
                        {formatCurrency(transaction.amount)}
                      </p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Process Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>Process commission payment to vendor</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Vendor</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="V001">Mama Asha's Kitchen</SelectItem>
                    <SelectItem value="V002">Adunni Beauty</SelectItem>
                    <SelectItem value="V003">Kente Collections</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Amount</label>
                <Input placeholder="Enter amount" type="number" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Payment Method</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea placeholder="Add payment notes..." />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowPaymentDialog(false);
                toast({
                  title: "Payment Processed",
                  description: "Payment has been processed successfully.",
                });
              }}>
                <CreditCard className="h-4 w-4 mr-2" />
                Process Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

