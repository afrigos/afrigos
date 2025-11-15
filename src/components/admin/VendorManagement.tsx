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
  Activity,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";
import { apiFetch } from "@/lib/api-client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

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
  if (params.status && params.status !== 'all') queryParams.append('status', params.status);
  if (params.search && params.search.trim()) queryParams.append('search', params.search.trim());

  const response = await apiFetch<{ success: boolean; data: Vendor[]; pagination: { total: number; pages: number; page: number; limit: number } }>(`/admin/vendors?${queryParams.toString()}`);
  
  if (!response.success || !response.data) {
    throw new Error('Failed to fetch vendors');
  }

  return {
    success: response.success,
    data: response.data,
    pagination: response.pagination
  };
};

const updateVendorStatus = async (vendorId: string, isActive: boolean) => {
  const response = await apiFetch<{ success: boolean; message: string; data: { id: string; isActive: boolean; isVerified: boolean } }>(`/admin/vendors/${vendorId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ isActive, isVerified: isActive })
  });

  if (!response.success) {
    throw new Error(response.message || 'Failed to update vendor status');
  }

  return response;
};

const createVendor = async (vendorData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  businessName: string;
  businessType: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}) => {
  const response = await apiFetch<{ success: boolean; message: string; data: { id: string; email: string; firstName: string; lastName: string } }>('/admin/vendors', {
    method: 'POST',
    body: JSON.stringify({
      ...vendorData,
      role: 'VENDOR'
    })
  });

  if (!response.success) {
    throw new Error(response.message || 'Failed to create vendor');
  }

  return response;
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
  const [showPassword, setShowPassword] = useState(false);
  const [vendorFormData, setVendorFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
    businessType: 'Sole Proprietorship',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United Kingdom',
  });
  const { toast } = useToast();

  const BUSINESS_TYPES = [
    'Sole Proprietorship',
    'Partnership',
    'Limited Liability Company',
    'Corporation',
    'Non-Profit Organization',
    'Cooperative',
    'Individual'
  ];

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  // Fetch vendors using TanStack Query
  const { data: vendorsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-vendors', currentPage, statusFilter, searchTerm],
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
        description: data.message || "Vendor status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update vendor status",
        variant: "destructive",
      });
    },
  });

  // Create vendor mutation
  const createVendorMutation = useMutation({
    mutationFn: createVendor,
    onSuccess: (data) => {
      toast({
        title: "Vendor Created",
        description: data.message || "Vendor created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      refetch();
      setShowAddModal(false);
      // Reset form
      setVendorFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        businessName: '',
        businessType: 'Sole Proprietorship',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United Kingdom',
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create vendor",
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

  const handleVendorFormChange = (field: string, value: string) => {
    setVendorFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!vendorFormData.firstName || !vendorFormData.lastName || !vendorFormData.email || 
        !vendorFormData.password || !vendorFormData.businessName || !vendorFormData.businessType) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(vendorFormData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Validate password length
    if (vendorFormData.password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    createVendorMutation.mutate({
      firstName: vendorFormData.firstName.trim(),
      lastName: vendorFormData.lastName.trim(),
      email: vendorFormData.email.trim(),
      password: vendorFormData.password,
      phone: vendorFormData.phone.trim() || undefined,
      businessName: vendorFormData.businessName.trim(),
      businessType: vendorFormData.businessType,
      address: (vendorFormData.street || vendorFormData.city || vendorFormData.state || vendorFormData.postalCode) ? {
        street: vendorFormData.street.trim(),
        city: vendorFormData.city.trim(),
        state: vendorFormData.state.trim(),
        postalCode: vendorFormData.postalCode.trim(),
        country: vendorFormData.country.trim(),
      } : undefined,
    });
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

  const handleContactVendor = async (vendor: Vendor, method: string) => {
    try {
      if (method === "email" && vendor.email) {
        window.location.href = `mailto:${vendor.email}?subject=Vendor Inquiry`;
      } else if (method === "phone" && vendor.phone && vendor.phone !== 'N/A') {
        window.location.href = `tel:${vendor.phone}`;
      } else {
      toast({
          title: "Contact Information Not Available",
          description: `Vendor ${method} information is not available.`,
          variant: "destructive",
      });
      }
    } catch (error) {
      toast({
        title: "Contact Failed",
        description: "Failed to initiate contact. Please try again.",
        variant: "destructive",
      });
    }
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
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-card">
          <TabsTrigger value="all">All ({pagination.total})</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
        </TabsList>

        {/* Render the same table for all tabs - filtering is handled by the API */}
        <TabsContent value={statusFilter} className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>
                {statusFilter === "all" && "All Vendors"}
                {statusFilter === "pending" && "Pending Approval"}
                {statusFilter === "approved" && "Approved Vendors"}
                {statusFilter === "review" && "Under Review"}
                {statusFilter === "suspended" && "Suspended Vendors"}
              </CardTitle>
              <CardDescription>
                {statusFilter === "all" && "Complete list of marketplace vendors"}
                {statusFilter === "pending" && "Vendors awaiting approval"}
                {statusFilter === "approved" && "Successfully approved vendors"}
                {statusFilter === "review" && "Vendors currently being reviewed"}
                {statusFilter === "suspended" && "Suspended vendors"}
              </CardDescription>
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
                        Error loading vendors: {error instanceof Error ? error.message : 'Unknown error'}
                      </TableCell>
                    </TableRow>
                  ) : vendors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No vendors found{searchTerm ? ` matching "${searchTerm}"` : ''} {statusFilter !== 'all' ? `with status "${statusFilter}"` : ''}
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
                          <span className="text-sm">★ {vendor.rating > 0 ? vendor.rating.toFixed(1) : 'N/A'}</span>
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
                            onClick={() => handleContactVendor(vendor, "email")}
                              disabled={updateStatusMutation.isPending}
                            title="Email Vendor"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleContactVendor(vendor, "phone")}
                              disabled={updateStatusMutation.isPending}
                            title="Call Vendor"
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
              {pagination.total > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                  totalItems={pagination.total}
                itemsPerPage={itemsPerPage}
              />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Vendor Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
            <DialogDescription>
              Create a new vendor account with all required information
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateVendor} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      value={vendorFormData.firstName}
                      onChange={(e) => handleVendorFormChange('firstName', e.target.value)}
                      className="pl-10"
                      required
                    />
                        </div>
                          </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      value={vendorFormData.lastName}
                      onChange={(e) => handleVendorFormChange('lastName', e.target.value)}
                      className="pl-10"
                      required
                    />
                          </div>
                        </div>
                        </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={vendorFormData.email}
                      onChange={(e) => handleVendorFormChange('email', e.target.value)}
                      className="pl-10"
                      required
                    />
                        </div>
                          </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={vendorFormData.phone}
                      onChange={(e) => handleVendorFormChange('phone', e.target.value)}
                      className="pl-10"
                      placeholder="+44 7304 276064"
                    />
                          </div>
                        </div>
                        </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={vendorFormData.password}
                    onChange={(e) => handleVendorFormChange('password', e.target.value)}
                    className="pl-10 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                        </div>
                <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="businessName"
                      value={vendorFormData.businessName}
                      onChange={(e) => handleVendorFormChange('businessName', e.target.value)}
                      className="pl-10"
                      required
                    />
                        </div>
                          </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select
                    value={vendorFormData.businessType}
                    onValueChange={(value) => handleVendorFormChange('businessType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                          </div>
                        </div>
                        </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Address (Optional)</h3>
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={vendorFormData.street}
                  onChange={(e) => handleVendorFormChange('street', e.target.value)}
                  placeholder="123 Main Street"
                />
                        </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={vendorFormData.city}
                    onChange={(e) => handleVendorFormChange('city', e.target.value)}
                    placeholder="London"
                  />
                        </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Region</Label>
                  <Input
                    id="state"
                    value={vendorFormData.state}
                    onChange={(e) => handleVendorFormChange('state', e.target.value)}
                    placeholder="Greater London"
                  />
                          </div>
                          </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={vendorFormData.postalCode}
                    onChange={(e) => handleVendorFormChange('postalCode', e.target.value)}
                    placeholder="SW1A 1AA"
                  />
                        </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={vendorFormData.country}
                    onChange={(e) => handleVendorFormChange('country', e.target.value)}
                  />
                        </div>
              </div>
            </div>

            <DialogFooter>
                          <Button 
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setVendorFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    phone: '',
                    businessName: '',
                    businessType: 'Sole Proprietorship',
                    street: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: 'United Kingdom',
                  });
                }}
                disabled={createVendorMutation.isPending}
              >
                Cancel
                          </Button>
                          <Button
                type="submit"
                disabled={createVendorMutation.isPending}
              >
                {createVendorMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Vendor'
                )}
                          </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                    <Button size="sm" onClick={() => handleContactVendor(selectedVendor, "email")}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleContactVendor(selectedVendor, "phone")}>
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