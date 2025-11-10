import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Package,
  Star,
  AlertTriangle,
  Image,
  FileText,
  Tag,
  DollarSign
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL, BACKEND_URL } from '@/lib/api-config';

// Types
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
  sourcing: 'IN_HOUSE' | 'OUTSOURCED';
  images: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  vendorId: string;
  categoryId: string;
  category?: {
    name: string;
  };
  vendor?: {
    businessName: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  reviews?: unknown[];
  orderItems?: unknown[];
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

// Category interface
interface Category {
  id: string;
  name: string;
  description?: string;
}

// API functions
const fetchCategories = async (): Promise<Category[]> => {
  const token = localStorage.getItem('afrigos-token');
  
  const response = await fetch(`${API_BASE_URL}/products/categories`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  
  const data = await response.json();
  return data.data || [];
};

const fetchProducts = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  vendorId?: string;
  categoryId?: string;
}): Promise<ProductsResponse> => {
  const token = localStorage.getItem('afrigos-token');
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.status) queryParams.append('status', params.status);
  if (params.search) queryParams.append('search', params.search);
  if (params.vendorId) queryParams.append('vendorId', params.vendorId);
  if (params.categoryId) queryParams.append('categoryId', params.categoryId);

  const response = await fetch(`${API_BASE_URL}/admin/products?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return response.json();
};

const updateProductStatus = async (productId: string, status: string, reviewNote?: string) => {
  const token = localStorage.getItem('afrigos-token');
  
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, reason: reviewNote }),
  });

  if (!response.ok) {
    throw new Error('Failed to update product status');
  }

  return response.json();
};


const complianceStatuses = {
  complete: { label: "Complete", color: "bg-success text-success-foreground" },
  pending: { label: "Pending", color: "bg-warning text-warning-foreground" },
  failed: { label: "Failed", color: "bg-destructive text-destructive-foreground" },
  review: { label: "Under Review", color: "bg-muted text-muted-foreground" }
};

export function ProductApprovalQueue() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    productId?: string;
    productName?: string;
  }>({ isOpen: false });
  const [rejectReason, setRejectReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  // Fetch products from API
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['admin-products', { page: currentPage, limit: itemsPerPage, status: statusFilter, search: searchTerm, category: categoryFilter }],
    queryFn: () => fetchProducts({
      page: currentPage,
      limit: itemsPerPage,
      status: statusFilter === 'all' ? undefined : statusFilter === 'review' ? 'PENDING' : statusFilter.toUpperCase(),
      search: searchTerm || undefined,
      categoryId: categoryFilter === 'all' ? undefined : categoryFilter,
    }),
  });

  // Update product status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ productId, status, reviewNote }: { productId: string; status: string; reviewNote?: string }) =>
      updateProductStatus(productId, status, reviewNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: "Success",
        description: "Product status updated successfully",
      });
      setSelectedProduct(null);
      setReviewNote("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product status",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case "PENDING":
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      case "REJECTED":
        return <Badge className="bg-destructive text-destructive-foreground">Rejected</Badge>;
      case "DRAFT":
        return <Badge variant="outline">Draft</Badge>;
      case "ACTIVE":
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "low":
        return <Badge className="bg-success text-success-foreground">Low Risk</Badge>;
      case "medium":
        return <Badge className="bg-warning text-warning-foreground">Medium Risk</Badge>;
      case "high":
        return <Badge className="bg-destructive text-destructive-foreground">High Risk</Badge>;
      default:
        return <Badge variant="secondary">{risk}</Badge>;
    }
  };

  const handleApprove = async (productId: string) => {
    updateStatusMutation.mutate({
      productId,
      status: 'APPROVED',
      reviewNote: reviewNote || undefined,
    });
  };

  const handleReject = async (productId: string, reason: string) => {
    // Mock email sending
    console.log(`Mock email sent to vendor about product ${productId} rejection: ${reason}`);
    
    updateStatusMutation.mutate({
      productId,
      status: 'REJECTED',
      reviewNote: reason,
    });
    
    // Close modal and reset reason
    setRejectModal({ isOpen: false });
    setRejectReason("");
  };

  const handleRejectSubmit = () => {
    if (!rejectModal.productId || !rejectReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }
    
    handleReject(rejectModal.productId, rejectReason);
  };

  const handleRequestChanges = async (productId: string, changes: string) => {
    updateStatusMutation.mutate({
      productId,
      status: 'DRAFT', // Request changes by setting back to draft
      reviewNote: changes,
    });
  };

  const handleExportQueue = async () => {
    setIsExporting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Queue Exported",
        description: "Product approval queue has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export queue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleBulkActions = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Bulk Actions",
        description: "Bulk action menu opened. Select products to perform actions.",
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Failed to open bulk actions. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Use API data instead of mock data
  const products = productsData?.data?.products || [];
  const pagination = productsData?.data?.pagination;

  // Debug logging
  useEffect(() => {
    if (productsData) {
      console.log('Products data:', productsData);
      console.log('Products array:', products);
      console.log('Products count:', products.length);
    }
  }, [productsData, products]);

  // Calculate statistics from API data
  const calculateStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingCount = products.filter(p => p.status === 'PENDING').length;
    const underReviewCount = products.filter(p => p.status === 'DRAFT').length; // Assuming DRAFT means under review
    const approvedToday = products.filter(p => {
      const updatedAt = new Date(p.updatedAt);
      updatedAt.setHours(0, 0, 0, 0);
      return p.status === 'APPROVED' && updatedAt.getTime() === today.getTime();
    }).length;
    const rejectedToday = products.filter(p => {
      const updatedAt = new Date(p.updatedAt);
      updatedAt.setHours(0, 0, 0, 0);
      return p.status === 'REJECTED' && updatedAt.getTime() === today.getTime();
    }).length;

    return {
      pendingCount,
      underReviewCount,
      approvedToday,
      rejectedToday
    };
  };

  const stats = calculateStats();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
            <p className="text-destructive">Failed to load products</p>
            <p className="text-muted-foreground text-sm mt-2">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Approval Queue</h1>
          <p className="text-muted-foreground">Review and approve new product listings</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportQueue}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export Queue"}
          </Button>
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-primary to-dashboard-accent"
            onClick={handleBulkActions}
          >
            <Package className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
        </div>
      </div>

      {/* Queue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.pendingCount}</div>
            <div className="text-sm text-muted-foreground">Products awaiting review</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Under Review
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.underReviewCount}</div>
            <div className="text-sm text-muted-foreground">Currently being reviewed</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved Today
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.approvedToday}</div>
            <div className="text-sm text-muted-foreground">Products approved</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejected Today
            </CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.rejectedToday}</div>
            <div className="text-sm text-muted-foreground">Products rejected</div>
          </CardContent>
        </Card>
      </div>

      <Tabs 
        defaultValue="pending" 
        value={statusFilter === "all" ? "all" : statusFilter === "pending" ? "pending" : statusFilter === "review" ? "review" : statusFilter === "rejected" ? "rejected" : "pending"}
        onValueChange={(value) => {
          if (value === "all") setStatusFilter("all");
          else if (value === "pending") setStatusFilter("pending");
          else if (value === "review") setStatusFilter("review");
          else if (value === "rejected") setStatusFilter("rejected");
        }}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="review">Under Review</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Search and Filters */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products by ID, name, or vendor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background"
                    disabled={categoriesLoading}
                  >
                    <option value="all">All Categories</option>
                    {categoriesLoading ? (
                      <option value="loading" disabled>Loading categories...</option>
                    ) : categories.length === 0 ? (
                      <option value="no-categories" disabled>No categories available</option>
                    ) : (
                      categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Product Queue</CardTitle>
              <CardDescription>Review and manage product submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        <p className="text-muted-foreground">No products found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.images?.length || 0} images • {new Date(product.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.vendor?.businessName || 
                         (product.vendor?.user?.firstName && product.vendor?.user?.lastName 
                           ? `${product.vendor.user.firstName} ${product.vendor.user.lastName}'s Store`
                           : 'Vendor Store')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category?.name || 'No Category'}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">£{product.price}</TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          To be assessed
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          To be reviewed
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProduct(product)}
                            title="View Product Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {product.status === "PENDING" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(product.id)}
                                disabled={updateStatusMutation.isPending}
                                title="Approve Product"
                              >
                                <CheckCircle className="h-4 w-4 text-success" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRejectModal({ isOpen: true, productId: product.id, productName: product.name })}
                                disabled={updateStatusMutation.isPending}
                                title="Reject Product"
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {pagination && (
              <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
              />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-6">
          {/* Search and Filters */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products by ID, name, or vendor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                        </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background"
                    disabled={categoriesLoading}
                  >
                    <option value="all">All Categories</option>
                    {categoriesLoading ? (
                      <option value="loading" disabled>Loading categories...</option>
                    ) : categories.length === 0 ? (
                      <option value="no-categories" disabled>No categories available</option>
                    ) : (
                      categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Product Queue</CardTitle>
              <CardDescription>Review and manage product submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        <p className="text-muted-foreground">No products found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.images?.length || 0} images • {new Date(product.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.vendor?.businessName || 
                         (product.vendor?.user?.firstName && product.vendor?.user?.lastName 
                           ? `${product.vendor.user.firstName} ${product.vendor.user.lastName}'s Store`
                           : 'Vendor Store')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category?.name || 'No Category'}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">£{product.price}</TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          To be assessed
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          To be reviewed
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProduct(product)}
                            title="View Product Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {product.status === "PENDING" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(product.id)}
                                disabled={updateStatusMutation.isPending}
                                title="Approve Product"
                              >
                                <CheckCircle className="h-4 w-4 text-success" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRejectModal({ isOpen: true, productId: product.id, productName: product.name })}
                                disabled={updateStatusMutation.isPending}
                                title="Reject Product"
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {pagination && (
              <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
              />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review Tab */}
        <TabsContent value="review" className="space-y-6">
          {/* Same content as pending tab */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products by ID, name, or vendor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background"
                    disabled={categoriesLoading}
                  >
                    <option value="all">All Categories</option>
                    {categoriesLoading ? (
                      <option value="loading" disabled>Loading categories...</option>
                    ) : categories.length === 0 ? (
                      <option value="no-categories" disabled>No categories available</option>
                    ) : (
                      categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Product Queue</CardTitle>
              <CardDescription>Review and manage product submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        <p className="text-muted-foreground">No products found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.images?.length || 0} images • {new Date(product.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.vendor?.businessName || 
                         (product.vendor?.user?.firstName && product.vendor?.user?.lastName 
                           ? `${product.vendor.user.firstName} ${product.vendor.user.lastName}'s Store`
                           : 'Vendor Store')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category?.name || 'No Category'}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">£{product.price}</TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          To be assessed
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          To be reviewed
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProduct(product)}
                            title="View Product Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {product.status === "PENDING" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(product.id)}
                                disabled={updateStatusMutation.isPending}
                                title="Approve Product"
                              >
                                <CheckCircle className="h-4 w-4 text-success" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRejectModal({ isOpen: true, productId: product.id, productName: product.name })}
                                disabled={updateStatusMutation.isPending}
                                title="Reject Product"
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {pagination && (
              <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
              />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rejected Tab */}
        <TabsContent value="rejected" className="space-y-6">
          {/* Same content as pending tab */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products by ID, name, or vendor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 border border-input rounded-md bg-background"
                    disabled={categoriesLoading}
                  >
                    <option value="all">All Categories</option>
                    {categoriesLoading ? (
                      <option value="loading" disabled>Loading categories...</option>
                    ) : categories.length === 0 ? (
                      <option value="no-categories" disabled>No categories available</option>
                    ) : (
                      categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Product Queue</CardTitle>
              <CardDescription>Review and manage product submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Compliance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">
                        <p className="text-muted-foreground">No products found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.images?.length || 0} images • {new Date(product.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.vendor?.businessName || 
                         (product.vendor?.user?.firstName && product.vendor?.user?.lastName 
                           ? `${product.vendor.user.firstName} ${product.vendor.user.lastName}'s Store`
                           : 'Vendor Store')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category?.name || 'No Category'}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">£{product.price}</TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          To be assessed
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          To be reviewed
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProduct(product)}
                            title="View Product Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {product.status === "PENDING" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApprove(product.id)}
                                disabled={updateStatusMutation.isPending}
                                title="Approve Product"
                              >
                                <CheckCircle className="h-4 w-4 text-success" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRejectModal({ isOpen: true, productId: product.id, productName: product.name })}
                                disabled={updateStatusMutation.isPending}
                                title="Reject Product"
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {pagination && (
              <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
              />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Details Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Product Review - {selectedProduct.id}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProduct(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Product Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedProduct.name}</div>
                    <div><strong>Vendor:</strong> {selectedProduct.vendor?.businessName || 
                         (selectedProduct.vendor?.user?.firstName && selectedProduct.vendor?.user?.lastName 
                           ? `${selectedProduct.vendor.user.firstName} ${selectedProduct.vendor.user.lastName}'s Store`
                           : 'Vendor Store')}</div>
                    <div><strong>Category:</strong> {selectedProduct.category?.name || 'Uncategorized'}</div>
                    <div><strong>Price:</strong> £{selectedProduct.price}</div>
                    <div><strong>Stock:</strong> {selectedProduct.stock}</div>
                    <div><strong>Submitted:</strong> {new Date(selectedProduct.createdAt).toLocaleDateString()}</div>
                    <div><strong>Images:</strong> {selectedProduct.images?.length || 0} photos</div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                  </div>
                </div>
                
                {/* Product Images Gallery */}
                <div>
                  <h3 className="font-semibold mb-4">Product Images</h3>
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {selectedProduct.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image.startsWith('http') ? image : `${BACKEND_URL}/${image}`}
                              alt={`${selectedProduct.name} - Image ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                              }}
                              onClick={() => {
                                // Open image in new tab for full view
                                window.open(image.startsWith('http') ? image : `${BACKEND_URL}/${image}`, '_blank');
                              }}
                            />
                            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                              {index + 1}/{selectedProduct.images.length}
                            </div>
                      </div>
                    ))}
                  </div>
                      {selectedProduct.images.length > 4 && (
                        <p className="text-sm text-muted-foreground text-center">
                          Click on any image to view in full size
                        </p>
                      )}
                  </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <p className="text-sm text-muted-foreground">No images available</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Review Notes</h3>
                <Textarea
                  placeholder="Add review notes..."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="mt-6 flex space-x-2">
                <Button 
                  onClick={() => handleApprove(selectedProduct.id)}
                  disabled={updateStatusMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {updateStatusMutation.isPending ? "Processing..." : "Approve Product"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleRequestChanges(selectedProduct.id, reviewNote)}
                  disabled={updateStatusMutation.isPending}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {updateStatusMutation.isPending ? "Processing..." : "Request Changes"}
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleReject(selectedProduct.id, reviewNote)}
                  disabled={updateStatusMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {updateStatusMutation.isPending ? "Processing..." : "Reject Product"}
                </Button>
                <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Tabs>

      {/* Reject Product Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Reject Product</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRejectModal({ isOpen: false })}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Product: <span className="font-medium">{rejectModal.productName}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Please provide a reason for rejecting this product. This will be sent to the vendor via email.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rejection Reason *
                </label>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please explain why this product is being rejected..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="flex space-x-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setRejectModal({ isOpen: false })}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRejectSubmit}
                  disabled={updateStatusMutation.isPending || !rejectReason.trim()}
                >
                  {updateStatusMutation.isPending ? "Rejecting..." : "Reject Product"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
