import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Target, Users, Shield, Globe, Award } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About AfriGos</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your trusted marketplace for authentic African products. Connecting vendors and customers across the continent.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="h-6 w-6 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-lg leading-relaxed">
              At AfriGos, we are dedicated to creating a vibrant marketplace that celebrates the rich diversity of African culture through authentic products. Our mission is to bridge the gap between African vendors and global customers, fostering economic growth while preserving and promoting African heritage.
            </p>
          </CardContent>
        </Card>

        {/* Values Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Authenticity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We verify every product to ensure authenticity and quality, giving you confidence in your purchases.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We build strong relationships between vendors and customers, creating a supportive community that thrives together.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Trust
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your security and satisfaction are our top priorities. We provide secure payment processing and reliable customer support.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* What We Do Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Globe className="h-6 w-6 text-primary" />
              What We Do
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">For Customers</h3>
              <p className="text-muted-foreground">
                Discover a curated selection of authentic African products from food and beverages to fashion, home decor, and more. Shop with confidence knowing every product is verified for quality and authenticity.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">For Vendors</h3>
              <p className="text-muted-foreground">
                Reach a global audience of customers who appreciate authentic African products. We provide the platform, tools, and support you need to grow your business and share your culture with the world.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Why Choose Us Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Award className="h-6 w-6 text-primary" />
              Why Choose AfriGos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span><strong>Verified Vendors:</strong> All vendors go through a thorough verification process to ensure reliability and quality.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span><strong>Quality Assurance:</strong> Products are reviewed and approved before being listed on our marketplace.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span><strong>Secure Payments:</strong> Your payments are processed securely through trusted payment gateways.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span><strong>Customer Support:</strong> Our dedicated support team is here to help you with any questions or concerns.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span><strong>Fair Pricing:</strong> Competitive prices with transparent fees for both vendors and customers.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span><strong>Global Shipping:</strong> We work with reliable shipping partners to deliver your orders safely and on time.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-2">Get in Touch</h2>
              <p className="text-muted-foreground mb-4">
                Have questions or want to learn more? We'd love to hear from you.
              </p>
              <a 
                href="/contact" 
                className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Contact Us
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}




