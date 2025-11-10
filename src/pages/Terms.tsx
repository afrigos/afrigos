import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Scale } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Scale className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                1. Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Welcome to AfriGos ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of our website, mobile application, and services (collectively, the "Service"). By accessing or using our Service, you agree to be bound by these Terms.
              </p>
              <p>
                If you do not agree to these Terms, please do not use our Service. We reserve the right to update, change, or replace any part of these Terms at any time. It is your responsibility to check this page periodically for changes.
              </p>
            </CardContent>
          </Card>

          {/* Acceptance of Terms */}
          <Card>
            <CardHeader>
              <CardTitle>2. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                By creating an account, placing an order, or using any of our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you are using the Service on behalf of a business, you represent that you have the authority to bind that business to these Terms.
              </p>
            </CardContent>
          </Card>

          {/* Account Registration */}
          <Card>
            <CardHeader>
              <CardTitle>3. Account Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                To use certain features of our Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your information to keep it accurate and current</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent, abusive, or illegal activity.
              </p>
            </CardContent>
          </Card>

          {/* Products and Services */}
          <Card>
            <CardHeader>
              <CardTitle>4. Products and Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We strive to provide accurate product descriptions, images, and pricing. However, we do not warrant that product descriptions, images, or other content are accurate, complete, reliable, current, or error-free.
              </p>
              <p>
                We reserve the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Modify or discontinue products or services at any time</li>
                <li>Limit quantities of products or services available</li>
                <li>Refuse or cancel orders at our discretion</li>
                <li>Correct errors in pricing, even after an order has been placed</li>
              </ul>
            </CardContent>
          </Card>

          {/* Orders and Payment */}
          <Card>
            <CardHeader>
              <CardTitle>5. Orders and Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                When you place an order through our Service, you agree to provide accurate payment information. All prices are in GBP (British Pounds) unless otherwise stated. Prices are subject to change without notice.
              </p>
              <p>
                Payment must be received before we process and ship your order. We accept major credit cards, debit cards, and other payment methods as displayed during checkout. All payments are processed securely through our payment gateway.
              </p>
              <p>
                By placing an order, you agree to pay the amount specified at checkout, including applicable taxes and shipping fees. We reserve the right to cancel orders for products listed at incorrect prices.
              </p>
            </CardContent>
          </Card>

          {/* Shipping and Delivery */}
          <Card>
            <CardHeader>
              <CardTitle>6. Shipping and Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Shipping terms, including delivery times and costs, are specified during checkout. Estimated delivery times are provided as estimates only and are not guaranteed.
              </p>
              <p>
                Risk of loss and title for products pass to you upon delivery to the carrier. We are not responsible for delays caused by the shipping carrier or circumstances beyond our control.
              </p>
              <p>
                Please ensure your delivery address is correct. We are not responsible for orders shipped to incorrect addresses provided by you.
              </p>
            </CardContent>
          </Card>

          {/* Returns and Refunds */}
          <Card>
            <CardHeader>
              <CardTitle>7. Returns and Refunds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Our return and refund policy is detailed on our Returns & Refunds page. Returns must be initiated within 30 days of delivery and items must be in original condition with all packaging and tags.
              </p>
              <p>
                Refunds will be processed to the original payment method within 5-7 business days after we receive and inspect the returned item.
              </p>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>8. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                All content on our Service, including text, graphics, logos, images, and software, is the property of AfriGos or its content suppliers and is protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, create derivative works of, publicly display, or use any content from our Service without our prior written permission.
              </p>
            </CardContent>
          </Card>

          {/* User Conduct */}
          <Card>
            <CardHeader>
              <CardTitle>9. User Conduct</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Violate or infringe upon the rights of others</li>
                <li>Transmit any harmful code, viruses, or malicious software</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Use the Service to harass, abuse, or harm others</li>
                <li>Impersonate any person or entity</li>
              </ul>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle>10. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                To the maximum extent permitted by law, AfriGos shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
              </p>
              <p>
                Our total liability to you for all claims arising from or related to the Service shall not exceed the amount you paid to us in the 12 months preceding the claim.
              </p>
            </CardContent>
          </Card>

          {/* Indemnification */}
          <Card>
            <CardHeader>
              <CardTitle>11. Indemnification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                You agree to indemnify, defend, and hold harmless AfriGos and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service or violation of these Terms.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>12. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including if you breach these Terms.
              </p>
              <p>
                Upon termination, your right to use the Service will cease immediately. All provisions of these Terms that by their nature should survive termination shall survive.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>13. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions.
              </p>
              <p>
                Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card>
            <CardHeader>
              <CardTitle>14. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last updated" date.
              </p>
              <p>
                Your continued use of the Service after any changes constitutes acceptance of the new Terms. If you do not agree to the modified Terms, you must stop using the Service.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>15. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                If you have any questions about these Terms, please contact us:
              </p>
              <p>
                <strong>Email:</strong> enquiries@afrigos.com<br />
                <strong>Address:</strong> 216-218 slack lane, DE22 3EE, United Kingdom
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



