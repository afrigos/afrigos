import { useState } from "react";
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
  Store
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock tracking data
const trackingData = {
  "TRK123456789": {
    orderId: "ORD001",
    customer: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+44 20 7123 4567",
    vendor: "Mama Asha's Kitchen",
    products: [
      { name: "Jollof Rice Spice Mix", quantity: 2, price: "£12.99" },
      { name: "Plantain Chips", quantity: 1, price: "£8.50" }
    ],
    total: "£34.48",
    status: "in_transit",
    orderDate: "2024-01-20",
    estimatedDelivery: "2024-01-22",
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
    timeline: [
      {
        status: "order_placed",
        title: "Order Placed",
        description: "Your order has been successfully placed",
        timestamp: "2024-01-20T10:30:00Z",
        completed: true
      },
      {
        status: "order_confirmed",
        title: "Order Confirmed",
        description: "Vendor has confirmed your order",
        timestamp: "2024-01-20T11:15:00Z",
        completed: true
      },
      {
        status: "processing",
        title: "Processing",
        description: "Your order is being prepared by the vendor",
        timestamp: "2024-01-20T14:20:00Z",
        completed: true
      },
      {
        status: "ready_for_handover",
        title: "Ready for Handover",
        description: "Order is ready and handed over to logistics partner",
        timestamp: "2024-01-21T09:45:00Z",
        completed: true
      },
      {
        status: "in_transit",
        title: "In Transit",
        description: "Your order is on its way to you",
        timestamp: "2024-01-21T16:30:00Z",
        completed: true,
        current: true
      },
      {
        status: "out_for_delivery",
        title: "Out for Delivery",
        description: "Package is out for final delivery",
        timestamp: null,
        completed: false
      },
      {
        status: "delivered",
        title: "Delivered",
        description: "Package has been delivered",
        timestamp: null,
        completed: false
      }
    ],
    logistics: {
      partner: "Royal Mail",
      trackingUrl: "https://royalmail.com/track/TRK123456789",
      contact: "+44 345 774 0740",
      estimatedDelivery: "2024-01-22"
    }
  }
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'order_placed': return { color: 'bg-blue-100 text-blue-800', icon: Clock };
    case 'order_confirmed': return { color: 'bg-yellow-100 text-yellow-800', icon: CheckCircle };
    case 'processing': return { color: 'bg-orange-100 text-orange-800', icon: Package };
    case 'ready_for_handover': return { color: 'bg-purple-100 text-purple-800', icon: Truck };
    case 'in_transit': return { color: 'bg-indigo-100 text-indigo-800', icon: Truck };
    case 'out_for_delivery': return { color: 'bg-green-100 text-green-800', icon: Truck };
    case 'delivered': return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
    default: return { color: 'bg-gray-100 text-gray-800', icon: Clock };
  }
};

export default function OrderTracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get('tracking') || "");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const trackingInfo = trackingData[trackingId as keyof typeof trackingData];

  const handleTrackOrder = () => {
    if (!trackingId.trim()) {
      toast({
        title: "Tracking ID Required",
        description: "Please enter a valid tracking ID",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
      if (trackingInfo) {
        setSearchParams({ tracking: trackingId });
      } else {
        toast({
          title: "Order Not Found",
          description: "No order found with this tracking ID. Please check and try again.",
          variant: "destructive",
        });
      }
    }, 1000);
  };

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

  if (!trackingInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Package className="h-8 w-8 text-orange-600" />
              <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
            </div>
            <p className="text-gray-600">Enter your tracking ID to see your order status</p>
          </div>

          {/* Search Form */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Tracking ID
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Enter your tracking ID (e.g., TRK123456789)"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      className="pl-10"
                      onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleTrackOrder}
                  disabled={isSearching}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {isSearching ? "Searching..." : "Track Order"}
                </Button>
              </div>

              {/* Demo Info */}
              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-800 font-medium mb-2">Demo Tracking ID:</p>
                <p className="text-sm text-orange-700 font-mono">TRK123456789</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              <Badge className="bg-orange-100 text-orange-800">
                {trackingInfo.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Order ID:</span> {trackingInfo.orderId}</p>
                  <p><span className="font-medium">Tracking ID:</span> {trackingInfo.trackingNumber}</p>
                  <p><span className="font-medium">Order Date:</span> {trackingInfo.orderDate}</p>
                  <p><span className="font-medium">Total:</span> {trackingInfo.total}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Delivery Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Estimated Delivery:</span> {trackingInfo.estimatedDelivery}</p>
                  <p><span className="font-medium">Logistics Partner:</span> {trackingInfo.logistics.partner}</p>
                  <div>
                    <p className="font-medium">Address:</p>
                    <div className="ml-2 space-y-1">
                      <p>{trackingInfo.deliveryAddress.streetAddress}</p>
                      {trackingInfo.deliveryAddress.apartment && (
                        <p>{trackingInfo.deliveryAddress.apartment}</p>
                      )}
                      <p>{trackingInfo.deliveryAddress.city}, {trackingInfo.deliveryAddress.state}</p>
                      <p>{trackingInfo.deliveryAddress.postcode}</p>
                      <p>{trackingInfo.deliveryAddress.country}</p>
                      <p><span className="font-medium">Phone:</span> {trackingInfo.deliveryAddress.phone}</p>
                      {trackingInfo.deliveryAddress.email && (
                        <p><span className="font-medium">Email:</span> {trackingInfo.deliveryAddress.email}</p>
                      )}
                      {trackingInfo.deliveryAddress.deliveryInstructions && (
                        <p><span className="font-medium">Instructions:</span> {trackingInfo.deliveryAddress.deliveryInstructions}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Products</h3>
              <div className="space-y-1">
                {trackingInfo.products.map((product, index) => (
                  <p key={index} className="text-sm">
                    {product.quantity}x {product.name} - {product.price}
                  </p>
                ))}
              </div>
            </div>
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
              {trackingInfo.timeline.map((step, index) => {
                const statusInfo = getStatusInfo(step.status);
                const Icon = statusInfo.icon;
                const isCompleted = step.completed;
                const isCurrent = step.current;

                return (
                  <div key={step.status} className="flex items-start space-x-4">
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
                    {index < trackingInfo.timeline.length - 1 && (
                      <div className="flex-shrink-0 w-8 flex justify-center">
                        <div className={`w-0.5 h-8 ${isCompleted ? 'bg-orange-300' : 'bg-gray-200'}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Logistics Information */}
        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck className="h-5 w-5" />
              <span>Logistics Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Store className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">Logistics Partner:</span>
                  <span className="text-sm">{trackingInfo.logistics.partner}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">Estimated Delivery:</span>
                  <span className="text-sm">{trackingInfo.logistics.estimatedDelivery}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">Contact:</span>
                  <span className="text-sm">{trackingInfo.logistics.contact}</span>
                </div>
              </div>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(trackingInfo.logistics.trackingUrl, '_blank')}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Track on {trackingInfo.logistics.partner}
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Search */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => setSearchParams({})}
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
