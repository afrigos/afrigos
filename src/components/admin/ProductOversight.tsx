import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
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
  Globe,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";
import { apiFetch } from "@/lib/api-client";

// Product interfaces
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  sku?: string | null;
  stock: number;
  status: string;
  sourcing?: string | null;
  images?: string[] | null;
  category?: {
    id: string;
    name: string;
    commissionRate?: number | null;
  } | null;
  commissionRate?: number | null;
  vendor: {
    id: string;
    businessName: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  totalSales: number;
  totalRevenue: number;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface Category {
  id: string;
  name: string;
  description?: string | null;
}

interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

// API functions
const fetchProducts = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  categoryId?: string;
}): Promise<ProductsResponse> => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.status && params.status !== 'all') {
    // Map frontend status to backend status
    const statusMap: Record<string, string> = {
      'pending': 'PENDING',
      'approved': 'APPROVED',
      'rejected': 'REJECTED',
      'review': 'PENDING', // Review is also PENDING in backend
      'draft': 'DRAFT'
    };
    queryParams.append('status', statusMap[params.status] || params.status.toUpperCase());
  }
  if (params.search && params.search.trim()) queryParams.append('search', params.search.trim());
  if (params.categoryId && params.categoryId !== 'all') queryParams.append('categoryId', params.categoryId);

  const response = await apiFetch<ProductsResponse>(`/admin/products?${queryParams.toString()}`);
  
  if (!response.success || !response.data) {
    throw new Error('Failed to fetch products');
  }

  return response;
};

const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiFetch<CategoriesResponse>('/categories');
    
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch categories');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return empty array if categories fetch fails
    return [];
  }
};

const updateProductStatus = async (productId: string, status: string, reason?: string) => {
  // Map frontend status to backend status
  const statusMap: Record<string, string> = {
    'approved': 'APPROVED',
    'rejected': 'REJECTED',
    'request-changes': 'DRAFT',
    'draft': 'DRAFT'
  };
  
  const backendStatus = statusMap[status] || status.toUpperCase();
  
  const response = await apiFetch<{ success: boolean; message: string; data: any }>(`/admin/products/${productId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status: backendStatus, reason })
  });

  if (!response.success) {
    throw new Error(response.message || 'Failed to update product status');
  }

  return response;
};

// Helper function to map backend status to frontend status
const mapStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'APPROVED': 'approved',
    'PENDING': 'pending',
    'REJECTED': 'rejected',
    'DRAFT': 'draft',
    'ACTIVE': 'approved',
    'INACTIVE': 'rejected'
  };
  return statusMap[status.toUpperCase()] || status.toLowerCase();
};

// Helper function to format price
const formatPrice = (price: number): string => {
  return `£${price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateString;
  }
};

export function ProductOversight() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [productIdForReject, setProductIdForReject] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm, categoryFilter, activeTab]);

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  // Determine which status to use based on activeTab
  const getStatusForQuery = () => {
    if (activeTab !== "all") {
      return activeTab;
    }
    return statusFilter;
  };

  // Fetch products from API
  const { data: productsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-products', currentPage, getStatusForQuery(), searchTerm, categoryFilter],
    queryFn: () => fetchProducts({
      page: currentPage,
      limit: itemsPerPage,
      status: getStatusForQuery(),
      search: searchTerm || undefined,
      categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
    }),
  });

  // Update product status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ productId, status, reason }: { productId: string; status: string; reason?: string }) =>
      updateProductStatus(productId, status, reason),
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message || "Product status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      refetch();
      setSelectedProduct(null);
      setReviewNote("");
      setRejectReason("");
      setRejectModalOpen(false);
      setProductIdForReject(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product status",
        variant: "destructive",
      });
    },
  });

  // Get products data from API response
  const products = productsResponse?.data?.products || [];
  const pagination = productsResponse?.data?.pagination || { total: 0, totalPages: 0, page: 1, limit: 10 };
  const totalPages = pagination.totalPages;

  // Count products by status for tabs (approximate - based on current filtered results)
  // For accurate counts, we'd need separate queries for each status, but this is good enough for now
  const statusCounts = {
    all: pagination.total || 0,
    pending: activeTab === 'all' ? products.filter(p => mapStatus(p.status) === 'pending').length : (activeTab === 'pending' ? products.length : 0),
    approved: activeTab === 'all' ? products.filter(p => mapStatus(p.status) === 'approved').length : (activeTab === 'approved' ? products.length : 0),
    review: activeTab === 'all' ? products.filter(p => mapStatus(p.status) === 'draft').length : (activeTab === 'review' ? products.length : 0),
    rejected: activeTab === 'all' ? products.filter(p => mapStatus(p.status) === 'rejected').length : (activeTab === 'rejected' ? products.length : 0)
  };

  const getStatusBadge = (status: string) => {
    const mappedStatus = mapStatus(status);
    switch (mappedStatus) {
      case "approved":
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-destructive text-destructive-foreground">Rejected</Badge>;
      case "draft":
        return <Badge variant="outline">Under Review</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRiskBadge = (riskScore?: string) => {
    // Risk score is not in the backend data, so we'll skip it for now
    return null;
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleViewVendorStore = (vendorId: string) => {
    navigate(`/admin/vendor-store/${vendorId}`);
  };

  const handleApprove = async (productId: string) => {
    updateStatusMutation.mutate({
      productId,
      status: 'approved',
      reason: reviewNote || undefined
    });
  };

  const handleReject = (productId: string) => {
    setProductIdForReject(productId);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!productIdForReject) return;
    if (!rejectReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }
    updateStatusMutation.mutate({
      productId: productIdForReject,
      status: 'rejected',
      reason: rejectReason
    });
  };

  const handleRequestChanges = async (productId: string, changes: string) => {
    updateStatusMutation.mutate({
      productId,
      status: 'request-changes',
      reason: changes
    });
  };

  const handleExportProducts = async () => {
    setIsExporting(true);
    try {
      // Mock API call - could be implemented later
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
    setStatusFilter("all");
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setCurrentPage(1);
  };

  // When activeTab changes, update the query (already handled by getStatusForQuery)

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
              <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={categoriesLoading}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
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
          <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({statusCounts.approved})</TabsTrigger>
          <TabsTrigger value="review">Review ({statusCounts.review})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({statusCounts.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading products...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-destructive" />
                <p className="text-destructive">Error loading products: {error instanceof Error ? error.message : 'Unknown error'}</p>
                <Button onClick={() => refetch()} className="mt-4">Retry</Button>
              </CardContent>
            </Card>
          ) : products.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? `No products match "${searchTerm}"` : `No products with status "${activeTab}"`}
                </p>
              </CardContent>
            </Card>
          ) : (
          <div className="grid gap-4">
              {products.map((product) => (
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
                              onClick={() => handleViewVendorStore(product.vendor.id)}
                              title="Click to view vendor store"
                            >
                              {product.vendor.businessName}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Category:</span>
                            <p>{product.category?.name || 'Uncategorized'}</p>
                          </div>
                          <div>
                            <span className="font-medium">Price:</span>
                            <p className="font-mono text-foreground">{formatPrice(product.price)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Stock:</span>
                            <p className={product.stock > 10 ? "text-success" : "text-warning"}>
                              {product.stock} units
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mt-2">
                          <div>
                            <span className="font-medium">Sales:</span>
                            <p className="text-foreground">{product.totalSales}</p>
                          </div>
                          <div>
                            <span className="font-medium">Revenue:</span>
                            <p className="font-mono text-foreground">{formatPrice(product.totalRevenue)}</p>
                          </div>
                          <div>
                            <span className="font-medium">Rating:</span>
                            <p className="text-foreground flex items-center">
                              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                              {product.avgRating > 0 ? product.avgRating.toFixed(1) : 'N/A'} ({product.reviewCount})
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Created:</span>
                            <p className="text-foreground">{formatDate(product.createdAt)}</p>
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
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedProduct(product)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Product Details - {product.name}</DialogTitle>
                            <DialogDescription>
                              View complete details for {product.name}
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
                                      <div><strong>SKU:</strong> {selectedProduct.sku || 'N/A'}</div>
                                    <div><strong>Vendor:</strong> 
                                      <span 
                                        className="cursor-pointer text-primary hover:text-primary/80 hover:underline transition-colors ml-1"
                                          onClick={() => handleViewVendorStore(selectedProduct.vendor.id)}
                                        title="Click to view vendor store"
                                      >
                                          {selectedProduct.vendor.businessName}
                                      </span>
                                    </div>
                                      <div><strong>Vendor Email:</strong> {selectedProduct.vendor.user.email}</div>
                                      <div><strong>Category:</strong> {selectedProduct.category?.name || 'Uncategorized'}</div>
                                      <div><strong>Price:</strong> {formatPrice(selectedProduct.price)}</div>
                                      {selectedProduct.comparePrice && (
                                        <div><strong>Compare Price:</strong> {formatPrice(selectedProduct.comparePrice)}</div>
                                      )}
                                      <div><strong>Stock:</strong> {selectedProduct.stock} units</div>
                                      <div><strong>Images:</strong> {selectedProduct.images?.length || 0} photos</div>
                                      <div><strong>Created:</strong> {formatDate(selectedProduct.createdAt)}</div>
                                      <div><strong>Updated:</strong> {formatDate(selectedProduct.updatedAt)}</div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium">Description</h4>
                                    <p className="text-sm text-muted-foreground">{selectedProduct.description || 'No description'}</p>
                                </div>
                                  {selectedProduct.images && selectedProduct.images.length > 0 && (
                                <div>
                                      <h4 className="font-medium mb-2">Product Images</h4>
                                      <div className="grid grid-cols-3 gap-2">
                                        {selectedProduct.images.map((image, index) => (
                                          <img
                                            key={index}
                                            src={image}
                                            alt={`${selectedProduct.name} - Image ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg border"
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                          />
                                        ))}
                            </div>
                            </div>
                          )}
                        </div>
                                    <div className="space-y-4">
                                      <div>
                                  <h4 className="font-medium">Status</h4>
                                    {getStatusBadge(selectedProduct.status)}
                                      </div>
                                      <div>
                                    <h4 className="font-medium">Sales Statistics</h4>
                                    <div className="space-y-2 text-sm">
                                      <div><strong>Total Sales:</strong> {selectedProduct.totalSales} units</div>
                                      <div><strong>Total Revenue:</strong> {formatPrice(selectedProduct.totalRevenue)}</div>
                                      <div><strong>Average Rating:</strong> 
                                        <span className="flex items-center ml-1">
                                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                                          {selectedProduct.avgRating > 0 ? selectedProduct.avgRating.toFixed(1) : 'N/A'} ({selectedProduct.reviewCount} reviews)
                                        </span>
                                      </div>
                                    </div>
                                            </div>
                                  {selectedProduct.category && (
                                      <div>
                                      <h4 className="font-medium">Commission Rate</h4>
                                      <div className="text-sm">
                                        {selectedProduct.commissionRate !== null && selectedProduct.commissionRate !== undefined
                                          ? `${selectedProduct.commissionRate}%`
                                          : selectedProduct.category.commissionRate !== null && selectedProduct.category.commissionRate !== undefined
                                          ? `${selectedProduct.category.commissionRate}% (from category)`
                                          : 'Not set'}
                                      </div>
                                  </div>
                                )}
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-2">Review Notes</h4>
                                    <Textarea
                                  placeholder="Add review notes (optional)..."
                                      value={reviewNote}
                                      onChange={(e) => setReviewNote(e.target.value)}
                                      className="min-h-[100px]"
                                    />
                                  </div>

                                  <div className="flex space-x-2">
                                {mapStatus(selectedProduct.status) !== 'approved' && (
                                    <Button 
                                      onClick={() => handleApprove(selectedProduct.id)}
                                    disabled={updateStatusMutation.isPending}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                    {updateStatusMutation.isPending ? "Processing..." : "Approve Product"}
                                    </Button>
                                )}
                                {mapStatus(selectedProduct.status) !== 'rejected' && (
                                  <>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => handleRequestChanges(selectedProduct.id, reviewNote)}
                                      disabled={updateStatusMutation.isPending}
                                    >
                                      <AlertTriangle className="h-4 w-4 mr-2" />
                                      Request Changes
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      onClick={() => handleReject(selectedProduct.id)}
                                      disabled={updateStatusMutation.isPending}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject Product
                                    </Button>
                                  </>
                                )}
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                      {mapStatus(product.status) !== 'approved' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleApprove(product.id)}
                          disabled={updateStatusMutation.isPending}
                          title="Approve Product"
                          >
                            <CheckCircle className="h-4 w-4 text-success" />
                          </Button>
                      )}
                      {mapStatus(product.status) !== 'rejected' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                          onClick={() => handleReject(product.id)}
                          disabled={updateStatusMutation.isPending}
                          title="Reject Product"
                          >
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                      )}
                              <Button 
                                variant="ghost" 
                                size="sm"
                        onClick={() => {
                          setSelectedProduct(product);
                          setReviewNote("");
                        }}
                        title="Request Changes"
                      >
                        <AlertTriangle className="h-4 w-4 text-warning" />
                              </Button>
                                        </div>
                                      </div>
                </CardContent>
              </Card>
            ))}
                                        </div>
                                      )}
          {pagination.total > 0 && (
          <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={pagination.total}
                itemsPerPage={itemsPerPage}
              />
          </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reject Product Dialog */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
                              <DialogHeader>
            <DialogTitle>Reject Product</DialogTitle>
                                <DialogDescription>
              Please provide a reason for rejecting this product.
                                </DialogDescription>
                              </DialogHeader>
          <div className="space-y-4 py-4">
                                          <div className="space-y-2">
              <label htmlFor="reject-reason" className="text-sm font-medium">Rejection Reason</label>
              <Textarea
                id="reject-reason"
                placeholder="Enter the reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[100px]"
              />
                                              </div>
                                          </div>
          <DialogFooter>
                                    <Button 
                                      variant="outline"
              onClick={() => {
                setRejectModalOpen(false);
                setProductIdForReject(null);
                setRejectReason("");
              }}
            >
              Cancel
                                    </Button>
                                    <Button 
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={updateStatusMutation.isPending || !rejectReason.trim()}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Product"
              )}
            </Button>
          </DialogFooter>
                            </DialogContent>
                          </Dialog>
    </div>
  );
}
