import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import type { CartItem } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, AlertTriangle, Plus, Minus } from "lucide-react";
import { BACKEND_URL } from "@/lib/api-config";

type DisplayCartItem = CartItem & {
  vendorName?: string;
  availableStock?: number;
};

const formatCurrency = (amount: number, currency: string = "GBP") =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const hasItems = items.length > 0;

  const handleQuantityIncrease = (item: DisplayCartItem) => {
    const currentQuantity = item.quantity;
    const maxQuantity = item.availableStock !== undefined ? item.availableStock : item.stock;
    if (currentQuantity < maxQuantity) {
      updateQuantity(item.id, currentQuantity + 1);
    }
  };

  const handleQuantityDecrease = (item: DisplayCartItem) => {
    const currentQuantity = item.quantity;
    if (currentQuantity > 1) {
      updateQuantity(item.id, currentQuantity - 1);
    }
  };

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
  };

  const subtotal = getCartTotal();
  const shippingCost = 0;
  const total = subtotal + shippingCost;

  const resolveImage = (image?: string | null) => {
    if (!image) return "/placeholder-product.jpg";
    if (image.startsWith("http")) return image;
    if (image.startsWith("/")) return `${BACKEND_URL}${image}`;
    return `${BACKEND_URL}/${image}`;
  };

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
                {items.map((item) => {
                  const displayItem = item as DisplayCartItem;
                  const vendorLabel =
                    displayItem.vendorName ??
                    displayItem.vendor?.businessName ??
                    "Marketplace vendor";
                  const availableStock =
                    typeof displayItem.availableStock === "number"
                      ? displayItem.availableStock
                      : displayItem.stock;

                  return (
                  <div
                    key={item.id}
                    className="grid gap-4 rounded-xl border border-border/60 p-4 shadow-sm transition-shadow hover:shadow-md lg:grid-cols-[120px_1fr]"
                  >
                    <Link
                      to={`/product/${item.id}`}
                      className="group relative block aspect-square overflow-hidden rounded-lg bg-muted"
                    >
                      <img
                        src={resolveImage(displayItem.image)}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(event) => {
                          (event.target as HTMLImageElement).src = "/placeholder-product.jpg";
                        }}
                      />
                    </Link>

                    <div className="flex flex-col justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              to={`/product/${item.id}`}
                              className="text-lg font-semibold text-foreground hover:text-primary"
                            >
                              {item.name}
                            </Link>
                            <div className="text-sm text-muted-foreground">
                              {`Sold by ${vendorLabel}`}
                            </div>
                            {/* Stock indicator */}
                            <div className="mt-1">
                              {availableStock > 0 ? (
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${
                                    availableStock <= 5
                                      ? "bg-amber-100 text-amber-800 border-amber-200"
                                      : "bg-green-100 text-green-800 border-green-200"
                                  }`}
                                >
                                  {availableStock <= 5
                                    ? `Only ${availableStock} left`
                                    : `In stock: ${availableStock}`}
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="text-xs">
                                  Out of stock
                                </Badge>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            className="rounded-full border border-transparent p-2 text-muted-foreground transition-colors hover:border-destructive/30 hover:text-destructive"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">Quantity</span>
                            <div className="flex items-center gap-2 border rounded-md">
                              <button
                                type="button"
                                onClick={() => handleQuantityDecrease(displayItem)}
                                disabled={item.quantity <= 1}
                                className="p-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-md"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="min-w-[3ch] text-center font-medium px-3 py-2">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuantityIncrease(displayItem)}
                                disabled={item.quantity >= availableStock}
                                className="p-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-md"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <div>Unit price</div>
                            <div className="text-base font-semibold text-foreground">
                              {formatCurrency(item.price)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                        <div className="text-sm text-muted-foreground">
                          Subtotal
                          <span className="ml-2 text-lg font-semibold text-foreground">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                        {availableStock < item.quantity && (
                          <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            Only {availableStock} left in stock.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
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
