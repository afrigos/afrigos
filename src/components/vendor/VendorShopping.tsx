import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  ShoppingBag, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Star,
  Eye,
  Heart,
  ShoppingCart,
  Package,
  Users,
  MapPin,
  Calendar,
  Filter,
  SortAsc,
  SortDesc,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Bookmark,
  Share,
  MessageSquare,
  BarChart3,
  PieChart,
  Target,
  Globe,
  Tag,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  Plus,
  Minus,
  ShoppingBasket,
  Store,
  TrendingUp as GrowthIcon,
  Grid,
  List
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock marketplace data
const marketplaceData = {
  featuredProducts: [
    {
      id: "MP001",
      name: "Premium Ethiopian Coffee Beans",
      vendor: "East African Delights",
      price: 24.99,
      originalPrice: 29.99,
      rating: 4.8,
      reviews: 156,
      sales: 234,
      category: "Food & Beverages",
      location: "London, UK",
      image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=200&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=400&fit=crop"
      ],
      tags: ["Organic", "Fair Trade", "Premium"],
      description: "Single-origin Ethiopian coffee beans, roasted to perfection",
      inStock: true,
      discount: 17,
      isBookmarked: false
    },
    {
      id: "MP002",
      name: "Handwoven Ghanaian Kente Cloth",
      vendor: "Heritage Crafts Co.",
      price: 89.99,
      originalPrice: 89.99,
      rating: 4.9,
      reviews: 89,
      sales: 45,
      category: "Fashion & Clothing",
      location: "Manchester, UK",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"
      ],
      tags: ["Handmade", "Traditional", "Cultural"],
      description: "Authentic handwoven Kente cloth from Ghana",
      inStock: true,
      discount: 0,
      isBookmarked: true
    },
    {
      id: "MP003",
      name: "Nigerian Palm Oil - 1L",
      vendor: "African Kitchen Essentials",
      price: 12.50,
      originalPrice: 15.00,
      rating: 4.6,
      reviews: 234,
      sales: 567,
      category: "Food & Beverages",
      location: "Birmingham, UK",
      image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=200&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop"
      ],
      tags: ["Natural", "Traditional", "Cooking"],
      description: "Pure Nigerian palm oil for authentic African cooking",
      inStock: true,
      discount: 17,
      isBookmarked: false
    }
  ],
  trendingCategories: [
    { name: "Food & Beverages", growth: 25.3, products: 1247, avgPrice: 18.50 },
    { name: "Beauty & Personal Care", growth: 18.7, products: 892, avgPrice: 24.99 },
    { name: "Fashion & Clothing", growth: 12.4, products: 567, avgPrice: 45.75 },
    { name: "Health & Wellness", growth: 22.1, products: 345, avgPrice: 32.25 },
    { name: "Home & Garden", growth: 15.8, products: 234, avgPrice: 67.50 },
    { name: "Arts & Crafts", growth: 8.9, products: 189, avgPrice: 89.99 }
  ],
  competitorAnalysis: [
    {
      vendor: "East African Delights",
      products: 45,
      rating: 4.8,
      totalSales: 2341,
      revenue: 45670.50,
      categories: ["Food & Beverages", "Spices & Seasonings"],
      location: "London, UK",
      established: "2020",
      growth: 18.5,
      topProducts: ["Ethiopian Coffee", "Berbere Spice Mix", "Teff Flour"]
    },
    {
      vendor: "Heritage Crafts Co.",
      products: 23,
      rating: 4.9,
      totalSales: 567,
      revenue: 28950.75,
      categories: ["Fashion & Clothing", "Arts & Crafts"],
      location: "Manchester, UK",
      established: "2019",
      growth: 12.3,
      topProducts: ["Kente Cloth", "Adinkra Symbols", "Traditional Bags"]
    },
    {
      vendor: "African Kitchen Essentials",
      products: 67,
      rating: 4.6,
      totalSales: 1234,
      revenue: 15670.25,
      categories: ["Food & Beverages", "Cooking Ingredients"],
      location: "Birmingham, UK",
      established: "2021",
      growth: 25.7,
      topProducts: ["Palm Oil", "Cocoa Powder", "Plantain Flour"]
    }
  ],
  marketInsights: {
    totalVendors: 1247,
    totalProducts: 45670,
    avgOrderValue: 36.63,
    topSellingCategories: [
      { category: "Food & Beverages", percentage: 42.6, trend: "up" },
      { category: "Beauty & Personal Care", percentage: 28.3, trend: "up" },
      { category: "Fashion & Clothing", percentage: 18.7, trend: "stable" },
      { category: "Health & Wellness", percentage: 10.4, trend: "up" }
    ],
    priceRanges: [
      { range: "Under £10", percentage: 25.4 },
      { range: "£10 - £25", percentage: 35.7 },
      { range: "£25 - £50", percentage: 22.8 },
      { range: "£50 - £100", percentage: 12.6 },
      { range: "Over £100", percentage: 3.5 }
    ]
  }
};

export function VendorShopping() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [bookmarkedProducts, setBookmarkedProducts] = useState<Set<string>>(new Set(["MP002"]));
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [shoppingCart, setShoppingCart] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedCompetitor, setSelectedCompetitor] = useState<any>(null);
  const [showCart, setShowCart] = useState(false);
  const { toast } = useToast();

  const handleBookmark = (productId: string) => {
    const newBookmarks = new Set(bookmarkedProducts);
    if (newBookmarks.has(productId)) {
      newBookmarks.delete(productId);
      toast({
        title: "Removed from Bookmarks",
        description: "Product has been removed from your bookmarks.",
      });
    } else {
      newBookmarks.add(productId);
      toast({
        title: "Added to Bookmarks",
        description: "Product has been added to your bookmarks.",
      });
    }
    setBookmarkedProducts(newBookmarks);
  };

  const handleAddToCart = (product: any) => {
    setShoppingCart(prev => [...prev, product]);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your shopping cart.`,
    });
  };

  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
  };

  const handleShareProduct = (product: any) => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this product: ${product.name} by ${product.vendor}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Product link has been copied to clipboard.",
      });
    }
  };

  const handleExploreCategory = (category: any) => {
    setSelectedCategory(category);
    setCategoryFilter(category.name);
    toast({
      title: "Category Filtered",
      description: `Now viewing products in ${category.name}`,
    });
  };

  const handleViewCompetitor = (competitor: any) => {
    setSelectedCompetitor(competitor);
    toast({
      title: "Competitor Analysis",
      description: `Analyzing ${competitor.vendor}`,
    });
  };

  const handleCompetitorAnalytics = (competitor: any) => {
    toast({
      title: "Competitor Analytics",
      description: `Opening detailed analytics for ${competitor.vendor}`,
    });
  };

  const handleViewModeToggle = (mode: "grid" | "list") => {
    setViewMode(mode);
    toast({
      title: "View Mode Changed",
      description: `Switched to ${mode} view`,
    });
  };

  const handleViewBookmarks = () => {
    toast({
      title: "Bookmarks",
      description: `You have ${bookmarkedProducts.size} bookmarked products`,
    });
  };

  const handleViewCart = () => {
    setShowCart(true);
  };

  const handleProceedToCheckout = () => {
    toast({
      title: "Checkout Initiated",
      description: `Proceeding to checkout with ${shoppingCart.length} items totaling ${formatCurrency(shoppingCart.reduce((sum, item) => sum + item.price, 0))}`,
    });
    setShowCart(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const filteredProducts = marketplaceData.featuredProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Marketplace Shopping</h1>
          <p className="text-muted-foreground">Browse products, analyze competitors, and discover market trends</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleViewBookmarks}>
            <Bookmark className="h-4 w-4 mr-2" />
            Bookmarks ({bookmarkedProducts.size})
          </Button>
          <Button variant="outline" size="sm" onClick={handleViewCart}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart ({shoppingCart.length})
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products or vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Food & Beverages">Food & Beverages</SelectItem>
                <SelectItem value="Fashion & Clothing">Fashion & Clothing</SelectItem>
                <SelectItem value="Beauty & Personal Care">Beauty & Personal Care</SelectItem>
                <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
                <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                <SelectItem value="Arts & Crafts">Arts & Crafts</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under-10">Under £10</SelectItem>
                <SelectItem value="10-25">£10 - £25</SelectItem>
                <SelectItem value="25-50">£25 - £50</SelectItem>
                <SelectItem value="50-100">£50 - £100</SelectItem>
                <SelectItem value="over-100">Over £100</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="insights">Market Insights</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Featured Products ({filteredProducts.length})</h2>
            <div className="flex items-center space-x-2">
              <Button 
                variant={viewMode === "grid" ? "default" : "outline"} 
                size="sm"
                onClick={() => handleViewModeToggle("grid")}
              >
                <Grid className="h-4 w-4 mr-2" />
                Grid View
              </Button>
              <Button 
                variant={viewMode === "list" ? "default" : "outline"} 
                size="sm"
                onClick={() => handleViewModeToggle("list")}
              >
                <List className="h-4 w-4 mr-2" />
                List View
              </Button>
            </div>
          </div>

          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {filteredProducts.map((product) => (
              <Card key={product.id} className={`group hover:shadow-lg transition-shadow ${
                viewMode === "list" ? "flex flex-row" : ""
              }`}>
                {viewMode === "grid" ? (
                  <>
                    <div className="relative">
                      <div className="aspect-square overflow-hidden rounded-t-lg bg-muted">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="absolute top-2 left-2">
                        {product.discount > 0 && (
                          <Badge className="bg-red-500 text-white">
                            -{product.discount}%
                          </Badge>
                        )}
                      </div>
                      <div className="absolute top-2 right-2 flex flex-col space-y-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={() => handleBookmark(product.id)}
                        >
                          <Heart 
                            className={`h-4 w-4 ${
                              bookmarkedProducts.has(product.id) 
                                ? 'fill-red-500 text-red-500' 
                                : 'text-muted-foreground'
                            }`} 
                          />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={() => handleShareProduct(product)}
                        >
                          <Share className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
                          <div className="flex items-center space-x-1 ml-2">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{product.rating}</span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">by {product.vendor}</p>
                        
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">{formatCurrency(product.price)}</span>
                          {product.originalPrice > product.price && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatCurrency(product.originalPrice)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{product.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Package className="h-3 w-3" />
                            <span>{product.sales} sold</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {product.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Add to Cart
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleViewProduct(product)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  // List View Layout
                  <>
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-l-lg"
                      />
                      <div className="absolute top-2 left-2">
                        {product.discount > 0 && (
                          <Badge className="bg-red-500 text-white text-xs">
                            -{product.discount}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">by {product.vendor}</p>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{product.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-lg">{formatCurrency(product.price)}</span>
                          {product.originalPrice > product.price && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatCurrency(product.originalPrice)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{product.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Package className="h-4 w-4" />
                            <span>{product.sales} sold</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {product.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleBookmark(product.id)}
                          >
                            <Heart 
                              className={`h-4 w-4 ${
                                bookmarkedProducts.has(product.id) 
                                  ? 'fill-red-500 text-red-500' 
                                  : 'text-muted-foreground'
                              }`} 
                            />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleShareProduct(product)}
                          >
                            <Share className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleViewProduct(product)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trending Categories</CardTitle>
              <CardDescription>Explore popular product categories and their growth trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketplaceData.trendingCategories.map((category) => (
                  <Card key={category.name} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{category.name}</h3>
                          <div className="flex items-center space-x-1">
                            {getGrowthIcon(category.growth)}
                            <span className="text-sm font-medium text-green-600">
                              +{category.growth}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Products</span>
                            <span>{category.products.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Avg Price</span>
                            <span>{formatCurrency(category.avgPrice)}</span>
                          </div>
                        </div>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleExploreCategory(category)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Explore Category
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competitors Tab */}
        <TabsContent value="competitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Competitor Analysis</CardTitle>
              <CardDescription>Analyze similar vendors and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Growth</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marketplaceData.competitorAnalysis.map((competitor) => (
                    <TableRow key={competitor.vendor}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{competitor.vendor}</p>
                          <p className="text-sm text-muted-foreground">{competitor.location}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {competitor.categories.slice(0, 2).map((category) => (
                              <Badge key={category} variant="outline" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{competitor.products}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{competitor.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>{competitor.totalSales.toLocaleString()}</TableCell>
                      <TableCell>{formatCurrency(competitor.revenue)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {getGrowthIcon(competitor.growth)}
                          <span className="text-green-600">+{competitor.growth}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewCompetitor(competitor)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCompetitorAnalytics(competitor)}
                          >
                            <BarChart3 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Market Overview</CardTitle>
                <CardDescription>Key marketplace statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{marketplaceData.marketInsights.totalVendors.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Vendors</div>
                  </div>
                  <div className="text-center p-4 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{marketplaceData.marketInsights.totalProducts.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Products</div>
                  </div>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{formatCurrency(marketplaceData.marketInsights.avgOrderValue)}</div>
                  <div className="text-sm text-muted-foreground">Average Order Value</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Selling Categories</CardTitle>
                <CardDescription>Market share by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketplaceData.marketInsights.topSellingCategories.map((category) => (
                    <div key={category.category} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{category.category}</span>
                        <span>{category.percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Distribution</CardTitle>
                <CardDescription>Product pricing across the marketplace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {marketplaceData.marketInsights.priceRanges.map((range) => (
                    <div key={range.range} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{range.range}</span>
                        <span>{range.percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${range.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Trends</CardTitle>
                <CardDescription>Growth indicators and opportunities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-800">Growing Categories</p>
                    <p className="text-sm text-green-600">Food & Beverages showing strong growth</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-800">Emerging Opportunities</p>
                    <p className="text-sm text-blue-600">Health & Wellness category expanding</p>
                  </div>
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium text-orange-800">Price Optimization</p>
                    <p className="text-sm text-orange-600">Consider £10-£25 price range</p>
                  </div>
                  <DollarSign className="h-5 w-5 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Details Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Detailed information about {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProduct.images?.slice(0, 2).map((img: string, index: number) => (
                      <img
                        key={index}
                        src={img}
                        alt={`${selectedProduct.name} ${index + 1}`}
                        className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          // You could implement image switching here
                        }}
                      />
                    )) || (
                      <>
                        <img
                          src={selectedProduct.image}
                          alt={selectedProduct.name}
                          className="w-full h-20 object-cover rounded"
                        />
                        <img
                          src={selectedProduct.image}
                          alt={selectedProduct.name}
                          className="w-full h-20 object-cover rounded"
                        />
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                    <p className="text-muted-foreground">by {selectedProduct.vendor}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{selectedProduct.rating}</span>
                      <span className="text-muted-foreground">({selectedProduct.reviews} reviews)</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-3xl font-bold">{formatCurrency(selectedProduct.price)}</span>
                      {selectedProduct.originalPrice > selectedProduct.price && (
                        <span className="text-lg text-muted-foreground line-through">
                          {formatCurrency(selectedProduct.originalPrice)}
                        </span>
                      )}
                      {selectedProduct.discount > 0 && (
                        <Badge className="bg-red-500 text-white">
                          -{selectedProduct.discount}% OFF
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Product Information</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <span>{selectedProduct.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span>{selectedProduct.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sales:</span>
                        <span>{selectedProduct.sales} sold</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stock:</span>
                        <span className={selectedProduct.inStock ? 'text-green-600' : 'text-red-600'}>
                          {selectedProduct.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 pt-4">
                    <Button 
                      size="lg" 
                      className="flex-1"
                      onClick={() => handleAddToCart(selectedProduct)}
                      disabled={!selectedProduct.inStock}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => handleBookmark(selectedProduct.id)}
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          bookmarkedProducts.has(selectedProduct.id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-muted-foreground'
                        }`} 
                      />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => handleShareProduct(selectedProduct)}
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Shopping Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shopping Cart</DialogTitle>
            <DialogDescription>
              Review your selected items
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {shoppingCart.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">by {item.vendor}</p>
                  <p className="font-bold">{formatCurrency(item.price)}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShoppingCart(prev => prev.filter((_, i) => i !== index));
                    toast({
                      title: "Item Removed",
                      description: `${item.name} has been removed from cart.`,
                    });
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="font-bold">
                Total: {formatCurrency(shoppingCart.reduce((sum, item) => sum + item.price, 0))}
              </span>
              <Button size="lg" onClick={handleProceedToCheckout}>
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
