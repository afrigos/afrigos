import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, AlertTriangle } from "lucide-react";

type QuantityMap = Record<string, number>;

const formatCurrency = (amount: number, currency: string = "GBP") =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateItemQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const [pendingQuantities, setPendingQuantities] = useState<QuantityMap>({});
  const hasItems = items.length > 0;

  const handleQuantityChange = (productId: string, rawValue: string) => {
    const parsed = Number(rawValue);
    if (Number.isNaN(parsed) || parsed < 1) {
      return;
    }

    setPendingQuantities((prev) => ({
      ...prev,
      [productId]: parsed,
    }));

    updateItemQuantity(productId, parsed);
  };

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
  };

  const subtotal = getCartTotal();
  const shippingCost = 0;
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Cart</h1>
            <p className="text-muted-foreground">Review your items before checking out.</p>
          </div>
          {hasItems && (
            <Button variant="outline" onClick={clearCart}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear cart
            </Button>
          )}
        </div>

        {hasItems ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Items in Cart
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 border-b pb-6 last:border-b-0 last:pb-0 md:flex-row"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link
                            to={`/product/${item.id}`}
                            className="text-lg font-semibold text-foreground hover:text-primary"
                          >
                            {item.name}
                          </Link>
                          <div className="text-sm text-muted-foreground">
                            {item.vendorName ? `Sold by ${item.vendorName}` : "Marketplace vendor"}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <label htmlFor={`quantity-${item.id}`} className="text-sm text-muted-foreground">
                            Quantity
                          </label>
                          <Input
                            id={`quantity-${item.id}`}
                            type="number"
                            min={1}
                            value={pendingQuantities[item.id] ?? item.quantity}
                            onChange={(event) => handleQuantityChange(item.id, event.target.value)}
                            className="w-24"
                          />
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            Unit price: {formatCurrency(item.price)}
                          </div>
                          <div className="text-lg font-semibold text-foreground">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>

                      {item.availableStock !== undefined && item.availableStock < item.quantity && (
                        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          Only {item.availableStock} left in stock.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Shipping</span>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Vendor will confirm after checkout. Shipping costs are settled directly with the vendor.
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    £0.00
                  </Badge>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-base font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
                </div>

                <div className="space-y-3">
                  <Button className="w-full" onClick={() => navigate("/checkout")}>
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/products")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Continue Shopping
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">Your cart is empty</h2>
                <p className="text-muted-foreground">
                  Browse our marketplace and add items to your cart when you're ready.
                </p>
              </div>
              <Button onClick={() => navigate("/products")}>
                Start Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Cart;
