import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Shield, MapPin } from "lucide-react";

export default function Shipping() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Truck className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Shipping Information</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about shipping, delivery, and tracking your orders
          </p>
        </div>

        {/* Vendor Shipping Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Vendor-Handled Shipping
            </CardTitle>
            <CardDescription>
              Shipping is handled directly by our vendors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-muted-foreground">
              <p>
                At AfriGos, shipping and delivery are handled directly by our vendors. This means:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Shipping costs and delivery times vary by vendor</li>
                <li>Each vendor sets their own shipping policies and rates</li>
                <li>You'll see shipping costs during checkout for each vendor's products</li>
                <li>Vendors ship directly from their location to you</li>
              </ul>
              <p className="pt-2">
                When placing an order, you'll see the specific shipping options and costs for each vendor's products before completing your purchase.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Shipping Process</CardTitle>
            <CardDescription>
              Here's what happens after you place your order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Order Confirmation</h3>
                  <p className="text-muted-foreground">
                    You'll receive an email confirmation immediately after placing your order with your order number and details.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Order Processing</h3>
                  <p className="text-muted-foreground">
                    Your order is prepared and packaged by the vendor. Processing times vary by vendor and are typically 1-3 business days.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Shipping Notification</h3>
                  <p className="text-muted-foreground">
                    Once your order ships, you'll receive a shipping notification email with your tracking number.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary">4</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Delivery</h3>
                  <p className="text-muted-foreground">
                    Your package will be delivered to the address you provided during checkout. Most carriers require a signature for delivery.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Make sure your delivery address is correct and complete</li>
                <li>• Include apartment/unit numbers when applicable</li>
                <li>• Provide a phone number for delivery updates</li>
                <li>• We cannot redirect packages after shipping</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Package Protection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• All packages are securely packaged</li>
                <li>• Fragile items are specially protected</li>
                <li>• Insured shipping available for high-value orders</li>
                <li>• Contact us immediately if package is damaged</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Tracking & Support */}
        <Card>
          <CardHeader>
            <CardTitle>Order Tracking & Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Track Your Order</h3>
                <p className="text-muted-foreground mb-4">
                  Once your order ships, the vendor will provide you with tracking information via email. You can track your package using the tracking number provided by the vendor. You can also visit our <a href="/track" className="text-primary hover:underline">Order Tracking</a> page.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-muted-foreground">
                  If you have questions about your shipment or experience any issues, please contact our customer support team at <a href="mailto:enquiries@afrigos.com" className="text-primary hover:underline">enquiries@afrigos.com</a> or visit our <a href="/contact" className="text-primary hover:underline">Contact Us</a> page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
      