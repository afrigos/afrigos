import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  Mail,
  Phone,
  Package,
  Truck,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Edit,
  Star,
  Save,
  X,
  Calendar,
  User,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { format } from "date-fns";
import { Pagination } from "@/components/ui/pagination";

const ORDER_STATUS_CONFIG = {
  PENDING: { label: "Pending", color: "bg-blue-100 text-blue-800", icon: Clock },
  CONFIRMED: { label: "Confirmed", color: "bg-yellow-100 text-yellow-800", icon: CheckCircle },
  PROCESSING: { label: "Processing", color: "bg-orange-100 text-orange-800", icon: Package },
  SHIPPED: { label: "Shipped", color: "bg-indigo-100 text-indigo-800", icon: Truck },
  DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
  REFUNDED: { label: "Refunded", color: "bg-purple-100 text-purple-800", icon: AlertTriangle },
} as const;

const ORDER_STATUSES = Object.entries(ORDER_STATUS_CONFIG).map(([value, meta]) => ({
  value,
  label: meta.label,
  color: meta.color,
  icon: meta.icon,
}));
// Base selectable statuses for vendors (excludes PENDING, CONFIRMED which are payment-controlled)
const BASE_SELECTABLE_VENDOR_STATUSES = ORDER_STATUSES.filter(
  (s) => s.value !== "PENDING" && s.value !== "CONFIRMED" && s.value !== "REFUNDED" && s.value !== "CANCELLED"
);

// Get selectable statuses based on current order status
const getSelectableStatusesForOrder = (currentStatus: string) => {
  // If order is DELIVERED, only REFUNDED is allowed
  if (currentStatus === "DELIVERED") {
    return ORDER_STATUSES.filter((s) => s.value === "REFUNDED");
  }
  
  // If order is REFUNDED, no status changes allowed
  if (currentStatus === "REFUNDED") {
    return [];
  }
  
  // If order is SHIPPED, can go to DELIVERED or REFUNDED
  if (currentStatus === "SHIPPED") {
    return ORDER_STATUSES.filter(
      (s) => s.value === "DELIVERED" || s.value === "REFUNDED"
    );
  }
  
  // If order is PROCESSING, can go to SHIPPED, DELIVERED, or REFUNDED
  if (currentStatus === "PROCESSING") {
    return ORDER_STATUSES.filter(
      (s) => s.value === "SHIPPED" || s.value === "DELIVERED" || s.value === "REFUNDED"
    );
  }
  
  // For CONFIRMED status (from payment), vendors can start with PROCESSING
  if (currentStatus === "CONFIRMED") {
    return ORDER_STATUSES.filter(
      (s) => s.value === "PROCESSING" || s.value === "SHIPPED" || s.value === "DELIVERED" || s.value === "REFUNDED"
    );
  }
  
  // Default: return base selectable statuses + REFUNDED (refunds can happen at any stage)
  return BASE_SELECTABLE_VENDOR_STATUSES.concat(
    ORDER_STATUSES.filter((s) => s.value === "REFUNDED")
  );
};

const formatStatusLabel = (status?: string | null) => {
  if (!status) return "Pending";
  return status
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatCurrency = (amount: number | null | undefined, currency: string = "GBP") =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount ?? 0));

const parseShippingAddress = (address: unknown) => {
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
    postalCode: getString(record.postalCode) ?? getString(record.zip) ?? getString(record.postcode),
    country: getString(record.country),
    phone: getString(record.phone),
    email: getString(record.email),
    instructions: getString(record.deliveryInstructions) ?? getString(record.instructions),
  };
};

type NormalizedAddress = ReturnType<typeof parseShippingAddress>;

type VendorOrderItem = {
  name: string;
  quantity: number;
  total: number;
  priceEach: number;
  totalFormatted: string;
  priceEachFormatted: string;
  commissionPercent: number;
  commissionAmount: number;
  commissionFormatted: string;
};

type VendorOrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAtISO?: string | null;
  createdAtFormatted: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  items: VendorOrderItem[];
  subtotalValue: number;
  subtotalFormatted: string;
  totalValue: number;
  totalFormatted: string;
  shippingCostValue: number;
  shippingCostFormatted: string;
  commissionValue: number;
  commissionFormatted: string;
  effectiveCommissionPercent: number;
  netAmountValue: number;
  netAmountFormatted: string;
  shippingAddress: NormalizedAddress;
  notes?: string | null;
};

type OrderReviewItem = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  product: {
    id: string;
    name: string;
    image?: string | null;
  };
  customer: {
    id: string;
    name: string;
    email?: string | null;
  };
};

type OrderReviewResponse = {
  success: boolean;
  data: {
    orderId: string;
    orderNumber?: string | null;
    reviews: OrderReviewItem[];
    pendingProducts: Array<{
      productId: string;
      name: string;
      image?: string | null;
    }>;
  };
};

const DEFAULT_COMMISSION_PERCENT = 10;

interface ApiOrderProductCategory {
  commissionRate?: number | null | string;
  name?: string;
  id?: string;
}

interface ApiOrderProduct {
  name?: string;
  commissionRate?: number | null | string;
  category?: ApiOrderProductCategory | null;
}

interface ApiOrderItem {
  total?: number | string;
  price?: number | string;
  quantity?: number;
  product?: ApiOrderProduct | null;
}

interface ApiOrderCustomer {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}

interface ApiOrder {
  id: string;
  orderNumber?: string | null;
  status?: string | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  createdAt?: string | null;
  totalAmount?: number | string | null;
  shippingCost?: number | string | null;
  shippingAddress?: unknown;
  notes?: string | null;
  orderItems?: ApiOrderItem[] | null;
  customer?: ApiOrderCustomer | null;
}

const normalizeOrder = (order: ApiOrder): VendorOrderRow => {
  const shippingAddress = parseShippingAddress(order.shippingAddress);
  const totalAmount = Number(order.totalAmount ?? 0);
  const shippingCost = Number(order.shippingCost ?? 0);
  const subtotal = Math.max(totalAmount - shippingCost, 0);
  let commissionTotal = 0;

  const items: VendorOrderItem[] = (order.orderItems ?? []).map((item) => {
    const total = Number(item.total ?? 0);
    const priceEach = Number(item.price ?? 0);
    const productRatePercent =
      item.product?.commissionRate !== undefined && item.product?.commissionRate !== null
        ? Number(item.product?.commissionRate)
        : null;
    const categoryRatePercent =
      item.product?.category?.commissionRate !== undefined &&
      item.product?.category?.commissionRate !== null
        ? Number(item.product?.category?.commissionRate)
        : null;
    const appliedPercent =
      productRatePercent ?? categoryRatePercent ?? DEFAULT_COMMISSION_PERCENT;
    const commissionAmount = total * (appliedPercent / 100);
    commissionTotal += commissionAmount;

    return {
      name: item.product?.name || "Product",
      quantity: item.quantity || 0,
      total,
      priceEach,
      totalFormatted: formatCurrency(total),
      priceEachFormatted: formatCurrency(priceEach),
      commissionPercent: appliedPercent,
      commissionAmount,
      commissionFormatted: formatCurrency(commissionAmount),
    };
  });

  const effectiveCommissionPercent =
    subtotal > 0 ? (commissionTotal / subtotal) * 100 : 0;
  const netAmount = totalAmount - commissionTotal;

  const customerName = [order.customer?.firstName, order.customer?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim() || order.customer?.email || "Customer";

  return {
    id: order.id,
    orderNumber: order.orderNumber || order.id,
    status: order.status || "PENDING",
    paymentStatus: order.paymentStatus || "PENDING",
    paymentMethod: order.paymentMethod || "Not specified",
    createdAtISO: order.createdAt,
    createdAtFormatted: order.createdAt ? format(new Date(order.createdAt), "dd MMM yyyy") : "—",
    customerName,
    customerEmail: order.customer?.email || shippingAddress?.email || "Not provided",
    customerPhone: shippingAddress?.phone || null,
    items,
    subtotalValue: subtotal,
    subtotalFormatted: formatCurrency(subtotal),
    totalValue: totalAmount,
    totalFormatted: formatCurrency(totalAmount),
    shippingCostValue: shippingCost,
    shippingCostFormatted: shippingCost > 0 ? formatCurrency(shippingCost) : "Vendor handled",
    commissionValue: commissionTotal,
    commissionFormatted: formatCurrency(commissionTotal),
    effectiveCommissionPercent,
    netAmountValue: netAmount,
    netAmountFormatted: formatCurrency(netAmount),
    shippingAddress,
    notes: order.notes ?? null,
  };
};

export function VendorOrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<VendorOrderRow | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [orderDetailId, setOrderDetailId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["vendor-orders"],
    queryFn: async () => {
      const response = await apiFetch<{
        success: boolean;
        data: { orders: ApiOrder[]; pagination: { total: number } };
        message?: string;
      }>("/orders?limit=100");

      if (!response.success) {
        throw new Error(response.message || "Failed to load vendor orders");
      }

      return response.data;
    },
  });

  const orders = useMemo(() => (data?.orders ?? []).map(normalizeOrder), [data]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !term ||
        order.orderNumber.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term);

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
  }, [orders, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const revenue = orders
      .filter((order) => order.paymentStatus === "COMPLETED")
      .reduce((sum, order) => sum + order.totalValue, 0);
    const inProgress = orders.filter((order) =>
      ["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status)
    ).length;
    const delivered = orders.filter((order) => order.status === "DELIVERED").length;
    const commission = orders.reduce((sum, order) => sum + order.commissionValue, 0);

    return {
      totalOrders,
      revenue,
      inProgress,
      delivered,
      commission,
    };
  }, [orders]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [filteredOrders.length, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const updateStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await apiFetch<{ success: boolean; data: ApiOrder; message?: string }>(
        `/orders/${orderId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to update order status");
      }

      return response.data;
    },
    onSuccess: (_data, variables) => {
    toast({
      title: "Status Updated",
        description: `Order ${variables.orderId} updated to ${formatStatusLabel(variables.status)}`,
    });
    setEditingOrder(null);
    setEditingStatus("");
      queryClient.invalidateQueries({ queryKey: ["vendor-orders"] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to update order status";
      toast({
        title: "Update Failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleStatusEdit = (orderId: string, currentStatus: string) => {
    setEditingOrder(orderId);
    setEditingStatus(currentStatus);
  };

  const handleStatusUpdate = (orderId: string) => {
    if (!editingStatus) {
      toast({
        title: "Select Status",
        description: "Choose a status before saving.",
        variant: "destructive",
      });
      return;
    }

    updateStatus.mutate({ orderId, status: editingStatus });
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setEditingStatus("");
  };

  const handleViewOrderDetail = (order: VendorOrderRow) => {
    setSelectedOrder(order);
    setOrderDetailId(order.id);
    setIsOrderDetailOpen(true);
  };

  const isUpdatingStatus = updateStatus.isPending;

  const {
    data: orderReviewData,
    isLoading: isLoadingOrderReviews,
    isFetching: isFetchingOrderReviews,
    error: orderReviewError,
  } = useQuery({
    queryKey: ["vendor-order-reviews", orderDetailId],
    queryFn: async () => {
      if (!orderDetailId) {
        throw new Error("Order not specified");
      }
      const response = await apiFetch<{ success: boolean; data: OrderReviewResponse['data']; message?: string }>(`/reviews/order/${orderDetailId}`);
      if (!response.success) {
        throw new Error(response.message || "Failed to load order reviews");
      }
      return response.data;
    },
    enabled: !!orderDetailId,
    staleTime: 30_000,
  });

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
        }`}
      />
    ));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground">Manage and track your customer orders</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            <Download className="h-4 w-4 mr-2" />
            Export Orders
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">All orders received</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenue)}</div>
            <p className="text-xs text-muted-foreground">Payments marked as completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Pending fulfilment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">Completed deliveries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.commission)}</div>
            <p className="text-xs text-muted-foreground">Aggregate commission retained</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders by customer or order number..."
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
          {isFetching && (
            <p className="mt-2 text-xs text-muted-foreground">Refreshing orders…</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Status Guide</CardTitle>
          <CardDescription>Understanding the order workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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

      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          <CardDescription>Manage your customer orders and update their status</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground">Loading orders…</div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              No orders match your filters yet.
            </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                    <TableHead>Order #</TableHead>
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
                  {paginatedOrders.map((order) => {
                    const statusInfo = ORDER_STATUSES.find((s) => s.value === order.status);
                    const StatusIcon = statusInfo?.icon ?? Clock;
                  
                  return (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div>
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="text-sm">
                              <p>{item.quantity}× {item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Commission: {item.commissionPercent.toFixed(2)}% ({item.commissionFormatted})
                              </p>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                            <p className="font-medium">{order.totalFormatted}</p>
                            <p className="text-sm text-muted-foreground">
                              Net: {order.netAmountFormatted}
                            </p>
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
                                {getSelectableStatusesForOrder(order.status).map((status) => (
                                  <SelectItem key={status.value} value={status.value}>
                                    {status.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                                onClick={() => handleStatusUpdate(order.id)}
                                disabled={isUpdatingStatus}
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                              <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                              <Badge className={statusInfo?.color ?? "bg-muted text-foreground"}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                                {formatStatusLabel(order.status)}
                            </Badge>
                            {order.status !== 'REFUNDED' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                  onClick={() => handleStatusEdit(order.id, order.status)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                        <TableCell>{order.createdAtFormatted}</TableCell>
                      <TableCell>
                          <span className="text-green-600 font-medium">{order.commissionFormatted}</span>
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => (window.location.href = `mailto:${order.customerEmail}`)}
                            >
                            <Mail className="h-3 w-3" />
                          </Button>
                            {order.customerPhone && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => (window.location.href = `tel:${order.customerPhone}`)}
                              >
                                <Phone className="h-3 w-3" />
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredOrders.length}
            itemsPerPage={itemsPerPage}
          />
        </CardContent>
      </Card>

      <Dialog
        open={isOrderDetailOpen}
        onOpenChange={(open) => {
          setIsOrderDetailOpen(open);
          if (!open) {
            setOrderDetailId(null);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5" />
              <span>Order Details - {selectedOrder?.orderNumber}</span>
            </DialogTitle>
            <DialogDescription>Complete order information and customer details</DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>
                        <strong>Order ID:</strong> {selectedOrder.orderNumber}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        <strong>Order Date:</strong> {selectedOrder.createdAtFormatted}
                      </span>
                    </div>
                      <div className="flex items-center space-x-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                      <span>
                        <strong>Shipping:</strong> {selectedOrder.shippingCostFormatted}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span>
                        <strong>Payment Status:</strong> {formatStatusLabel(selectedOrder.paymentStatus)}
                      </span>
                    </div>
                      <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span>
                        <strong>Payment Method:</strong> {selectedOrder.paymentMethod}
                      </span>
                      </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>
                        <strong>Name:</strong> {selectedOrder.customerName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>
                        <strong>Email:</strong> {selectedOrder.customerEmail}
                      </span>
                    </div>
                    {selectedOrder.customerPhone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>
                          <strong>Phone:</strong> {selectedOrder.customerPhone}
                        </span>
                    </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Delivery Address</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedOrder.shippingAddress ? (
                    <div className="space-y-2 text-sm">
                      {selectedOrder.shippingAddress.name && <p>{selectedOrder.shippingAddress.name}</p>}
                      {selectedOrder.shippingAddress.street && <p>{selectedOrder.shippingAddress.street}</p>}
                      {selectedOrder.shippingAddress.apartment && <p>{selectedOrder.shippingAddress.apartment}</p>}
                      {(selectedOrder.shippingAddress.city || selectedOrder.shippingAddress.state) && (
                        <p>
                          {[selectedOrder.shippingAddress.city, selectedOrder.shippingAddress.state]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                      {(selectedOrder.shippingAddress.postalCode || selectedOrder.shippingAddress.country) && (
                        <p>
                          {[selectedOrder.shippingAddress.postalCode, selectedOrder.shippingAddress.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                      {selectedOrder.shippingAddress.instructions && (
                      <div className="mt-3 p-3 bg-muted/20 rounded-lg">
                        <p className="text-sm font-medium">Delivery Instructions:</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedOrder.shippingAddress.instructions}
                          </p>
                      </div>
                    )}
                  </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No shipping address available.</p>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground">
                    Shipping is arranged directly with the vendor after the order is confirmed.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Quantity: {item.quantity}</p>
                            <p>Commission Rate: {item.commissionPercent.toFixed(2)}%</p>
                            <p>Commission: {item.commissionFormatted}</p>
                        </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.totalFormatted}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.priceEachFormatted} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">{selectedOrder.subtotalFormatted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Shipping:</span>
                      <span className="font-medium">{selectedOrder.shippingCostFormatted}</span>
                    </div>
                    <div className="flex items-center justify-between text-green-600">
                      <span>
                        Platform Commission ({selectedOrder.effectiveCommissionPercent.toFixed(2)}%)
                      </span>
                      <span className="font-medium">-{selectedOrder.commissionFormatted}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between font-bold text-lg">
                        <span>Net Amount:</span>
                        <span>{selectedOrder.netAmountFormatted}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.notes || 'No additional notes for this order.'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                    {(() => {
                    const statusInfo = ORDER_STATUSES.find((s) => s.value === selectedOrder.status);
                    const StatusIcon = statusInfo?.icon ?? Clock;
                      return (
                      <div className="flex items-center space-x-3">
                        <Badge className={statusInfo?.color ?? "bg-muted text-foreground"}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                          {formatStatusLabel(selectedOrder.status)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                          Current status: {formatStatusLabel(selectedOrder.status)}
                          </span>
                      </div>
                      );
                    })()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Feedback</CardTitle>
                  <CardDescription>
                    Ratings and comments submitted by the customer for this order.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingOrderReviews || isFetchingOrderReviews ? (
                    <div className="flex items-center justify-center py-6 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Loading reviews…</span>
                  </div>
                  ) : orderReviewError ? (
                    <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
                      {(orderReviewError as Error).message ?? "Unable to load reviews for this order."}
                    </div>
                  ) : orderReviewData && orderReviewData.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {orderReviewData.reviews.map((review) => (
                        <div key={review.id} className="rounded-lg border border-muted/40 p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {review.product.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {review.customer.name} • {format(new Date(review.createdAt), "dd MMM yyyy")}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="mt-3 text-sm text-muted-foreground">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No reviews have been submitted for this order yet.
                    </p>
                  )}

                  {orderReviewData && orderReviewData.pendingProducts.length > 0 && (
                    <div className="rounded-md bg-muted/20 p-3 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-2">Awaiting Feedback</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {orderReviewData.pendingProducts.map((product) => (
                          <li key={product.productId}>{product.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
