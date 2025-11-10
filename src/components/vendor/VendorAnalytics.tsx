import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-client";
import { DollarSign, ShoppingCart, Package, Star, RefreshCw, Download } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

type VendorAnalyticsOverview = {
  totalRevenue: unknown;
  totalOrders: number;
  totalProducts: number;
  averageRating: unknown;
};

type VendorAnalyticsOrder = {
  id: string;
  orderNumber?: string | null;
  totalAmount?: unknown;
  status?: string | null;
  paymentStatus?: string | null;
  createdAt: string;
  customer?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  } | null;
};

type VendorAnalyticsProduct = {
  id: string;
  name: string;
  price?: unknown;
  status?: string | null;
  _count?: {
    orderItems?: number | null;
  } | null;
};

type VendorAnalyticsApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    period: string;
    overview: VendorAnalyticsOverview;
    recentOrders: VendorAnalyticsOrder[];
    topProducts: VendorAnalyticsProduct[];
  };
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (value && typeof value === "object" && "toNumber" in value && typeof (value as any).toNumber === "function") {
    return Number((value as any).toNumber());
  }
  return 0;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(amount);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export function VendorAnalytics() {
  const [period, setPeriod] = useState("30d");
  const { toast } = useToast();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["vendor-analytics", period],
    queryFn: async () => {
      const response = await apiFetch<VendorAnalyticsApiResponse>(`/analytics/vendor?period=${period}`);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch analytics");
      }
      return response.data;
    },
    keepPreviousData: true,
  });

  const overview = data?.overview;
  const totalRevenue = toNumber(overview?.totalRevenue);
  const totalOrders = overview?.totalOrders ?? 0;
  const totalProducts = overview?.totalProducts ?? 0;
  const averageRatingRaw = toNumber(overview?.averageRating);
  const averageRating = averageRatingRaw ? Number(averageRatingRaw.toFixed(2)) : 0;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const topProducts = data?.topProducts ?? [];
  const recentOrders = data?.recentOrders ?? [];

  const [ordersPage, setOrdersPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setOrdersPage(1);
    setProductsPage(1);
  }, [period]);

  useEffect(() => {
    setOrdersPage(1);
  }, [recentOrders.length]);

  useEffect(() => {
    setProductsPage(1);
  }, [topProducts.length]);

  const ordersTotalPages = Math.max(1, Math.ceil(recentOrders.length / itemsPerPage));
  const productsTotalPages = Math.max(1, Math.ceil(topProducts.length / itemsPerPage));

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(recentOrders.length / itemsPerPage));
    if (ordersPage > maxPage) {
      setOrdersPage(maxPage);
    }
  }, [recentOrders.length, ordersPage]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(topProducts.length / itemsPerPage));
    if (productsPage > maxPage) {
      setProductsPage(maxPage);
    }
  }, [topProducts.length, productsPage]);

  const paginatedRecentOrders = useMemo(() => {
    const start = (ordersPage - 1) * itemsPerPage;
    return recentOrders.slice(start, start + itemsPerPage);
  }, [recentOrders, ordersPage]);

  const paginatedTopProducts = useMemo(() => {
    const start = (productsPage - 1) * itemsPerPage;
    return topProducts.slice(start, start + itemsPerPage);
  }, [topProducts, productsPage]);

  const handleRefresh = async () => {
    const result = await refetch();
    if (result.error) {
      toast({
        title: "Refresh failed",
        description: result.error.message ?? "Unable to refresh analytics right now.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Analytics updated",
        description: "Latest vendor performance data has been loaded.",
      });
    }
  };

  const handleExport = () => {
    toast({
      title: "Export coming soon",
      description: "CSV and PDF exports will be available in a future update.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendor Analytics</h1>
          <p className="text-muted-foreground">
            Track revenue, orders, and product performance for the selected period.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load analytics</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : "Please try again later."}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</div>
            )}
            <p className="text-xs text-muted-foreground">Gross revenue generated in this period.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{totalOrders.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">Completed orders attributed to your store.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{totalProducts.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">Products listed during this reporting window.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-foreground">{averageRating.toFixed(2)} / 5</div>
            )}
            <p className="text-xs text-muted-foreground">Based on customer reviews collected to date.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
            <CardTitle>Recent orders</CardTitle>
            <CardDescription>Latest orders placed within the selected period.</CardDescription>
              </CardHeader>
              <CardContent>
            {isLoading ? (
                <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full rounded-md" />
                  ))}
                </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders recorded for this period.</p>
            ) : (
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
                    {paginatedRecentOrders.map((order) => {
                      const total = formatCurrency(toNumber(order.totalAmount));
                      const customerName =
                        [order.customer?.firstName, order.customer?.lastName].filter(Boolean).join(" ") ||
                        order.customer?.email ||
                        "—";

                      return (
                        <TableRow key={order.id}>
                          <TableCell>
                            <div className="font-medium text-foreground">
                              {order.orderNumber ?? order.id.slice(0, 8).toUpperCase()}
                      </div>
                            <div className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</div>
                          </TableCell>
                          <TableCell className="text-sm text-foreground">{customerName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {order.status?.toLowerCase() ?? "unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">
                              {order.paymentStatus?.toLowerCase() ?? "unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium text-foreground">{total}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <Pagination
                  currentPage={ordersPage}
                  totalPages={ordersTotalPages}
                  onPageChange={setOrdersPage}
                  totalItems={recentOrders.length}
                  itemsPerPage={itemsPerPage}
                  className="px-0"
                />
              </div>
            )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
            <CardTitle>Top products</CardTitle>
            <CardDescription>Products with the highest order volume this period.</CardDescription>
              </CardHeader>
              <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full rounded-md" />
                ))}
              </div>
            ) : topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No product sales recorded for this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTopProducts.map((product) => {
                      const ordersCount = product._count?.orderItems ?? 0;
                      const price = product.price !== undefined ? formatCurrency(toNumber(product.price)) : "—";

                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="font-medium text-foreground">{product.name}</div>
                            {product.status && (
                              <span className="text-xs text-muted-foreground capitalize">{product.status.toLowerCase()}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium text-foreground">
                            {ordersCount}
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">{price}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <Pagination
                  currentPage={productsPage}
                  totalPages={productsTotalPages}
                  onPageChange={setProductsPage}
                  totalItems={topProducts.length}
                  itemsPerPage={itemsPerPage}
                  className="px-0"
                />
              </div>
            )}
              </CardContent>
            </Card>
          </div>

            <Card>
              <CardHeader>
          <CardTitle>Snapshot</CardTitle>
          <CardDescription>Derived insights based on the current reporting window.</CardDescription>
              </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-dashed p-4">
            <p className="text-sm text-muted-foreground">Average order value</p>
            {isLoading ? (
              <Skeleton className="mt-2 h-6 w-24" />
            ) : (
              <p className="mt-2 text-xl font-semibold text-foreground">{formatCurrency(averageOrderValue || 0)}</p>
            )}
                      </div>
          <div className="rounded-lg border border-dashed p-4">
            <p className="text-sm text-muted-foreground">Orders per product</p>
            {isLoading ? (
              <Skeleton className="mt-2 h-6 w-20" />
            ) : (
              <p className="mt-2 text-xl font-semibold text-foreground">
                {totalProducts > 0 ? (totalOrders / totalProducts).toFixed(2) : "0.00"}
              </p>
            )}
                      </div>
          <div className="rounded-lg border border-dashed p-4">
            <p className="text-sm text-muted-foreground">Reporting period</p>
            <p className="mt-2 text-xl font-semibold capitalize text-foreground">{period}</p>
            <p className="text-xs text-muted-foreground">
              Calculated using data between {period === "7d" ? "the last week" : `the last ${period}`}.
            </p>
                </div>
              </CardContent>
            </Card>
    </div>
  );
}

export default VendorAnalytics;

