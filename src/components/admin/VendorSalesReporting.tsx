import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Download,
  Search,
  Filter,
  Eye,
  BarChart3,
  PieChart,
  Users,
  Package,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  ShoppingCart,
  CreditCard,
  Banknote
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Vendor sales data
const vendorSalesData = [
  {
    vendorId: "V001",
    vendorName: "Mama Asha's Kitchen",
    vendorEmail: "mamaasha@afrigos.com",
    category: "Food & Beverages",
    joinDate: "2023-06-15",
    status: "active",
    totalOrders: 156,
    grossSales: 12450.00,
    netSales: 10582.50,
    platformCommission: 1867.50,
    commissionRate: 15.0,
    avgOrderValue: 79.81,
    lastOrderDate: "2024-01-23",
    growthRate: 23.5,
    topProducts: [
      { name: "Jollof Rice Spice Mix", sales: 2340.00, quantity: 180 },
      { name: "Plantain Chips", sales: 1870.00, quantity: 220 },
      { name: "Nigerian Pepper Soup Mix", sales: 1340.00, quantity: 149 }
    ]
  },
  {
    vendorId: "V002",
    vendorName: "Adunni Beauty",
    vendorEmail: "adunni@afrigos.com",
    category: "Beauty & Personal Care",
    joinDate: "2023-08-22",
    status: "active",
    totalOrders: 89,
    grossSales: 8920.00,
    netSales: 7582.00,
    platformCommission: 1338.00,
    commissionRate: 15.0,
    avgOrderValue: 100.22,
    lastOrderDate: "2024-01-22",
    growthRate: 18.7,
    topProducts: [
      { name: "Shea Butter Hair Care Set", sales: 4722.00, quantity: 189 },
      { name: "Natural Hair Oil", sales: 2340.00, quantity: 156 },
      { name: "African Black Soap", sales: 1858.00, quantity: 124 }
    ]
  },
  {
    vendorId: "V003",
    vendorName: "Kente Collections",
    vendorEmail: "kente@afrigos.com",
    category: "Fashion & Clothing",
    joinDate: "2023-09-10",
    status: "active",
    totalOrders: 234,
    grossSales: 15680.00,
    netSales: 13328.00,
    platformCommission: 2352.00,
    commissionRate: 15.0,
    avgOrderValue: 67.01,
    lastOrderDate: "2024-01-24",
    growthRate: 32.1,
    topProducts: [
      { name: "Traditional Kente Cloth Scarf", sales: 14040.00, quantity: 156 },
      { name: "Ankara Print Dress", sales: 1640.00, quantity: 78 }
    ]
  },
  {
    vendorId: "V004",
    vendorName: "Afro Herbs Ltd",
    vendorEmail: "afroherbs@afrigos.com",
    category: "Health & Wellness",
    joinDate: "2023-07-05",
    status: "active",
    totalOrders: 67,
    grossSales: 6340.00,
    netSales: 5389.00,
    platformCommission: 951.00,
    commissionRate: 15.0,
    avgOrderValue: 94.63,
    lastOrderDate: "2024-01-21",
    growthRate: 12.4,
    topProducts: [
      { name: "Moringa Leaf Powder", sales: 2682.00, quantity: 145 },
      { name: "Neem Leaf Powder", sales: 1890.00, quantity: 126 },
      { name: "Bitter Leaf Extract", sales: 1768.00, quantity: 88 }
    ]
  },
  {
    vendorId: "V005",
    vendorName: "Tech Africa",
    vendorEmail: "techafrica@afrigos.com",
    category: "Electronics & Technology",
    joinDate: "2023-10-15",
    status: "active",
    totalOrders: 45,
    grossSales: 9120.00,
    netSales: 7752.00,
    platformCommission: 1368.00,
    commissionRate: 15.0,
    avgOrderValue: 202.67,
    lastOrderDate: "2024-01-20",
    growthRate: 45.2,
    topProducts: [
      { name: "Premium Wireless Headphones", sales: 4560.00, quantity: 24 },
      { name: "Smartphone Accessories", sales: 4560.00, quantity: 21 }
    ]
  }
];

export function VendorSalesReporting() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isVendorDetailOpen, setIsVendorDetailOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("1m");
  const { toast } = useToast();

  const filteredVendors = vendorSalesData.filter(vendor => {
    const matchesSearch = vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.vendorEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || vendor.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalGrossSales = vendorSalesData.reduce((sum, vendor) => sum + vendor.grossSales, 0);
  const totalNetSales = vendorSalesData.reduce((sum, vendor) => sum + vendor.netSales, 0);
  const totalCommission = vendorSalesData.reduce((sum, vendor) => sum + vendor.platformCommission, 0);
  const totalOrders = vendorSalesData.reduce((sum, vendor) => sum + vendor.totalOrders, 0);

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
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  const handleViewVendorDetail = (vendor: any) => {
    setSelectedVendor(vendor);
    setIsVendorDetailOpen(true);
  };

  const handleExportReport = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Export Successful",
        description: "Vendor sales report has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const categories = Array.from(new Set(vendorSalesData.map(v => v.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendor Sales Reporting</h1>
          <p className="text-muted-foreground">Detailed sales reports for all vendors</p>
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
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gross Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalGrossSales)}</div>
            <p className="text-xs text-muted-foreground">
              Across {vendorSalesData.length} vendors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Net Sales</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalNetSales)}</div>
            <p className="text-xs text-muted-foreground">
              After commission deductions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCommission)}</div>
            <p className="text-xs text-muted-foreground">
              Average {((totalCommission / totalGrossSales) * 100).toFixed(1)}% rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Average {Math.round(totalOrders / vendorSalesData.length)} per vendor
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Sales Summary</CardTitle>
          <CardDescription>Detailed sales performance for each vendor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Gross Sales</TableHead>
                  <TableHead>Net Sales</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Growth</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.vendorId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{vendor.vendorName}</p>
                        <p className="text-sm text-muted-foreground">{vendor.vendorEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{vendor.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <p className="font-medium">{vendor.totalOrders}</p>
                        <p className="text-sm text-muted-foreground">
                          Avg: {formatCurrency(vendor.avgOrderValue)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">
                      {formatCurrency(vendor.grossSales)}
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      {formatCurrency(vendor.netSales)}
                    </TableCell>
                    <TableCell className="font-bold text-blue-600">
                      {formatCurrency(vendor.platformCommission)}
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center ${getGrowthColor(vendor.growthRate)}`}>
                        {getGrowthIcon(vendor.growthRate)}
                        <span className="ml-1">{vendor.growthRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewVendorDetail(vendor)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Detail Dialog */}
      <Dialog open={isVendorDetailOpen} onOpenChange={setIsVendorDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Vendor Sales Details - {selectedVendor?.vendorName}</span>
            </DialogTitle>
            <DialogDescription>
              Comprehensive sales analysis and performance metrics
            </DialogDescription>
          </DialogHeader>
          
          {selectedVendor && (
            <div className="space-y-6">
              {/* Vendor Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Gross Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(selectedVendor.grossSales)}</div>
                    <p className="text-xs text-muted-foreground">Total revenue</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Net Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedVendor.netSales)}</div>
                    <p className="text-xs text-muted-foreground">After commission</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Commission</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(selectedVendor.platformCommission)}</div>
                    <p className="text-xs text-muted-foreground">{selectedVendor.commissionRate}% rate</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedVendor.totalOrders}</div>
                    <p className="text-xs text-muted-foreground">Total orders</p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                  <CardDescription>Best performing products for this vendor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedVendor.topProducts.map((product: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.quantity} units sold</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(product.sales)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(product.sales / product.quantity)} avg price
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
