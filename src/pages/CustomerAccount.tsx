import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Package, Receipt, ShoppingCart, Star, Truck, User } from "lucide-react";

type Address = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
};

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  total: number;
  product?: {
      id: string;
      name: string;
    images?: string[] | null;
    };
};

type Order = {
    id: string;
  orderNumber?: string | null;
  status?: string | null;
  paymentStatus?: string | null;
  createdAt: string;
  updatedAt?: string;
  totalAmount?: number | null;
  shippingCost?: number | null;
  shippingAddress?: Address | string | null;
  orderItems?: OrderItem[];
};

type OrdersResponse = {
        success: boolean;
        data: {
          orders: Order[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
          };
        };
};

type OrderReviewResponse = {
  success: boolean;
  data: {
    orderId: string;
    orderNumber?: string | null;
    reviews: Array<{
      id: string;
      rating: number;
      comment?: string | null;
      createdAt: string;
      product: {
        id: string;
        name: string;
        image?: string | null;
      };
    }>;
    pendingProducts: Array<{
      productId: string;
      name: string;
      image?: string | null;
    }>;
  };
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const statusVariants: Record<string, string> = {
  pending: "secondary",
  processing: "default",
  shipped: "default",
  delivered: "success",
  cancelled: "destructive",
  refunded: "outline",
};

function parseAddress(address?: Address | string | null): Address | null {
  if (!address) {
    return null;
  }

  if (typeof address === "string") {
    try {
      const parsed = JSON.parse(address);
      return parsed && typeof parsed === "object" ? (parsed as Address) : null;
    } catch (error) {
      console.warn("Failed to parse shipping address", error);
      return null;
    }
  }

  return address;
}

const formatCurrency = (value?: number | null) => `£${Number(value ?? 0).toFixed(2)}`;

const formatStatus = (status?: string | null) => {
  if (!status) return "Pending";
  const key = status.toLowerCase();
  return statusLabels[key] ?? status.replace(/_/g, " ");
};

const getStatusVariant = (status?: string | null) => {
  if (!status) return "secondary";
  const key = status.toLowerCase();
  return statusVariants[key] ?? "secondary";
};

const CustomerAccount = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const defaultTab = useMemo(() => (location.pathname === "/orders" ? "orders" : "overview"), [location.pathname]);
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewDrafts, setReviewDrafts] = useState<Record<string, { rating: number; comment: string }>>({});

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["customer-orders"],
    queryFn: async () => {
      // Use type=customer to ensure we get orders where user is the customer (orders they placed)
      // This works for both customers and vendors who are shopping
      const response = await apiFetch<OrdersResponse>("/orders?limit=50&type=customer");
      if (!response.success) {
        throw new Error("Failed to load orders");
      }
      return response.data;
    },
  });

  const orders = data?.orders ?? [];
  const selectedOrderId = selectedOrder?.id ?? null;

  const {
    data: orderReviewData,
    isLoading: isLoadingOrderReview,
    isFetching: isFetchingOrderReview,
    isError: isOrderReviewError,
    error: orderReviewError,
  } = useQuery({
    queryKey: ["customer-order-review", selectedOrderId],
    enabled: reviewDialogOpen && !!selectedOrderId,
    queryFn: async () => {
      if (!selectedOrderId) {
        throw new Error("Missing order identifier");
      }
      const response = await apiFetch<OrderReviewResponse>(`/reviews/order/${selectedOrderId}`);
      if (!response.success) {
        throw new Error(response.message || "Failed to load review details");
      }
      return response.data;
    },
  });

  const reviewEntries = useMemo(() => {
    if (!orderReviewData) return [];
    const existing = orderReviewData.reviews.map((review) => ({
      productId: review.product.id,
      name: review.product.name,
      image: review.product.image ?? null,
      existing: true,
    }));
    const pending = orderReviewData.pendingProducts.map((product) => ({
      productId: product.productId,
      name: product.name,
      image: product.image ?? null,
      existing: false,
    }));
    return [...existing, ...pending];
  }, [orderReviewData]);

  useEffect(() => {
    if (!orderReviewData) return;
    const nextDrafts: Record<string, { rating: number; comment: string }> = {};

    orderReviewData.reviews.forEach((review) => {
      nextDrafts[review.product.id] = {
        rating: review.rating,
        comment: review.comment ?? "",
      };
    });

    orderReviewData.pendingProducts.forEach((product) => {
      if (!nextDrafts[product.productId]) {
        nextDrafts[product.productId] = {
          rating: 0,
          comment: "",
        };
      }
    });

    setReviewDrafts(nextDrafts);
  }, [orderReviewData]);

  useEffect(() => {
    if (!reviewDialogOpen) {
      setReviewDrafts({});
    }
  }, [reviewDialogOpen]);

  const totalSpent = useMemo(() => {
    return orders.reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0);
  }, [orders]);

  const recentOrder = orders[0];
  const openOrders = orders.filter((order) => {
    const status = order.status?.toLowerCase();
    return status && !["delivered", "cancelled", "refunded"].includes(status);
  });

  const initials = useMemo(() => {
    if (user?.name) {
      const parts = user.name.split(" ").filter(Boolean);
      if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
      }
      return parts
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
    }

    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "CU";
  }, [user?.name, user?.email]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "orders" && location.pathname !== "/orders") {
      navigate("/orders", { replace: true });
    } else if (value === "overview" && location.pathname !== "/account") {
      navigate("/account", { replace: true });
    }
  };

  const handleOpenReview = (order: Order) => {
    setSelectedOrder(order);
    setReviewDialogOpen(true);
  };

  const handleRatingChange = (productId: string, rating: number) => {
    setReviewDrafts((prev) => ({
      ...prev,
      [productId]: {
        rating,
        comment: prev[productId]?.comment ?? "",
      },
    }));
  };

  const handleCommentChange = (productId: string, comment: string) => {
    setReviewDrafts((prev) => ({
      ...prev,
      [productId]: {
        rating: prev[productId]?.rating ?? 0,
        comment,
      },
    }));
  };

  const reviewMutation = useMutation({
    mutationFn: async ({
      orderId,
      items,
    }: {
      orderId: string;
      items: Array<{ productId: string; rating: number; comment?: string }>;
    }) => {
      const response = await apiFetch<{ success: boolean; message?: string }>("/reviews", {
        method: "POST",
        body: JSON.stringify({ orderId, items }),
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to submit reviews");
      }

      return response;
    },
    onSuccess: async (_response, variables) => {
      toast({
        title: "Reviews submitted",
        description: "Thanks for sharing your experience.",
      });
      await queryClient.invalidateQueries({ queryKey: ["customer-order-review", variables.orderId] });
      await queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
      setReviewDialogOpen(false);
      setSelectedOrder(null);
      setReviewDrafts({});
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Unable to submit reviews right now.";
      toast({
        title: "Submission failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitReviews = () => {
    if (!selectedOrder) return;

    const items = Object.entries(reviewDrafts)
      .map(([productId, value]) => ({
        productId,
        rating: value.rating,
        comment: value.comment.trim() ? value.comment.trim() : undefined,
      }))
      .filter((item) => item.rating > 0);

    if (items.length === 0) {
      toast({
        title: "Add a rating",
        description: "Please rate at least one product before submitting.",
        variant: "destructive",
      });
      return;
    }

    reviewMutation.mutate({
      orderId: selectedOrder.id,
      items,
    });
  };

  const isSubmittingReview = reviewMutation.isPending;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-16 w-16">
            {user?.avatar ? <AvatarImage src={user.avatar} alt={user.name ?? "Customer"} /> : null}
            <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Welcome back{user?.name ? `, ${user.name}` : ""}</h1>
            <p className="text-muted-foreground">
              Manage your orders, view order history, and track your shipments from one place.
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link to="/track">
              <Truck className="mr-2 h-4 w-4" /> Track an Order
            </Link>
          </Button>
          <Button variant="default" asChild className="w-full sm:w-auto">
            <Link to="/products">
              <ShoppingCart className="mr-2 h-4 w-4" /> Continue Shopping
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <TabsTrigger value="overview" className="w-full sm:w-auto">Overview</TabsTrigger>
          <TabsTrigger value="orders" className="w-full sm:w-auto">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders.length}</div>
                <p className="text-xs text-muted-foreground">All orders you have placed with AfriGos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Orders</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openOrders.length}</div>
                <p className="text-xs text-muted-foreground">Orders currently being processed or shipped</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
                <p className="text-xs text-muted-foreground">Including taxes and vendor shipping fees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account Email</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold truncate" title={user?.email ?? ""}>
                  {user?.email ?? "Not provided"}
                </div>
                <p className="text-xs text-muted-foreground">Ensure your contact details stay up-to-date</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Most Recent Order</CardTitle>
              <CardDescription>Track the progress of your most recent purchase.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-32 w-full rounded-lg" />
              ) : recentOrder ? (
                <OrderOverviewCard order={recentOrder} />
                                ) : (
                <p className="text-sm text-muted-foreground">No orders placed yet. Start shopping to see your orders here.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Your Orders</CardTitle>
                <CardDescription>View details, track shipments, and review your previous orders.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isError && (
                <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
                  {(error as Error)?.message ?? "We could not load your orders. Please try again later."}
                </div>
              )}

              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-28 w-full rounded-lg" />
                  <Skeleton className="h-28 w-full rounded-lg" />
                  <Skeleton className="h-28 w-full rounded-lg" />
                </div>
              ) : orders.length === 0 ? (
                <EmptyOrdersState />
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <OrderCard key={order.id} order={order} onReview={handleOpenReview} />
                  ))}
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={reviewDialogOpen}
        onOpenChange={(open) => {
          setReviewDialogOpen(open);
          if (!open) {
            setSelectedOrder(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedOrder
                ? `Review Order #${selectedOrder.orderNumber ?? selectedOrder.id}`
                : "Review Order"}
            </DialogTitle>
            <DialogDescription>
              Rate the products you received so other customers can shop with confidence.
            </DialogDescription>
          </DialogHeader>

          {isLoadingOrderReview || isFetchingOrderReview ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading products…
            </div>
          ) : isOrderReviewError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
              {(orderReviewError as Error)?.message ?? "We couldn't load the items for this order."}
            </div>
          ) : reviewEntries.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              There are no products to review for this order yet.
            </div>
          ) : (
            <div className="space-y-6">
              {reviewEntries.map((entry) => {
                const draft = reviewDrafts[entry.productId] ?? { rating: 0, comment: "" };
                return (
                  <div key={entry.productId} className="space-y-3 rounded-md border p-4">
                    <div className="flex items-start gap-3">
                      {entry.image ? (
                        <img
                          src={entry.image}
                          alt={entry.name}
                          className="h-16 w-16 flex-shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <p className="font-medium text-foreground">{entry.name}</p>
                        {entry.existing && <Badge variant="outline">Previously reviewed</Badge>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">Rating</Label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleRatingChange(entry.productId, value)}
                            className="transition-colors"
                            aria-label={`${value} star${value > 1 ? "s" : ""}`}
                          >
                            <Star
                              className={`h-6 w-6 ${
                                value <= draft.rating
                                  ? "fill-orange-500 text-orange-500"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor={`review-comment-${entry.productId}`}
                        className="text-sm font-medium text-muted-foreground"
                      >
                        Comment (optional)
                      </Label>
                      <Textarea
                        id={`review-comment-${entry.productId}`}
                        value={draft.comment}
                        onChange={(event) => handleCommentChange(entry.productId, event.target.value)}
                        placeholder="Share details about the quality, fit, or experience with this product..."
                        rows={3}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setReviewDialogOpen(false);
                setSelectedOrder(null);
              }}
              disabled={isSubmittingReview}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReviews}
              disabled={isSubmittingReview || reviewEntries.length === 0}
            >
              {isSubmittingReview ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit reviews"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const OrderOverviewCard = ({ order }: { order: Order }) => {
  const navigate = useNavigate();
  const address = parseAddress(order.shippingAddress);

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Order</span>
            <span className="font-semibold text-foreground">#{order.orderNumber ?? order.id}</span>
            <Badge variant={getStatusVariant(order.status)}>{formatStatus(order.status)}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Placed on {format(new Date(order.createdAt), "d MMM yyyy • p")}
          </p>
          <p className="text-lg font-semibold text-foreground">Total: {formatCurrency(order.totalAmount)}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button variant="outline" size="sm" onClick={() => navigate(`/track?order=${order.orderNumber ?? order.id}`)}>
            <Truck className="mr-2 h-4 w-4" /> Track Order
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/order/${order.id}/confirmation`)}>
            View Details
          </Button>
        </div>
      </div>

      {address && (
        <div className="mt-4 rounded-md bg-muted/40 p-4">
          <p className="text-sm font-semibold text-foreground mb-1">Shipping Address</p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              {[address.firstName, address.lastName].filter(Boolean).join(" ") || "Customer"}
            </p>
            <p>{address.address1}</p>
            {address.address2 && <p>{address.address2}</p>}
            <p>
              {[address.city, address.state, address.postalCode]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p>{address.country}</p>
            {address.phone && <p>Phone: {address.phone}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

const OrderCard = ({ order, onReview }: { order: Order; onReview: (order: Order) => void }) => {
  const navigate = useNavigate();
  const address = parseAddress(order.shippingAddress);
  const normalizedStatus = order.status?.toLowerCase() ?? "";
  const normalizedPayment = order.paymentStatus?.toLowerCase() ?? "";
  const canReview =
    ["delivered", "completed"].includes(normalizedStatus) ||
    ["completed"].includes(normalizedPayment);

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Order</span>
            <span className="font-semibold text-foreground">#{order.orderNumber ?? order.id}</span>
            <Badge variant={getStatusVariant(order.status)}>{formatStatus(order.status)}</Badge>
            {order.paymentStatus && (
              <Badge variant="outline">{order.paymentStatus}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Placed {format(new Date(order.createdAt), "PPpp")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-semibold text-foreground">{formatCurrency(order.totalAmount)}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {(order.orderItems ?? []).map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-md border bg-muted/20 p-3 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <p className="font-medium text-foreground">{item.product?.name ?? "Product"}</p>
              <p className="text-sm text-muted-foreground">
                Qty {item.quantity} • {formatCurrency(item.price)} each
              </p>
            </div>
            <p className="font-semibold text-foreground sm:text-right">
              {formatCurrency(item.total ?? Number(item.price ?? 0) * Number(item.quantity ?? 1))}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex w-full flex-col flex-wrap items-stretch gap-2 sm:flex-row sm:items-center">
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => navigate(`/track?order=${order.orderNumber ?? order.id}`)}
        >
          <Truck className="mr-2 h-4 w-4" /> Track Order
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => navigate(`/order/${order.id}/confirmation`)}
        >
          View Details
        </Button>
        {canReview && (
          <Button
            variant="secondary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => onReview(order)}
          >
            Write a Review
          </Button>
        )}
      </div>

      {address && (
        <div className="mt-4 rounded-md bg-muted/30 p-4">
          <p className="text-sm font-semibold text-foreground mb-1">Shipping To</p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              {[address.firstName, address.lastName].filter(Boolean).join(" ") || "Customer"}
            </p>
            <p>{address.address1}</p>
            {address.address2 && <p>{address.address2}</p>}
            <p>
              {[address.city, address.state, address.postalCode]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p>{address.country}</p>
            {address.phone && <p>Phone: {address.phone}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyOrdersState = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-6 text-center sm:p-10">
      <Package className="h-8 w-8 text-muted-foreground" />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">No orders yet</h3>
        <p className="text-sm text-muted-foreground">
          Start shopping to discover authentic African products from trusted vendors across the AfriGos marketplace.
        </p>
      </div>
      <Button asChild className="w-full sm:w-auto">
        <Link to="/products">
          <ShoppingCart className="mr-2 h-4 w-4" /> Browse Products
        </Link>
      </Button>
    </div>
  );
};

export default CustomerAccount;