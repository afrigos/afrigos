import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft,
  Store,
  Package,
  Star,
  TrendingUp,
  Eye,
  Search,
  Filter,
  ShoppingBag,
  Users,
  DollarSign,
  Calendar
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3002/api/v1';

interface Vendor {
  id: string;
  businessName: string;
  businessType: string;
  description: string;
  website?: string;
  taxId?: string;
  revenue: number;
  verificationStatus: string;
  location: string;
  category: string;
  bankAccount: string;
  contactPerson: string;
  emergencyContact: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean;
    isVerified: boolean;
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock: number;
  status: string;
  sourcing: string;
  images: string[];
  category: { id: string; name: string };
  totalSales: number;
  totalRevenue: number;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
}

interface VendorStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  avgRating: number;
  totalCustomers: number;
  monthlyGrowth: number;
}

const fetchVendorDetails = async (vendorId: string): Promise<{ success: boolean; data: Vendor }> => {
  const token = localStorage.getItem('afrigos-token');
  const response = await fetch(`${API_BASE_URL}/admin/vendors/${vendorId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch vendor details');
  }

  return response.json();
};

const fetchVendorProducts = async (vendorId: string): Promise<{ success: boolean; data: Product[] }> => {
  const token = localStorage.getItem('afrigos-token');
  const response = await fetch(`${API_BASE_URL}/admin/products?vendorId=${vendorId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch vendor products');
  }

  return response.json();
};

const fetchVendorStats = async (vendorId: string): Promise<{ success: boolean; data: VendorStats }> => {
  const token = localStorage.getItem('afrigos-token');
  const response = await fetch(`${API_BASE_URL}/admin/vendor-stats/${vendorId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch vendor stats');
  }

  return response.json();
};

export default function VendorStore() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch vendor details
  const { data: vendorData, isLoading: vendorLoading, error: vendorError } = useQuery({
    queryKey: ['vendor-details', vendorId],
    queryFn: () => fetchVendorDetails(vendorId!),
    enabled: !!vendorId,
  });

  // Fetch vendor products
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['vendor-products', vendorId],
    queryFn: () => fetchVendorProducts(vendorId!),
    enabled: !!vendorId,
  });

  // Fetch vendor stats
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['vendor-stats', vendorId],
    queryFn: () => fetchVendorStats(vendorId!),
    enabled: !!vendorId,
  });

  const vendor = vendorData?.data;
  const products = productsData?.data || [];
  const stats = statsData?.data;

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'DRAFT':
        return <Badge className="bg-gray-100 text-gray-800"><Package className="h-3 w-3 mr-1" />Draft</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `http://localhost:3002/${imagePath}`;
  };

  if (vendorLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading vendor details...</p>
        </div>
      </div>
    );
  }

  if (vendorError || !vendor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading vendor details</p>
          <Button onClick={() => navigate('/admin/vendors')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vendors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/admin/vendors')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vendors
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Store className="h-6 w-6 mr-2 text-orange-600" />
              {vendor.businessName}
            </h1>
            <p className="text-muted-foreground">Vendor Store & Statistics</p>
          </div>
        </div>
      </div>

      {/* Vendor Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{vendor.businessName}</h3>
                <p className="text-muted-foreground">{vendor.businessType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Person</p>
                <p className="font-medium">{vendor.user.firstName} {vendor.user.lastName}</p>
                <p className="text-sm">{vendor.user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Business Description</p>
                <p className="text-sm">{vendor.description || 'No description provided'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={vendor.user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {vendor.user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Verification</span>
                <Badge className={vendor.user.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                  {vendor.user.isVerified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Category</span>
                <Badge variant="outline">{vendor.category}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Joined</span>
                <span className="text-sm">{new Date(vendor.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">£{stats.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Products Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Products ({filteredProducts.length})</CardTitle>
              <CardDescription>Products sold by this vendor</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading products...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-square bg-gray-100 relative">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={getImageUrl(product.images[0])}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg">£{product.price}</span>
                        {getStatusBadge(product.status)}
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Stock: {product.stock}</span>
                        <span>Sales: {product.totalSales}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



