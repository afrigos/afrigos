import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

const API_BASE_URL = 'http://localhost:3002/api/v1';

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  category: string;
  status: string;
  joinDate: string;
  revenue: string;
  products: number;
  rating: number;
  documents: string;
}

interface VendorsResponse {
  success: boolean;
  data: Vendor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API functions
const fetchVendors = async (params: { page?: number; limit?: number; status?: string; search?: string }): Promise<VendorsResponse> => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.status) queryParams.append('status', params.status);
  if (params.search) queryParams.append('search', params.search);

  const response = await fetch(`${API_BASE_URL}/admin/vendors?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('afrigos-token')}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch vendors');
  }

  return response.json();
};

const updateVendorStatus = async (vendorId: string, isActive: boolean) => {
  const response = await fetch(`${API_BASE_URL}/admin/vendors/${vendorId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('afrigos-token')}`
    },
    body: JSON.stringify({ isActive, isVerified: isActive })
  });

  if (!response.ok) {
    throw new Error('Failed to update vendor status');
  }

  return response.json();
};

export function VendorManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAddingVendor, setIsAddingVendor] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [selectedStoreVendor, setSelectedStoreVendor] = useState<Vendor | null>(null);
  const { toast } = useToast();

  // Fetch vendors using TanStack Query
  const { data: vendorsResponse, isLoading, error } = useQuery({
    queryKey: ['vendors', currentPage, statusFilter, searchTerm],
    queryFn: () => fetchVendors({
      page: currentPage,
      limit: itemsPerPage,
      status: statusFilter,
      search: searchTerm
    })
  });

  // Update vendor status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ vendorId, isActive }: { vendorId: string; isActive: boolean }) => 
      updateVendorStatus(vendorId, isActive),
    onSuccess: (data) => {
      toast({
        title: "Status Updated",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get vendors data from API response
  const vendors = vendorsResponse?.data || [];
  const pagination = vendorsResponse?.pagination || { total: 0, pages: 0 };
  const totalPages = pagination.pages;

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

  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
  };

  const handleViewStore = (vendor: Vendor) => {
    navigate(`/admin/vendor-store/${vendor.id}`);
  };

  const handleApproveVendor = async (vendorId: string) => {
    updateStatusMutation.mutate({ vendorId, isActive: true });
  };

  const handleSuspendVendor = async (vendorId: string) => {
    updateStatusMutation.mutate({ vendorId, isActive: false });
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
          <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>All ({pagination.total})</TabsTrigger>
          <TabsTrigger value="pending" onClick={() => setStatusFilter("pending")}>Pending</TabsTrigger>
          <TabsTrigger value="approved" onClick={() => setStatusFilter("approved")}>Approved</TabsTrigger>
          <TabsTrigger value="review" onClick={() => setStatusFilter("review")}>Review</TabsTrigger>
          <TabsTrigger value="suspended" onClick={() => setStatusFilter("suspended")}>Suspended</TabsTrigger>
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
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <span className="ml-2">Loading vendors...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-destructive">
                        Error loading vendors: {error.message}
                      </TableCell>
                    </TableRow>
                  ) : vendors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No vendors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    vendors.map((vendor) => (
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
                              disabled={updateStatusMutation.isPending}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleContactVendor(vendor.id, "phone")}
                              disabled={updateStatusMutation.isPending}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          {vendor.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApproveVendor(vendor.id)}
                                disabled={updateStatusMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 text-success" />
                            </Button>
                          )}
                          {vendor.status === "approved" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSuspendVendor(vendor.id)}
                                disabled={updateStatusMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                          {vendor.status === "suspended" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApproveVendor(vendor.id)}
                                disabled={updateStatusMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 text-success" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={pagination.total}
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
              <div className="text-center py-8 text-muted-foreground">
                Use the "All" tab to view all vendors. Filtering by status will be implemented soon.
                        </div>
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
              <div className="text-center py-8 text-muted-foreground">
                Use the "All" tab to view all vendors. Filtering by status will be implemented soon.
                        </div>
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
              <div className="text-center py-8 text-muted-foreground">
                Use the "All" tab to view all vendors. Filtering by status will be implemented soon.
                        </div>
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
              <div className="text-center py-8 text-muted-foreground">
                Use the "All" tab to view all vendors. Filtering by status will be implemented soon.
                        </div>
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
    </div>
  );
}