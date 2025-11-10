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
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Download,
  Users,
  Star,
  ShoppingCart,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/api-config";
import { apiFetch } from "@/lib/api-client";

// Predefined countries for customers
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

// Predefined customer preferences
const customerPreferences = [
  "Food & Beverages",
  "Fashion & Clothing", 
  "Beauty & Personal Care",
  "Health & Wellness",
  "Home & Garden",
  "Electronics & Technology",
  "Sports & Fitness",
  "Books & Education",
  "Arts & Crafts",
  "Jewelry & Accessories"
];

// Fetch customers from API
const fetchCustomers = async (params: { page: number; limit: number; status: string; search?: string }) => {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    status: params.status,
    ...(params.search && { search: params.search })
  });
  
  const response = await apiFetch<{
    success: boolean;
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>(`${API_BASE_URL}/admin/customers?${queryParams.toString()}`);
  
  return response;
};

export function CustomerManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch customers
  const { data: customersData, isLoading: isLoadingCustomers, error } = useQuery({
    queryKey: ['customers', currentPage, itemsPerPage, statusFilter, searchTerm],
    queryFn: () => fetchCustomers({
      page: currentPage,
      limit: itemsPerPage,
      status: statusFilter,
      search: searchTerm || undefined
    }),
  });

  const customers = customersData?.data || [];
  const pagination = customersData?.pagination || { page: 1, limit: 10, total: 0, pages: 0 };

  // Calculate stats from data
const customerStats = [
  {
    title: "Total Customers",
      value: pagination.total.toLocaleString(),
      change: "+0%",
      trend: "up" as const,
    icon: Users
  },
  {
    title: "Active Customers",
      value: customers.filter((c: any) => c.status === 'active').length.toLocaleString(),
      change: "+0%",
      trend: "up" as const,
    icon: TrendingUp
  },
  {
      title: "Total Revenue",
      value: `£${customers.reduce((sum: number, c: any) => {
        const spent = parseFloat(c.totalSpent.replace('£', '').replace(/,/g, '')) || 0;
        return sum + spent;
      }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "+0%",
      trend: "up" as const,
    icon: ShoppingCart
  },
  {
      title: "Average Rating",
      value: customers.length > 0
        ? (customers.reduce((sum: number, c: any) => sum + (c.rating || 0), 0) / customers.length).toFixed(1)
        : "0.0",
      change: "+0%",
      trend: "up" as const,
      icon: Star
    }
  ];

  // Add customer form state
  const [addCustomerForm, setAddCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    dateOfBirth: "",
    gender: "",
    occupation: "",
    company: "",
    address: "",
    city: "",
    postalCode: "",
    country: "UK",
    preferences: [] as string[],
    marketingConsent: false,
    termsAccepted: false
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case "inactive":
        return <Badge className="bg-muted text-muted-foreground">Inactive</Badge>;
      case "suspended":
        return <Badge className="bg-destructive text-destructive-foreground">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleContactCustomer = (customerId: string, method: string) => {
    toast({
      title: "Contact Initiated",
      description: `Contacting customer ${customerId} via ${method}`,
    });
  };

  const handleViewProfile = (customer: any) => {
    setSelectedCustomer(customer);
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
        description: "Customer data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export customer data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddCustomer = () => {
    setShowAddModal(true);
  };

  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingCustomer(true);
    
    try {
      // TODO: Implement actual API call to create customer
      // For now, this is a placeholder that just shows a success message
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Customer Added Successfully",
        description: `Customer ${addCustomerForm.name} has been added successfully.`,
      });
      
      // Reset form and close modal
      setAddCustomerForm({
        name: "",
        email: "",
        phone: "",
        location: "",
        dateOfBirth: "",
        gender: "",
        occupation: "",
        company: "",
        address: "",
        city: "",
        postalCode: "",
        country: "UK",
        preferences: [],
        marketingConsent: false,
        termsAccepted: false
      });
      setShowAddModal(false);
      
    } catch (error) {
      toast({
        title: "Failed to Add Customer",
        description: "An error occurred while adding the customer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingCustomer(false);
    }
  };

  const handleAddCustomerFormChange = (field: string, value: any) => {
    setAddCustomerForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceToggle = (preference: string) => {
    setAddCustomerForm(prev => ({
      ...prev,
      preferences: prev.preferences.includes(preference)
        ? prev.preferences.filter(p => p !== preference)
        : [...prev.preferences, preference]
    }));
  };

  // Update customer status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ customerId, isActive }: { customerId: string; isActive: boolean }) => {
      return apiFetch(`${API_BASE_URL}/admin/users/${customerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Status Updated",
        description: "Customer status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update customer status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSuspendCustomer = async (customerId: string) => {
    setIsLoading(customerId);
    updateStatusMutation.mutate({ customerId, isActive: false });
      setIsLoading(null);
  };

  const handleActivateCustomer = async (customerId: string) => {
    setIsLoading(customerId);
    updateStatusMutation.mutate({ customerId, isActive: true });
      setIsLoading(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
          <p className="text-muted-foreground">Manage customer profiles and interactions</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportData}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export Data"}
          </Button>
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-primary to-dashboard-accent"
            onClick={handleAddCustomer}
          >
            <Users className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Customer Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {customerStats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center space-x-1">
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-success' : 'text-destructive'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-muted-foreground">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Customers</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="support">Support Issues</TabsTrigger>
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
                      placeholder="Search customers by name, email, or ID..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to first page on search
                      }}
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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customers Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Customer Database</CardTitle>
              <CardDescription>Manage customer profiles and interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingCustomers ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <p className="mt-2 text-sm text-muted-foreground">Loading customers...</p>
                      </TableCell>
                    </TableRow>
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <p className="text-sm text-muted-foreground">No customers found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer: any) => (
                    <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">Joined {customer.joinDate}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{customer.email}</div>
                          <div className="text-sm text-muted-foreground">{customer.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.location}</TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{customer.totalOrders}</div>
                          <div className="text-sm text-muted-foreground">orders</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{customer.totalSpent}</TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{customer.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewProfile(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleContactCustomer(customer.id, "email")}
                            disabled={isLoading === customer.id}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleContactCustomer(customer.id, "phone")}
                            disabled={isLoading === customer.id}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          {customer.status === "active" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSuspendCustomer(customer.id)}
                              disabled={isLoading === customer.id}
                            >
                              <AlertTriangle className="h-4 w-4 text-warning" />
                            </Button>
                          )}
                          {customer.status === "suspended" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActivateCustomer(customer.id)}
                              disabled={isLoading === customer.id}
                            >
                              <CheckCircle className="h-4 w-4 text-success" />
                            </Button>
                          )}
                          {customer.status === "inactive" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActivateCustomer(customer.id)}
                              disabled={isLoading === customer.id}
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
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span>Active Customers</span>
              </CardTitle>
              <CardDescription>Currently active customers</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingCustomers ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : customers.filter((c: any) => c.status === "active").length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-sm text-muted-foreground">No active customers</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.filter((c: any) => c.status === "active").map((customer: any) => (
                    <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">Joined {customer.joinDate}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{customer.email}</div>
                          <div className="text-sm text-muted-foreground">{customer.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{customer.totalOrders}</div>
                          <div className="text-sm text-muted-foreground">orders</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{customer.totalSpent}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{customer.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewProfile(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleContactCustomer(customer.id, "email")}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSuspendCustomer(customer.id)}
                            disabled={isLoading === customer.id}
                          >
                            <AlertTriangle className="h-4 w-4 text-warning" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-muted-foreground" />
                <span>Inactive Customers</span>
              </CardTitle>
              <CardDescription>Inactive and suspended customers</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Order</TableHead>
                    <TableHead>Support Tickets</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingCustomers ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : customers.filter((c: any) => c.status !== "active").length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-sm text-muted-foreground">No inactive customers</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.filter((c: any) => c.status !== "active").map((customer: any) => (
                    <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">Joined {customer.joinDate}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{customer.email}</div>
                          <div className="text-sm text-muted-foreground">{customer.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">{customer.lastOrder}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{customer.supportTickets}</div>
                          <div className="text-sm text-muted-foreground">tickets</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewProfile(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActivateCustomer(customer.id)}
                            disabled={isLoading === customer.id}
                          >
                            <CheckCircle className="h-4 w-4 text-success" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleContactCustomer(customer.id, "email")}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-warning" />
                <span>Support Issues</span>
              </CardTitle>
              <CardDescription>Customers with support tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Support Tickets</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Order</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingCustomers ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : customers.filter((c: any) => c.supportTickets > 0).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-sm text-muted-foreground">No customers with support issues</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.filter((c: any) => c.supportTickets > 0).map((customer: any) => (
                    <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">Joined {customer.joinDate}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{customer.email}</div>
                          <div className="text-sm text-muted-foreground">{customer.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className={`font-medium ${customer.supportTickets > 3 ? "text-destructive" : "text-warning"}`}>
                            {customer.supportTickets}
                          </div>
                          <div className="text-sm text-muted-foreground">tickets</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(customer.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">{customer.lastOrder}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewProfile(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleContactCustomer(customer.id, "email")}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleContactCustomer(customer.id, "phone")}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          {customer.supportTickets > 3 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSuspendCustomer(customer.id)}
                              disabled={isLoading === customer.id}
                            >
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Customer Profile - {selectedCustomer.name}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCustomer(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Personal Information</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Customer ID:</strong> {selectedCustomer.id}</div>
                  <div><strong>Name:</strong> {selectedCustomer.name}</div>
                  <div><strong>Email:</strong> {selectedCustomer.email}</div>
                  <div><strong>Phone:</strong> {selectedCustomer.phone}</div>
                  <div><strong>Location:</strong> {selectedCustomer.location}</div>
                  <div><strong>Join Date:</strong> {selectedCustomer.joinDate}</div>
                  <div><strong>Status:</strong> {getStatusBadge(selectedCustomer.status)}</div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Preferences</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCustomer.preferences && selectedCustomer.preferences.length > 0 ? (
                      selectedCustomer.preferences.map((pref: string, index: number) => (
                      <Badge key={index} variant="outline">{pref}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No preferences set</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Order History</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Total Orders:</strong> {selectedCustomer.totalOrders}</div>
                  <div><strong>Total Spent:</strong> {selectedCustomer.totalSpent}</div>
                  <div><strong>Last Order:</strong> {selectedCustomer.lastOrder}</div>
                  <div><strong>Average Rating:</strong> ★ {selectedCustomer.rating}</div>
                  <div><strong>Support Tickets:</strong> {selectedCustomer.supportTickets}</div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Quick Actions</h4>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleContactCustomer(selectedCustomer.id, "email")}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleContactCustomer(selectedCustomer.id, "phone")}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-2">
              <Button onClick={() => handleContactCustomer(selectedCustomer.id, "email")}>
                <Mail className="h-4 w-4 mr-2" />
                Contact Customer
              </Button>
              <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add New Customer</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
                <Input
                  id="name"
                  type="text"
                  value={addCustomerForm.name}
                  onChange={(e) => handleAddCustomerFormChange("name", e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={addCustomerForm.email}
                  onChange={(e) => handleAddCustomerFormChange("email", e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground mb-1">Phone</label>
                <Input
                  id="phone"
                  type="tel"
                  value={addCustomerForm.phone}
                  onChange={(e) => handleAddCustomerFormChange("phone", e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
                <Input
                  id="location"
                  type="text"
                  value={addCustomerForm.location}
                  onChange={(e) => handleAddCustomerFormChange("location", e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-muted-foreground mb-1">Country</label>
                <Select onValueChange={(value) => handleAddCustomerFormChange("country", value)} value={addCustomerForm.country}>
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
                <label htmlFor="gender" className="block text-sm font-medium text-muted-foreground mb-1">Gender</label>
                <Select onValueChange={(value) => handleAddCustomerFormChange("gender", value)} value={addCustomerForm.gender}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="preferences" className="block text-sm font-medium text-muted-foreground mb-1">Preferences</label>
                <div className="flex flex-wrap gap-2">
                  {customerPreferences.map((pref) => (
                    <Badge
                      key={pref}
                      variant={addCustomerForm.preferences.includes(pref) ? "default" : "outline"}
                      onClick={() => handlePreferenceToggle(pref)}
                      className="cursor-pointer hover:bg-primary/10"
                    >
                      {pref}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="marketingConsent"
                  checked={addCustomerForm.marketingConsent}
                  onChange={(e) => handleAddCustomerFormChange("marketingConsent", e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-input"
                />
                <label htmlFor="marketingConsent" className="text-sm text-muted-foreground">
                  I agree to receive marketing communications from your company.
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  checked={addCustomerForm.termsAccepted}
                  onChange={(e) => handleAddCustomerFormChange("termsAccepted", e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-input"
                />
                <label htmlFor="termsAccepted" className="text-sm text-muted-foreground">
                  I have read and accept the terms and conditions.
                </label>
              </div>
              <Button type="submit" className="w-full" disabled={isAddingCustomer}>
                {isAddingCustomer ? "Adding..." : "Add Customer"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
