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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DollarSign,
  Edit,
  Save,
  X,
  Calendar,
  User,
  ShoppingCart
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Standardized order statuses
const ORDER_STATUSES = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800', icon: Clock },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-yellow-100 text-yellow-800', icon: CheckCircle },
  { value: 'processing', label: 'Processing', color: 'bg-orange-100 text-orange-800', icon: Package },
  { value: 'ready_for_handover', label: 'Ready for Handover', color: 'bg-purple-100 text-purple-800', icon: Truck },
  { value: 'in_transit', label: 'In Transit', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle }
];

// Mock vendor order data
const vendorOrderData = [
  {
    id: "ORD001",
    customer: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+44 20 7123 4567",
    products: [
      { name: "Jollof Rice Spice Mix", quantity: 2, price: "£12.99" },
      { name: "Plantain Chips", quantity: 1, price: "£8.50" }
    ],
    total: "£34.48",
    status: "processing",
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
    trackingNumber: "TRK123456789",
    commission: "£5.17",
    netAmount: "£29.31"
  },
  {
    id: "ORD002",
    customer: "Michael Chen",
    email: "m.chen@email.com",
    phone: "+44 161 456 7890",
    products: [
      { name: "Shea Butter Hair Care Set", quantity: 1, price: "£24.99" }
    ],
    total: "£24.99",
    status: "confirmed",
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
    trackingNumber: null,
    commission: "£3.75",
    netAmount: "£21.24"
  },
  {
    id: "ORD003",
    customer: "Emma Wilson",
    email: "emma.w@email.com",
    phone: "+44 121 789 0123",
    products: [
      { name: "Traditional Kente Cloth Scarf", quantity: 1, price: "£89.99" }
    ],
    total: "£89.99",
    status: "ready_for_handover",
    paymentStatus: "paid",
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
    trackingNumber: null,
    commission: "£13.50",
    netAmount: "£76.49"
  },
  {
    id: "ORD004",
    customer: "David Brown",
    email: "d.brown@email.com",
    phone: "+44 113 234 5678",
    products: [
      { name: "Moringa Leaf Powder", quantity: 3, price: "£18.50" }
    ],
    total: "£55.50",
    status: "new",
    paymentStatus: "paid",
    paymentMethod: "Bank Transfer",
    orderDate: "2024-01-22",
    deliveryDate: null,
    deliveryAddress: {
      streetAddress: "321 Park Lane",
      city: "Leeds",
      state: "West Yorkshire",
      postcode: "LS1 1AA",
      country: "United Kingdom",
      phone: "+44 113 234 5678",
      email: "d.brown@email.com"
    },
    trackingNumber: null,
    commission: "£8.33",
    netAmount: "£47.17"
  },
  {
    id: "ORD005",
    customer: "Lisa Thompson",
    email: "lisa.t@email.com",
    phone: "+44 141 567 8901",
    products: [
      { name: "Nigerian Pepper Soup Mix", quantity: 2, price: "£8.99" },
      { name: "Plantain Chips", quantity: 3, price: "£8.50" }
    ],
    total: "£42.98",
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Credit Card",
    orderDate: "2024-01-18",
    deliveryDate: "2024-01-20",
    deliveryAddress: {
      streetAddress: "15 Queen Street",
      city: "Glasgow",
      state: "Scotland",
      postcode: "G1 3DE",
      country: "United Kingdom",
      phone: "+44 141 567 8901",
      email: "lisa.t@email.com"
    },
    trackingNumber: "TRK555666777",
    commission: "£6.45",
    netAmount: "£36.53"
  },
  {
    id: "ORD006",
    customer: "James Wilson",
    email: "james.w@email.com",
    phone: "+44 131 234 5678",
    products: [
      { name: "Shea Butter Hair Care Set", quantity: 1, price: "£24.99" }
    ],
    total: "£24.99",
    status: "in_transit",
    paymentStatus: "paid",
    paymentMethod: "PayPal",
    orderDate: "2024-01-23",
    deliveryDate: null,
    deliveryAddress: {
      streetAddress: "8 Royal Mile",
      city: "Edinburgh",
      state: "Scotland",
      postcode: "EH1 1RE",
      country: "United Kingdom",
      phone: "+44 131 234 5678",
      email: "james.w@email.com",
      deliveryInstructions: "Please call before delivery"
    },
    trackingNumber: "TRK888999000",
    commission: "£3.75",
    netAmount: "£21.24"
  },
  {
    id: "ORD007",
    customer: "Maria Garcia",
    email: "maria.g@email.com",
    phone: "+44 29 876 5432",
    products: [
      { name: "Traditional Kente Cloth Scarf", quantity: 1, price: "£89.99" },
      { name: "Moringa Leaf Powder", quantity: 1, price: "£18.50" }
    ],
    total: "£108.49",
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "Credit Card",
    orderDate: "2024-01-17",
    deliveryDate: null,
    deliveryAddress: {
      streetAddress: "22 Cardiff Bay",
      city: "Cardiff",
      state: "Wales",
      postcode: "CF10 5AL",
      country: "United Kingdom",
      phone: "+44 29 876 5432",
      email: "maria.g@email.com"
    },
    trackingNumber: null,
    commission: "£0.00",
    netAmount: "£0.00"
  }
];

export function VendorOrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const { toast } = useToast();

  const filteredOrders = vendorOrderData.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const displayedOrders = showAllOrders ? vendorOrderData : filteredOrders;

  const getStatusInfo = (status: string) => {
    return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    // In a real app, this would make an API call
    toast({
      title: "Status Updated",
      description: `Order ${orderId} status updated to ${newStatus.replace('_', ' ')}`,
    });
    setEditingOrder(null);
    setEditingStatus("");
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setEditingStatus("");
  };

  const handleViewOrderDetail = (order: any) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  const handleViewAllOrders = () => {
    setShowAllOrders(!showAllOrders);
    setSearchTerm("");
    setStatusFilter("all");
    toast({
      title: showAllOrders ? "Filtered View" : "All Orders View",
      description: showAllOrders ? "Showing filtered orders" : "Showing all orders without filters",
    });
  };

  const formatCurrency = (amount: string) => {
    return amount;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground">Manage and track your customer orders</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Orders
          </Button>
          <Button 
            size="sm"
            onClick={handleViewAllOrders}
            variant={showAllOrders ? "default" : "outline"}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showAllOrders ? "Show Filtered" : "View All Orders"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders by customer name or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Order Status Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Guide</CardTitle>
          <CardDescription>Understanding the order workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {ORDER_STATUSES.map((status) => {
              const Icon = status.icon;
              return (
                <div key={status.value} className="flex items-center space-x-2 p-2 rounded-lg bg-muted/20">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{status.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Orders ({displayedOrders.length})
            {showAllOrders && (
              <Badge variant="secondary" className="ml-2">
                All Orders View
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {showAllOrders 
              ? "Showing all orders without filters" 
              : "Manage your customer orders and update their status"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-sm text-muted-foreground">{order.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {order.products.map((product, index) => (
                            <div key={index} className="text-sm">
                              {product.quantity}x {product.name}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatCurrency(order.total)}</p>
                          <p className="text-sm text-muted-foreground">Net: {formatCurrency(order.netAmount)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {editingOrder === order.id ? (
                          <div className="flex items-center space-x-2">
                            <Select value={editingStatus} onValueChange={setEditingStatus}>
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ORDER_STATUSES.map((status) => (
                                  <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(order.id, editingStatus)}
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingOrder(order.id);
                                setEditingStatus(order.status);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">{formatCurrency(order.commission)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewOrderDetail(order)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-3 w-3" />
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

      {/* Order Detail Dialog */}
      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5" />
              <span>Order Details - {selectedOrder?.id}</span>
            </DialogTitle>
            <DialogDescription>
              Complete order information and customer details
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span><strong>Order ID:</strong> {selectedOrder.id}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span><strong>Order Date:</strong> {selectedOrder.orderDate}</span>
                    </div>
                    {selectedOrder.deliveryDate && (
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span><strong>Delivery Date:</strong> {selectedOrder.deliveryDate}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span><strong>Payment Status:</strong> {selectedOrder.paymentStatus}</span>
                    </div>
                    {selectedOrder.trackingNumber && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span><strong>Tracking:</strong> {selectedOrder.trackingNumber}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span><strong>Name:</strong> {selectedOrder.customer}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span><strong>Email:</strong> {selectedOrder.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span><strong>Phone:</strong> {selectedOrder.phone}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Delivery Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>{selectedOrder.deliveryAddress.streetAddress}</p>
                    {selectedOrder.deliveryAddress.apartment && (
                      <p>{selectedOrder.deliveryAddress.apartment}</p>
                    )}
                    <p>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state}</p>
                    <p>{selectedOrder.deliveryAddress.postcode}</p>
                    <p>{selectedOrder.deliveryAddress.country}</p>
                    {selectedOrder.deliveryAddress.deliveryInstructions && (
                      <div className="mt-3 p-3 bg-muted/20 rounded-lg">
                        <p className="text-sm font-medium">Delivery Instructions:</p>
                        <p className="text-sm text-muted-foreground">{selectedOrder.deliveryAddress.deliveryInstructions}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.products.map((product: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">Quantity: {product.quantity}</p>
                        </div>
                        <p className="font-bold">{product.price}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">{selectedOrder.total}</span>
                    </div>
                    <div className="flex items-center justify-between text-green-600">
                      <span>Platform Commission:</span>
                      <span className="font-medium">-{selectedOrder.commission}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between font-bold text-lg">
                        <span>Net Amount:</span>
                        <span>{selectedOrder.netAmount}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    {(() => {
                      const statusInfo = getStatusInfo(selectedOrder.status);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Current status: {selectedOrder.status.replace('_', ' ')}
                          </span>
                        </>
                      );
                    })()}
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
