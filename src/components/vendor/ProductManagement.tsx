import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Upload, 
  X,
  Factory,
  Globe,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  TrendingUp,
  Package,
  DollarSign
} from 'lucide-react';

import { API_BASE_URL, BACKEND_URL } from '@/lib/api-config';

// Helper function to get full image URL
const getImageUrl = (imagePath: string) => {
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `${BACKEND_URL}/${imagePath}`;
};

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku: string;
  stock: number;
  status: string;
  sourcing: string;
  images: string[];
  category: { id: string; name: string };
  totalSales: number;
  totalRevenue: number;
  avgRating: number;
  reviewCount: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  type: string;
}

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  comparePrice: string;
  stock: string;
  sourcing: string;
  categoryId: string;
  sku: string;
  tags: string;
}

// Fetch products
const fetchProducts = async (params: any = {}): Promise<ProductsResponse> => {
  console.log('=== FRONTEND: FETCHING PRODUCTS ===');
  console.log('Params:', params);
  
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value.toString());
  });
  
  const url = `${API_BASE_URL}/products?${queryParams}`;
  console.log('Fetching from URL:', url);
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('afrigos-token')}`
    }
  });
  
  console.log('Response status:', response.status);
  console.log('Response ok:', response.ok);
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error('API Error response:', errorData);
    throw new Error(errorData.message || 'Failed to fetch products');
  }
  
  const result = await response.json();
  console.log('API Success response:', result);
  return result.data;
};

// Fetch categories
const fetchCategories = async (): Promise<Category[]> => {
  const token = localStorage.getItem('afrigos-token');
  console.log('Fetching categories with token:', token ? 'Token exists' : 'No token');
  
  const response = await fetch(`${API_BASE_URL}/products/categories`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  console.log('Categories API response status:', response.status);
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error('Categories API error:', errorData);
    throw new Error(errorData.message || 'Failed to fetch categories');
  }
  
  const data = await response.json();
  console.log('Categories API response data:', data);
  return data.data;
};

// Create product
const createProduct = async (formData: FormData): Promise<Product> => {
  console.log('=== API: CREATING PRODUCT ===');
  console.log('API URL:', `${API_BASE_URL}/products`);
  console.log('Token exists:', !!localStorage.getItem('afrigos-token'));
  
  const response = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('afrigos-token')}`
    },
    body: formData
  });
  
  console.log('Response status:', response.status);
  console.log('Response ok:', response.ok);
  
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error response:', error);
    throw new Error(error.message || 'Failed to create product');
  }
  
  const data = await response.json();
  console.log('API Success response:', data);
  return data.data;
};

// Update product
const updateProduct = async ({ id, formData }: { id: string; formData: FormData }): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('afrigos-token')}`
    },
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update product');
  }
  
  const data = await response.json();
  return data.data;
};

// Delete product
const deleteProduct = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('afrigos-token')}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete product');
  }
};

export default function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSourcing, setSelectedSourcing] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    stock: '',
    sourcing: 'IN_HOUSE',
    categoryId: '',
    sku: '',
    tags: ''
  });
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', { searchTerm, selectedCategory, selectedSourcing, selectedStatus, currentPage }],
    queryFn: () => fetchProducts({
      search: searchTerm,
      category: selectedCategory === 'all' ? '' : selectedCategory,
      sourcing: selectedSourcing === 'all' ? '' : selectedSourcing,
      status: selectedStatus === 'all' ? '' : selectedStatus,
      page: currentPage,
      limit: 10
    }),
    refetchInterval: 30000
  });

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  // Debug categories (remove in production)
  if (categoriesError) {
    console.error('Categories error:', categoriesError);
  }

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowAddModal(false);
      resetForm();
      toast({
        title: "Product Created",
        description: "Your product has been submitted for admin approval.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowEditModal(false);
      resetForm();
      toast({
        title: "Product Updated",
        description: "Your product changes have been submitted for admin approval.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowDeleteModal(false);
      setProductToDelete(null);
      toast({
        title: "Product Deleted",
        description: "Product has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      comparePrice: '',
      stock: '',
      sourcing: 'IN_HOUSE',
      categoryId: '',
      sku: '',
      tags: ''
    });
    setImages([]);
    setImagePreviews([]);
  };

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Check if adding these files would exceed the limit
    if (images.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 images per product.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (5MB limit)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Some files exceed the 5MB limit. Please choose smaller files.",
        variant: "destructive",
      });
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    
    // Clear the input so the same file can be selected again
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('=== FRONTEND: CREATING PRODUCT ===');
    console.log('Form data:', formData);
    console.log('Images:', images);
    console.log('Images count:', images.length);
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    if (formData.comparePrice) formDataToSend.append('comparePrice', formData.comparePrice);
    formDataToSend.append('stock', formData.stock);
    formDataToSend.append('sourcing', formData.sourcing);
    formDataToSend.append('categoryId', formData.categoryId);
    formDataToSend.append('sku', formData.sku);
    if (formData.tags) formDataToSend.append('tags', formData.tags);

    images.forEach((image, index) => {
      formDataToSend.append('images', image);
    });

    console.log('FormData entries:');
    for (let [key, value] of formDataToSend.entries()) {
      console.log(key, value);
    }

    createProductMutation.mutate(formDataToSend);
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    if (formData.comparePrice) formDataToSend.append('comparePrice', formData.comparePrice);
    formDataToSend.append('stock', formData.stock);
    formDataToSend.append('sourcing', formData.sourcing);
    formDataToSend.append('categoryId', formData.categoryId);
    formDataToSend.append('sku', formData.sku);
    if (formData.tags) formDataToSend.append('tags', formData.tags);

    images.forEach((image, index) => {
      formDataToSend.append('images', image);
    });

    updateProductMutation.mutate({ id: selectedProduct.id, formData: formDataToSend });
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete.id);
    }
  };

  const handleEdit = (product: Product) => {
    console.log('Editing product:', product);
    console.log('Product category:', product.category);
    
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      comparePrice: product.comparePrice?.toString() || '',
      stock: product.stock.toString(),
      sourcing: product.sourcing,
      categoryId: product.category?.id || '',
      sku: product.sku,
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || ''
    });
    setExistingImages(product.images || []);
    setImages([]);
    setShowEditModal(true);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const getStatusBadge = (status: string, hasReviewNote?: boolean) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'DRAFT':
        if (hasReviewNote) {
          return <Badge className="bg-orange-100 text-orange-800"><AlertCircle className="h-3 w-3 mr-1" />Changes Requested</Badge>;
        }
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getSourcingIcon = (sourcing: string) => {
    return sourcing === 'IN_HOUSE' ? <Factory className="h-4 w-4" /> : <Globe className="h-4 w-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Failed to load products</p>
      </div>
    );
  }

  const products = productsData?.products || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600">Manage your product catalog and inventory</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedSourcing} onValueChange={setSelectedSourcing}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Sourcing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sourcing</SelectItem>
            <SelectItem value="IN_HOUSE">In-House</SelectItem>
            <SelectItem value="OUTSOURCED">Outsourced</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Product Sourcing Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Product Sourcing Guide</CardTitle>
          <CardDescription>Understanding the difference between In-House and Outsourced products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Factory className="h-8 w-8 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">In-House</h3>
                <p className="text-sm text-gray-600">Self-manufactured products</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Globe className="h-8 w-8 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Outsourced</h3>
                <p className="text-sm text-gray-600">Resold products from suppliers</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({products.length})</CardTitle>
          <CardDescription>Manage your product catalog and inventory</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No products found</p>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="mt-4 bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Sourcing</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Performance</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center relative">
                            {product.images.length > 0 ? (
                              <>
                                <img 
                                  src={getImageUrl(product.images[0])} 
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                                <Package className="h-6 w-6 text-gray-400" style={{ display: 'none' }} />
                              </>
                            ) : (
                              <Package className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">ID: {product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900">
                      {product.category?.name || 'No Category'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getSourcingIcon(product.sourcing)}
                          <span className="text-sm text-gray-900">
                            {product.sourcing === 'IN_HOUSE' ? 'In-House' : 'Outsourced'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">£{product.price.toFixed(2)}</p>
                          {product.comparePrice && (
                            <p className="text-sm text-gray-500 line-through">£{product.comparePrice.toFixed(2)}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900">{product.stock}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {getStatusBadge(product.status, !!product.rejectionReason)}
                          {product.rejectionReason && (
                            <div className={`mt-2 p-2 border rounded text-sm ${
                              product.status === 'REJECTED' 
                                ? 'bg-red-50 border-red-200' 
                                : product.status === 'DRAFT'
                                ? 'bg-orange-50 border-orange-200'
                                : 'bg-yellow-50 border-yellow-200'
                            }`}>
                              <p className={`font-medium mb-1 ${
                                product.status === 'REJECTED' 
                                  ? 'text-red-800' 
                                  : product.status === 'DRAFT'
                                  ? 'text-orange-800'
                                  : 'text-yellow-800'
                              }`}>
                                {product.status === 'REJECTED' 
                                  ? 'Rejection Reason:' 
                                  : product.status === 'DRAFT'
                                  ? 'Changes Requested:'
                                  : 'Review Note:'}
                              </p>
                              <p className={
                                product.status === 'REJECTED' 
                                  ? 'text-red-700' 
                                  : product.status === 'DRAFT'
                                  ? 'text-orange-700'
                                  : 'text-yellow-700'
                              }>{product.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-sm text-gray-900">{product.avgRating}</span>
                            <span className="text-sm text-gray-500">({product.reviewCount})</span>
                          </div>
                          <p className="text-sm text-gray-500">{product.totalSales} sales</p>
                          <p className="text-sm text-gray-500">£{product.totalRevenue.toFixed(2)}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              console.log('Edit button clicked for product:', product.id);
                              handleEdit(product);
                            }}
                            title="Edit Product"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(product)}
                            title="View Product Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Product Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product for your catalog. All products require admin approval.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddProduct} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="Product SKU"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter product description"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (£) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comparePrice">Compare Price (£)</Label>
                <Input
                  id="comparePrice"
                  type="number"
                  step="0.01"
                  value={formData.comparePrice}
                  onChange={(e) => handleInputChange('comparePrice', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                    ) : categories.length === 0 ? (
                      <SelectItem value="no-categories" disabled>No categories available</SelectItem>
                    ) : (
                      categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sourcing">Sourcing *</Label>
                <Select value={formData.sourcing} onValueChange={(value) => handleInputChange('sourcing', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sourcing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_HOUSE">In-House</SelectItem>
                    <SelectItem value="OUTSOURCED">Outsourced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="Enter tags separated by commas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Product Images</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Upload up to 5 images (JPG, PNG, GIF, WebP). Max 5MB per image. You can select multiple files at once.
              </p>
              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">
                    Selected Images ({imagePreviews.length}/5):
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-20 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          {images[index]?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-orange-600 hover:bg-orange-700"
                disabled={createProductMutation.isPending}
              >
                {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update your product information. Changes will require admin approval.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProduct} className="space-y-6">
            {/* Same form fields as Add Product Modal */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sku">SKU</Label>
                <Input
                  id="edit-sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder="Product SKU"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter product description"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (£) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-comparePrice">Compare Price (£)</Label>
                <Input
                  id="edit-comparePrice"
                  type="number"
                  step="0.01"
                  value={formData.comparePrice}
                  onChange={(e) => handleInputChange('comparePrice', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock *</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                    ) : categories.length === 0 ? (
                      <SelectItem value="no-categories" disabled>No categories available</SelectItem>
                    ) : (
                      categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sourcing">Sourcing *</Label>
                <Select value={formData.sourcing} onValueChange={(value) => handleInputChange('sourcing', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sourcing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_HOUSE">In-House</SelectItem>
                    <SelectItem value="OUTSOURCED">Outsourced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags</Label>
              <Input
                id="edit-tags"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="Enter tags separated by commas"
              />
            </div>

            <div className="space-y-2">
              <Label>Current Images</Label>
              {existingImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {existingImages.map((imagePath, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={getImageUrl(imagePath)} 
                        alt={`Current ${index + 1}`} 
                        className="w-full h-20 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setExistingImages(prev => prev.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No current images</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-images">Additional Images</Label>
              <Input
                id="edit-images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">
                    Selected Images ({imagePreviews.length}/5):
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-20 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          {images[index]?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-orange-600 hover:bg-orange-700"
                disabled={updateProductMutation.isPending}
              >
                {updateProductMutation.isPending ? 'Updating...' : 'Update Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Product Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              View detailed information about your product
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-6">
              {/* Product Images */}
              <div>
                <h3 className="font-semibold mb-2">Product Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    selectedProduct.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={getImageUrl(image)}
                          alt={`${selectedProduct.name} ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-center">
                        <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No images available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Basic Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Name:</span>
                      <p className="text-sm">{selectedProduct.name}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">SKU:</span>
                      <p className="text-sm">{selectedProduct.sku}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Category:</span>
                      <p className="text-sm">
                        {selectedProduct.category?.name || 'No Category'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Sourcing:</span>
                      <div className="flex items-center space-x-2">
                        {getSourcingIcon(selectedProduct.sourcing)}
                        <span className="text-sm">{selectedProduct.sourcing === 'IN_HOUSE' ? 'In-House' : 'Outsourced'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Pricing & Stock</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Price:</span>
                      <p className="text-sm font-semibold">£{selectedProduct.price}</p>
                    </div>
                    {selectedProduct.comparePrice && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Compare Price:</span>
                        <p className="text-sm line-through text-gray-500">£{selectedProduct.comparePrice}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium text-gray-500">Stock:</span>
                      <p className="text-sm">{selectedProduct.stock} units</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Status:</span>
                      <div className="mt-1">{getStatusBadge(selectedProduct.status, !!selectedProduct.rejectionReason)}</div>
                      {selectedProduct.rejectionReason && (
                        <div className={`mt-3 p-3 border rounded-lg ${
                          selectedProduct.status === 'REJECTED' 
                            ? 'bg-red-50 border-red-200' 
                            : selectedProduct.status === 'DRAFT'
                            ? 'bg-orange-50 border-orange-200'
                            : 'bg-yellow-50 border-yellow-200'
                        }`}>
                          <p className={`text-sm font-semibold mb-1 ${
                            selectedProduct.status === 'REJECTED' 
                              ? 'text-red-800' 
                              : selectedProduct.status === 'DRAFT'
                              ? 'text-orange-800'
                              : 'text-yellow-800'
                          }`}>
                            {selectedProduct.status === 'REJECTED' 
                              ? 'Rejection Reason:' 
                              : selectedProduct.status === 'DRAFT'
                              ? 'Changes Requested:'
                              : 'Review Note:'}
                          </p>
                          <p className={`text-sm ${
                            selectedProduct.status === 'REJECTED' 
                              ? 'text-red-700' 
                              : selectedProduct.status === 'DRAFT'
                              ? 'text-orange-700'
                              : 'text-yellow-700'
                          }`}>{selectedProduct.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedProduct.description || 'No description provided'}
                </p>
              </div>

              {/* Tags */}
              {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Metrics */}
              <div>
                <h3 className="font-semibold mb-2">Performance</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-semibold">{selectedProduct.totalSales}</p>
                    <p className="text-xs text-gray-500">Total Sales</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-semibold">{selectedProduct.avgRating || 0}</p>
                    <p className="text-xs text-gray-500">Avg Rating</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-lg font-semibold">£{selectedProduct.totalRevenue.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Total Revenue</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowViewModal(false);
              if (selectedProduct) {
                handleEdit(selectedProduct);
              }
            }}>
              Edit Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
