import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GradientBackground, HeroSection, CardGradient, SubtleGradient } from '@/components/ui/GradientBackground';
import { 
  Star, 
  Package, 
  DollarSign, 
  Users, 
  TrendingUp,
  Heart,
  ShoppingCart,
  Globe
} from 'lucide-react';

export function ColorSchemeDemo() {
  return (
    <div className="space-y-8 p-6">
      {/* Hero Section */}
      <HeroSection>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Afri GoS</h1>
          <p className="text-xl mb-8 opacity-90">
            Connecting buyers with authentic African goods and skills
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-white text-afrigos hover:bg-gray-100">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Start Shopping
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <Users className="mr-2 h-5 w-5" />
              Join as Vendor
            </Button>
          </div>
        </div>
      </HeroSection>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardGradient>
          <div className="flex items-center space-x-3 mb-4">
            <Package className="h-8 w-8" />
            <h3 className="text-xl font-semibold">Authentic Products</h3>
          </div>
          <p className="opacity-90">
            Discover genuine African goods from verified vendors across the continent.
          </p>
        </CardGradient>

        <CardGradient>
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-8 w-8" />
            <h3 className="text-xl font-semibold">Skilled Services</h3>
          </div>
          <p className="opacity-90">
            Connect with talented African professionals offering their unique skills.
          </p>
        </CardGradient>

        <CardGradient>
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="h-8 w-8" />
            <h3 className="text-xl font-semibold">Global Reach</h3>
          </div>
          <p className="opacity-90">
            Bridge the gap between African talent and international markets.
          </p>
        </CardGradient>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-6 border-afrigos/20 shadow-afrigos">
          <div className="flex justify-center mb-2">
            <Users className="h-8 w-8 text-afrigos" />
          </div>
          <h3 className="text-2xl font-bold text-afrigos">10,000+</h3>
          <p className="text-sm text-muted-foreground">Active Vendors</p>
        </Card>

        <Card className="text-center p-6 border-afrigos/20 shadow-afrigos">
          <div className="flex justify-center mb-2">
            <Package className="h-8 w-8 text-afrigos" />
          </div>
          <h3 className="text-2xl font-bold text-afrigos">50,000+</h3>
          <p className="text-sm text-muted-foreground">Products Listed</p>
        </Card>

        <Card className="text-center p-6 border-afrigos/20 shadow-afrigos">
          <div className="flex justify-center mb-2">
            <Heart className="h-8 w-8 text-afrigos" />
          </div>
          <h3 className="text-2xl font-bold text-afrigos">25,000+</h3>
          <p className="text-sm text-muted-foreground">Happy Customers</p>
        </Card>

        <Card className="text-center p-6 border-afrigos/20 shadow-afrigos">
          <div className="flex justify-center mb-2">
            <TrendingUp className="h-8 w-8 text-afrigos" />
          </div>
          <h3 className="text-2xl font-bold text-afrigos">98%</h3>
          <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
        </Card>
      </div>

      {/* Subtle Gradient Section */}
      <SubtleGradient>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-afrigos mb-4">Join Our Community</h2>
          <p className="text-lg text-gray-700 mb-6">
            Be part of the movement that's bringing African excellence to the world
          </p>
          <div className="flex gap-3 justify-center">
            <Badge className="bg-afrigos-gradient text-white px-4 py-2">Verified Vendors</Badge>
            <Badge className="bg-afrigos-gradient text-white px-4 py-2">Quality Products</Badge>
            <Badge className="bg-afrigos-gradient text-white px-4 py-2">Global Shipping</Badge>
          </div>
        </div>
      </SubtleGradient>

      {/* Color Palette Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-afrigos">Color Palette Showcase</CardTitle>
          <CardDescription>
            The warm orange and yellow gradient inspired by the Afri GoS brand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Hero Gradient</h4>
              <div className="h-16 bg-afrigos-hero rounded-lg"></div>
              <p className="text-sm text-muted-foreground">bg-afrigos-hero</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Warm Gradient</h4>
              <div className="h-16 bg-afrigos-warm rounded-lg"></div>
              <p className="text-sm text-muted-foreground">bg-afrigos-warm</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Primary Gradient</h4>
              <div className="h-16 bg-afrigos-gradient rounded-lg"></div>
              <p className="text-sm text-muted-foreground">bg-afrigos-gradient</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

