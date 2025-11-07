import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Clock, CheckCircle, AlertCircle, Package, Mail } from "lucide-react";

export default function Returns() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <RefreshCw className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Returns & Refunds</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our hassle-free return and refund policy ensures your satisfaction
          </p>
        </div>

        {/* Return Policy Overview */}
        <Card className="mb-8 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-bold mb-2">30-Day Return Policy</h2>
                <p className="text-muted-foreground">
                  We offer a 30-day return window from the date of delivery. Items must be unused, in original packaging, and with all tags and labels attached.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Return Conditions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Return Conditions</CardTitle>
            <CardDescription>
              To be eligible for a return, your item must meet the following conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Eligible Items</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Items in original packaging</li>
                      <li>• Unused and unopened products</li>
                      <li>• All tags and labels attached</li>
                      <li>• Original receipt or order confirmation</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Non-Returnable Items</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Perishable food items</li>
                      <li>• Customized or personalized products</li>
                      <li>• Items damaged by misuse</li>
                      <li>• Items without original packaging</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Return Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How to Return an Item</CardTitle>
            <CardDescription>
              Follow these simple steps to return your item
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary">1</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Log Into Your Account</h3>
                  <p className="text-muted-foreground">
                    Go to your account dashboard and navigate to your orders section.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary">2</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Select Item to Return</h3>
                  <p className="text-muted-foreground">
                    Find the order containing the item you want to return and click "Request Return".
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary">3</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Provide Return Reason</h3>
                  <p className="text-muted-foreground">
                    Select the reason for your return and provide any additional details if needed.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary">4</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Receive Return Authorization</h3>
                  <p className="text-muted-foreground">
                    Once approved, you'll receive return instructions and a return shipping label (if applicable) via email.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="font-bold text-primary">5</span>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Ship Your Return</h3>
                  <p className="text-muted-foreground">
                    Package the item securely using the original packaging if possible, attach the return label, and ship it back to us.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refund Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Refund Process</CardTitle>
            <CardDescription>
              Understanding how refunds work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Package className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Processing Time</h3>
                  <p className="text-muted-foreground mb-2">
                    Once we receive your returned item, we'll inspect it and process your refund within 5-7 business days.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Refund Method</h3>
                  <p className="text-muted-foreground mb-2">
                    Refunds will be credited to your original payment method. Processing time may vary:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Credit/Debit Cards: 5-10 business days</li>
                    <li>• PayPal: 3-5 business days</li>
                    <li>• Bank Transfer: 7-14 business days</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold mb-2">Shipping Costs</h3>
                  <p className="text-muted-foreground">
                    Original shipping costs are non-refundable unless the return is due to our error or a defective product. Return shipping costs are the responsibility of the customer unless otherwise stated.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exchanges */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Exchanges</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We offer exchanges for items in different sizes or colors, subject to availability. To request an exchange:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
              <li>Follow the return process outlined above</li>
              <li>Indicate that you'd like an exchange when submitting your return request</li>
              <li>Specify the size or color you'd like to exchange for</li>
              <li>Once your return is received and approved, we'll ship the exchanged item</li>
            </ol>
            <p className="text-muted-foreground mt-4">
              If the item you're exchanging for is a different price, we'll refund or charge the difference accordingly.
            </p>
          </CardContent>
        </Card>

        {/* Need Help */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Need Help with a Return?</h2>
            <p className="text-muted-foreground mb-4">
              Our customer support team is here to assist you with any questions about returns or refunds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact" 
                className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Contact Support
              </a>
              <a 
                href="mailto:support@afrigos.com" 
                className="inline-block border border-primary text-primary px-6 py-2 rounded-md hover:bg-primary/10 transition-colors"
              >
                Email Us
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}






