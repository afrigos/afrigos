import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { 
  RefreshCw,
  DollarSign,
  ShoppingCart,
  Users,
  Repeat,
  Target,
  Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

type Numeric = number | string | null | undefined;

interface VendorReportsOverview {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  totalCustomers: number;
  repeatCustomerRate: number;
  averageOrderValue: number;
  shippingCostTotal: number;
  pendingOrdersValue: number;
  commissionTotal: number;
  netRevenue: number;
  grossEarnings: number;
}

interface VendorReportsRevenuePoint {
  date: string;
  revenue: number;
  orders: number;
}

interface VendorReportsStatusBreakdown {
  status: string;
  count: number;
  revenue: number;
}

interface VendorReportsTopProduct {
  id: string;
  name: string;
  revenue: number;
  orders: number;
  price: number;
  category: string | null;
}

interface VendorReportsCustomer {
  id: string;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
}

interface VendorReportsOrder {
  id: string;
  orderNumber: string;
  status: string | null;
  paymentStatus: string | null;
  createdAt: string;
  totalAmount: number;
  customerName: string;
}

interface VendorReportsResponse {
  success: boolean;
  message?: string;
  data?: {
    period: string;
    generatedAt: string;
    overview: VendorReportsOverview;
    revenueTrend: VendorReportsRevenuePoint[];
    statusBreakdown: VendorReportsStatusBreakdown[];
    topProducts: VendorReportsTopProduct[];
    topCustomers: VendorReportsCustomer[];
    recentOrders: VendorReportsOrder[];
  };
}

const periodOptions = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last 12 months" },
];

const formatCurrency = (value: Numeric) => {
  const numeric = Number(value ?? 0);
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(numeric) ? numeric : 0);
};

const formatPercent = (value: Numeric) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return "0%";
  return `${numeric.toFixed(1)}%`;
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

const fetchVendorReports = async (period: string) => {
  const response = await apiFetch<VendorReportsResponse>(`/analytics/vendor/reports?period=${period}`);
  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to fetch vendor reports");
  }
  return response.data;
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export function VendorReports() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [period, setPeriod] = useState("30d");
  const [ordersPage, setOrdersPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const itemsPerPage = 5;

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vendor-reports", period],
    queryFn: () => fetchVendorReports(period),
    enabled: !!user?.vendorId,
    refetchInterval: 120000,
  });

  useEffect(() => {
    setOrdersPage(1);
    setProductsPage(1);
  }, [period]);

  useEffect(() => {
    const maxOrdersPage = Math.max(1, Math.ceil((data?.recentOrders.length ?? 0) / itemsPerPage));
    if (ordersPage > maxOrdersPage) setOrdersPage(maxOrdersPage);
  }, [data?.recentOrders.length, ordersPage]);

  useEffect(() => {
    const maxProductsPage = Math.max(1, Math.ceil((data?.topProducts.length ?? 0) / itemsPerPage));
    if (productsPage > maxProductsPage) setProductsPage(maxProductsPage);
  }, [data?.topProducts.length, productsPage]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading vendor reports…</CardTitle>
          <CardDescription>Verifying your account details.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!user?.vendorId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendor reports unavailable</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We couldn’t find an active vendor profile for this account. Please contact support if this
            is unexpected.
          </p>
        </CardContent>
      </Card>
    );
  }

  const overview = data?.overview;
  const revenueTrend = data?.revenueTrend ?? [];
  const statusBreakdown = data?.statusBreakdown ?? [];
  const topProducts = data?.topProducts ?? [];
  const topCustomers = data?.topCustomers ?? [];
  const recentOrders = data?.recentOrders ?? [];

  const paginatedOrders = useMemo(() => {
    const start = (ordersPage - 1) * itemsPerPage;
    return recentOrders.slice(start, start + itemsPerPage);
  }, [recentOrders, ordersPage]);

  const paginatedProducts = useMemo(() => {
    const start = (productsPage - 1) * itemsPerPage;
    return topProducts.slice(start, start + itemsPerPage);
  }, [topProducts, productsPage]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Business Reports</h1>
          <p className="text-muted-foreground">
            Track revenue, orders, and customer behaviour across your store.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={() => {
              refetch();
              toast({
                title: "Reports refreshed",
                description: "Latest performance data retrieved successfully.",
              });
            }}
            disabled={isFetching}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Refreshing…" : "Refresh"}
                </Button>
        </div>
      </div>

      {isError ? (
        <Card>
          <CardHeader>
            <CardTitle>Unable to load reports</CardTitle>
            <CardDescription>{error instanceof Error ? error.message : "Please try again later."}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      ) : null}

      {isLoading && !data ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading reports…</CardTitle>
            <CardDescription>Gathering the latest metrics for your store.</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {overview && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(overview.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Net after commission: {formatCurrency(overview.netRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold text-foreground">{overview.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Completed: {overview.completedOrders}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold text-foreground">{overview.totalCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Repeat className="h-3 w-3 text-muted-foreground" />
                Repeat rate: {formatPercent(overview.repeatCustomerRate)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average order value</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatCurrency(overview.averageOrderValue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Shipping collected: {formatCurrency(overview.shippingCostTotal)}
            </p>
          </CardContent>
        </Card>
      </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <CardDescription>Daily revenue for the selected period</CardDescription>
              </CardHeader>
          <CardContent className="space-y-3">
            {revenueTrend.length === 0 ? (
              <p className="text-sm text-muted-foreground">No completed orders recorded for this period.</p>
            ) : (
              revenueTrend.slice(-12).map((point) => (
                <div
                  key={point.date}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/10 px-3 py-2"
                >
                      <div>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(point.date).toLocaleDateString("en-GB", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {point.orders} {point.orders === 1 ? "order" : "orders"}
                    </p>
                      </div>
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(point.revenue)}
                        </p>
                      </div>
              ))
            )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
            <CardTitle>Status breakdown</CardTitle>
            <CardDescription>Volume and completed revenue by order status</CardDescription>
              </CardHeader>
          <CardContent className="space-y-3">
            {statusBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders found for this period.</p>
            ) : (
              statusBreakdown.map((status) => (
                <div
                  key={status.status}
                  className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2"
                >
                        <div>
                    <p className="text-sm font-medium text-foreground">
                      {formatStatusLabel(status.status)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {status.count} {status.count === 1 ? "order" : "orders"}
                        </p>
                      </div>
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(status.revenue)}
                        </p>
                      </div>
              ))
            )}
              </CardContent>
            </Card>
                        </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>The latest orders placed during this period</CardDescription>
              </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders have been placed yet.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {paginatedOrders.map((order) => (
                        <TableRow key={order.id}>
                        <TableCell>
                            <div className="font-medium text-foreground">{order.orderNumber}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDateTime(order.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-foreground">{order.customerName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {formatStatusLabel(order.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {formatStatusLabel(order.paymentStatus)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm font-semibold text-foreground">
                            {formatCurrency(order.totalAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                      </div>
                <Pagination
                  currentPage={ordersPage}
                  totalPages={Math.max(1, Math.ceil(recentOrders.length / itemsPerPage))}
                  onPageChange={setOrdersPage}
                  totalItems={recentOrders.length}
                  itemsPerPage={itemsPerPage}
                  className="px-0"
                />
              </>
            )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
            <CardTitle>Top products</CardTitle>
            <CardDescription>Products generating the most revenue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No product performance data available for this period.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Units</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                      {paginatedProducts.map((product) => (
                        <TableRow key={product.id}>
                      <TableCell>
                            <div className="font-medium text-foreground">{product.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {product.category ?? "Uncategorised"}
                        </div>
                      </TableCell>
                          <TableCell className="text-right text-sm font-medium text-foreground">
                            {product.orders}
                          </TableCell>
                          <TableCell className="text-right text-sm font-semibold text-foreground">
                            {formatCurrency(product.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                      </div>
                <Pagination
                  currentPage={productsPage}
                  totalPages={Math.max(1, Math.ceil(topProducts.length / itemsPerPage))}
                  onPageChange={setProductsPage}
                  totalItems={topProducts.length}
                  itemsPerPage={itemsPerPage}
                  className="px-0"
                />
              </>
            )}
              </CardContent>
            </Card>
                      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
            <CardTitle>Top customers</CardTitle>
            <CardDescription>Loyal customers and their total spend</CardDescription>
              </CardHeader>
          <CardContent className="space-y-3">
            {topCustomers.length === 0 ? (
              <p className="text-sm text-muted-foreground">You haven't recorded any customer purchases yet.</p>
            ) : (
              topCustomers.slice(0, 6).map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{customer.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {customer.email}
                    </p>
                      </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(customer.totalSpent)}
                    </p>
                        <p className="text-xs text-muted-foreground">
                      {customer.orders} {customer.orders === 1 ? "order" : "orders"}
                        </p>
                    </div>
                </div>
              ))
            )}
              </CardContent>
            </Card>

        {overview && (
            <Card>
              <CardHeader>
              <CardTitle>Financial summary</CardTitle>
              <CardDescription>Commission, shipping, and pending order value</CardDescription>
              </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-dashed p-4">
                <p className="text-xs uppercase text-muted-foreground">Gross earnings</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {formatCurrency(overview.grossEarnings)}
                </p>
                    </div>
              <div className="rounded-lg border border-dashed p-4">
                <p className="text-xs uppercase text-muted-foreground">Commission retained</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {formatCurrency(overview.commissionTotal)}
                </p>
                  </div>
              <div className="rounded-lg border border-dashed p-4">
                <p className="text-xs uppercase text-muted-foreground">Net revenue</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {formatCurrency(overview.netRevenue)}
                </p>
                    </div>
              <div className="rounded-lg border border-dashed p-4">
                <p className="text-xs uppercase text-muted-foreground">Undelivered order value</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {formatCurrency(overview.pendingOrdersValue)}
                </p>
                </div>
              </CardContent>
            </Card>
        )}
                  </div>
    </div>
  );
}

export default VendorReports;

