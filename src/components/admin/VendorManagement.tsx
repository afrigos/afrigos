import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  Mail,
  Phone,
  MapPin,
  Store,
  TrendingUp,
  Users,
  Package,
  Star,
  BarChart3,
  Globe,
  Calendar,
  DollarSign,
  ShoppingCart,
  Heart,
  MessageCircle,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  AlertTriangle,
  Target,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";

// Predefined categories for vendors
const vendorCategories = [
  "Food & Beverages",
  "Fashion & Clothing",
  "Beauty & Personal Care",
  "Health & Wellness",
  "Home & Garden",
  "Electronics & Technology",
  "Sports & Fitness",
  "Books & Education",
  "Arts & Crafts",
  "Automotive",
  "Jewelry & Accessories",
  "Toys & Games",
  "Pet Supplies",
  "Baby & Kids",
  "Office & Business"
];

// Predefined countries
const countries = [
  "United Kingdom",
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Ethiopia",
  "Tanzania",
  "Uganda",
  "Rwanda",
  "Senegal",
  "Morocco",
  "Egypt",
  "Tunisia",
  "Algeria",
  "Libya"
];

// Enhanced vendor data with comprehensive store statistics
const vendorData = [
  {
    id: "V001",
    name: "Mama Asha's Kitchen",
    email: "contact@mamaashas.co.uk",
    phone: "+44 20 7123 4567",
    location: "London, UK",
    category: "Food & Beverages",
    status: "pending",
    joinDate: "2024-01-15",
    revenue: "£12,450",
    products: 24,
    rating: 4.8,
    documents: "Complete",
    // Store statistics
    storeStats: {
      totalSales: 12450,
      totalOrders: 342,
      averageOrderValue: 36.40,
      conversionRate: 3.2,
      returnRate: 1.8,
      customerSatisfaction: 4.8,
      responseTime: "2.3 hours",
      fulfillmentRate: 98.5,
      activeProducts: 24,
      totalProducts: 28,
      monthlyGrowth: 12.5,
      topSellingProduct: "Jollof Rice Spice Mix",
      customerReviews: 156,
      repeatCustomers: 67,
      socialMediaFollowers: 1240,
      websiteVisits: 8900,
      averageRating: 4.8,
      onTimeDelivery: 96.2,
      customerSupportScore: 4.7
    },
    // Product categories breakdown
    productCategories: [
      { name: "Spices & Seasonings", count: 12, revenue: 6800 },
      { name: "Ready-to-Eat Meals", count: 8, revenue: 4200 },
      { name: "Beverages", count: 4, revenue: 1450 }
    ],
    // Sales trends (last 6 months)
    salesTrends: [
      { month: "Jan", sales: 8900, orders: 245 },
      { month: "Feb", sales: 10200, orders: 278 },
      { month: "Mar", sales: 11800, orders: 312 },
      { month: "Apr", sales: 12450, orders: 342 },
      { month: "May", sales: 13200, orders: 365 },
      { month: "Jun", sales: 14100, orders: 389 }
    ],
    // Customer demographics
    customerDemographics: {
      ageGroups: [
        { group: "18-25", percentage: 15 },
        { group: "26-35", percentage: 35 },
        { group: "36-45", percentage: 28 },
        { group: "46-55", percentage: 16 },
        { group: "55+", percentage: 6 }
      ],
      locations: [
        { location: "London", percentage: 45 },
        { location: "Manchester", percentage: 20 },
        { location: "Birmingham", percentage: 15 },
        { location: "Other UK", percentage: 20 }
      ]
    }
  },
  {
    id: "V002", 
    name: "Adunni Beauty",
    email: "hello@adunnibeauty.com",
    phone: "+44 161 456 7890",
    location: "Manchester, UK",
    category: "Beauty & Personal Care",
    status: "approved",
    joinDate: "2024-01-10",
    revenue: "£8,920",
    products: 18,
    rating: 4.9,
    documents: "Complete",
    storeStats: {
      totalSales: 8920,
      totalOrders: 234,
      averageOrderValue: 38.12,
      conversionRate: 4.1,
      returnRate: 2.1,
      customerSatisfaction: 4.9,
      responseTime: "1.8 hours",
      fulfillmentRate: 99.2,
      activeProducts: 18,
      totalProducts: 22,
      monthlyGrowth: 18.7,
      topSellingProduct: "Natural Hair Growth Oil",
      customerReviews: 203,
      repeatCustomers: 89,
      socialMediaFollowers: 2100,
      websiteVisits: 12300,
      averageRating: 4.9,
      onTimeDelivery: 97.8,
      customerSupportScore: 4.8
    },
    productCategories: [
      { name: "Hair Care", count: 8, revenue: 4200 },
      { name: "Skin Care", count: 6, revenue: 3200 },
      { name: "Body Care", count: 4, revenue: 1520 }
    ],
    salesTrends: [
      { month: "Jan", sales: 6200, orders: 165 },
      { month: "Feb", sales: 7200, orders: 189 },
      { month: "Mar", sales: 8100, orders: 212 },
      { month: "Apr", sales: 8920, orders: 234 },
      { month: "May", sales: 9600, orders: 251 },
      { month: "Jun", sales: 10400, orders: 273 }
    ],
    customerDemographics: {
      ageGroups: [
        { group: "18-25", percentage: 25 },
        { group: "26-35", percentage: 40 },
        { group: "36-45", percentage: 22 },
        { group: "46-55", percentage: 10 },
        { group: "55+", percentage: 3 }
      ],
      locations: [
        { location: "Manchester", percentage: 35 },
        { location: "London", percentage: 25 },
        { location: "Liverpool", percentage: 20 },
        { location: "Other UK", percentage: 20 }
      ]
    }
  },
  {
    id: "V003",
    name: "Kente Collections",
    email: "info@kentecollections.uk",
    phone: "+44 121 789 0123",
    location: "Birmingham, UK", 
    category: "Fashion & Clothing",
    status: "suspended",
    joinDate: "2024-01-08",
    revenue: "£15,680",
    products: 45,
    rating: 4.6,
    documents: "Incomplete",
    storeStats: {
      totalSales: 15680,
      totalOrders: 523,
      averageOrderValue: 29.98,
      conversionRate: 2.8,
      returnRate: 3.5,
      customerSatisfaction: 4.6,
      responseTime: "3.1 hours",
      fulfillmentRate: 97.1,
      activeProducts: 45,
      totalProducts: 52,
      monthlyGrowth: 8.3,
      topSellingProduct: "Traditional Kente Dress",
      customerReviews: 312,
      repeatCustomers: 145,
      socialMediaFollowers: 3400,
      websiteVisits: 15600,
      averageRating: 4.6,
      onTimeDelivery: 95.5,
      customerSupportScore: 4.4
    },
    productCategories: [
      { name: "Traditional Dresses", count: 20, revenue: 8200 },
      { name: "Modern African Fashion", count: 15, revenue: 5800 },
      { name: "Accessories", count: 10, revenue: 1680 }
    ],
    salesTrends: [
      { month: "Jan", sales: 12800, orders: 428 },
      { month: "Feb", sales: 14200, orders: 475 },
      { month: "Mar", sales: 15100, orders: 505 },
      { month: "Apr", sales: 15680, orders: 523 },
      { month: "May", sales: 16200, orders: 541 },
      { month: "Jun", sales: 16800, orders: 560 }
    ],
    customerDemographics: {
      ageGroups: [
        { group: "18-25", percentage: 20 },
        { group: "26-35", percentage: 35 },
        { group: "36-45", percentage: 25 },
        { group: "46-55", percentage: 15 },
        { group: "55+", percentage: 5 }
      ],
      locations: [
        { location: "Birmingham", percentage: 30 },
        { location: "London", percentage: 25 },
        { location: "Manchester", percentage: 20 },
        { location: "Other UK", percentage: 25 }
      ]
    }
  },
  {
    id: "V004",
    name: "Afro Herbs Ltd",
    email: "support@afroherbs.co.uk",
    phone: "+44 113 234 5678",
    location: "Leeds, UK",
    category: "Health & Wellness",
    status: "review",
    joinDate: "2024-01-12",
    revenue: "£6,340",
    products: 12,
    rating: 4.7,
    documents: "Pending",
    storeStats: {
      totalSales: 6340,
      totalOrders: 178,
      averageOrderValue: 35.62,
      conversionRate: 2.9,
      returnRate: 1.2,
      customerSatisfaction: 4.7,
      responseTime: "2.8 hours",
      fulfillmentRate: 98.8,
      activeProducts: 12,
      totalProducts: 15,
      monthlyGrowth: 15.2,
      topSellingProduct: "Immune Boost Tea",
      customerReviews: 89,
      repeatCustomers: 45,
      socialMediaFollowers: 890,
      websiteVisits: 6700,
      averageRating: 4.7,
      onTimeDelivery: 96.8,
      customerSupportScore: 4.6
    },
    productCategories: [
      { name: "Herbal Teas", count: 6, revenue: 3200 },
      { name: "Supplements", count: 4, revenue: 2400 },
      { name: "Essential Oils", count: 2, revenue: 740 }
    ],
    salesTrends: [
      { month: "Jan", sales: 4200, orders: 118 },
      { month: "Feb", sales: 5200, orders: 146 },
      { month: "Mar", sales: 5800, orders: 163 },
      { month: "Apr", sales: 6340, orders: 178 },
      { month: "May", sales: 6900, orders: 194 },
      { month: "Jun", sales: 7500, orders: 211 }
    ],
    customerDemographics: {
      ageGroups: [
        { group: "18-25", percentage: 12 },
        { group: "26-35", percentage: 28 },
        { group: "36-45", percentage: 35 },
        { group: "46-55", percentage: 20 },
        { group: "55+", percentage: 5 }
      ],
      locations: [
        { location: "Leeds", percentage: 40 },
        { location: "Bradford", percentage: 25 },
        { location: "Sheffield", percentage: 20 },
        { location: "Other UK", percentage: 15 }
      ]
    }
  },
  {
    id: "V005",
    name: "Spice Masters",
    email: "info@spicemasters.co.uk",
    phone: "+44 20 7890 1234",
    location: "London, UK",
    category: "Food & Beverages",
    status: "approved",
    joinDate: "2024-01-05",
    revenue: "£18,920",
    products: 32,
    rating: 4.9,
    documents: "Complete",
    storeStats: {
      totalSales: 18920,
      totalOrders: 456,
      averageOrderValue: 41.49,
      conversionRate: 3.8,
      returnRate: 1.5,
      customerSatisfaction: 4.9,
      responseTime: "1.5 hours",
      fulfillmentRate: 99.1,
      activeProducts: 32,
      totalProducts: 38,
      monthlyGrowth: 22.3,
      topSellingProduct: "Premium Curry Powder Blend",
      customerReviews: 267,
      repeatCustomers: 123,
      socialMediaFollowers: 2800,
      websiteVisits: 18900,
      averageRating: 4.9,
      onTimeDelivery: 98.2,
      customerSupportScore: 4.8
    },
    productCategories: [
      { name: "Spice Blends", count: 15, revenue: 9800 },
      { name: "Individual Spices", count: 12, revenue: 7200 },
      { name: "Seasoning Mixes", count: 5, revenue: 1920 }
    ],
    salesTrends: [
      { month: "Jan", sales: 13200, orders: 318 },
      { month: "Feb", sales: 15200, orders: 366 },
      { month: "Mar", sales: 17200, orders: 414 },
      { month: "Apr", sales: 18920, orders: 456 },
      { month: "May", sales: 20800, orders: 501 },
      { month: "Jun", sales: 22800, orders: 549 }
    ],
    customerDemographics: {
      ageGroups: [
        { group: "18-25", percentage: 18 },
        { group: "26-35", percentage: 32 },
        { group: "36-45", percentage: 30 },
        { group: "46-55", percentage: 16 },
        { group: "55+", percentage: 4 }
      ],
      locations: [
        { location: "London", percentage: 50 },
        { location: "Manchester", percentage: 18 },
        { location: "Birmingham", percentage: 15 },
        { location: "Other UK", percentage: 17 }
      ]
    }
  },
  {
    id: "V006",
    name: "Ankara Express",
    email: "hello@ankaraexpress.uk",
    phone: "+44 161 567 8901",
    location: "Manchester, UK",
    category: "Fashion & Clothing",
    status: "pending",
    joinDate: "2024-01-18",
    revenue: "£3,450",
    products: 8,
    rating: 4.5,
    documents: "Incomplete",
    storeStats: {
      totalSales: 3450,
      totalOrders: 95,
      averageOrderValue: 36.32,
      conversionRate: 2.1,
      returnRate: 2.8,
      customerSatisfaction: 4.5,
      responseTime: "4.2 hours",
      fulfillmentRate: 96.8,
      activeProducts: 8,
      totalProducts: 12,
      monthlyGrowth: 8.9,
      topSellingProduct: "Ankara Print Dress",
      customerReviews: 67,
      repeatCustomers: 23,
      socialMediaFollowers: 560,
      websiteVisits: 4200,
      averageRating: 4.5,
      onTimeDelivery: 94.2,
      customerSupportScore: 4.3
    },
    productCategories: [
      { name: "Ankara Dresses", count: 5, revenue: 2100 },
      { name: "Traditional Wear", count: 3, revenue: 1350 }
    ],
    salesTrends: [
      { month: "Jan", sales: 2800, orders: 77 },
      { month: "Feb", sales: 3100, orders: 85 },
      { month: "Mar", sales: 3300, orders: 91 },
      { month: "Apr", sales: 3450, orders: 95 },
      { month: "May", sales: 3600, orders: 99 },
      { month: "Jun", sales: 3800, orders: 105 }
    ],
    customerDemographics: {
      ageGroups: [
        { group: "18-25", percentage: 30 },
        { group: "26-35", percentage: 40 },
        { group: "36-45", percentage: 20 },
        { group: "46-55", percentage: 8 },
        { group: "55+", percentage: 2 }
      ],
      locations: [
        { location: "Manchester", percentage: 45 },
        { location: "London", percentage: 30 },
        { location: "Liverpool", percentage: 15 },
        { location: "Other UK", percentage: 10 }
      ]
    }
  },
  {
    id: "V007",
    name: "Shea Butter Co",
    email: "contact@sheabutterco.com",
    phone: "+44 121 345 6789",
    location: "Birmingham, UK",
    category: "Beauty & Personal Care",
    status: "approved",
    joinDate: "2024-01-08",
    revenue: "£11,230",
    products: 28,
    rating: 4.8,
    documents: "Complete",
    storeStats: {
      totalSales: 11230,
      totalOrders: 298,
      averageOrderValue: 37.68,
      conversionRate: 3.5,
      returnRate: 1.9,
      customerSatisfaction: 4.8,
      responseTime: "2.1 hours",
      fulfillmentRate: 98.9,
      activeProducts: 28,
      totalProducts: 32,
      monthlyGrowth: 16.8,
      topSellingProduct: "Pure Shea Butter",
      customerReviews: 189,
      repeatCustomers: 78,
      socialMediaFollowers: 1650,
      websiteVisits: 11200,
      averageRating: 4.8,
      onTimeDelivery: 97.5,
      customerSupportScore: 4.7
    },
    productCategories: [
      { name: "Shea Butter Products", count: 15, revenue: 6800 },
      { name: "Hair Care", count: 8, revenue: 3200 },
      { name: "Skin Care", count: 5, revenue: 1230 }
    ],
    salesTrends: [
      { month: "Jan", sales: 8200, orders: 218 },
      { month: "Feb", sales: 9200, orders: 244 },
      { month: "Mar", sales: 10200, orders: 271 },
      { month: "Apr", sales: 11230, orders: 298 },
      { month: "May", sales: 12100, orders: 321 },
      { month: "Jun", sales: 13000, orders: 345 }
    ],
    customerDemographics: {
      ageGroups: [
        { group: "18-25", percentage: 22 },
        { group: "26-35", percentage: 38 },
        { group: "36-45", percentage: 25 },
        { group: "46-55", percentage: 12 },
        { group: "55+", percentage: 3 }
      ],
      locations: [
        { location: "Birmingham", percentage: 35 },
        { location: "London", percentage: 25 },
        { location: "Manchester", percentage: 20 },
        { location: "Other UK", percentage: 20 }
      ]
    }
  },
  {
    id: "V008",
    name: "Nigerian Spices Co",
    email: "info@nigerianspices.co.uk",
    phone: "+44 20 7890 5678",
    location: "London, UK",
    category: "Food & Beverages",
    status: "suspended",
    joinDate: "2024-01-03",
    revenue: "£9,870",
    products: 15,
    rating: 4.3,
    documents: "Incomplete",
    storeStats: {
      totalSales: 9870,
      totalOrders: 267,
      averageOrderValue: 36.97,
      conversionRate: 2.9,
      returnRate: 3.2,
      customerSatisfaction: 4.3,
      responseTime: "3.8 hours",
      fulfillmentRate: 96.2,
      activeProducts: 15,
      totalProducts: 18,
      monthlyGrowth: 5.4,
      topSellingProduct: "Nigerian Pepper Mix",
      customerReviews: 134,
      repeatCustomers: 56,
      socialMediaFollowers: 980,
      websiteVisits: 8900,
      averageRating: 4.3,
      onTimeDelivery: 93.8,
      customerSupportScore: 4.1
    },
    productCategories: [
      { name: "Spice Mixes", count: 8, revenue: 5200 },
      { name: "Individual Spices", count: 7, revenue: 4670 }
    ],
    salesTrends: [
      { month: "Jan", sales: 8200, orders: 222 },
      { month: "Feb", sales: 8700, orders: 235 },
      { month: "Mar", sales: 9200, orders: 249 },
      { month: "Apr", sales: 9870, orders: 267 },
      { month: "May", sales: 10200, orders: 276 },
      { month: "Jun", sales: 10500, orders: 284 }
    ],
    customerDemographics: {
      ageGroups: [
        { group: "18-25", percentage: 18 },
        { group: "26-35", percentage: 32 },
        { group: "36-45", percentage: 30 },
        { group: "46-55", percentage: 16 },
        { group: "55+", percentage: 4 }
      ],
      locations: [
        { location: "London", percentage: 45 },
        { location: "Manchester", percentage: 20 },
        { location: "Birmingham", percentage: 18 },
        { location: "Other UK", percentage: 17 }
      ]
    }
  },
  {
    id: "V009",
    name: "Kente Collections",
    email: "hello@kentecollections.uk",
    phone: "+44 161 567 1234",
    location: "Manchester, UK",
    category: "Fashion & Clothing",
    status: "pending",
    joinDate: "2024-01-20",
    revenue: "£2,340",
    products: 6,
    rating: 4.6,
    documents: "Pending",
    storeStats: {
      totalSales: 2340,
      totalOrders: 64,
      averageOrderValue: 36.56,
      conversionRate: 1.8,
      returnRate: 2.1,
      customerSatisfaction: 4.6,
      responseTime: "4.5 hours",
      fulfillmentRate: 95.3,
      activeProducts: 6,
      totalProducts: 8,
      monthlyGrowth: 12.3,
      topSellingProduct: "Kente Scarf",
      customerReviews: 42,
      repeatCustomers: 18,
      socialMediaFollowers: 320,
      websiteVisits: 2800,
      averageRating: 4.6,
      onTimeDelivery: 93.1,
      customerSupportScore: 4.4
    },
    productCategories: [
      { name: "Kente Accessories", count: 4, revenue: 1680 },
      { name: "Traditional Wear", count: 2, revenue: 660 }
    ],
    salesTrends: [
      { month: "Jan", sales: 1800, orders: 49 },
      { month: "Feb", sales: 2000, orders: 55 },
      { month: "Mar", sales: 2200, orders: 60 },
      { month: "Apr", sales: 2340, orders: 64 },
      { month: "May", sales: 2500, orders: 68 },
      { month: "Jun", sales: 2700, orders: 74 }
    ],
    customerDemographics: {
      ageGroups: [
        { group: "18-25", percentage: 25 },
        { group: "26-35", percentage: 35 },
        { group: "36-45", percentage: 25 },
        { group: "46-55", percentage: 12 },
        { group: "55+", percentage: 3 }
      ],
      locations: [
        { location: "Manchester", percentage: 40 },
        { location: "London", percentage: 30 },
        { location: "Liverpool", percentage: 20 },
        { location: "Other UK", percentage: 10 }
      ]
    }
  },
  {
    id: "V010",
    name: "Moringa Health",
    email: "contact@moringahealth.com",
    phone: "+44 121 345 1234",
    location: "Birmingham, UK",
    category: "Health & Wellness",
    status: "approved",
    joinDate: "2024-01-14",
    revenue: "£7,890",
    products: 22,
    rating: 4.7,
    documents: "Complete",
    storeStats: {
      totalSales: 7890,
      totalOrders: 212,
      averageOrderValue: 37.22,
      conversionRate: 3.1,
      returnRate: 1.5,
      customerSatisfaction: 4.7,
      responseTime: "2.4 hours",
      fulfillmentRate: 98.6,
      activeProducts: 22,
      totalProducts: 25,
      monthlyGrowth: 14.7,
      topSellingProduct: "Moringa Powder",
      customerReviews: 145,
      repeatCustomers: 67,
      socialMediaFollowers: 1200,
      websiteVisits: 8900,
      averageRating: 4.7,
      onTimeDelivery: 97.2,
      customerSupportScore: 4.6
    },
    productCategories: [
      { name: "Moringa Products", count: 12, revenue: 4800 },
      { name: "Health Supplements", count: 8, revenue: 2400 },
      { name: "Wellness Products", count: 2, revenue: 690 }
    ],
    salesTrends: [
      { month: "Jan", sales: 5800, orders: 156 },
      { month: "Feb", sales: 6500, orders: 175 },
      { month: "Mar", sales: 7200, orders: 193 },
      { month: "Apr", sales: 7890, orders: 212 },
      { month: "May", sales: 8500, orders: 228 },
      { month: "Jun", sales: 9200, orders: 247 }
    ],
    customerDemographics: {
      ageGroups: [
        { group: "18-25", percentage: 15 },
        { group: "26-35", percentage: 30 },
        { group: "36-45", percentage: 35 },
        { group: "46-55", percentage: 18 },
        { group: "55+", percentage: 2 }
      ],
      locations: [
        { location: "Birmingham", percentage: 40 },
        { location: "London", percentage: 25 },
        { location: "Manchester", percentage: 20 },
        { location: "Other UK", percentage: 15 }
      ]
    }
  },
  {
    id: "V011",
    name: "African Crafts Co",
    email: "info@africancrafts.uk",
    phone: "+44 20 7890 6666",
    location: "London, UK",
    category: "Arts & Crafts",
    status: "review",
    joinDate: "2024-01-16",
    revenue: "£4,560",
    products: 14,
    rating: 4.4,
    documents: "Pending",
    storeStats: {
      totalSales: 4560,
      totalOrders: 123,
      averageOrderValue: 37.07,
      conversionRate: 2.4,
      returnRate: 2.8,
      customerSatisfaction: 4.4,
      responseTime: "3.2 hours",
      fulfillmentRate: 97.6,
      activeProducts: 14,
      totalProducts: 16,
      monthlyGrowth: 9.8,
      topSellingProduct: "Handmade Beaded Necklace",
      customerReviews: 78,
      repeatCustomers: 34,
      socialMediaFollowers: 680,
      websiteVisits: 5200,
      averageRating: 4.4,
      onTimeDelivery: 95.9,
      customerSupportScore: 4.3
    },
    productCategories: [
      { name: "Beaded Jewelry", count: 8, revenue: 2800 },
      { name: "Handmade Crafts", count: 6, revenue: 1760 }
    ],
    salesTrends: [
      { month: "Jan", sales: 3600, orders: 97 },
      { month: "Feb", sales: 4000, orders: 108 },
      { month: "Mar", sales: 4300, orders: 116 },
      { month: "Apr", sales: 4560, orders: 123 },
      { month: "May", sales: 4800, orders: 130 },
      { month: "Jun", sales: 5100, orders: 138 }
    ],
    customerDemographics: {
      ageGroups: [
        { group: "18-25", percentage: 20 },
        { group: "26-35", percentage: 35 },
        { group: "36-45", percentage: 28 },
        { group: "46-55", percentage: 14 },
        { group: "55+", percentage: 3 }
      ],
      locations: [
        { location: "London", percentage: 50 },
        { location: "Manchester", percentage: 20 },
        { location: "Birmingham", percentage: 15 },
        { location: "Other UK", percentage: 15 }
      ]
    }
  },
  {
    id: "V012",
    name: "Yoruba Beads",
    email: "hello@yorubabeads.co.uk",
    phone: "+44 161 567 8888",
    location: "Manchester, UK",
    category: "Jewelry & Accessories",
    status: "approved",
    joinDate: "2024-01-09",
    revenue: "£13,450",
    products: 35,
    rating: 4.9,
    documents: "Complete",
    storeStats: {
      totalSales: 13450,
      totalOrders: 356,
      averageOrderValue: 37.78,
      conversionRate: 3.9,
      returnRate: 1.2,
      customerSatisfaction: 4.9,
      responseTime: "1.9 hours",
      fulfillmentRate: 99.3,
      activeProducts: 35,
      totalProducts: 40,
      monthlyGrowth: 20.1,
      topSellingProduct: "Yoruba Beaded Bracelet",
      customerReviews: 234,
      repeatCustomers: 112,
      socialMediaFollowers: 2100,
      websiteVisits: 14500,
      averageRating: 4.9,
      onTimeDelivery: 98.5,
      customerSupportScore: 4.8
    },
    productCategories: [
      { name: "Beaded Jewelry", count: 20, revenue: 8200 },
      { name: "Traditional Accessories", count: 10, revenue: 3800 },
      { name: "Modern Jewelry", count: 5, revenue: 1450 }
    ],
    salesTrends: [
      { month: "Jan", sales: 9800, orders: 259 },
      { month: "Feb", sales: 11200, orders: 296 },
      { month: "Mar", sales: 12400, orders: 328 },
      { month: "Apr", sales: 13450, orders: 356 },
      { month: "May", sales: 14500, orders: 384 },
      { month: "Jun", sales: 15600, orders: 413 }
    ],
    customerDemographics: {
      ageGroups: [
        { group: "18-25", percentage: 22 },
        { group: "26-35", percentage: 38 },
        { group: "36-45", percentage: 25 },
        { group: "46-55", percentage: 12 },
        { group: "55+", percentage: 3 }
      ],
      locations: [
        { location: "Manchester", percentage: 35 },
        { location: "London", percentage: 30 },
        { location: "Liverpool", percentage: 20 },
        { location: "Other UK", percentage: 15 }
      ]
    }
  },
  {
    id: "V013",
    name: "Ghanaian Cocoa",
    email: "contact@ghanaiancocoa.uk",
    phone: "+44 121 345 7777",
    location: "Birmingham, UK",
    category: "Food & Beverages",
    status: "pending",
    joinDate: "2024-01-22",
    revenue: "£1,890",
    products: 4,
    rating: 4.2,
    documents: "Incomplete"
  },
  {
    id: "V014",
    name: "Senegalese Fabric",
    email: "info@senegalesefabric.com",
    phone: "+44 20 7890 9999",
    location: "London, UK",
    category: "Clothing",
    status: "approved",
    joinDate: "2024-01-11",
    revenue: "£16,780",
    products: 42,
    rating: 4.8,
    documents: "Complete"
  },
  {
    id: "V015",
    name: "Ethiopian Coffee",
    email: "hello@ethiopiancoffee.uk",
    phone: "+44 161 567 0000",
    location: "Manchester, UK",
    category: "Food",
    status: "suspended",
    joinDate: "2024-01-07",
    revenue: "£8,920",
    products: 19,
    rating: 4.1,
    documents: "Incomplete"
  }
];

export function VendorManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [selectedStoreVendor, setSelectedStoreVendor] = useState<any>(null);
  const { toast } = useToast();

  // Add vendor form state
  const [addVendorForm, setAddVendorForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    country: "United Kingdom",
    category: "",
    businessType: "",
    description: "",
    website: "",
    taxId: "",
    bankAccount: "",
    contactPerson: "",
    emergencyContact: ""
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      case "suspended":
        return <Badge className="bg-destructive text-destructive-foreground">Suspended</Badge>;
      case "review":
        return <Badge variant="outline">Under Review</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredVendors = vendorData.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || vendor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVendors = filteredVendors.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Export Successful",
        description: "Vendor data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export vendor data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddVendor = () => {
    setShowAddModal(true);
  };

  const handleAddVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingVendor(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate new vendor ID
      const newVendorId = `V${String(vendorData.length + 1).padStart(3, '0')}`;
      
      // Create new vendor object
      const newVendor = {
        id: newVendorId,
        name: addVendorForm.name,
        email: addVendorForm.email,
        phone: addVendorForm.phone,
        location: addVendorForm.location,
        category: addVendorForm.category,
        status: "pending",
        joinDate: new Date().toISOString().split('T')[0],
        revenue: "£0",
        products: 0,
        rating: 0,
        documents: "Incomplete"
      };
      
      // In a real app, this would be an API call
      // vendorData.push(newVendor);
      
      toast({
        title: "Vendor Added Successfully",
        description: `Vendor ${addVendorForm.name} has been added and is pending approval.`,
      });
      
      // Reset form and close modal
      setAddVendorForm({
        name: "",
        email: "",
        phone: "",
        location: "",
        country: "United Kingdom",
        category: "",
        businessType: "",
        description: "",
        website: "",
        taxId: "",
        bankAccount: "",
        contactPerson: "",
        emergencyContact: ""
      });
      setShowAddModal(false);
      
    } catch (error) {
      toast({
        title: "Failed to Add Vendor",
        description: "An error occurred while adding the vendor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingVendor(false);
    }
  };

  const handleAddVendorFormChange = (field: string, value: string) => {
    setAddVendorForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleViewVendor = (vendor: any) => {
    setSelectedVendor(vendor);
  };

  const handleViewStore = (vendor: any) => {
    navigate(`/admin/vendor-store/${vendor.id}`);
  };

  const handleApproveVendor = async (vendorId: string) => {
    setIsLoading(vendorId);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Vendor Approved",
        description: `Vendor ${vendorId} has been approved successfully.`,
      });
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "Failed to approve vendor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleSuspendVendor = async (vendorId: string) => {
    setIsLoading(vendorId);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Vendor Suspended",
        description: `Vendor ${vendorId} has been suspended.`,
      });
    } catch (error) {
      toast({
        title: "Suspension Failed",
        description: "Failed to suspend vendor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleContactVendor = (vendorId: string, method: string) => {
    toast({
      title: "Contact Initiated",
      description: `Contacting vendor ${vendorId} via ${method}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendor Management</h1>
          <p className="text-muted-foreground">Manage and monitor marketplace vendors</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportData}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-primary to-dashboard-accent"
            onClick={handleAddVendor}
          >
            Add Vendor
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-card">
          <TabsTrigger value="all">All ({vendorData.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({vendorData.filter(v => v.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({vendorData.filter(v => v.status === "approved").length})</TabsTrigger>
          <TabsTrigger value="review">Review ({vendorData.filter(v => v.status === "review").length})</TabsTrigger>
          <TabsTrigger value="suspended">Suspended ({vendorData.filter(v => v.status === "suspended").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>All Vendors</CardTitle>
              <CardDescription>Complete list of marketplace vendors</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentVendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{vendor.name}</div>
                          <div className="text-sm text-muted-foreground">{vendor.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {vendor.email}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            {vendor.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{vendor.category}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                      <TableCell className="text-center">{vendor.products}</TableCell>
                      <TableCell className="font-mono">{vendor.revenue}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-sm">★ {vendor.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewVendor(vendor)}
                            title="View Vendor Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewStore(vendor)}
                            title="View Store & Statistics"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Store className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleContactVendor(vendor.id, "email")}
                            disabled={isLoading === vendor.id}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleContactVendor(vendor.id, "phone")}
                            disabled={isLoading === vendor.id}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          {vendor.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApproveVendor(vendor.id)}
                              disabled={isLoading === vendor.id}
                            >
                              <CheckCircle className="h-4 w-4 text-success" />
                            </Button>
                          )}
                          {vendor.status === "approved" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSuspendVendor(vendor.id)}
                              disabled={isLoading === vendor.id}
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                          {vendor.status === "suspended" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApproveVendor(vendor.id)}
                              disabled={isLoading === vendor.id}
                            >
                              <CheckCircle className="h-4 w-4 text-success" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={filteredVendors.length}
                itemsPerPage={itemsPerPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tab contents would be similar but filtered */}
        <TabsContent value="pending">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-warning" />
                <span>Pending Approval</span>
              </CardTitle>
              <CardDescription>Vendors awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentVendors.filter(v => v.status === "pending").map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{vendor.name}</div>
                          <div className="text-sm text-muted-foreground">{vendor.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {vendor.email}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            {vendor.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{vendor.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={vendor.documents === "Complete" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                          {vendor.documents}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{vendor.products}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-sm">★ {vendor.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewVendor(vendor)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApproveVendor(vendor.id)}
                            disabled={isLoading === vendor.id}
                          >
                            <CheckCircle className="h-4 w-4 text-success" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleContactVendor(vendor.id, "email")}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={filteredVendors.filter(v => v.status === "pending").length}
                itemsPerPage={itemsPerPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span>Approved Vendors</span>
              </CardTitle>
              <CardDescription>Successfully approved vendors</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentVendors.filter(v => v.status === "approved").map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{vendor.name}</div>
                          <div className="text-sm text-muted-foreground">{vendor.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {vendor.email}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            {vendor.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{vendor.category}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{vendor.products}</TableCell>
                      <TableCell className="font-mono">{vendor.revenue}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-sm">★ {vendor.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewVendor(vendor)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSuspendVendor(vendor.id)}
                            disabled={isLoading === vendor.id}
                          >
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleContactVendor(vendor.id, "email")}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={filteredVendors.filter(v => v.status === "approved").length}
                itemsPerPage={itemsPerPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Under Review</span>
              </CardTitle>
              <CardDescription>Vendors currently being reviewed</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentVendors.filter(v => v.status === "review").map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{vendor.name}</div>
                          <div className="text-sm text-muted-foreground">{vendor.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {vendor.email}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            {vendor.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{vendor.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={vendor.documents === "Complete" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                          {vendor.documents}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{vendor.products}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-sm">★ {vendor.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewVendor(vendor)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApproveVendor(vendor.id)}
                            disabled={isLoading === vendor.id}
                          >
                            <CheckCircle className="h-4 w-4 text-success" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleContactVendor(vendor.id, "email")}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={filteredVendors.filter(v => v.status === "review").length}
                itemsPerPage={itemsPerPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suspended">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <span>Suspended Vendors</span>
              </CardTitle>
              <CardDescription>Suspended vendors</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentVendors.filter(v => v.status === "suspended").map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{vendor.name}</div>
                          <div className="text-sm text-muted-foreground">{vendor.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {vendor.email}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            {vendor.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{vendor.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={vendor.documents === "Complete" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                          {vendor.documents}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{vendor.products}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-sm">★ {vendor.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewVendor(vendor)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApproveVendor(vendor.id)}
                            disabled={isLoading === vendor.id}
                          >
                            <CheckCircle className="h-4 w-4 text-success" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleContactVendor(vendor.id, "email")}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={filteredVendors.filter(v => v.status === "suspended").length}
                itemsPerPage={itemsPerPage}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Vendor Profile Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Vendor Profile - {selectedVendor.name}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedVendor(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Vendor Information</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Vendor ID:</strong> {selectedVendor.id}</div>
                  <div><strong>Name:</strong> {selectedVendor.name}</div>
                  <div><strong>Email:</strong> {selectedVendor.email}</div>
                  <div><strong>Phone:</strong> {selectedVendor.phone}</div>
                  <div><strong>Location:</strong> {selectedVendor.location}</div>
                  <div><strong>Category:</strong> {selectedVendor.category}</div>
                  <div><strong>Join Date:</strong> {selectedVendor.joinDate}</div>
                  <div><strong>Status:</strong> {getStatusBadge(selectedVendor.status)}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Performance Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Total Revenue:</strong> {selectedVendor.revenue}</div>
                  <div><strong>Products Listed:</strong> {selectedVendor.products}</div>
                  <div><strong>Rating:</strong> ★ {selectedVendor.rating}</div>
                  <div><strong>Documents:</strong> {selectedVendor.documents}</div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Quick Actions</h4>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleContactVendor(selectedVendor.id, "email")}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleContactVendor(selectedVendor.id, "phone")}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-2">
              {selectedVendor.status === "pending" && (
                <Button onClick={() => handleApproveVendor(selectedVendor.id)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Vendor
                </Button>
              )}
              {selectedVendor.status === "approved" && (
                <Button variant="destructive" onClick={() => handleSuspendVendor(selectedVendor.id)}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Suspend Vendor
                </Button>
              )}
              {selectedVendor.status === "suspended" && (
                <Button onClick={() => handleApproveVendor(selectedVendor.id)}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Reactivate Vendor
                </Button>
              )}
              <Button variant="outline" onClick={() => setSelectedVendor(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add New Vendor</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleAddVendorSubmit} className="space-y-4">
              <div>
                <label htmlFor="add-name" className="block text-sm font-medium text-foreground mb-1">
                  Vendor Name
                </label>
                <Input
                  id="add-name"
                  type="text"
                  value={addVendorForm.name}
                  onChange={(e) => handleAddVendorFormChange("name", e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="add-email" className="block text-sm font-medium text-foreground mb-1">
                  Email
                </label>
                <Input
                  id="add-email"
                  type="email"
                  value={addVendorForm.email}
                  onChange={(e) => handleAddVendorFormChange("email", e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="add-phone" className="block text-sm font-medium text-foreground mb-1">
                  Phone
                </label>
                <Input
                  id="add-phone"
                  type="tel"
                  value={addVendorForm.phone}
                  onChange={(e) => handleAddVendorFormChange("phone", e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="add-location" className="block text-sm font-medium text-foreground mb-1">
                  Location
                </label>
                <Input
                  id="add-location"
                  type="text"
                  value={addVendorForm.location}
                  onChange={(e) => handleAddVendorFormChange("location", e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="add-country" className="block text-sm font-medium text-foreground mb-1">
                  Country
                </label>
                <Select onValueChange={(value) => handleAddVendorFormChange("country", value)} value={addVendorForm.country}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="add-category" className="block text-sm font-medium text-foreground mb-1">
                  Category
                </label>
                <Select onValueChange={(value) => handleAddVendorFormChange("category", value)} value={addVendorForm.category}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendorCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="add-businessType" className="block text-sm font-medium text-foreground mb-1">
                  Business Type
                </label>
                <Input
                  id="add-businessType"
                  type="text"
                  value={addVendorForm.businessType}
                  onChange={(e) => handleAddVendorFormChange("businessType", e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="add-description" className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <textarea
                  id="add-description"
                  value={addVendorForm.description}
                  onChange={(e) => handleAddVendorFormChange("description", e.target.value)}
                  rows={3}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="add-website" className="block text-sm font-medium text-foreground mb-1">
                  Website
                </label>
                <Input
                  id="add-website"
                  type="url"
                  value={addVendorForm.website}
                  onChange={(e) => handleAddVendorFormChange("website", e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="add-taxId" className="block text-sm font-medium text-foreground mb-1">
                  Tax ID
                </label>
                <Input
                  id="add-taxId"
                  type="text"
                  value={addVendorForm.taxId}
                  onChange={(e) => handleAddVendorFormChange("taxId", e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="add-bankAccount" className="block text-sm font-medium text-foreground mb-1">
                  Bank Account
                </label>
                <Input
                  id="add-bankAccount"
                  type="text"
                  value={addVendorForm.bankAccount}
                  onChange={(e) => handleAddVendorFormChange("bankAccount", e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="add-contactPerson" className="block text-sm font-medium text-foreground mb-1">
                  Contact Person
                </label>
                <Input
                  id="add-contactPerson"
                  type="text"
                  value={addVendorForm.contactPerson}
                  onChange={(e) => handleAddVendorFormChange("contactPerson", e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="add-emergencyContact" className="block text-sm font-medium text-foreground mb-1">
                  Emergency Contact
                </label>
                <Input
                  id="add-emergencyContact"
                  type="text"
                  value={addVendorForm.emergencyContact}
                  onChange={(e) => handleAddVendorFormChange("emergencyContact", e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isAddingVendor}>
                {isAddingVendor ? "Adding..." : "Add Vendor"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Vendor Store View Modal */}
      {showStoreModal && selectedStoreVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Store className="h-6 w-6 text-blue-600" />
                    {selectedStoreVendor.name} - Store Analytics
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    Comprehensive store statistics and performance metrics
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStoreModal(false)}
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Store Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                        <p className="text-2xl font-bold text-foreground">
                          £{selectedStoreVendor.storeStats.totalSales.toLocaleString()}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold text-foreground">
                          {selectedStoreVendor.storeStats.totalOrders.toLocaleString()}
                        </p>
                      </div>
                      <ShoppingCart className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                        <p className="text-2xl font-bold text-foreground">
                          £{selectedStoreVendor.storeStats.averageOrderValue}
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Customer Rating</p>
                        <p className="text-2xl font-bold text-foreground flex items-center">
                          {selectedStoreVendor.storeStats.averageRating}
                          <Star className="h-4 w-4 text-yellow-500 ml-1 fill-current" />
                        </p>
                      </div>
                      <Star className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                        <p className="text-lg font-semibold">{selectedStoreVendor.storeStats.conversionRate}%</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Return Rate</p>
                        <p className="text-lg font-semibold">{selectedStoreVendor.storeStats.returnRate}%</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Fulfillment Rate</p>
                        <p className="text-lg font-semibold">{selectedStoreVendor.storeStats.fulfillmentRate}%</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">On-Time Delivery</p>
                        <p className="text-lg font-semibold">{selectedStoreVendor.storeStats.onTimeDelivery}%</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                        <p className="text-lg font-semibold">{selectedStoreVendor.storeStats.responseTime}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Monthly Growth</p>
                        <p className="text-lg font-semibold text-green-600">+{selectedStoreVendor.storeStats.monthlyGrowth}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Customer Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Customer Reviews</p>
                        <p className="text-lg font-semibold">{selectedStoreVendor.storeStats.customerReviews}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Repeat Customers</p>
                        <p className="text-lg font-semibold">{selectedStoreVendor.storeStats.repeatCustomers}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Social Followers</p>
                        <p className="text-lg font-semibold">{selectedStoreVendor.storeStats.socialMediaFollowers.toLocaleString()}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Website Visits</p>
                        <p className="text-lg font-semibold">{selectedStoreVendor.storeStats.websiteVisits.toLocaleString()}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Customer Satisfaction</p>
                        <p className="text-lg font-semibold flex items-center">
                          {selectedStoreVendor.storeStats.customerSatisfaction}
                          <Star className="h-4 w-4 text-yellow-500 ml-1 fill-current" />
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Support Score</p>
                        <p className="text-lg font-semibold flex items-center">
                          {selectedStoreVendor.storeStats.customerSupportScore}
                          <Star className="h-4 w-4 text-yellow-500 ml-1 fill-current" />
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Product Categories & Sales Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Product Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedStoreVendor.productCategories.map((category: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-muted-foreground">{category.count} products</p>
                          </div>
                          <p className="font-semibold">£{category.revenue.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Sales Trends (Last 6 Months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedStoreVendor.salesTrends.map((trend: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{trend.month}</p>
                            <p className="text-sm text-muted-foreground">{trend.orders} orders</p>
                          </div>
                          <p className="font-semibold">£{trend.sales.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customer Demographics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Age Demographics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedStoreVendor.customerDemographics.ageGroups.map((ageGroup: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{ageGroup.group}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${ageGroup.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold">{ageGroup.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Geographic Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedStoreVendor.customerDemographics.locations.map((location: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{location.location}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${location.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold">{location.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Selling Product */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Top Performing Product
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div>
                      <p className="text-lg font-semibold">{selectedStoreVendor.storeStats.topSellingProduct}</p>
                      <p className="text-sm text-muted-foreground">Best selling product in this store</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-muted-foreground">Product Performance</p>
                      <p className="text-lg font-bold text-green-600">Excellent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowStoreModal(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    toast({
                      title: "Export Successful",
                      description: `Store analytics for ${selectedStoreVendor.name} have been exported.`,
                    });
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Analytics
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
