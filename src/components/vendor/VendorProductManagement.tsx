import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Package,
  Factory,
  Globe,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Image,
  Tag,
  DollarSign,
  Upload,
  X,
  FileImage,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Product sourcing options
const SOURCING_OPTIONS = [
  { value: 'in_house', label: 'In-House', description: 'Self-manufactured products', icon: Factory },
  { value: 'outsourced', label: 'Outsourced', description: 'Resold products from suppliers', icon: Globe }
];

// Product categories
const PRODUCT_CATEGORIES = [
  "Food & Beverages",
  "Fashion & Clothing", 
  "Beauty & Personal Care",
  "Health & Wellness",
  "Home & Garden",
  "Electronics & Technology",
  "Sports & Fitness",
  "Books & Education",
  "Arts & Crafts",
  "Automotive",
  "Jewelry & Accessories",
  "Toys & Games",
  "Pet Supplies",
  "Baby & Kids",
  "Office & Business"
];

// Mock vendor product data with comprehensive details
const vendorProductData = [
  {
    id: "P001",
    name: "Authentic Jollof Rice Spice Mix",
    category: "Food & Beverages",
    price: "£12.99",
    status: "approved",
    stock: 45,
    sourcing: "in_house",
    images: [
      "https://picsum.photos/400/300?random=1",
      "https://picsum.photos/400/300?random=101",
      "https://picsum.photos/400/300?random=201"
    ],
    description: "Premium West African spice blend for authentic Jollof rice. Imported directly from Nigeria. This traditional blend includes carefully selected spices that have been used for generations to create the perfect Jollof rice flavor. Each batch is hand-mixed to ensure consistency and authenticity.",
    submitted: "2024-01-15",
    rating: 4.8,
    reviews: 156,
    sales: 234,
    revenue: "£3,036.66",
    specifications: {
      weight: "250g",
      dimensions: "12cm x 8cm x 3cm",
      material: "Natural Spices",
      origin: "Nigeria",
      shelfLife: "18 months",
      certifications: ["Organic", "Halal", "Fair Trade"]
    },
    compliance: {
      foodSafety: "complete",
      labeling: "complete",
      ingredients: "complete",
      allergens: "complete"
    },
    riskScore: "low",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:45:00Z"
  },
  {
    id: "P002",
    name: "Shea Butter Hair Care Set",
    category: "Beauty & Personal Care",
    price: "£24.99",
    status: "pending",
    stock: 12,
    sourcing: "outsourced",
    images: [
      "https://picsum.photos/400/300?random=2",
      "https://picsum.photos/400/300?random=102",
      "https://picsum.photos/400/300?random=202"
    ],
    description: "Natural hair care products made with pure shea butter from Ghana. Suitable for all hair types. This premium set includes shampoo, conditioner, and hair mask, all formulated with organic shea butter and natural ingredients.",
    submitted: "2024-01-18",
    rating: 4.9,
    reviews: 89,
    sales: 156,
    revenue: "£3,898.44",
    specifications: {
      weight: "500ml each",
      dimensions: "15cm x 8cm x 6cm",
      material: "Natural Ingredients",
      origin: "Ghana",
      shelfLife: "24 months",
      certifications: ["Organic", "Cruelty-Free", "Vegan"]
    },
    compliance: {
      foodSafety: "complete",
      labeling: "complete",
      ingredients: "complete",
      allergens: "pending"
    },
    riskScore: "low",
    createdAt: "2024-01-16T09:15:00Z",
    updatedAt: "2024-01-18T16:30:00Z"
  },
  {
    id: "P003",
    name: "Traditional Kente Cloth Scarf",
    category: "Fashion & Clothing",
    price: "£89.99",
    status: "approved",
    stock: 8,
    sourcing: "outsourced",
    images: [
      "https://picsum.photos/400/300?random=3",
      "https://picsum.photos/400/300?random=103",
      "https://picsum.photos/400/300?random=203"
    ],
    description: "Handwoven traditional Kente cloth scarf. Each piece is unique and tells a story. Made with authentic Kente fabric from Ghana, this scarf features traditional patterns and colors that represent cultural heritage and craftsmanship.",
    submitted: "2024-01-10",
    rating: 4.7,
    reviews: 67,
    sales: 45,
    revenue: "£4,049.55",
    specifications: {
      weight: "150g",
      dimensions: "180cm x 30cm",
      material: "Cotton Kente Fabric",
      origin: "Ghana",
      shelfLife: "N/A",
      certifications: ["Handcrafted", "Traditional"]
    },
    compliance: {
      foodSafety: "complete",
      labeling: "complete",
      ingredients: "complete",
      allergens: "complete"
    },
    riskScore: "low",
    createdAt: "2024-01-14T11:20:00Z",
    updatedAt: "2024-01-19T13:15:00Z"
  }
];

export function VendorProductManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sourcingFilter, setSourcingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  // Form state for adding/editing products
  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    sourcing: "",
    description: "",
    images: [""],
    specifications: {
      weight: "",
      dimensions: "",
      material: "",
      origin: "",
      shelfLife: "",
      certifications: []
    },
    compliance: {
      foodSafety: "pending",
      labeling: "pending",
      ingredients: "pending",
      allergens: "pending"
    }
  });

  const filteredProducts = vendorProductData.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    const matchesSourcing = sourcingFilter === "all" || product.sourcing === sourcingFilter;
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesCategory && matchesSourcing && matchesStatus;
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved': return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'pending': return { color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'rejected': return { color: 'bg-red-100 text-red-800', icon: AlertTriangle };
      default: return { color: 'bg-gray-100 text-gray-800', icon: Clock };
    }
  };

  const getSourcingInfo = (sourcing: string) => {
    const option = SOURCING_OPTIONS.find(s => s.value === sourcing);
    if (!option) return { label: 'Unknown', icon: Package };
    return { label: option.label, icon: option.icon };
  };

  const handleAddProduct = () => {
    // Validate required fields
    if (!productForm.name || !productForm.category || !productForm.price || !productForm.sourcing) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields including product sourcing.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would make an API call
    toast({
      title: "Product Added",
      description: "Your product has been submitted for approval.",
    });
    
    setIsAddDialogOpen(false);
    setProductForm({
      name: "",
      category: "",
      price: "",
      stock: "",
      sourcing: "",
      description: "",
      images: [""],
      specifications: {
        weight: "",
        dimensions: "",
        material: "",
        origin: "",
        shelfLife: "",
        certifications: []
      },
      compliance: {
        foodSafety: "pending",
        labeling: "pending",
        ingredients: "pending",
        allergens: "pending"
      }
    });
  };

  // File upload simulation
  const simulateFileUpload = async (file: File, index: number): Promise<string> => {
    return new Promise((resolve) => {
      // Simulate upload delay
      setTimeout(() => {
        // Generate a mock URL that would come from your bucket
        const mockUrl = `https://afrigos-bucket.s3.amazonaws.com/products/${Date.now()}_${file.name}`;
        resolve(mockUrl);
      }, 2000);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (JPEG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Set uploading state
    setUploadingFiles(prev => ({ ...prev, [index]: true }));

    try {
      // Simulate file upload to bucket
      const uploadedUrl = await simulateFileUpload(file, index);
      
      // Update the images array with the uploaded URL
      const newImages = [...productForm.images];
      newImages[index] = uploadedUrl;
      setProductForm({ ...productForm, images: newImages });

      toast({
        title: "File Uploaded Successfully",
        description: "Your image has been uploaded and converted to a link.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock.toString(),
      sourcing: product.sourcing,
      description: product.description,
      images: product.images
    });
  };

  const handleUpdateProduct = () => {
    toast({
      title: "Product Updated",
      description: "Product information has been updated successfully.",
    });
    setEditingProduct(null);
    setProductForm({
      name: "",
      category: "",
      price: "",
      stock: "",
      sourcing: "",
      description: "",
      images: [""],
      specifications: {
        weight: "",
        dimensions: "",
        material: "",
        origin: "",
        shelfLife: "",
        certifications: []
      },
      compliance: {
        foodSafety: "pending",
        labeling: "pending",
        ingredients: "pending",
        allergens: "pending"
      }
    });
  };

  const handleDeleteProduct = (productId: string) => {
    toast({
      title: "Product Deleted",
      description: "Product has been removed from your inventory.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Management</h1>
          <p className="text-muted-foreground">Manage your product catalog and inventory</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Create a new product listing. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Product Name *</label>
                  <Input
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <Select value={productForm.category} onValueChange={(value) => setProductForm({...productForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
                             <div className="grid grid-cols-3 gap-4">
                 <div>
                   <label className="text-sm font-medium">Price *</label>
                   <Input
                     value={productForm.price}
                     onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                     placeholder="£0.00"
                   />
                 </div>
                 <div>
                   <label className="text-sm font-medium">Stock Quantity</label>
                   <Input
                     value={productForm.stock}
                     onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                     placeholder="0"
                     type="number"
                   />
                 </div>
                 <div>
                   <label className="text-sm font-medium">Product Sourcing *</label>
                   <Select value={productForm.sourcing} onValueChange={(value) => setProductForm({...productForm, sourcing: value})}>
                     <SelectTrigger>
                       <SelectValue placeholder="Select sourcing" />
                     </SelectTrigger>
                     <SelectContent>
                       {SOURCING_OPTIONS.map((option) => (
                         <SelectItem key={option.value} value={option.value}>
                           <div className="flex items-center space-x-2">
                             <option.icon className="h-4 w-4" />
                             <span>{option.label}</span>
                           </div>
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
               </div>

               <div>
                 <label className="text-sm font-medium">Description</label>
                 <Textarea
                   value={productForm.description}
                   onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                   placeholder="Describe your product..."
                   rows={3}
                 />
               </div>

               {/* Product Images */}
               <div>
                 <label className="text-sm font-medium">Product Images</label>
                 <div className="space-y-4">
                   {productForm.images.map((image, index) => (
                     <div key={index} className="space-y-2">
                       {/* Image Input and Upload */}
                       <div className="flex items-center space-x-2">
                         <div className="flex-1 flex items-center space-x-2">
                           <Input
                             value={image}
                             onChange={(e) => {
                               const newImages = [...productForm.images];
                               newImages[index] = e.target.value;
                               setProductForm({...productForm, images: newImages});
                             }}
                             placeholder="Image URL or upload file"
                             className="flex-1"
                           />
                           
                           {/* File Upload Button */}
                           <div className="relative">
                             <input
                               type="file"
                               accept="image/*"
                               onChange={(e) => handleFileUpload(e, index)}
                               className="hidden"
                               id={`file-upload-${index}`}
                             />
                             <label
                               htmlFor={`file-upload-${index}`}
                               className={`inline-flex items-center px-3 py-2 border border-input rounded-md text-sm font-medium cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors ${
                                 uploadingFiles[index] ? 'opacity-50 cursor-not-allowed' : ''
                               }`}
                             >
                               {uploadingFiles[index] ? (
                                 <>
                                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                   Uploading...
                                 </>
                               ) : (
                                 <>
                                   <Upload className="h-4 w-4 mr-2" />
                                   Upload
                                 </>
                               )}
                             </label>
                           </div>
                         </div>
                         
                         {/* Remove Button */}
                         <Button
                           type="button"
                           variant="outline"
                           size="sm"
                           onClick={() => {
                             const newImages = productForm.images.filter((_, i) => i !== index);
                             setProductForm({...productForm, images: newImages});
                           }}
                         >
                           <X className="h-4 w-4" />
                         </Button>
                       </div>
                       
                       {/* Image Preview */}
                       {image && (
                         <div className="relative">
                           <div className="w-32 h-32 border border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                             {image.startsWith('http') ? (
                               <img 
                                 src={image} 
                                 alt={`Product image ${index + 1}`}
                                 className="w-full h-full object-cover"
                                 onError={(e) => {
                                   e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIGZpbGw9IiNEMUQ1REIiLz4KPHBhdGggZD0iTTI0IDI4SDQwVjQwSDI0VjI4WiIgZmlsbD0iI0M3Q0ZEMiIvPgo8L3N2Zz4K';
                                 }}
                               />
                             ) : (
                               <div className="text-center text-gray-500">
                                 <FileImage className="h-8 w-8 mx-auto mb-2" />
                                 <p className="text-xs">Image Preview</p>
                               </div>
                             )}
                           </div>
                           {image.startsWith('https://afrigos-bucket.s3.amazonaws.com/') && (
                             <div className="absolute top-1 right-1">
                               <CheckCircle2 className="h-4 w-4 text-green-600 bg-white rounded-full" />
                             </div>
                           )}
                         </div>
                       )}
                     </div>
                   ))}
                   
                   {/* Add Image Button */}
                   <Button
                     type="button"
                     variant="outline"
                     size="sm"
                     onClick={() => setProductForm({
                       ...productForm, 
                       images: [...productForm.images, ""]
                     })}
                   >
                     <Plus className="h-4 w-4 mr-2" />
                     Add Image
                   </Button>
                   
                   {/* Upload Info */}
                   <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                     <p className="flex items-center">
                       <FileImage className="h-3 w-3 mr-1" />
                       <strong>File Upload:</strong> Upload images (JPEG, PNG, GIF) up to 5MB. Files will be automatically converted to links.
                     </p>
                   </div>
                 </div>
               </div>

               {/* Product Specifications */}
               <div className="space-y-4">
                 <h4 className="font-medium">Product Specifications</h4>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-sm font-medium">Weight</label>
                     <Input
                       value={productForm.specifications.weight}
                       onChange={(e) => setProductForm({
                         ...productForm, 
                         specifications: {...productForm.specifications, weight: e.target.value}
                       })}
                       placeholder="e.g., 250g"
                     />
                   </div>
                   <div>
                     <label className="text-sm font-medium">Dimensions</label>
                     <Input
                       value={productForm.specifications.dimensions}
                       onChange={(e) => setProductForm({
                         ...productForm, 
                         specifications: {...productForm.specifications, dimensions: e.target.value}
                       })}
                       placeholder="e.g., 12cm x 8cm x 3cm"
                     />
                   </div>
                   <div>
                     <label className="text-sm font-medium">Material</label>
                     <Input
                       value={productForm.specifications.material}
                       onChange={(e) => setProductForm({
                         ...productForm, 
                         specifications: {...productForm.specifications, material: e.target.value}
                       })}
                       placeholder="e.g., Natural Spices"
                     />
                   </div>
                   <div>
                     <label className="text-sm font-medium">Origin</label>
                     <Input
                       value={productForm.specifications.origin}
                       onChange={(e) => setProductForm({
                         ...productForm, 
                         specifications: {...productForm.specifications, origin: e.target.value}
                       })}
                       placeholder="e.g., Nigeria"
                     />
                   </div>
                   <div>
                     <label className="text-sm font-medium">Shelf Life</label>
                     <Input
                       value={productForm.specifications.shelfLife}
                       onChange={(e) => setProductForm({
                         ...productForm, 
                         specifications: {...productForm.specifications, shelfLife: e.target.value}
                       })}
                       placeholder="e.g., 18 months"
                     />
                   </div>
                 </div>
               </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProduct}>
                  Add Product
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourcingFilter} onValueChange={setSourcingFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sourcing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sourcing</SelectItem>
                {SOURCING_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sourcing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Product Sourcing Guide</CardTitle>
          <CardDescription>Understanding the difference between In-House and Outsourced products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SOURCING_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <div key={option.value} className="flex items-start space-x-3 p-4 bg-muted/20 rounded-lg">
                  <Icon className="h-6 w-6 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-medium">{option.label}</h4>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
          <CardDescription>Manage your product catalog and inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
                             <TableHeader>
                 <TableRow>
                   <TableHead>Product</TableHead>
                   <TableHead>Category</TableHead>
                   <TableHead>Sourcing</TableHead>
                   <TableHead>Price</TableHead>
                   <TableHead>Stock</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead>Compliance</TableHead>
                   <TableHead>Performance</TableHead>
                   <TableHead>Actions</TableHead>
                 </TableRow>
               </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const statusInfo = getStatusInfo(product.status);
                  const StatusIcon = statusInfo.icon;
                  const sourcingInfo = getSourcingInfo(product.sourcing);
                  const SourcingIcon = sourcingInfo.icon;
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <Image className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <SourcingIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{sourcingInfo.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.price}</TableCell>
                      <TableCell>
                        <span className={product.stock < 10 ? 'text-red-600 font-medium' : ''}>
                          {product.stock}
                        </span>
                      </TableCell>
                                             <TableCell>
                         <Badge className={statusInfo.color}>
                           <StatusIcon className="h-3 w-3 mr-1" />
                           {product.status}
                         </Badge>
                       </TableCell>
                       <TableCell>
                         <div className="space-y-1">
                           {product.compliance && (
                             <>
                               <div className="flex items-center space-x-1">
                                 <div className={`w-2 h-2 rounded-full ${
                                   product.compliance.foodSafety === 'complete' ? 'bg-green-500' : 'bg-yellow-500'
                                 }`} />
                                 <span className="text-xs">Food Safety</span>
                               </div>
                               <div className="flex items-center space-x-1">
                                 <div className={`w-2 h-2 rounded-full ${
                                   product.compliance.labeling === 'complete' ? 'bg-green-500' : 'bg-yellow-500'
                                 }`} />
                                 <span className="text-xs">Labeling</span>
                               </div>
                             </>
                           )}
                         </div>
                       </TableCell>
                       <TableCell>
                         <div className="space-y-1">
                           <div className="flex items-center space-x-1">
                             <Star className="h-3 w-3 fill-current text-yellow-400" />
                             <span className="text-sm">{product.rating}</span>
                             <span className="text-xs text-muted-foreground">({product.reviews})</span>
                           </div>
                           <div className="text-xs text-muted-foreground">
                             {product.sales} sales • {product.revenue}
                           </div>
                         </div>
                       </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Update your product information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Product Name</label>
                  <Input
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={productForm.category} onValueChange={(value) => setProductForm({...productForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Price</label>
                  <Input
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Stock</label>
                  <Input
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                    type="number"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Sourcing</label>
                  <Select value={productForm.sourcing} onValueChange={(value) => setProductForm({...productForm, sourcing: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCING_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingProduct(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateProduct}>
                  Update Product
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
