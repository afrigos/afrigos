import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Home,
  Store,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { BACKEND_URL } from "@/lib/api-config";

// Build timeline from order status
const buildTimeline = (order: any) => {
  const timeline = [];
  const status = order.status || 'PENDING';
  const createdAt = new Date(order.createdAt);
  const updatedAt = new Date(order.updatedAt);

  // Order Placed - always completed
  timeline.push({
    status: "order_placed",
    title: "Order Placed",
    description: "Your order has been successfully placed",
    timestamp: createdAt.toISOString(),
    completed: true
  });

  // Order Confirmed - if status is beyond PENDING
  if (['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status)) {
    timeline.push({
      status: "order_confirmed",
      title: "Order Confirmed",
      description: "Vendor has confirmed your order",
      timestamp: updatedAt.toISOString(),
      completed: true
    });
  }

  // Processing - if status is PROCESSING or beyond
  if (['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status)) {
    timeline.push({
      status: "processing",
      title: "Processing",
      description: "Your order is being prepared by the vendor",
      timestamp: updatedAt.toISOString(),
      completed: true
    });
  }

  // Shipped - if status is SHIPPED or DELIVERED
  if (['SHIPPED', 'DELIVERED'].includes(status)) {
    timeline.push({
      status: "in_transit",
      title: "Shipped",
      description: "Your order has been shipped",
      timestamp: updatedAt.toISOString(),
      completed: true,
      current: status === 'SHIPPED'
    });
  }

  // Delivered - if status is DELIVERED
  if (status === 'DELIVERED') {
    timeline.push({
      status: "delivered",
      title: "Delivered",
      description: "Package has been delivered",
      timestamp: updatedAt.toISOString(),
      completed: true,
      current: true
    });
  }

  // Cancelled - if status is CANCELLED
  if (status === 'CANCELLED') {
    timeline.push({
      status: "cancelled",
      title: "Cancelled",
      description: "Order has been cancelled",
      timestamp: updatedAt.toISOString(),
      completed: true,
      current: true
    });
  }

  return timeline;
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'order_placed': return { color: 'bg-blue-100 text-blue-800', icon: Clock };
    case 'order_confirmed': return { color: 'bg-yellow-100 text-yellow-800', icon: CheckCircle };
    case 'processing': return { color: 'bg-orange-100 text-orange-800', icon: Package };
    case 'in_transit': return { color: 'bg-indigo-100 text-indigo-800', icon: Truck };
    case 'shipped': return { color: 'bg-indigo-100 text-indigo-800', icon: Truck };
    case 'delivered': return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
    case 'cancelled': return { color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    default: return { color: 'bg-gray-100 text-gray-800', icon: Clock };
  }
};

const getOrderStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING': return { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' };
    case 'CONFIRMED': return { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' };
    case 'PROCESSING': return { color: 'bg-orange-100 text-orange-800', label: 'Processing' };
    case 'SHIPPED': return { color: 'bg-indigo-100 text-indigo-800', label: 'Shipped' };
    case 'DELIVERED': return { color: 'bg-green-100 text-green-800', label: 'Delivered' };
    case 'CANCELLED': return { color: 'bg-red-100 text-red-800', label: 'Cancelled' };
    case 'REFUNDED': return { color: 'bg-gray-100 text-gray-800', label: 'Refunded' };
    default: return { color: 'bg-gray-100 text-gray-800', label: status };
  }
};

export default function OrderTracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState("");
  const [shouldFetch, setShouldFetch] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // Initialize order number from URL only once on mount, but don't auto-fetch
  useEffect(() => {
    if (!isInitialized) {
      const orderFromUrl = searchParams.get('order');
      if (orderFromUrl) {
        setOrderNumber(orderFromUrl);
      }
      setIsInitialized(true);
    }
  }, [searchParams, isInitialized]);

  // Fetch order data only when shouldFetch is true
  const { data: orderData, isLoading, error, refetch } = useQuery({
    queryKey: ['track-order', orderNumber],
    queryFn: async () => {
      if (!orderNumber) return null;
      const response = await apiFetch<{ success: boolean; data: any }>(`/orders/track/${orderNumber}`);
      return response.data;
    },
    enabled: shouldFetch && !!orderNumber,
    retry: false,
  });

  const order = orderData;
  const timeline = order ? buildTimeline(order) : [];
  const shippingAddress = order?.shippingAddress 
    ? (typeof order.shippingAddress === 'string' 
        ? JSON.parse(order.shippingAddress) 
        : order.shippingAddress)
    : null;

  const handleTrackOrder = () => {
    if (!orderNumber.trim()) {
      toast({
        title: "Order Number Required",
        description: "Please enter a valid order number",
        variant: "destructive",
      });
      return;
    }

    // Enable fetching and trigger the query
    setShouldFetch(true);
    setSearchParams({ order: orderNumber });
    refetch();
  };

  useEffect(() => {
    if (error) {
      toast({
        title: "Order Not Found",
        description: "No order found with this order number. Please check and try again.",
        variant: "destructive",
      });
      setShouldFetch(false); // Reset so they can try again
    }
  }, [error, toast, refetch]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show search form if no order has been fetched yet (not loading and no order data)
  if (!shouldFetch && !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Package className="h-8 w-8 text-orange-600" />
              <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
            </div>
            <p className="text-gray-600">Enter your order number to see your order status</p>
          </div>

          {/* Search Form */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-6">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleTrackOrder();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Order Number
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Enter your order number (e.g., AFG-1762539095612-YWLRETJNZ)"
                      value={orderNumber}
                      onChange={(e) => {
                        setOrderNumber(e.target.value);
                      }}
                      className="pl-10"
                      autoComplete="off"
                    />
                  </div>
                </div>
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    "Track Order"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading order information...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null; // Will show the search form
  }

  const statusBadge = getOrderStatusBadge(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Package className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
          </div>
          <p className="text-gray-600">Track your order in real-time</p>
        </div>

        {/* Order Summary */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order Summary</span>
              <Badge className={statusBadge.color}>
                {statusBadge.label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Order Number:</span> {order.orderNumber}</p>
                  <p><span className="font-medium">Order Date:</span> {formatDate(order.createdAt)}</p>
                  <p><span className="font-medium">Total:</span> £{Number(order.totalAmount || 0).toFixed(2)}</p>
                  <p><span className="font-medium">Shipping:</span> £{Number(order.shippingCost || 0).toFixed(2)}</p>
                  {order.vendor && (
                    <p><span className="font-medium">Vendor:</span> {order.vendor.businessName}</p>
                  )}
                </div>
              </div>
              {shippingAddress && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Delivery Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-medium">Address:</p>
                      <div className="ml-2 space-y-1">
                        <p>{shippingAddress.street || shippingAddress.fullName || shippingAddress.name}</p>
                        {shippingAddress.apartment && <p>{shippingAddress.apartment}</p>}
                        <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode || shippingAddress.postcode}</p>
                        <p>{shippingAddress.country}</p>
                        {shippingAddress.phone && (
                          <p><span className="font-medium">Phone:</span> {shippingAddress.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {order.orderItems && order.orderItems.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Products</h3>
                <div className="space-y-2">
                  {order.orderItems.map((item: any, index: number) => {
                    const productImage = item.product?.images?.[0] 
                      ? (item.product.images[0].startsWith('http') 
                          ? item.product.images[0] 
                          : `${BACKEND_URL}${item.product.images[0]}`)
                      : '/placeholder-product.jpg';
                    
                    return (
                      <div key={index} className="flex items-center gap-3 py-2 border-b last:border-0">
                        <img 
                          src={productImage} 
                          alt={item.product?.name || 'Product'} 
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                          }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.product?.name || 'Product'}</p>
                          <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold">£{Number(item.total || item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tracking Timeline */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle>Order Timeline</CardTitle>
            <CardDescription>Track your order's journey from placement to delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.length > 0 ? timeline.map((step, index) => {
                const statusInfo = getStatusInfo(step.status);
                const Icon = statusInfo.icon;
                const isCompleted = step.completed;
                const isCurrent = step.current;

                return (
                  <div key={`${step.status}-${index}`} className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted ? statusInfo.color : 'bg-gray-200'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                          {step.title}
                        </h4>
                        {isCurrent && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                        {step.description}
                      </p>
                      {step.timestamp && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(step.timestamp)}
                        </p>
                      )}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="flex-shrink-0 w-8 flex justify-center">
                        <div className={`w-0.5 h-8 ${isCompleted ? 'bg-orange-300' : 'bg-gray-200'}`} />
                      </div>
                    )}
                  </div>
                );
              }) : (
                <p className="text-gray-500 text-center py-4">No tracking information available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Need Help?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                If you have any questions about your order or delivery, please contact our support team.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = 'mailto:support@afrigos.com'}
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back to Search */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => {
              setSearchParams({});
              setOrderNumber('');
              setShouldFetch(false);
            }}
            className="text-orange-600 hover:text-orange-700"
          >
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Track Another Order
          </Button>
        </div>
      </div>
    </div>
  );
}
