import { useEffect, useMemo, useState } from "react";
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
  Package,
  Truck,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Pagination } from "@/components/ui/pagination";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { format } from "date-fns";

type StatusFilter = "all" | "pending" | "processing" | "shipped" | "delivered" | "cancelled";

type OrderStatusCounts = Array<{ status: string; _count: { _all: number } }>;
type PaymentStatusCounts = Array<{ paymentStatus: string; _count: { _all: number } }>;

type NormalizedAddress = {
  name?: string;
  street?: string;
  apartment?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  instructions?: string;
};

type NormalizedOrderItem = {
  name: string;
  quantity: number;
  priceFormatted: string;
};

type AdminOrderItemApi = {
  quantity: number;
  price: unknown;
  total: unknown;
  product: { name?: string | null } | null;
};

type AdminOrderApi = {
  id: string;
  orderNumber?: string | null;
  status: string;
  paymentStatus: string;
  totalAmount: unknown;
  paymentMethod?: string | null;
  createdAt: string;
  vendor?: { businessName?: string | null } | null;
  customer?: { firstName?: string | null; lastName?: string | null; email?: string | null } | null;
  orderItems: AdminOrderItemApi[];
  shippingAddress?: unknown;
  trackingNumber?: string | null;
};

type OrdersResponse = {
  orders: AdminOrderApi[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

type OrderMetricsResponse = {
  overview: {
    totalOrders: number;
    totalRevenue: unknown;
  };
  orderStatusCounts?: OrderStatusCounts;
  paymentStatusCounts?: PaymentStatusCounts;
};

type AdminOrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  vendorName: string;
  totalFormatted: string;
  totalValue: number;
  statusRaw: string;
  status: string;
  paymentStatusRaw: string;
  paymentStatus: string;
  orderDateISO: string;
  orderDateFormatted: string;
  paymentMethod: string | null;
  shippingAddress: NormalizedAddress | null;
  items: NormalizedOrderItem[];
  trackingNumber?: string | null;
};

const statusQueryMap: Record<Exclude<StatusFilter, "all">, string> = {
  pending: "PENDING",
  processing: "PROCESSING",
  shipped: "SHIPPED",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
};

const tabStatuses: StatusFilter[] = ["all", "processing", "shipped", "delivered", "cancelled"];

const normalizeNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  if (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof (value as { toNumber?: () => number }).toNumber === "function"
  ) {
    return (value as { toNumber: () => number }).toNumber();
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return 0;
};

const formatCurrency = (value: unknown) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(normalizeNumber(value));

const formatNumber = (value: unknown) =>
  new Intl.NumberFormat("en-GB").format(Math.max(0, Math.floor(normalizeNumber(value))));

const formatStatusLabel = (status: string) =>
  status
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const toStatusKey = (value: string | null | undefined) => (value ?? "").toLowerCase();

const parseShippingAddress = (address: unknown): NormalizedAddress | null => {
  if (!address) return null;
  let parsed: unknown = address;

  if (typeof address === "string") {
    try {
      parsed = JSON.parse(address);
    } catch (error) {
      console.warn("Unable to parse shipping address", error);
      return null;
    }
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return null;
  }

  const record = parsed as Record<string, unknown>;
  const getString = (value: unknown) =>
    typeof value === "string" && value.trim().length > 0 ? value : undefined;

  return {
    name: getString(record.fullName) ?? getString(record.name),
    street: getString(record.street) ?? getString(record.address1) ?? getString(record.address),
    apartment: getString(record.apartment) ?? getString(record.address2),
    city: getString(record.city),
    state: getString(record.state) ?? getString(record.region),
    postalCode:
      getString(record.postalCode) ?? getString(record.zip) ?? getString(record.postcode),
    country: getString(record.country),
    phone: getString(record.phone),
    email: getString(record.email),
    instructions:
      getString(record.deliveryInstructions) ?? getString(record.instructions),
  };
};

const createOrderRow = (order: AdminOrderApi): AdminOrderRow => {
  const customerName = [order.customer?.firstName, order.customer?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim() || order.customer?.email || "Customer";

  const shippingAddress = parseShippingAddress(order.shippingAddress);

  const items: NormalizedOrderItem[] = (order.orderItems ?? []).map((item) => ({
    name: item.product?.name || "Product",
    quantity: item.quantity || 0,
    priceFormatted: formatCurrency(
      item.total ?? normalizeNumber(item.price) * (item.quantity || 0)
    ),
  }));

  return {
    id: order.id,
    orderNumber: order.orderNumber || order.id,
    customerName,
    customerEmail: order.customer?.email || shippingAddress?.email || "Not provided",
    customerPhone: shippingAddress?.phone || null,
    vendorName: order.vendor?.businessName || "Unknown vendor",
    totalFormatted: formatCurrency(order.totalAmount),
    totalValue: normalizeNumber(order.totalAmount),
    statusRaw: order.status || "PENDING",
    status: toStatusKey(order.status || "PENDING"),
    paymentStatusRaw: order.paymentStatus || "PENDING",
    paymentStatus: toStatusKey(order.paymentStatus || "PENDING"),
    orderDateISO: order.createdAt,
    orderDateFormatted: order.createdAt ? format(new Date(order.createdAt), "dd MMM yyyy") : "—",
    paymentMethod: order.paymentMethod || null,
    shippingAddress,
    items,
    trackingNumber: order.trackingNumber || null,
  };
};

const fetchAdminOrders = async (
  page: number,
  statusFilter: StatusFilter,
  limit: number
): Promise<OrdersResponse> => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  if (statusFilter !== "all") {
    params.set("status", statusQueryMap[statusFilter]);
  }

  const response = await apiFetch<{
    success: boolean;
    data: OrdersResponse;
  }>(`/orders?${params.toString()}`);

  if (!response.success || !response.data) {
    throw new Error("Failed to load orders");
  }

  return response.data;
};

const fetchOrderMetrics = async (): Promise<OrderMetricsResponse> => {
  const response = await apiFetch<{
    success: boolean;
    data: OrderMetricsResponse;
  }>("/admin/dashboard");

  if (!response.success || !response.data) {
    throw new Error("Failed to load dashboard metrics");
  }

  return response.data;
};

export function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [tabValue, setTabValue] = useState<StatusFilter>("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderRow | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const {
    data: ordersData,
    isLoading: loadingOrders,
    isFetching: fetchingOrders,
  } = useQuery<OrdersResponse>({
    queryKey: ["admin-orders", currentPage, statusFilter, itemsPerPage],
    queryFn: () => fetchAdminOrders(currentPage, statusFilter, itemsPerPage),
  });

  const { data: metricsData } = useQuery<OrderMetricsResponse>({
    queryKey: ["admin-order-metrics"],
    queryFn: fetchOrderMetrics,
    staleTime: 60000,
  });

  const normalizedOrders = useMemo(
    () => (ordersData?.orders ?? []).map(createOrderRow),
    [ordersData]
  );

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return normalizedOrders;

    return normalizedOrders.filter((order) =>
      [order.orderNumber, order.customerName, order.vendorName]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [normalizedOrders, searchTerm]);

  const displayedOrders = filteredOrders;

  const pagination = ordersData?.pagination ?? {
    page: currentPage,
    limit: itemsPerPage,
    total: displayedOrders.length,
    pages: Math.max(1, Math.ceil(displayedOrders.length / itemsPerPage)),
  };

  const totalPages = pagination.pages || 1;
  const totalItems = pagination.total ?? displayedOrders.length;
  const itemsPerPageValue = pagination.limit ?? itemsPerPage;

  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {};
    (metricsData?.orderStatusCounts ?? []).forEach((entry) => {
      map[entry.status] = entry._count._all;
    });
    return map;
  }, [metricsData]);

  const paymentCounts = useMemo(() => {
    const map: Record<string, number> = {};
    (metricsData?.paymentStatusCounts ?? []).forEach((entry) => {
      map[entry.paymentStatus] = entry._count._all;
    });
    return map;
  }, [metricsData]);

  const orderStats = useMemo(
    () => [
  {
    title: "Total Orders",
        value: formatNumber(metricsData?.overview.totalOrders ?? totalItems),
        description: "All recorded orders",
        icon: Package,
  },
  {
    title: "Revenue",
        value: formatCurrency(metricsData?.overview.totalRevenue ?? 0),
        description: "Completed payments",
        icon: DollarSign,
  },
  {
    title: "Pending Orders",
        value: formatNumber(statusCounts["PENDING"] ?? 0),
        description: "Awaiting vendor action",
        icon: Clock,
      },
      {
        title: "Refunded Orders",
        value: formatNumber(paymentCounts["REFUNDED"] ?? 0),
        description: "Orders refunded to customers",
        icon: AlertTriangle,
      },
    ],
    [metricsData, statusCounts, paymentCounts, totalItems]
  );

  const handleTabChange = (value: string) => {
    const newValue = (value as StatusFilter) ?? "all";
    setTabValue(newValue);
    setStatusFilter(newValue);
  };

  const handleStatusSelect = (value: string) => {
    const newValue = (value as StatusFilter) ?? "all";
    setStatusFilter(newValue);
    if (tabStatuses.includes(newValue)) {
      setTabValue(newValue);
    } else {
      setTabValue("all");
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleProcessRefund = async (orderId: string) => {
    setActionLoadingId(orderId);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
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
      setActionLoadingId(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setActionLoadingId(orderId);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
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
      setActionLoadingId(null);
    }
  };

  const handleContactCustomer = async (orderId: string, method: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
    setActionLoadingId(orderId);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
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
      setActionLoadingId(null);
    }
  };

  const handleResendConfirmation = async (orderId: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
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

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setActionLoadingId(orderId);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast({
        title: "Status Updated",
        description: `Order ${orderId} status updated to ${formatStatusLabel(newStatus)}`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExportOrders = async () => {
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
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

  const handleViewAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
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

  const getStatusBadge = (status: string) => {
    const normalized = toStatusKey(status);
    switch (normalized) {
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
        return <Badge variant="secondary">{formatStatusLabel(status)}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const normalized = toStatusKey(status);
    switch (normalized) {
      case "completed":
      case "paid":
        return <Badge className="bg-success text-success-foreground">{formatStatusLabel(status)}</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      case "refunded":
        return <Badge className="bg-destructive text-destructive-foreground">Refunded</Badge>;
      case "failed":
        return <Badge variant="outline">Failed</Badge>;
      default:
        return <Badge variant="secondary">{formatStatusLabel(status)}</Badge>;
    }
  };

  const renderOrdersSection = () => (
    <>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                  placeholder="Search orders by number, customer, or vendor..."
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
                onChange={(e) => handleStatusSelect(e.target.value)}
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
          {fetchingOrders && (
            <p className="mt-4 text-sm text-muted-foreground">Refreshing orders…</p>
          )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
          <CardTitle>Orders</CardTitle>
              <CardDescription>Manage and track customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                <TableHead>Order #</TableHead>
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
              {loadingOrders && displayedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading orders...
                  </TableCell>
                </TableRow>
              ) : displayedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    No orders found{searchTerm ? " for this search." : "."}
                  </TableCell>
                </TableRow>
              ) : (
                displayedOrders.map((order) => (
                    <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                        </div>
                      </TableCell>
                    <TableCell>{order.vendorName}</TableCell>
                    <TableCell className="font-medium">{order.totalFormatted}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                    <TableCell>{order.orderDateFormatted}</TableCell>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleContactVendor(order.id, "email")}
                            title="Email Vendor"
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                          {order.status === "processing" && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, "SHIPPED")}
                              disabled={actionLoadingId === order.id}
                              title="Mark as Shipped"
                            >
                              <Truck className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResendConfirmation(order.id)}
                              title="Resend Confirmation"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                          {order.status === "shipped" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsDelivered(order.id)}
                            disabled={actionLoadingId === order.id}
                              title="Mark as Delivered"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        {order.paymentStatus === "completed" &&
                          order.status !== "cancelled" &&
                          order.status !== "delivered" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleProcessRefund(order.id)}
                              disabled={actionLoadingId === order.id}
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
                            disabled={actionLoadingId === order.id}
                              title="Cancel Order"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                ))
              )}
                </TableBody>
              </Table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPageValue}
              />
            </CardContent>
          </Card>
    </>
  );

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
            disabled={isLoadingAnalytics}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {isLoadingAnalytics ? "Loading..." : "View Analytics"}
          </Button>
        </div>
      </div>

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
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tabValue} onValueChange={handleTabChange} className="space-y-6">
        <TabsList>
          {tabStatuses.map((value) => (
            <TabsTrigger key={value} value={value}>
              {value === "all" ? "All Orders" : formatStatusLabel(value)}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabStatuses.map((value) => (
          <TabsContent key={value} value={value} className="space-y-6">
            {renderOrdersSection()}
        </TabsContent>
        ))}
      </Tabs>

        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Order Details - {selectedOrder.orderNumber}</h2>
              <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {selectedOrder.customerName}</div>
                  <div><strong>Email:</strong> {selectedOrder.customerEmail}</div>
                  <div><strong>Phone:</strong> {selectedOrder.customerPhone ?? "Not provided"}</div>
                    <div><strong>Address:</strong></div>
                  <div className="ml-4 space-y-1 text-muted-foreground">
                    {selectedOrder.shippingAddress ? (
                      <>
                        {selectedOrder.shippingAddress.street && <div>{selectedOrder.shippingAddress.street}</div>}
                        {selectedOrder.shippingAddress.apartment && <div>{selectedOrder.shippingAddress.apartment}</div>}
                        {(selectedOrder.shippingAddress.city || selectedOrder.shippingAddress.state) && (
                          <div>
                            {[selectedOrder.shippingAddress.city, selectedOrder.shippingAddress.state]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        )}
                        {(selectedOrder.shippingAddress.postalCode || selectedOrder.shippingAddress.country) && (
                          <div>
                            {[selectedOrder.shippingAddress.postalCode, selectedOrder.shippingAddress.country]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        )}
                        {selectedOrder.shippingAddress.instructions && (
                          <div><strong>Instructions:</strong> {selectedOrder.shippingAddress.instructions}</div>
                        )}
                      </>
                    ) : (
                      <div>No shipping address on file.</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Order Information</h3>
                  <div className="space-y-2 text-sm">
                  <div><strong>Status:</strong> {formatStatusLabel(selectedOrder.statusRaw)}</div>
                  <div><strong>Payment Status:</strong> {formatStatusLabel(selectedOrder.paymentStatusRaw)}</div>
                  <div><strong>Vendor:</strong> {selectedOrder.vendorName}</div>
                  <div><strong>Order Date:</strong> {selectedOrder.orderDateFormatted}</div>
                  <div><strong>Payment Method:</strong> {selectedOrder.paymentMethod ?? "Not specified"}</div>
                    <div><strong>Tracking:</strong> {selectedOrder.trackingNumber || "Not available"}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Products</h3>
                <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                      </div>
                    <div className="font-medium">{item.priceFormatted}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="font-bold">Total:</span>
                <span className="font-bold text-lg">{selectedOrder.totalFormatted}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
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
                {selectedOrder.status === "processing" && (
                <>
                  <Button 
                    onClick={() => handleUpdateStatus(selectedOrder.id, "SHIPPED")}
                    disabled={actionLoadingId === selectedOrder.id}
                    size="sm"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Mark as Shipped
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleResendConfirmation(selectedOrder.id)}
                    size="sm"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Confirmation
                  </Button>
                </>
              )}
                {selectedOrder.status === "shipped" && (
                  <Button 
                    onClick={() => handleMarkAsDelivered(selectedOrder.id)}
                  disabled={actionLoadingId === selectedOrder.id}
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Delivered
                  </Button>
                )}
              {selectedOrder.paymentStatus === "completed" &&
                selectedOrder.status !== "cancelled" &&
                selectedOrder.status !== "delivered" && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleProcessRefund(selectedOrder.id)}
                    disabled={actionLoadingId === selectedOrder.id}
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
                  disabled={actionLoadingId === selectedOrder.id}
                    size="sm"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
              <Button variant="outline" onClick={() => setSelectedOrder(null)} size="sm">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
