import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Truck,
  Clock,
  CheckCircle,
  Package,
  AlertTriangle,
  RefreshCw,
  Search,
  Mail,
  Phone,
  MapPin,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-client";
import { Pagination } from "@/components/ui/pagination";

const SHIPMENT_STATUS_CONFIG = {
  PENDING: { label: "Pending", variant: "outline" as const, icon: Clock },
  CONFIRMED: { label: "Confirmed", variant: "secondary" as const, icon: CheckCircle },
  PROCESSING: { label: "Processing", variant: "secondary" as const, icon: Package },
  SHIPPED: { label: "Shipped", variant: "default" as const, icon: Truck },
  DELIVERED: { label: "Delivered", variant: "default" as const, icon: CheckCircle },
  CANCELLED: { label: "Cancelled", variant: "destructive" as const, icon: AlertTriangle },
  REFUNDED: { label: "Refunded", variant: "destructive" as const, icon: AlertTriangle },
} as const;

type ShipmentStatus = keyof typeof SHIPMENT_STATUS_CONFIG;

const ORDER_STATUS_SEQUENCE: ShipmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

const formatCurrency = (amount: number | null | undefined, currency = "GBP") =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount ?? 0));

const formatStatusLabel = (status?: string | null) => {
  if (!status) return "Pending";
  return status
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const parseShippingAddress = (address: unknown) => {
  if (!address) return null;
  let parsedAddress = address;

  if (typeof address === "string") {
    try {
      parsedAddress = JSON.parse(address);
    } catch (error) {
      console.warn("Unable to parse shipping address", error);
      return null;
    }
  }

  if (typeof parsedAddress !== "object" || parsedAddress === null || Array.isArray(parsedAddress)) {
    return null;
  }

  const record = parsedAddress as Record<string, unknown>;
  const getString = (value: unknown) =>
    typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;

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

type NormalizedAddress = ReturnType<typeof parseShippingAddress>;

interface ApiOrderProductCategory {
  commissionRate?: number | null | string;
  name?: string;
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
  status?: ShipmentStatus | null;
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  totalAmount?: number | string | null;
  shippingCost?: number | string | null;
  shippingAddress?: unknown;
  notes?: string | null;
  orderItems?: ApiOrderItem[] | null;
  customer?: ApiOrderCustomer | null;
}

type NormalizedShipment = {
  id: string;
  orderNumber: string;
  status: ShipmentStatus;
  paymentStatus: string;
  createdAtISO: string | null;
  createdAtFormatted: string;
  updatedAtISO: string | null;
  updatedAtFormatted: string;
  totalAmountValue: number;
  totalAmountFormatted: string;
  shippingCostValue: number;
  shippingCostFormatted: string;
  shippingMethod: string;
  shippingAddress: NormalizedAddress;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  destination: string;
  notes?: string | null;
  itemsCount: number;
};

const resolveShippingMethod = (
  status: ShipmentStatus,
  shippingCost: number,
  notes: string | null,
) => {
  if (shippingCost > 0) {
    return "Checkout shipping";
  }

  const statusMap: Record<ShipmentStatus, string> = {
    PENDING: "Awaiting pickup scheduling",
    CONFIRMED: "Awaiting pickup scheduling",
    PROCESSING: "Packing in progress",
    SHIPPED: "In transit (vendor courier)",
    DELIVERED: "Delivered by vendor",
    CANCELLED: "Shipment cancelled",
    REFUNDED: "Shipment refunded",
  };

  if (status in statusMap) {
    return statusMap[status];
  }

  if (notes?.toLowerCase().includes("vendor")) {
    return "Vendor handled";
  }

  return "Vendor arranged";
};

const normalizeShipment = (order: ApiOrder): NormalizedShipment => {
  const shippingAddress = parseShippingAddress(order.shippingAddress);
  const totalAmount = Number(order.totalAmount ?? 0);
  const shippingCost = Number(order.shippingCost ?? 0);
  const notes = order.notes ?? null;

  const status = (order.status ?? "PENDING") as ShipmentStatus;
  const shippingMethod = resolveShippingMethod(status, shippingCost, notes);

  const destination = shippingAddress
    ? [shippingAddress.city, shippingAddress.country].filter(Boolean).join(", ") || "Unknown"
    : "Unknown";

  const createdAtFormatted = order.createdAt
    ? format(new Date(order.createdAt), "dd MMM yyyy")
    : "—";
  const updatedAtFormatted = order.updatedAt
    ? format(new Date(order.updatedAt), "dd MMM yyyy")
    : createdAtFormatted;

  const customerName =
    [order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(" ").trim() ||
    order.customer?.email ||
    shippingAddress?.name ||
    "Customer";

  const itemsCount = (order.orderItems ?? []).reduce(
    (sum, item) => sum + Number(item.quantity ?? 0),
    0
  );

  return {
    id: order.id,
    orderNumber: order.orderNumber || order.id,
    status,
    paymentStatus: order.paymentStatus ?? "PENDING",
    createdAtISO: order.createdAt ?? null,
    createdAtFormatted,
    updatedAtISO: order.updatedAt ?? null,
    updatedAtFormatted,
    totalAmountValue: totalAmount,
    totalAmountFormatted: formatCurrency(totalAmount),
    shippingCostValue: shippingCost,
    shippingCostFormatted: shippingCost > 0 ? formatCurrency(shippingCost) : "Vendor handled",
    shippingMethod,
    shippingAddress,
    customerName,
    customerEmail: order.customer?.email || shippingAddress?.email || "Not provided",
    customerPhone: shippingAddress?.phone ?? null,
    destination,
    notes: notes ?? undefined,
    itemsCount,
  };
};

const getNextStatus = (status: ShipmentStatus): ShipmentStatus | null => {
  const index = ORDER_STATUS_SEQUENCE.indexOf(status);
  if (index === -1 || index === ORDER_STATUS_SEQUENCE.length - 1) {
    return null;
  }
  return ORDER_STATUS_SEQUENCE[index + 1];
};

export function VendorShipping() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedShipment, setSelectedShipment] = useState<NormalizedShipment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["vendor-shipping"],
    queryFn: async () => {
      const response = await apiFetch<{
        success: boolean;
        data: { orders: ApiOrder[]; pagination: { total: number } };
        message?: string;
      }>("/orders?limit=100");

      if (!response.success) {
        throw new Error(response.message || "Failed to load shipping data");
      }

      return response.data;
    },
  });

  const shipments = useMemo(
    () => (data?.orders ?? []).map(normalizeShipment),
    [data?.orders],
  );

  const stats = useMemo(() => {
    const total = shipments.length;
    const awaitingDispatch = shipments.filter((shipment) =>
      ["PENDING", "CONFIRMED", "PROCESSING"].includes(shipment.status),
    ).length;
    const inTransit = shipments.filter((shipment) => shipment.status === "SHIPPED").length;
    const delivered = shipments.filter((shipment) => shipment.status === "DELIVERED").length;
    const issues = shipments.filter((shipment) =>
      ["CANCELLED", "REFUNDED"].includes(shipment.status),
    ).length;
    const totalShippingCost = shipments.reduce(
      (sum, shipment) => sum + shipment.shippingCostValue,
      0,
    );
    const averageShippingCost = total > 0 ? totalShippingCost / total : 0;
    const vendorHandled = shipments.filter((shipment) => shipment.shippingMethod === "Vendor handled")
      .length;

    return {
      total,
      awaitingDispatch,
      inTransit,
      delivered,
      issues,
      averageShippingCost,
      vendorHandled,
    };
  }, [shipments]);

  const methodBreakdown = useMemo(() => {
    const counts = shipments.reduce<Record<string, number>>((accumulator, shipment) => {
      accumulator[shipment.shippingMethod] = (accumulator[shipment.shippingMethod] ?? 0) + 1;
      return accumulator;
    }, {});

    const entries = Object.entries(counts)
      .map(([method, count]) => ({
        method,
        count,
        percentage: stats.total > 0 ? (count / stats.total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    if (entries.length === 0) {
      entries.push({ method: "Vendor handled", count: 0, percentage: 0 });
    }

    return entries;
  }, [shipments, stats.total]);

  const topDestinations = useMemo(() => {
    const counts = shipments.reduce<Record<string, number>>((accumulator, shipment) => {
      accumulator[shipment.destination] = (accumulator[shipment.destination] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts)
      .map(([destination, count]) => ({ destination, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [shipments]);

  const filteredShipments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return shipments.filter((shipment) => {
      const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;
      const matchesSearch =
        !term ||
        shipment.orderNumber.toLowerCase().includes(term) ||
        shipment.customerName.toLowerCase().includes(term) ||
        shipment.destination.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [shipments, searchTerm, statusFilter]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredShipments.length / itemsPerPage));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [filteredShipments.length, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredShipments.length / itemsPerPage));
  const paginatedShipments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredShipments.slice(start, start + itemsPerPage);
  }, [filteredShipments, currentPage, itemsPerPage]);

  const updateStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: ShipmentStatus }) => {
      const response = await apiFetch<{ success: boolean; message?: string }>(
        `/orders/${orderId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to update shipment status");
      }
    },
    onSuccess: (_data, variables) => {
      toast({
        title: "Shipment updated",
        description: `Order ${variables.orderId} is now ${formatStatusLabel(variables.status)}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["vendor-shipping"] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to update shipment status";
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Shipping data refreshed",
      description: "Latest shipments pulled from the server.",
    });
  };

  const openDetails = (shipment: NormalizedShipment) => {
    setSelectedShipment(shipment);
    setIsDetailOpen(true);
  };

  const closeDetails = () => {
    setIsDetailOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shipping Management</h1>
          <p className="text-muted-foreground">
            Track fulfilment progress and manage customer deliveries
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isFetching}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Refreshing…" : "Refresh data"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total shipments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Orders that require fulfilment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Awaiting dispatch</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.awaitingDispatch}</div>
            <p className="text-xs text-muted-foreground">Pending, confirmed or processing orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">In transit</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.inTransit}</div>
            <p className="text-xs text-muted-foreground">Marked as shipped</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">Completed deliveries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.issues}</div>
            <p className="text-xs text-muted-foreground">Cancelled or refunded orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average shipping cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {formatCurrency(stats.averageShippingCost)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.vendorHandled} shipments handled directly by you
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Shipping methods</CardTitle>
            <CardDescription>Breakdown of how orders are dispatched</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {methodBreakdown.map((entry) => (
              <div key={entry.method} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{entry.method}</span>
                  <span className="text-muted-foreground">
                    {entry.count} shipments · {entry.percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${entry.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            {stats.total === 0 && (
              <p className="text-sm text-muted-foreground">
                No shipments yet. Orders will appear here once customers start purchasing.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top destinations</CardTitle>
            <CardDescription>Where your recent orders are heading</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topDestinations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Destinations will appear once orders are placed.</p>
            ) : (
              topDestinations.map((entry) => (
                <div
                  key={entry.destination}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
                >
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{entry.destination}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{entry.count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipments</CardTitle>
          <CardDescription>Find orders by customer, destination, or status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by order number, customer, or destination…"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {Object.entries(SHIPMENT_STATUS_CONFIG).map(([status, config]) => (
                  <SelectItem key={status} value={status}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isFetching && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Syncing latest data…
            </div>
          )}
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground">Loading shipments…</div>
          ) : filteredShipments.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              No shipments match your filters yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedShipments.map((shipment) => {
                    const config = SHIPMENT_STATUS_CONFIG[shipment.status] ?? SHIPMENT_STATUS_CONFIG.PENDING;
                    const Icon = config.icon;
                    const nextStatus = getNextStatus(shipment.status);

                    return (
                      <TableRow key={shipment.id}>
                        <TableCell className="font-medium">{shipment.orderNumber}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">{shipment.customerName}</p>
                            <p className="text-xs text-muted-foreground">{shipment.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-foreground">{shipment.destination}</p>
                          <p className="text-xs text-muted-foreground">
                            {shipment.itemsCount} {shipment.itemsCount === 1 ? "item" : "items"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge variant={config.variant} className="flex items-center space-x-1">
                            <Icon className="h-3 w-3" />
                            <span>{config.label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-foreground">{formatStatusLabel(shipment.paymentStatus)}</p>
                          <p className="text-xs text-muted-foreground">{shipment.shippingCostFormatted}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium text-foreground">{shipment.totalAmountFormatted}</p>
                          <p className="text-xs text-muted-foreground">{shipment.shippingMethod}</p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {shipment.updatedAtFormatted}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {nextStatus && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateStatus.mutate({
                                    orderId: shipment.id,
                                    status: nextStatus,
                                  })
                                }
                                disabled={updateStatus.isPending}
                              >
                                {updateStatus.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  `Mark ${formatStatusLabel(nextStatus)}`
                                )}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => openDetails(shipment)}
                            >
                              View
                            </Button>
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
            totalItems={filteredShipments.length}
            itemsPerPage={itemsPerPage}
          />
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={closeDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Shipping details</DialogTitle>
            <DialogDescription>
              Full shipping information for order {selectedShipment?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-foreground">
                      Order summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <Badge variant={SHIPMENT_STATUS_CONFIG[selectedShipment.status].variant}>
                        {SHIPMENT_STATUS_CONFIG[selectedShipment.status].label}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Placed on</span>
                      <span className="text-foreground">{selectedShipment.createdAtFormatted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last updated</span>
                      <span className="text-foreground">{selectedShipment.updatedAtFormatted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Items</span>
                      <span className="text-foreground">{selectedShipment.itemsCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total</span>
                      <span className="text-foreground font-medium">
                        {selectedShipment.totalAmountFormatted}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-foreground">
                      Customer contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <div>
                      <p className="text-foreground font-medium">{selectedShipment.customerName}</p>
                      <p>{selectedShipment.customerEmail}</p>
                    </div>
                    {selectedShipment.customerPhone ? (
                      <p>{selectedShipment.customerPhone}</p>
                    ) : (
                      <p className="italic">No phone number provided.</p>
                    )}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => (window.location.href = `mailto:${selectedShipment.customerEmail}`)}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </Button>
                      {selectedShipment.customerPhone && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => (window.location.href = `tel:${selectedShipment.customerPhone}`)}
                        >
                          <Phone className="mr-2 h-4 w-4" />
                          Call
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-foreground">
                    Delivery address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {selectedShipment.shippingAddress ? (
                    <>
                      {selectedShipment.shippingAddress.name && (
                        <p className="text-foreground">{selectedShipment.shippingAddress.name}</p>
                      )}
                      {selectedShipment.shippingAddress.street && (
                        <p>{selectedShipment.shippingAddress.street}</p>
                      )}
                      {selectedShipment.shippingAddress.apartment && (
                        <p>{selectedShipment.shippingAddress.apartment}</p>
                      )}
                      {(selectedShipment.shippingAddress.city ||
                        selectedShipment.shippingAddress.state) && (
                        <p>
                          {[selectedShipment.shippingAddress.city, selectedShipment.shippingAddress.state]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                      {(selectedShipment.shippingAddress.postalCode ||
                        selectedShipment.shippingAddress.country) && (
                        <p>
                          {[selectedShipment.shippingAddress.postalCode, selectedShipment.shippingAddress.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                      {selectedShipment.shippingAddress.instructions && (
                        <div className="rounded-lg bg-muted/30 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Delivery instructions
                          </p>
                          <p className="text-sm text-foreground">
                            {selectedShipment.shippingAddress.instructions}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p>No shipping address provided.</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Shipping is arranged directly with the customer once the order is confirmed.
                  </p>
                </CardContent>
              </Card>

              {selectedShipment.notes && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-foreground">
                      Order notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {selectedShipment.notes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VendorShipping;
