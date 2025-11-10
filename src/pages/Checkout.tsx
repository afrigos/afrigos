import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Lock, Loader2, CheckCircle, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BACKEND_URL, API_BASE_URL } from "@/lib/api-config";
import { apiFetch } from "@/lib/api-client";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripePaymentForm } from "@/components/payment/StripePaymentForm";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

type CheckoutStep = 'address' | 'review' | 'payment';

const formatCurrency = (amount: number, currency: string = 'GBP') =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  // Shipping address form
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United Kingdom',
  });

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    // Redirect to customer login if not authenticated
    if (!isAuthenticated) {
      navigate('/auth/customer-login?redirect=/checkout');
      return;
    }

    // Redirect if cart is empty
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    // Pre-fill address if user has saved address
    if (user) {
      setAddress(prev => ({
        ...prev,
        fullName: user.name || '',
      }));
    }
  }, [isAuthenticated, items.length, navigate, user]);

  const subtotal = getCartTotal();
  const shippingCost = 0;
  const shippingCurrency = 'GBP';
  const total = subtotal + shippingCost;

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('review');
  };

  const handleEditAddress = () => {
    setCurrentStep('address');
  };

  // Create order when moving to payment step
  useEffect(() => {
    if (currentStep === 'payment' && !orderId && paymentMethod === 'card') {
      createOrderAndPaymentIntent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, orderId, paymentMethod]);

  const createOrderAndPaymentIntent = async () => {
    setIsSubmitting(true);
    try {
      // Create order first
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
        paymentMethod,
        totalAmount: subtotal + shippingCost,
        shippingCost,
        shippingMethod: 'vendor_handled',
      };

      const orderResponse = await apiFetch<{ success: boolean; data: { id: string; orderNumber: string } }>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.success) {
        throw new Error('Failed to create order');
      }

      const newOrderId = orderResponse.data.id;
      setOrderId(newOrderId);

      // Create payment intent for Stripe
      if (paymentMethod === 'card') {
        const intentResponse = await apiFetch<{ 
          success: boolean; 
          data: { clientSecret: string; paymentIntentId: string } 
        }>('/payments/create-intent', {
          method: 'POST',
          body: JSON.stringify({ orderId: newOrderId }),
        });

        if (intentResponse.success) {
          setClientSecret(intentResponse.data.clientSecret);
          setPaymentIntentId(intentResponse.data.paymentIntentId);
        } else {
          throw new Error('Failed to create payment intent');
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to initialize payment. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      setCurrentStep('review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'bank') {
      setIsSubmitting(true);
      try {
        const orderData = {
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress: {
            fullName: address.fullName,
            phone: address.phone,
            street: address.street,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
          },
          paymentMethod,
          totalAmount: subtotal + shippingCost,
          shippingCost,
          shippingMethod: 'vendor_handled',
        };

        const response = await apiFetch<{ success: boolean; data: { id: string; orderNumber: string } }>('/orders', {
          method: 'POST',
          body: JSON.stringify(orderData),
        });

        if (response.success) {
          clearCart();
          navigate(`/order/${response.data.id}/confirmation`);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to place order. Please try again.";
        toast({
          title: "Order Failed",
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStep('payment');
    }
  };

  const handlePaymentSuccess = (orderId: string) => {
    clearCart();
    navigate(`/order/${orderId}/confirmation`);
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    });
  };

  if (!isAuthenticated || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${currentStep === 'address' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'address' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                1
              </div>
              <span className="hidden sm:inline">Address</span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 ${currentStep !== 'address' ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center gap-2 ${currentStep === 'review' ? 'text-primary' : currentStep === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep !== 'address' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {currentStep === 'payment' ? <CheckCircle className="h-4 w-4" /> : '2'}
              </div>
              <span className="hidden sm:inline">Review</span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 ${currentStep === 'payment' ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center gap-2 ${currentStep === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                3
              </div>
              <span className="hidden sm:inline">Payment</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 'address' && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                  <CardDescription>Enter your delivery address</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="street">Street Address *</Label>
                      <Input
                        id="street"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State/Region *</Label>
                        <Input
                          id="state"
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="postalCode">Postal Code *</Label>
                        <Input
                          id="postalCode"
                          value={address.postalCode}
                          onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country *</Label>
                        <Input
                          id="country"
                          value={address.country}
                          onChange={(e) => setAddress({ ...address, country: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" size="lg">
                      Continue to Review
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {currentStep === 'review' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Review Your Order</CardTitle>
                    <CardDescription>Please review your order before proceeding</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {items.map((item) => {
                      const imageUrl = item.image.startsWith('http') 
                        ? item.image 
                        : `${BACKEND_URL}${item.image}`;
                      
                      return (
                        <div key={item.id} className="flex gap-4 py-4 border-b last:border-0">
                          <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-sm text-muted-foreground">{item.vendor.businessName}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm">Qty: {item.quantity}</span>
                              <span className="font-semibold">£{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{address.fullName}</p>
                    <p className="text-sm text-muted-foreground">{address.street}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p className="text-sm text-muted-foreground">{address.country}</p>
                    <p className="text-sm text-muted-foreground mt-2">{address.phone}</p>
                    <Button
                      variant="link"
                      className="p-0 mt-2"
                      onClick={handleEditAddress}
                    >
                      Edit Address
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Shipping</CardTitle>
                    <CardDescription>Delivery cost and estimate</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Shipping Cost</span>
                      <span className="font-medium">
                        Vendor will confirm after checkout
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Select your preferred payment method</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4"
                        />
                        <CreditCard className="h-5 w-5" />
                        <span className="font-medium">Credit/Debit Card (Stripe)</span>
                      </label>
                      <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank"
                          checked={paymentMethod === 'bank'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4"
                        />
                        <Lock className="h-5 w-5" />
                        <span className="font-medium">Bank Transfer</span>
                      </label>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handleEditAddress}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="flex-1"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {paymentMethod === 'card' ? 'Continue to Payment' : 'Place Order'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {currentStep === 'payment' && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment</CardTitle>
                  <CardDescription>
                    {paymentMethod === 'card' 
                      ? 'Complete your payment securely with Stripe'
                      : 'Payment instructions will be sent via email'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentMethod === 'card' && clientSecret && orderId ? (
                    <Elements 
                      stripe={stripePromise} 
                      options={{ 
                        clientSecret,
                        appearance: {
                          theme: 'stripe',
                        },
                      }}
                    >
                      <StripePaymentForm
                        clientSecret={clientSecret}
                        orderId={orderId}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </Elements>
                  ) : paymentMethod === 'card' ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Setting up payment...</span>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Payment instructions will be sent to your email after order confirmation.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setOrderId(null);
                        setClientSecret(null);
                        setPaymentIntentId(null);
                        setCurrentStep('review');
                      }}
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.name} x{item.quantity}
                      </span>
                      <span>£{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal, 'GBP')}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      Vendor will confirm after checkout
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Shipping is arranged directly with the vendor after checkout.
                  </p>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(total, shippingCurrency)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}