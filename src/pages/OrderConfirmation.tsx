import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Loader2, Package } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { BACKEND_URL } from "@/lib/api-config";

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await apiFetch<{ success: boolean; data: any }>(`/orders/${orderId}`);
      return response.data;
    },
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
            <Button onClick={() => navigate('/')}>Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

  const order = orderData;
  const shippingAddress = typeof order.shippingAddress === 'string' 
    ? JSON.parse(order.shippingAddress) 
    : order.shippingAddress;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Order Placed Successfully!</h1>
            <p className="text-muted-foreground">
              Thank you for your order. We'll send you a confirmation email shortly.
            </p>
          </div>

          {/* Order Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>
                Order #{order.orderNumber || order.id}
              </CardDescription>
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground">Order Number</p>
                <p className="text-lg font-semibold text-foreground">
                  {order.orderNumber || order.id}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.orderItems?.map((item: any) => {
                    const product = item.product || {};
                    const imageUrl = product.images?.[0] 
                      ? (product.images[0].startsWith('http') 
                          ? product.images[0] 
                          : `${BACKEND_URL}${product.images[0]}`)
                      : '/placeholder-product.jpg';
                    
                    return (
                      <div key={item.id} className="flex gap-4 py-4 border-b last:border-0">
                        <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={imageUrl}
                            alt={product.name || 'Product'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{product.name || 'Product'}</h4>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                            <span className="font-semibold">£{Number(item.total || item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }) || (
                    <p className="text-muted-foreground">No items found</p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {shippingAddress && (
                <div>
                  <h3 className="font-semibold mb-2">Shipping Address</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{shippingAddress.fullName || shippingAddress.name}</p>
                    <p>{shippingAddress.street}</p>
                    <p>
                      {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                    </p>
                    <p>{shippingAddress.country}</p>
                    {shippingAddress.phone && <p>{shippingAddress.phone}</p>}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>£{Number(order.totalAmount || 0 - (order.shippingCost || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>£{Number(order.shippingCost || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">£{Number(order.totalAmount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status */}
              <div>
                <h3 className="font-semibold mb-2">Order Status</h3>
                <Badge variant={order.status === 'PENDING' ? 'secondary' : 'default'}>
                  {order.status || 'PENDING'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/account')} variant="outline" size="lg">
              View My Orders
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={() => navigate(`/track?order=${order.orderNumber || order.id}`)} 
              size="lg"
            >
              <Package className="mr-2 h-5 w-5" />
              Track Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}




