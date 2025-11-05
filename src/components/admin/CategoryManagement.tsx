import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  Filter,
  Tag,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";

import { API_BASE_URL } from '@/lib/api-config';

interface Category {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  vendorCount: number;
  productCount: number;
  revenue: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesResponse {
  success: boolean;
  data: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// API functions
const fetchCategories = async (params: { page?: number; limit?: number; search?: string; status?: string; type?: string }): Promise<CategoriesResponse> => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('status', params.status);
  if (params.type) queryParams.append('type', params.type);

  const response = await fetch(`${API_BASE_URL}/categories?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('afrigos-token')}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return response.json();
};

const createCategory = async (data: { name: string; description?: string; type?: string; status?: string }) => {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('afrigos-token')}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create category');
  }

  return response.json();
};

const updateCategory = async (id: string, data: { name?: string; description?: string; type?: string; status?: string }) => {
  console.log('API call - updating category:', id, data);
  
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('afrigos-token')}`
    },
    body: JSON.stringify(data)
  });

  console.log('API response status:', response.status);

  if (!response.ok) {
    const error = await response.json();
    console.error('API error:', error);
    throw new Error(error.message || 'Failed to update category');
  }

  const result = await response.json();
  console.log('API success:', result);
  return result;
};

const deleteCategory = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('afrigos-token')}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete category');
  }

  return response.json();
};

const categoryTypes = ["AugmentableProduct", "Service", "Digital", "Physical"];

// Helper function to get display name for category type
const getTypeDisplayName = (type: string) => {
  switch (type) {
    case 'AugmentableProduct': return 'Product';
    case 'Service': return 'Service';
    case 'Digital': return 'Digital';
    case 'Physical': return 'Physical';
    default: return type;
  }
};

export function CategoryManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isExporting, setIsExporting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const { toast } = useToast();

  // Fetch categories using TanStack Query
  const { data: categoriesResponse, isLoading, error } = useQuery<CategoriesResponse, Error>({
    queryKey: ['categories', currentPage, statusFilter, typeFilter, searchTerm],
    queryFn: () => fetchCategories({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      type: typeFilter !== 'all' ? typeFilter : undefined
    })
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (data) => {
      toast({
        title: "Category Added Successfully",
        description: data.message || "Category has been added successfully.",
      });
      setShowAddModal(false);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add Category",
        description: error.message || "Failed to add category. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateCategory(id, data),
    onSuccess: (data) => {
      toast({
        title: "Category Updated Successfully",
        description: data.message || "Category has been updated successfully.",
      });
      setShowEditModal(false);
      setSelectedCategory(null);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Category",
        description: error.message || "Failed to update category. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (data) => {
      toast({
        title: "Category Deleted",
        description: data.message || "Category has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add/Edit category form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    type: "",
    status: "active"
  });

  // Get categories data from API response
  const categories = categoriesResponse?.data || [];
  const pagination = categoriesResponse?.pagination || { total: 0, pages: 0 };
  const totalPages = pagination.pages;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case "inactive":
        return <Badge className="bg-destructive text-destructive-foreground">Inactive</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, searchTerm]);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Export Successful",
        description: "Category data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export category data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddCategory = () => {
    setCategoryForm({
      name: "",
      description: "",
      type: "",
      status: "active"
    });
    setShowAddModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      type: category.type,
      status: category.status
    });
    setShowEditModal(true);
  };

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    createCategoryMutation.mutate(categoryForm);
  };

  const handleEditCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategory) {
      console.log('Updating category:', selectedCategory.id, categoryForm);
      updateCategoryMutation.mutate({
        id: selectedCategory.id,
        data: categoryForm
      });
    }
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDeleteCategory = async () => {
    if (categoryToDelete) {
      deleteCategoryMutation.mutate(categoryToDelete.id);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  const cancelDeleteCategory = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  const handleCategoryFormChange = (field: string, value: string) => {
    setCategoryForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Category Management</h1>
          <p className="text-muted-foreground">Manage product and service categories</p>
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
            onClick={handleAddCategory}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
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
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {categoryTypes.map(type => (
                  <SelectItem key={type} value={type}>{getTypeDisplayName(type)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Manage all product and service categories</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vendors</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2">Loading categories...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-destructive">
                    Error loading categories: {error.message}
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{category.name}</div>
                      <div className="text-sm text-muted-foreground">{category.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTypeDisplayName(category.type)}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(category.status)}</TableCell>
                  <TableCell className="text-center">{category.vendorCount}</TableCell>
                  <TableCell className="text-center">{category.productCount}</TableCell>
                  <TableCell className="font-mono">{category.revenue}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                          onClick={() => handleDeleteCategory(category)}
                          disabled={deleteCategoryMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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

      {/* Category Detail Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Category Details - {selectedCategory.name}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Category Information</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Category ID:</strong> {selectedCategory.id}</div>
                  <div><strong>Name:</strong> {selectedCategory.name}</div>
                  <div><strong>Description:</strong> {selectedCategory.description}</div>
                  <div><strong>Type:</strong> {selectedCategory.type}</div>
                  <div><strong>Status:</strong> {getStatusBadge(selectedCategory.status)}</div>
                  <div><strong>Created:</strong> {selectedCategory.createdAt}</div>
                  <div><strong>Updated:</strong> {selectedCategory.updatedAt}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Performance Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Total Vendors:</strong> {selectedCategory.vendorCount}</div>
                  <div><strong>Total Products:</strong> {selectedCategory.productCount}</div>
                  <div><strong>Total Revenue:</strong> {selectedCategory.revenue}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-2">
              <Button onClick={() => handleEditCategory(selectedCategory)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Category
              </Button>
              <Button variant="outline" onClick={() => setSelectedCategory(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add New Category</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleAddCategorySubmit} className="space-y-4">
              <div>
                <label htmlFor="add-cat-name" className="block text-sm font-medium text-foreground mb-1">
                  Category Name
                </label>
                <Input
                  id="add-cat-name"
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => handleCategoryFormChange("name", e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="add-cat-description" className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <Textarea
                  id="add-cat-description"
                  value={categoryForm.description}
                  onChange={(e) => handleCategoryFormChange("description", e.target.value)}
                  rows={3}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="add-cat-type" className="block text-sm font-medium text-foreground mb-1">
                  Type
                </label>
                <Select onValueChange={(value) => handleCategoryFormChange("type", value)} value={categoryForm.type}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryTypes.map(type => (
                      <SelectItem key={type} value={type}>{getTypeDisplayName(type)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="add-cat-status" className="block text-sm font-medium text-foreground mb-1">
                  Status
                </label>
                <Select onValueChange={(value) => handleCategoryFormChange("status", value)} value={categoryForm.status}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createCategoryMutation.isPending}>
                {createCategoryMutation.isPending ? "Adding..." : "Add Category"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Category</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditModal(false)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleEditCategorySubmit} className="space-y-4">
              <div>
                <label htmlFor="edit-cat-name" className="block text-sm font-medium text-foreground mb-1">
                  Category Name
                </label>
                <Input
                  id="edit-cat-name"
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => handleCategoryFormChange("name", e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="edit-cat-description" className="block text-sm font-medium text-foreground mb-1">
                  Description
                </label>
                <Textarea
                  id="edit-cat-description"
                  value={categoryForm.description}
                  onChange={(e) => handleCategoryFormChange("description", e.target.value)}
                  rows={3}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="edit-cat-type" className="block text-sm font-medium text-foreground mb-1">
                  Type
                </label>
                <Select onValueChange={(value) => handleCategoryFormChange("type", value)} value={categoryForm.type}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryTypes.map(type => (
                      <SelectItem key={type} value={type}>{getTypeDisplayName(type)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="edit-cat-status" className="block text-sm font-medium text-foreground mb-1">
                  Status
                </label>
                <Select onValueChange={(value) => handleCategoryFormChange("status", value)} value={categoryForm.status}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={updateCategoryMutation.isPending}>
                {updateCategoryMutation.isPending ? "Updating..." : "Update Category"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <h2 className="text-xl font-bold">Delete Category</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelDeleteCategory}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete the category <strong>"{categoryToDelete.name}"</strong>? 
                This action cannot be undone.
              </p>
              
              {categoryToDelete.productCount > 0 && (
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                    <div className="text-sm text-warning">
                      <p className="font-medium">Warning</p>
                      <p className="mt-1">
                        This category has {categoryToDelete.productCount} product(s). 
                        You cannot delete a category that contains products.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="destructive" 
                  onClick={confirmDeleteCategory}
                  disabled={deleteCategoryMutation.isPending || categoryToDelete.productCount > 0}
                  className="flex-1"
                >
                  {deleteCategoryMutation.isPending ? "Deleting..." : "Delete Category"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={cancelDeleteCategory}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


