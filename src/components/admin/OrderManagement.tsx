import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  Mail,
  Phone,
  MapPin,
  Package,
  Truck,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";

const orderData = [
  {
    id: "ORD001",
    customer: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+44 20 7123 4567",
    vendor: "Mama Asha's Kitchen",
    products: [
      { name: "Jollof Rice Spice Mix", quantity: 2, price: "£12.99" },
      { name: "Plantain Chips", quantity: 1, price: "£8.50" }
    ],
    total: "£34.48",
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    orderDate: "2024-01-20",
    deliveryDate: "2024-01-22",
    deliveryAddress: {
      streetAddress: "123 High Street",
      apartment: "Apt 4B",
      city: "London",
      state: "Greater London",
      postcode: "SW1A 1AA",
      country: "United Kingdom",
      phone: "+44 20 7123 4567",
      email: "sarah.j@email.com",
      deliveryInstructions: "Leave with neighbor if not home"
    },
    trackingNumber: "TRK123456789"
  },
  {
    id: "ORD002",
    customer: "Michael Chen",
    email: "m.chen@email.com",
    phone: "+44 161 456 7890",
    vendor: "Adunni Beauty",
    products: [
      { name: "Shea Butter Hair Care Set", quantity: 1, price: "£24.99" }
    ],
    total: "£24.99",
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "PayPal",
    orderDate: "2024-01-21",
    deliveryDate: null,
    deliveryAddress: {
      streetAddress: "456 Oxford Road",
      city: "Manchester",
      state: "Greater Manchester",
      postcode: "M1 7ED",
      country: "United Kingdom",
      phone: "+44 161 456 7890",
      email: "m.chen@email.com"
    },
    trackingNumber: null
  },
  {
    id: "ORD003",
    customer: "Emma Wilson",
    email: "emma.w@email.com",
    phone: "+44 121 789 0123",
    vendor: "Kente Collections",
    products: [
      { name: "Traditional Kente Cloth Scarf", quantity: 1, price: "£89.99" }
    ],
    total: "£89.99",
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "Apple Pay",
    orderDate: "2024-01-19",
    deliveryDate: null,
    deliveryAddress: {
      streetAddress: "789 New Street",
      city: "Birmingham",
      state: "West Midlands",
      postcode: "B1 1AA",
      country: "United Kingdom",
      phone: "+44 121 789 0123",
      email: "emma.w@email.com"
    },
    trackingNumber: null
  },
  {
    id: "ORD004",
    customer: "David Brown",
    email: "d.brown@email.com",
    phone: "+44 113 234 5678",
    vendor: "Afro Herbs Ltd",
    products: [
      { name: "Moringa Leaf Powder", quantity: 3, price: "£18.50" }
    ],
    total: "£55.50",
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    orderDate: "2024-01-18",
    deliveryDate: "2024-01-25",
    deliveryAddress: {
      streetAddress: "321 Park Lane",
      city: "Leeds",
      state: "West Yorkshire",
      postcode: "LS1 1AA",
      country: "United Kingdom",
      phone: "+44 113 234 5678",
      email: "d.brown@email.com"
    },
    trackingNumber: "TRK987654321"
  }
];

const orderStats = [
  {
    title: "Total Orders",
    value: "1,247",
    change: "+12.5%",
    trend: "up",
    icon: Package
  },
  {
    title: "Revenue",
    value: "£45,890",
    change: "+8.2%",
    trend: "up",
    icon: DollarSign
  },
  {
    title: "Pending Orders",
    value: "34",
    change: "-5.1%",
    trend: "down",
    icon: Clock
  },
  {
    title: "Refunds",
    value: "12",
    change: "+2.3%",
    trend: "up",
    icon: AlertTriangle
  }
];

export function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-success text-success-foreground">Delivered</Badge>;
      case "shipped":
        return <Badge className="bg-primary text-primary-foreground">Shipped</Badge>;
      case "processing":
        return <Badge className="bg-warning text-warning-foreground">Processing</Badge>;
      case "cancelled":
        return <Badge className="bg-destructive text-destructive-foreground">Cancelled</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success text-success-foreground">Paid</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      case "refunded":
        return <Badge className="bg-destructive text-destructive-foreground">Refunded</Badge>;
      case "failed":
        return <Badge variant="outline">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleProcessRefund = async (orderId: string) => {
    setIsLoading(orderId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Refund Processed",
        description: `Refund has been processed for order ${orderId}`,
      });
    } catch (error) {
      toast({
        title: "Refund Failed",
        description: "Failed to process refund. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setIsLoading(orderId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Order Cancelled",
        description: `Order ${orderId} has been cancelled successfully`,
      });
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleContactCustomer = async (orderId: string, method: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Contact Initiated",
        description: `Contacting customer for order ${orderId} via ${method}`,
      });
    } catch (error) {
      toast({
        title: "Contact Failed",
        description: "Failed to initiate contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleContactVendor = async (orderId: string, method: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Vendor Contact Initiated",
        description: `Contacting vendor for order ${orderId} via ${method}`,
      });
    } catch (error) {
      toast({
        title: "Contact Failed",
        description: "Failed to contact vendor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsDelivered = async (orderId: string) => {
    setIsLoading(orderId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Order Delivered",
        description: `Order ${orderId} has been marked as delivered`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to mark order as delivered. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleResendConfirmation = async (orderId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Confirmation Sent",
        description: `Order confirmation has been resent for order ${orderId}`,
      });
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to resend confirmation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewAnalytics = () => {
    toast({
      title: "Analytics",
      description: "Redirecting to order analytics dashboard...",
    });
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setIsLoading(orderId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Status Updated",
        description: `Order ${orderId} status updated to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleExportOrders = async () => {
    setIsExporting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Orders Exported",
        description: "Order data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const filteredOrders = orderData.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground">Track and manage customer orders</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportOrders}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-primary to-dashboard-accent"
            onClick={handleViewAnalytics}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {orderStats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center space-x-1">
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-success' : 'text-destructive'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Search and Filters */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders by ID, customer, or vendor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Manage and track customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer}</div>
                          <div className="text-sm text-muted-foreground">{order.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{order.vendor}</TableCell>
                      <TableCell className="font-medium">{order.total}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {/* Contact Customer */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleContactCustomer(order.id, "email")}
                            title="Email Customer"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleContactCustomer(order.id, "phone")}
                            title="Call Customer"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          
                          {/* Contact Vendor */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleContactVendor(order.id, "email")}
                            title="Email Vendor"
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                          
                          {/* Status-specific actions */}
                          {order.status === "processing" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, "shipped")}
                              disabled={isLoading === order.id}
                              title="Mark as Shipped"
                            >
                              <Truck className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {order.status === "shipped" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsDelivered(order.id)}
                              disabled={isLoading === order.id}
                              title="Mark as Delivered"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Refund and Cancel actions */}
                          {order.paymentStatus === "paid" && order.status !== "cancelled" && order.status !== "delivered" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleProcessRefund(order.id)}
                              disabled={isLoading === order.id}
                              title="Process Refund"
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {order.status !== "cancelled" && order.status !== "delivered" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={isLoading === order.id}
                              title="Cancel Order"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Resend confirmation for processing orders */}
                          {order.status === "processing" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResendConfirmation(order.id)}
                              title="Resend Confirmation"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={filteredOrders.length}
                itemsPerPage={itemsPerPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Order Details - {selectedOrder.id}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedOrder.customer}</div>
                    <div><strong>Email:</strong> {selectedOrder.email}</div>
                    <div><strong>Phone:</strong> {selectedOrder.phone}</div>
                    <div><strong>Address:</strong></div>
                    <div className="ml-4 space-y-1">
                      <div>{selectedOrder.deliveryAddress.streetAddress}</div>
                      {selectedOrder.deliveryAddress.apartment && (
                        <div>{selectedOrder.deliveryAddress.apartment}</div>
                      )}
                      <div>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state}</div>
                      <div>{selectedOrder.deliveryAddress.postcode}</div>
                      <div>{selectedOrder.deliveryAddress.country}</div>
                      {selectedOrder.deliveryAddress.deliveryInstructions && (
                        <div><strong>Instructions:</strong> {selectedOrder.deliveryAddress.deliveryInstructions}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Order Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Vendor:</strong> {selectedOrder.vendor}</div>
                    <div><strong>Order Date:</strong> {selectedOrder.orderDate}</div>
                    <div><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</div>
                    <div><strong>Tracking:</strong> {selectedOrder.trackingNumber || "Not available"}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Products</h3>
                <div className="space-y-2">
                  {selectedOrder.products.map((product: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">Qty: {product.quantity}</div>
                      </div>
                      <div className="font-medium">{product.price}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-lg">{selectedOrder.total}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {/* Contact Actions */}
                <Button 
                  variant="outline" 
                  onClick={() => handleContactCustomer(selectedOrder.id, "email")}
                  size="sm"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Customer
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => handleContactCustomer(selectedOrder.id, "phone")}
                  size="sm"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Customer
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => handleContactVendor(selectedOrder.id, "email")}
                  size="sm"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Email Vendor
                </Button>
                
                {/* Status-specific actions */}
                {selectedOrder.status === "processing" && (
                  <Button 
                    onClick={() => handleUpdateStatus(selectedOrder.id, "shipped")}
                    disabled={isLoading === selectedOrder.id}
                    size="sm"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Mark as Shipped
                  </Button>
                )}
                
                {selectedOrder.status === "shipped" && (
                  <Button 
                    onClick={() => handleMarkAsDelivered(selectedOrder.id)}
                    disabled={isLoading === selectedOrder.id}
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Delivered
                  </Button>
                )}
                
                {selectedOrder.status === "processing" && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleResendConfirmation(selectedOrder.id)}
                    size="sm"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Confirmation
                  </Button>
                )}
                
                {/* Refund and Cancel actions */}
                {selectedOrder.paymentStatus === "paid" && selectedOrder.status !== "cancelled" && selectedOrder.status !== "delivered" && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleProcessRefund(selectedOrder.id)}
                    disabled={isLoading === selectedOrder.id}
                    size="sm"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Process Refund
                  </Button>
                )}
                
                {selectedOrder.status !== "cancelled" && selectedOrder.status !== "delivered" && (
                  <Button 
                    variant="destructive" 
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    disabled={isLoading === selectedOrder.id}
                    size="sm"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedOrder(null)}
                  size="sm"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
}
