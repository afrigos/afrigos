import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertTriangle,
  Package,
  Star,
  Image,
  FileText,
  Tag,
  DollarSign,
  Download,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  Activity,
  Target,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";

const productData = [
  {
    id: "P001",
    name: "Authentic Jollof Rice Spice Mix",
    vendor: "Mama Asha's Kitchen",
    vendorId: "V001",
    category: "Food & Beverages",
    price: "£12.99",
    status: "approved",
    stock: 45,
    images: [
      "https://picsum.photos/400/300?random=1",
      "https://picsum.photos/400/300?random=101",
      "https://picsum.photos/400/300?random=201"
    ],
    description: "Premium West African spice blend for authentic Jollof rice. Imported directly from Nigeria. This traditional blend includes carefully selected spices that have been used for generations to create the perfect Jollof rice flavor. Each batch is hand-mixed to ensure consistency and authenticity.",
    submitted: "2024-01-15",
    compliance: {
      foodSafety: "complete",
      labeling: "complete",
      ingredients: "complete",
      allergens: "complete"
    },
    riskScore: "low",
    rating: 4.8,
    reviews: 156,
    sales: 234,
    specifications: {
      weight: "250g",
      dimensions: "12cm x 8cm x 3cm",
      material: "Natural Spices",
      origin: "Nigeria",
      shelfLife: "18 months",
      certifications: ["Organic", "Halal", "Fair Trade"]
    },
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:45:00Z"
  },
  {
    id: "P002",
    name: "Shea Butter Hair Care Set",
    vendor: "Adunni Beauty",
    vendorId: "V002",
    category: "Beauty & Personal Care",
    price: "£24.99",
    status: "pending",
    stock: 12,
    images: [
      "https://picsum.photos/400/300?random=2",
      "https://picsum.photos/400/300?random=102",
      "https://picsum.photos/400/300?random=202"
    ],
    description: "Natural hair care products made with pure shea butter from Ghana. Suitable for all hair types. This premium set includes shampoo, conditioner, and hair mask, all formulated with organic shea butter and natural ingredients. Perfect for dry, damaged, or curly hair.",
    submitted: "2024-01-16",
    compliance: {
      foodSafety: "complete",
      labeling: "complete",
      ingredients: "complete",
      allergens: "pending"
    },
    riskScore: "low",
    rating: 4.9,
    reviews: 203,
    sales: 189,
    specifications: {
      weight: "500ml each",
      dimensions: "15cm x 8cm x 6cm",
      material: "Natural Ingredients",
      origin: "Ghana",
      shelfLife: "24 months",
      certifications: ["Organic", "Cruelty-Free", "Vegan"]
    },
    createdAt: "2024-01-16T09:15:00Z",
    updatedAt: "2024-01-18T16:30:00Z"
  },
  {
    id: "P003",
    name: "Traditional Kente Cloth Scarf",
    vendor: "Kente Collections",
    vendorId: "V003",
    category: "Fashion & Clothing",
    price: "£89.99",
    status: "rejected",
    stock: 0,
    images: [
      "https://picsum.photos/400/300?random=3",
      "https://picsum.photos/400/300?random=103"
    ],
    description: "Handwoven traditional Kente cloth scarf. Each piece is unique and tells a story. Made with authentic Kente fabric from Ghana, this scarf features traditional patterns and colors that represent cultural heritage and craftsmanship.",
    submitted: "2024-01-14",
    compliance: {
      foodSafety: "complete",
      labeling: "pending",
      ingredients: "complete",
      allergens: "complete"
    },
    riskScore: "medium",
    rating: 4.6,
    reviews: 89,
    sales: 67,
    specifications: {
      weight: "150g",
      dimensions: "180cm x 30cm",
      material: "Kente Fabric",
      origin: "Ghana",
      shelfLife: "N/A",
      certifications: ["Handcrafted", "Traditional"]
    },
    createdAt: "2024-01-14T11:20:00Z",
    updatedAt: "2024-01-16T09:30:00Z"
  },
  {
    id: "P004",
    name: "Moringa Leaf Powder",
    vendor: "Afro Herbs Ltd",
    vendorId: "V004",
    category: "Health & Wellness",
    price: "£18.50",
    status: "review",
    stock: 28,
    images: [
      "https://picsum.photos/400/300?random=4",
      "https://picsum.photos/400/300?random=104",
      "https://picsum.photos/400/300?random=204",
      "https://picsum.photos/400/300?random=304"
    ],
    description: "Organic superfood supplement from Moringa leaves. Rich in vitamins and minerals. This premium powder is sourced from carefully selected Moringa trees and processed to maintain maximum nutritional value.",
    submitted: "2024-01-17",
    compliance: {
      foodSafety: "pending",
      labeling: "complete",
      ingredients: "complete",
      allergens: "complete"
    },
    riskScore: "medium",
    rating: 4.7,
    reviews: 134,
    sales: 98,
    specifications: {
      weight: "200g",
      dimensions: "10cm x 8cm x 4cm",
      material: "Organic Moringa",
      origin: "Kenya",
      shelfLife: "24 months",
      certifications: ["Organic", "Vegan", "Gluten-Free"]
    },
    createdAt: "2024-01-17T08:45:00Z",
    updatedAt: "2024-01-19T12:15:00Z"
  },
  {
    id: "P005",
    name: "Nigerian Pepper Sauce",
    vendor: "Spice Masters",
    vendorId: "V005",
    category: "Food & Beverages",
    price: "£8.99",
    status: "pending",
    stock: 35,
    images: [
      "https://picsum.photos/400/300?random=5",
      "https://picsum.photos/400/300?random=105",
      "https://picsum.photos/400/300?random=205"
    ],
    description: "Authentic Nigerian pepper sauce made with fresh scotch bonnet peppers. This traditional sauce is prepared using age-old recipes and the finest ingredients for authentic taste.",
    submitted: "2024-01-18",
    compliance: {
      foodSafety: "pending",
      labeling: "complete",
      ingredients: "complete",
      allergens: "pending"
    },
    riskScore: "medium",
    rating: 4.5,
    reviews: 78,
    sales: 156,
    specifications: {
      weight: "250ml",
      dimensions: "8cm x 6cm x 4cm",
      material: "Glass Bottle",
      origin: "Nigeria",
      shelfLife: "12 months",
      certifications: ["Traditional", "Authentic"]
    },
    createdAt: "2024-01-18T14:30:00Z",
    updatedAt: "2024-01-20T10:20:00Z"
  },
  {
    id: "P006",
    name: "African Print Dress",
    vendor: "Ankara Express",
    category: "Clothing",
    price: "£45.00",
    status: "pending",
    stock: 8,
    images: 4,
    description: "Beautiful African print dress made with authentic Ankara fabric.",
    submitted: "2024-01-19",
    compliance: {
      foodSafety: "complete",
      labeling: "pending",
      ingredients: "complete",
      allergens: "complete"
    },
    riskScore: "low"
  },
  {
    id: "P007",
    name: "Baobab Fruit Powder",
    vendor: "Afro Herbs Ltd",
    category: "Herbal",
    price: "£15.99",
    status: "pending",
    stock: 22,
    images: 3,
    description: "Pure baobab fruit powder rich in vitamin C and antioxidants.",
    submitted: "2024-01-20",
    compliance: {
      foodSafety: "complete",
      labeling: "complete",
      ingredients: "complete",
      allergens: "complete"
    },
    riskScore: "low"
  },
  {
    id: "P008",
    name: "Yoruba Beaded Necklace",
    vendor: "African Crafts Co",
    category: "Jewelry",
    price: "£65.00",
    status: "pending",
    stock: 5,
    images: 6,
    description: "Handcrafted Yoruba beaded necklace with traditional patterns.",
    submitted: "2024-01-21",
    compliance: {
      foodSafety: "complete",
      labeling: "pending",
      ingredients: "complete",
      allergens: "complete"
    },
    riskScore: "low"
  },
  {
    id: "P009",
    name: "Ghanaian Cocoa Powder",
    vendor: "Spice Masters",
    category: "Food",
    price: "£14.99",
    status: "approved",
    stock: 67,
    images: 4,
    description: "Premium Ghanaian cocoa powder for baking and beverages.",
    submitted: "2024-01-10",
    compliance: {
      foodSafety: "complete",
      labeling: "complete",
      ingredients: "complete",
      allergens: "complete"
    },
    riskScore: "low"
  },
  {
    id: "P010",
    name: "Nigerian Palm Oil",
    vendor: "Mama Asha's Kitchen",
    category: "Food",
    price: "£6.99",
    status: "approved",
    stock: 89,
    images: 3,
    description: "Pure Nigerian palm oil for authentic African cooking.",
    submitted: "2024-01-08",
    compliance: {
      foodSafety: "complete",
      labeling: "complete",
      ingredients: "complete",
      allergens: "complete"
    },
    riskScore: "low"
  },
  {
    id: "P011",
    name: "Senegalese Fabric",
    vendor: "Ankara Express",
    category: "Clothing",
    price: "£28.50",
    status: "pending",
    stock: 15,
    images: 5,
    description: "Authentic Senegalese fabric for traditional clothing.",
    submitted: "2024-01-22",
    compliance: {
      foodSafety: "complete",
      labeling: "pending",
      ingredients: "complete",
      allergens: "complete"
    },
    riskScore: "low"
  },
  {
    id: "P012",
    name: "Kenyan Tea Blend",
    vendor: "Afro Herbs Ltd",
    category: "Herbal",
    price: "£12.99",
    status: "review",
    stock: 42,
    images: 4,
    description: "Traditional Kenyan tea blend with natural herbs.",
    submitted: "2024-01-16",
    compliance: {
      foodSafety: "pending",
      labeling: "complete",
      ingredients: "complete",
      allergens: "complete"
    },
    riskScore: "medium"
  },
  {
    id: "P013",
    name: "Ethiopian Coffee Beans",
    vendor: "Spice Masters",
    category: "Food",
    price: "£18.99",
    status: "approved",
    stock: 34,
    images: 6,
    description: "Premium Ethiopian coffee beans, single origin.",
    submitted: "2024-01-05",
    compliance: {
      foodSafety: "complete",
      labeling: "complete",
      ingredients: "complete",
      allergens: "complete"
    },
    riskScore: "low"
  },
  {
    id: "P014",
    name: "Moroccan Argan Oil",
    vendor: "Adunni Beauty",
    category: "Beauty",
    price: "£32.99",
    status: "pending",
    stock: 18,
    images: 4,
    description: "Pure Moroccan argan oil for hair and skin care.",
    submitted: "2024-01-23",
    compliance: {
      foodSafety: "complete",
      labeling: "complete",
      ingredients: "pending",
      allergens: "complete"
    },
    riskScore: "low"
  },
  {
    id: "P015",
    name: "South African Rooibos",
    vendor: "Afro Herbs Ltd",
    category: "Herbal",
    price: "£9.99",
    status: "approved",
    stock: 56,
    images: 3,
    description: "Organic South African rooibos tea.",
    submitted: "2024-01-12",
    compliance: {
      foodSafety: "complete",
      labeling: "complete",
      ingredients: "complete",
      allergens: "complete"
    },
    riskScore: "low"
  },
  {
    id: "P016",
    name: "Tanzanian Honey",
    vendor: "Mama Asha's Kitchen",
    category: "Food",
    price: "£11.99",
    status: "pending",
    stock: 23,
    images: 4,
    description: "Pure Tanzanian honey from local beekeepers.",
    submitted: "2024-01-24",
    compliance: {
      foodSafety: "pending",
      labeling: "complete",
      ingredients: "complete",
      allergens: "pending"
    },
    riskScore: "medium"
  },
  {
    id: "P017",
    name: "Ugandan Vanilla",
    vendor: "Spice Masters",
    category: "Food",
    price: "£24.99",
    status: "rejected",
    stock: 0,
    images: 3,
    description: "Premium Ugandan vanilla beans for baking.",
    submitted: "2024-01-13",
    compliance: {
      foodSafety: "complete",
      labeling: "pending",
      ingredients: "complete",
      allergens: "complete"
    },
    riskScore: "medium"
  },
  {
    id: "P018",
    name: "Zimbabwean Marula Oil",
    vendor: "Adunni Beauty",
    category: "Beauty",
    price: "£29.99",
    status: "approved",
    stock: 31,
    images: 5,
    description: "Natural Zimbabwean marula oil for skincare.",
    submitted: "2024-01-09",
    compliance: {
      foodSafety: "complete",
      labeling: "complete",
      ingredients: "complete",
      allergens: "complete"
    },
    riskScore: "low"
  },
  {
    id: "P019",
    name: "Malawian Chilli Sauce",
    vendor: "Spice Masters",
    category: "Food",
    price: "£7.99",
    status: "pending",
    stock: 27,
    images: 4,
    description: "Spicy Malawian chilli sauce with traditional recipe.",
    submitted: "2024-01-25",
    compliance: {
      foodSafety: "pending",
      labeling: "complete",
      ingredients: "complete",
      allergens: "pending"
    },
    riskScore: "medium"
  },
  {
    id: "P020",
    name: "Botswanan Leather Bag",
    vendor: "African Crafts Co",
    category: "Accessories",
    price: "£85.00",
    status: "pending",
    stock: 8,
    images: 6,
    description: "Handcrafted Botswanan leather bag with traditional designs.",
    submitted: "2024-01-26",
    compliance: {
      foodSafety: "complete",
      labeling: "pending",
      ingredients: "complete",
      allergens: "complete"
    },
    riskScore: "low"
  }
];

export function ProductOversight() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-destructive text-destructive-foreground">Rejected</Badge>;
      case "review":
        return <Badge variant="outline">Under Review</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRiskBadge = (riskScore: string) => {
    switch (riskScore) {
      case "low":
        return <Badge className="bg-success text-success-foreground text-xs">Low Risk</Badge>;
      case "medium":
        return <Badge className="bg-warning text-warning-foreground text-xs">Medium Risk</Badge>;
      case "high":
        return <Badge className="bg-destructive text-destructive-foreground text-xs">High Risk</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{riskScore}</Badge>;
    }
  };

  const getComplianceStatus = (status: string) => {
    switch (status) {
      case "complete":
        return <Badge className="bg-success text-success-foreground text-xs">Complete</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground text-xs">Pending</Badge>;
      case "review":
        return <Badge className="bg-primary text-primary-foreground text-xs">Review</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const filteredProducts = productData.filter(product => {
    const matchesSearch = product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const navigate = useNavigate();

  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleViewVendorStore = (vendorId: string) => {
    navigate(`/admin/vendor-store/${vendorId}`);
    toast({
      title: "Navigating to Vendor Store",
      description: "Opening vendor store page...",
    });
  };

  const handleApprove = async (productId: string) => {
    setIsLoading(productId);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Product Approved",
        description: `Product ${productId} has been approved successfully.`,
      });
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: "Failed to approve product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleReject = async (productId: string, reason: string) => {
    setIsLoading(productId);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Product Rejected",
        description: `Product ${productId} has been rejected.`,
      });
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleRequestChanges = async (productId: string, changes: string) => {
    setIsLoading(productId);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Changes Requested",
        description: `Changes requested for product ${productId}.`,
      });
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "Failed to request changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleExportProducts = async () => {
    setIsExporting(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Export Successful",
        description: "Product data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export product data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleReviewQueue = () => {
    setActiveTab("pending");
    toast({
      title: "Review Queue",
      description: "Navigated to pending products for review.",
    });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setCurrentPage(1);
    toast({
      title: "Filters Cleared",
      description: "All filters have been reset.",
    });
  };

  const handleViewApproved = () => {
    setActiveTab("all");
    setStatusFilter("approved");
    toast({
      title: "Filter Applied",
      description: "Showing approved products only.",
    });
  };

  const handleViewRejected = () => {
    setActiveTab("all");
    setStatusFilter("rejected");
    toast({
      title: "Filter Applied",
      description: "Showing rejected products only.",
    });
  };

  const handleViewReview = () => {
    setActiveTab("all");
    setStatusFilter("review");
    toast({
      title: "Filter Applied",
      description: "Showing products under review only.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Oversight</h1>
          <p className="text-muted-foreground">Review and manage product listings</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportProducts}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-primary to-dashboard-accent" onClick={handleReviewQueue}>
            Review Queue
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
                placeholder="Search products by name, vendor, or category..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex space-x-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Beauty">Beauty</SelectItem>
                  <SelectItem value="Clothing">Clothing</SelectItem>
                  <SelectItem value="Herbal">Herbal</SelectItem>
                  <SelectItem value="Jewelry">Jewelry</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              {(searchTerm || statusFilter !== "all" || categoryFilter !== "all") && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Status Tabs */}
      <Tabs defaultValue="all" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 bg-card">
          <TabsTrigger value="all">All ({productData.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({productData.filter(p => p.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({productData.filter(p => p.status === "approved").length})</TabsTrigger>
          <TabsTrigger value="review">Review ({productData.filter(p => p.status === "review").length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({productData.filter(p => p.status === "rejected").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-4">
            {currentProducts.map((product) => (
              <Card key={product.id} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4">
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="w-full h-full flex items-center justify-center" style={{ display: product.images && product.images.length > 0 ? 'none' : 'flex' }}>
                          <span className="text-sm text-muted-foreground">{product.images?.length || 0} imgs</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-foreground">{product.name}</h3>
                          {getStatusBadge(product.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Vendor:</span>
                            <p 
                              className="cursor-pointer text-primary hover:text-primary/80 hover:underline transition-colors"
                              onClick={() => product.vendorId && handleViewVendorStore(product.vendorId)}
                              title="Click to view vendor store"
                            >
                              {product.vendor}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Category:</span>
                            <p>{product.category}</p>
                          </div>
                          <div>
                            <span className="font-medium">Price:</span>
                            <p className="font-mono text-foreground">{product.price}</p>
                          </div>
                          <div>
                            <span className="font-medium">Stock:</span>
                            <p className={product.stock > 10 ? "text-success" : "text-warning"}>
                              {product.stock} units
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Product Details - {product.id}</DialogTitle>
                            <DialogDescription>
                              View complete details for {product.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium">Product Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <div><strong>Name:</strong> {product.name}</div>
                                    <div><strong>Vendor:</strong> 
                                      <span 
                                        className="cursor-pointer text-primary hover:text-primary/80 hover:underline transition-colors ml-1"
                                        onClick={() => product.vendorId && handleViewVendorStore(product.vendorId)}
                                        title="Click to view vendor store"
                                      >
                                        {product.vendor}
                                      </span>
                                    </div>
                                    <div><strong>Category:</strong> {product.category}</div>
                                    <div><strong>Price:</strong> {product.price}</div>
                                    <div><strong>Stock:</strong> {product.stock} units</div>
                                    <div><strong>Images:</strong> {product.images?.length || 0} photos</div>
                                    <div><strong>Submitted:</strong> {product.submitted}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium">Description</h4>
                                  <p className="text-sm text-muted-foreground">{product.description}</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium">Status</h4>
                                  {getStatusBadge(product.status)}
                                </div>
                                {product.compliance && (
                                  <div>
                                    <h4 className="font-medium">Compliance Status</h4>
                                    <div className="space-y-2">
                                      {Object.entries(product.compliance).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                          <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                          {getComplianceStatus(value)}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {product.riskScore && (
                                  <div>
                                    <h4 className="font-medium">Risk Assessment</h4>
                                    {getRiskBadge(product.riskScore)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleApprove(product.id)}
                        disabled={isLoading === product.id}
                      >
                        <CheckCircle className="h-4 w-4 text-success" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleReject(product.id, "")}
                        disabled={isLoading === product.id}
                      >
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRequestChanges(product.id, "")}
                        disabled={isLoading === product.id}
                      >
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={filteredProducts.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span>Pending Review</span>
              </CardTitle>
              <CardDescription>Products awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProducts.filter(p => p.status === "pending").map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.images?.[0] || `https://picsum.photos/400/300?random=${product.id}`}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="space-y-1">
                            <div className="font-medium text-foreground">{product.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Package className="h-3 w-3 mr-1" />
                              {product.id}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Star className="h-3 w-3 mr-1" />
                              {product.rating || 'N/A'} ({product.reviews || 0} reviews)
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div 
                          className="text-sm cursor-pointer text-primary hover:text-primary/80 hover:underline transition-colors"
                          onClick={() => product.vendorId && handleViewVendorStore(product.vendorId)}
                          title="Click to view vendor store"
                        >
                          {product.vendor}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-foreground">{product.price}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">{product.submitted}</div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {product.compliance ? Object.entries(product.compliance).map(([doc, status]) => (
                            <div key={doc} className="flex items-center justify-between">
                              <span className="text-xs capitalize">{doc.replace(/([A-Z])/g, ' $1')}</span>
                              {getComplianceStatus(status)}
                            </div>
                          )) : (
                            <span className="text-xs text-muted-foreground">No compliance data</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{product.riskScore ? getRiskBadge(product.riskScore) : <Badge variant="outline" className="text-xs">N/A</Badge>}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewProduct(product)}
                            title="View Product Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedProduct(product)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Product Review - {product.id}</DialogTitle>
                                <DialogDescription>
                                  Review {product.name} details and compliance
                                </DialogDescription>
                              </DialogHeader>
                              {selectedProduct && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-medium">Product Information</h4>
                                        <div className="space-y-2 text-sm">
                                          <div><strong>Name:</strong> {selectedProduct.name}</div>
                                          <div><strong>Vendor:</strong> {selectedProduct.vendor}</div>
                                          <div><strong>Category:</strong> {selectedProduct.category}</div>
                                          <div><strong>Price:</strong> {selectedProduct.price}</div>
                                          <div><strong>Stock:</strong> {selectedProduct.stock} units</div>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-medium">Description</h4>
                                        <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-medium">Compliance Status</h4>
                                        <div className="space-y-2">
                                          {Object.entries(selectedProduct.compliance).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                              <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                              {getComplianceStatus(value)}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-medium">Risk Assessment</h4>
                                        {getRiskBadge(selectedProduct.riskScore)}
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-2">Review Notes</h4>
                                    <Textarea
                                      placeholder="Add review notes..."
                                      value={reviewNote}
                                      onChange={(e) => setReviewNote(e.target.value)}
                                      className="min-h-[100px]"
                                    />
                                  </div>

                                  <div className="flex space-x-2">
                                    <Button 
                                      onClick={() => handleApprove(selectedProduct.id)}
                                      disabled={isLoading === selectedProduct.id}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      {isLoading === selectedProduct.id ? "Processing..." : "Approve Product"}
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => handleRequestChanges(selectedProduct.id, reviewNote)}
                                      disabled={isLoading === selectedProduct.id}
                                    >
                                      <AlertTriangle className="h-4 w-4 mr-2" />
                                      {isLoading === selectedProduct.id ? "Processing..." : "Request Changes"}
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      onClick={() => handleReject(selectedProduct.id, reviewNote)}
                                      disabled={isLoading === selectedProduct.id}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      {isLoading === selectedProduct.id ? "Processing..." : "Reject Product"}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleApprove(product.id)}
                            disabled={isLoading === product.id}
                          >
                            <CheckCircle className="h-4 w-4 text-success" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleReject(product.id, "")}
                            disabled={isLoading === product.id}
                          >
                            <XCircle className="h-4 w-4 text-destructive" />
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
                totalItems={filteredProducts.filter(p => p.status === "pending").length}
                itemsPerPage={itemsPerPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <span>Under Review</span>
              </CardTitle>
              <CardDescription>Products currently being reviewed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {productData.filter(p => p.status === "review").length} Product(s) Under Review
                </h3>
                <p className="text-muted-foreground mb-4">
                  Products currently being reviewed by the team
                </p>
                <Button className="bg-gradient-to-r from-primary to-dashboard-accent" onClick={handleViewReview}>
                  View Review Process
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span>Approved Products</span>
              </CardTitle>
              <CardDescription>Successfully approved products</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Approved Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProducts.filter(p => p.status === "approved").map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">{product.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Package className="h-3 w-3 mr-1" />
                            {product.id}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Image className="h-3 w-3 mr-1" />
                            {product.images} images
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{product.vendor}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-foreground">{product.price}</div>
                      </TableCell>
                      <TableCell>
                        <div className={`text-sm ${product.stock > 10 ? "text-success" : "text-warning"}`}>
                          {product.stock} units
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">{product.submitted}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedProduct(product)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Approved Product Details - {product.id}</DialogTitle>
                                <DialogDescription>
                                  View {product.name} details
                                </DialogDescription>
                              </DialogHeader>
                              {selectedProduct && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-medium">Product Information</h4>
                                        <div className="space-y-2 text-sm">
                                          <div><strong>Name:</strong> {selectedProduct.name}</div>
                                          <div><strong>Vendor:</strong> {selectedProduct.vendor}</div>
                                          <div><strong>Category:</strong> {selectedProduct.category}</div>
                                          <div><strong>Price:</strong> {selectedProduct.price}</div>
                                          <div><strong>Stock:</strong> {selectedProduct.stock} units</div>
                                          <div><strong>Images:</strong> {selectedProduct.images} photos</div>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-medium">Description</h4>
                                        <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-medium">Approval Status</h4>
                                        <div className="p-3 bg-success/10 border border-success/20 rounded">
                                          <div className="text-sm text-success">
                                            <strong>Status:</strong> Approved
                                          </div>
                                          <div className="text-sm text-muted-foreground mt-2">
                                            <strong>Date:</strong> {selectedProduct.submitted}
                                          </div>
                                        </div>
                                      </div>
                                      {selectedProduct.compliance && (
                                        <div>
                                          <h4 className="font-medium">Compliance Status</h4>
                                          <div className="space-y-2">
                                            {Object.entries(selectedProduct.compliance).map(([key, value]) => (
                                              <div key={key} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                                <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                                {getComplianceStatus(value)}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {selectedProduct.riskScore && (
                                        <div>
                                          <h4 className="font-medium">Risk Assessment</h4>
                                          {getRiskBadge(selectedProduct.riskScore)}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="outline"
                                      onClick={() => handleRequestChanges(selectedProduct.id, "Product review requested")}
                                      disabled={isLoading === selectedProduct.id}
                                    >
                                      <AlertTriangle className="h-4 w-4 mr-2" />
                                      {isLoading === selectedProduct.id ? "Processing..." : "Request Review"}
                                    </Button>
                                    <Button 
                                      variant="destructive"
                                      onClick={() => handleReject(selectedProduct.id, "Product quality concerns")}
                                      disabled={isLoading === selectedProduct.id}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      {isLoading === selectedProduct.id ? "Processing..." : "Revoke Approval"}
                                    </Button>
                                    <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                                      Close
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRequestChanges(product.id, "Product review requested")}
                            disabled={isLoading === product.id}
                          >
                            <AlertTriangle className="h-4 w-4 text-warning" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleReject(product.id, "Product quality concerns")}
                            disabled={isLoading === product.id}
                          >
                            <XCircle className="h-4 w-4 text-destructive" />
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
                totalItems={filteredProducts.filter(p => p.status === "approved").length}
                itemsPerPage={itemsPerPage}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <span>Rejected Products</span>
              </CardTitle>
              <CardDescription>Products that didn't meet requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Rejection Reason</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProducts.filter(p => p.status === "rejected").map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">{product.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Package className="h-3 w-3 mr-1" />
                            {product.id}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Image className="h-3 w-3 mr-1" />
                            {product.images} images
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{product.vendor}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-foreground">{product.price}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">{product.submitted}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-destructive">
                          {product.category === "Food" ? "Incomplete food safety documentation" :
                           product.category === "Clothing" ? "Missing labeling requirements" :
                           "Failed compliance review"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedProduct(product)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Rejected Product Details - {product.id}</DialogTitle>
                                <DialogDescription>
                                  Review {product.name} rejection details
                                </DialogDescription>
                              </DialogHeader>
                              {selectedProduct && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-medium">Product Information</h4>
                                        <div className="space-y-2 text-sm">
                                          <div><strong>Name:</strong> {selectedProduct.name}</div>
                                          <div><strong>Vendor:</strong> {selectedProduct.vendor}</div>
                                          <div><strong>Category:</strong> {selectedProduct.category}</div>
                                          <div><strong>Price:</strong> {selectedProduct.price}</div>
                                          <div><strong>Stock:</strong> {selectedProduct.stock} units</div>
                                          <div><strong>Images:</strong> {selectedProduct.images} photos</div>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-medium">Description</h4>
                                        <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                                      </div>
                                    </div>
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-medium">Rejection Details</h4>
                                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded">
                                          <div className="text-sm text-destructive">
                                            <strong>Reason:</strong> {selectedProduct.category === "Food" ? "Incomplete food safety documentation" :
                                             selectedProduct.category === "Clothing" ? "Missing labeling requirements" :
                                             "Failed compliance review"}
                                          </div>
                                          <div className="text-sm text-muted-foreground mt-2">
                                            <strong>Date:</strong> {selectedProduct.submitted}
                                          </div>
                                        </div>
                                      </div>
                                      {selectedProduct.compliance && (
                                        <div>
                                          <h4 className="font-medium">Compliance Status</h4>
                                          <div className="space-y-2">
                                            {Object.entries(selectedProduct.compliance).map(([key, value]) => (
                                              <div key={key} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                                <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                                {getComplianceStatus(value)}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {selectedProduct.riskScore && (
                                        <div>
                                          <h4 className="font-medium">Risk Assessment</h4>
                                          {getRiskBadge(selectedProduct.riskScore)}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="outline"
                                      onClick={() => handleApprove(selectedProduct.id)}
                                      disabled={isLoading === selectedProduct.id}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      {isLoading === selectedProduct.id ? "Processing..." : "Re-approve Product"}
                                    </Button>
                                    <Button 
                                      variant="outline"
                                      onClick={() => handleRequestChanges(selectedProduct.id, "Please address the compliance issues")}
                                      disabled={isLoading === selectedProduct.id}
                                    >
                                      <AlertTriangle className="h-4 w-4 mr-2" />
                                      {isLoading === selectedProduct.id ? "Processing..." : "Request Resubmission"}
                                    </Button>
                                    <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                                      Close
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleApprove(product.id)}
                            disabled={isLoading === product.id}
                          >
                            <CheckCircle className="h-4 w-4 text-success" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRequestChanges(product.id, "Please address the compliance issues")}
                            disabled={isLoading === product.id}
                          >
                            <AlertTriangle className="h-4 w-4 text-warning" />
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
                totalItems={filteredProducts.filter(p => p.status === "rejected").length}
                itemsPerPage={itemsPerPage}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">{selectedProduct.name}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProductModal(false)}
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Images */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedProduct.images.map((image: string, index: number) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${selectedProduct.name} - Image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>

              {/* Product Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Product Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Product ID:</span>
                        <span className="font-mono">{selectedProduct.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <Badge variant="outline">{selectedProduct.category}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-semibold">{selectedProduct.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stock:</span>
                        <span className="font-semibold">{selectedProduct.stock} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        {getStatusBadge(selectedProduct.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rating:</span>
                        <div className="flex items-center">
                          <span className="font-semibold">★ {selectedProduct.rating}</span>
                          <span className="text-sm text-muted-foreground ml-1">({selectedProduct.reviews} reviews)</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Sales:</span>
                        <span className="font-semibold">{selectedProduct.sales} units</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{selectedProduct.description}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Specifications</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Weight:</span>
                        <span>{selectedProduct.specifications.weight}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dimensions:</span>
                        <span>{selectedProduct.specifications.dimensions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Material:</span>
                        <span>{selectedProduct.specifications.material}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Origin:</span>
                        <span>{selectedProduct.specifications.origin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shelf Life:</span>
                        <span>{selectedProduct.specifications.shelfLife}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Certifications:</span>
                        <div className="flex gap-1">
                          {selectedProduct.specifications.certifications.map((cert: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Compliance Status</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedProduct.compliance).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                          <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          {getComplianceStatus(value)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
                    {getRiskBadge(selectedProduct.riskScore)}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Timeline</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Submitted:</span>
                        <span>{selectedProduct.submitted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(selectedProduct.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span>{new Date(selectedProduct.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Vendor Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vendor:</span>
                        <span>{selectedProduct.vendor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vendor ID:</span>
                        <span className="font-mono">{selectedProduct.vendorId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowProductModal(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    toast({
                      title: "Product Details Exported",
                      description: `Details for ${selectedProduct.name} have been exported.`,
                    });
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}