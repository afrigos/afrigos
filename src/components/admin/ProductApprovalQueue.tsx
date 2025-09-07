import { useState } from "react";
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

const productQueueData = [
  {
    id: "P001",
    name: "Authentic Jollof Rice Spice Mix",
    vendor: "Mama Asha's Kitchen",
    category: "Food",
    price: "£12.99",
    status: "pending",
    submittedDate: "2024-01-20",
    images: 3,
    description: "Premium West African spice blend for authentic Jollof rice. Imported directly from Nigeria.",
    compliance: {
      foodSafety: "pending",
      labeling: "complete",
      ingredients: "complete",
      allergens: "pending"
    },
    riskScore: "low",
    reviewNotes: ""
  },
  {
    id: "P002",
    name: "Shea Butter Hair Care Set",
    vendor: "Adunni Beauty",
    category: "Beauty",
    price: "£24.99",
    status: "review",
    submittedDate: "2024-01-19",
    images: 5,
    description: "Natural hair care products made with pure shea butter from Ghana. Suitable for all hair types.",
    compliance: {
      foodSafety: "complete",
      labeling: "complete",
      ingredients: "complete",
      allergens: "complete"
    },
    riskScore: "low",
    reviewNotes: "Need to verify organic certification"
  },
  {
    id: "P003",
    name: "Traditional Kente Cloth Scarf",
    vendor: "Kente Collections",
    category: "Clothing",
    price: "£89.99",
    status: "pending",
    submittedDate: "2024-01-21",
    images: 2,
    description: "Handwoven traditional Kente cloth scarf. Each piece is unique and tells a story.",
    compliance: {
      foodSafety: "complete",
      labeling: "pending",
      ingredients: "complete",
      allergens: "complete"
    },
    riskScore: "medium",
    reviewNotes: ""
  },
  {
    id: "P004",
    name: "Moringa Leaf Powder",
    vendor: "Afro Herbs Ltd",
    category: "Herbal",
    price: "£18.50",
    status: "rejected",
    submittedDate: "2024-01-18",
    images: 4,
    description: "Organic Moringa leaf powder. Rich in vitamins and minerals. Imported from Nigeria.",
    compliance: {
      foodSafety: "failed",
      labeling: "complete",
      ingredients: "complete",
      allergens: "complete"
    },
    riskScore: "high",
    reviewNotes: "Failed food safety inspection - missing certification"
  },
  {
    id: "P005",
    name: "Nigerian Pepper Soup Mix",
    vendor: "Spice Masters",
    category: "Food",
    price: "£8.99",
    status: "pending",
    submittedDate: "2024-01-22",
    images: 3,
    description: "Traditional Nigerian pepper soup spice mix. Perfect for authentic African cuisine.",
    compliance: {
      foodSafety: "pending",
      labeling: "complete",
      ingredients: "pending",
      allergens: "pending"
    },
    riskScore: "medium",
    reviewNotes: ""
  }
];

const complianceStatuses = {
  complete: { label: "Complete", color: "bg-success text-success-foreground" },
  pending: { label: "Pending", color: "bg-warning text-warning-foreground" },
  failed: { label: "Failed", color: "bg-destructive text-destructive-foreground" },
  review: { label: "Under Review", color: "bg-muted text-muted-foreground" }
};

export function ProductApprovalQueue() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
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
    setIsLoading(productId);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Product Approved",
        description: `Product ${productId} has been approved and is now live`,
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Product Rejected",
        description: `Product ${productId} has been rejected: ${reason}`,
        variant: "destructive",
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Changes Requested",
        description: `Changes requested for product ${productId}`,
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

  const filteredProducts = productQueueData.filter(product => {
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
            <div className="text-2xl font-bold text-foreground">34</div>
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
            <div className="text-2xl font-bold text-foreground">12</div>
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
            <div className="text-2xl font-bold text-foreground">8</div>
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
            <div className="text-2xl font-bold text-foreground">3</div>
            <div className="text-sm text-muted-foreground">Products rejected</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
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
                  >
                    <option value="all">All Categories</option>
                    <option value="Food">Food</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Herbal">Herbal</option>
                    <option value="Services">Services</option>
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
                    <TableHead>Product ID</TableHead>
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
                  {currentProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.images} images • {product.submittedDate}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.vendor}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{product.price}</TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell>{getRiskBadge(product.riskScore)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {Object.entries(product.compliance).map(([key, value]) => (
                            <div
                              key={key}
                              className={`w-2 h-2 rounded-full ${
                                value === 'complete' ? 'bg-success' :
                                value === 'pending' ? 'bg-warning' :
                                'bg-destructive'
                              }`}
                              title={`${key}: ${value}`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedProduct(product)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {product.status === "pending" && (
                            <>
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
                                onClick={() => handleReject(product.id, "Quality issues")}
                                disabled={isLoading === product.id}
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
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
                totalItems={filteredProducts.length}
                itemsPerPage={itemsPerPage}
              />
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
                    <div><strong>Vendor:</strong> {selectedProduct.vendor}</div>
                    <div><strong>Category:</strong> {selectedProduct.category}</div>
                    <div><strong>Price:</strong> {selectedProduct.price}</div>
                    <div><strong>Submitted:</strong> {selectedProduct.submittedDate}</div>
                    <div><strong>Images:</strong> {selectedProduct.images} photos</div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Compliance Status</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedProduct.compliance).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <Badge className={complianceStatuses[value as keyof typeof complianceStatuses].color}>
                          {complianceStatuses[value as keyof typeof complianceStatuses].label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Risk Assessment</h4>
                    {getRiskBadge(selectedProduct.riskScore)}
                  </div>
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
                <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
}
