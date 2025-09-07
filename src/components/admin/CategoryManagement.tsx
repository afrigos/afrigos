import { useState } from "react";
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
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";

// Sample category data
const categoryData = [
  {
    id: "CAT001",
    name: "Food & Beverages",
    description: "Fresh food, beverages, and culinary products",
    type: "Product",
    status: "active",
    vendorCount: 45,
    productCount: 234,
    revenue: "£45,678",
    createdAt: "2023-01-15",
    updatedAt: "2024-01-20"
  },
  {
    id: "CAT002",
    name: "Fashion & Clothing",
    description: "Traditional and modern African fashion",
    type: "Product",
    status: "active",
    vendorCount: 32,
    productCount: 189,
    revenue: "£38,920",
    createdAt: "2023-02-10",
    updatedAt: "2024-01-18"
  },
  {
    id: "CAT003",
    name: "Beauty & Personal Care",
    description: "Natural beauty and personal care products",
    type: "Product",
    status: "active",
    vendorCount: 28,
    productCount: 156,
    revenue: "£29,450",
    createdAt: "2023-03-05",
    updatedAt: "2024-01-15"
  },
  {
    id: "CAT004",
    name: "Health & Wellness",
    description: "Traditional medicine and wellness products",
    type: "Product",
    status: "active",
    vendorCount: 22,
    productCount: 98,
    revenue: "£18,750",
    createdAt: "2023-04-12",
    updatedAt: "2024-01-12"
  },
  {
    id: "CAT005",
    name: "Home & Garden",
    description: "Home decor and garden products",
    type: "Product",
    status: "active",
    vendorCount: 18,
    productCount: 87,
    revenue: "£15,230",
    createdAt: "2023-05-20",
    updatedAt: "2024-01-10"
  },
  {
    id: "CAT006",
    name: "Electronics & Technology",
    description: "Electronic devices and tech accessories",
    type: "Product",
    status: "inactive",
    vendorCount: 12,
    productCount: 45,
    revenue: "£8,920",
    createdAt: "2023-06-08",
    updatedAt: "2024-01-05"
  },
  {
    id: "CAT007",
    name: "Arts & Crafts",
    description: "Traditional African arts and crafts",
    type: "Product",
    status: "active",
    vendorCount: 25,
    productCount: 134,
    revenue: "£22,180",
    createdAt: "2023-07-15",
    updatedAt: "2024-01-08"
  },
  {
    id: "CAT008",
    name: "Jewelry & Accessories",
    description: "Traditional and modern jewelry",
    type: "Product",
    status: "active",
    vendorCount: 20,
    productCount: 112,
    revenue: "£19,450",
    createdAt: "2023-08-22",
    updatedAt: "2024-01-14"
  }
];

const categoryTypes = ["Product", "Service", "Digital", "Physical"];

export function CategoryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const { toast } = useToast();

  // Add/Edit category form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    type: "",
    status: "active"
  });

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

  const filteredCategories = categoryData.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || category.status === statusFilter;
    const matchesType = typeFilter === "all" || category.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = filteredCategories.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

  const handleEditCategory = (category: any) => {
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
    setIsAddingCategory(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Category Added Successfully",
        description: `Category "${categoryForm.name}" has been added successfully.`,
      });
      
      setShowAddModal(false);
      
    } catch (error) {
      toast({
        title: "Failed to Add Category",
        description: "An error occurred while adding the category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleEditCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingCategory(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Category Updated Successfully",
        description: `Category "${categoryForm.name}" has been updated successfully.`,
      });
      
      setShowEditModal(false);
      
    } catch (error) {
      toast({
        title: "Failed to Update Category",
        description: "An error occurred while updating the category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEditingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    setIsLoading(categoryId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Category Deleted",
        description: "Category has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
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
                  <SelectItem key={type} value={type}>{type}</SelectItem>
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
              {currentCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{category.name}</div>
                      <div className="text-sm text-muted-foreground">{category.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{category.type}</Badge>
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
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={isLoading === category.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
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
            totalItems={filteredCategories.length}
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
                      <SelectItem key={type} value={type}>{type}</SelectItem>
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
              <Button type="submit" className="w-full" disabled={isAddingCategory}>
                {isAddingCategory ? "Adding..." : "Add Category"}
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
                      <SelectItem key={type} value={type}>{type}</SelectItem>
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
              <Button type="submit" className="w-full" disabled={isEditingCategory}>
                {isEditingCategory ? "Updating..." : "Update Category"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


