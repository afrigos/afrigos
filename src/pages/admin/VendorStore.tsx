import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  ArrowLeft,
  Package,
  Star,
  Download,
  BarChart3,
  DollarSign,
  TrendingUp,
  Eye,
  Store
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/ui/pagination";

// Mock vendor data
const vendorData = [
  {
    id: "V001",
    name: "Mama Asha's Kitchen",
    email: "contact@mamaashas.co.uk",
    phone: "+44 20 7123 4567",
    location: "London, UK",
    category: "Food & Beverages",
    status: "approved",
    joinDate: "2024-01-15",
    revenue: "£12,450",
    products: 24,
    rating: 4.8,
    documents: "Complete",
    storeStats: {
      totalSales: 12450,
      totalOrders: 342,
      averageOrderValue: 36.40,
      conversionRate: 3.2,
      returnRate: 1.8,
      customerSatisfaction: 4.8,
      responseTime: "2.3 hours",
      fulfillmentRate: 98.5,
      activeProducts: 24,
      totalProducts: 28,
      monthlyGrowth: 12.5,
      topSellingProduct: "Jollof Rice Spice Mix",
      customerReviews: 156,
      repeatCustomers: 67,
      socialMediaFollowers: 1240,
      websiteVisits: 8900,
      averageRating: 4.8,
      onTimeDelivery: 96.2,
      customerSupportScore: 4.7
    }
  },
  {
    id: "V002", 
    name: "Adunni Beauty",
    email: "hello@adunnibeauty.com",
    phone: "+44 161 456 7890",
    location: "Manchester, UK",
    category: "Beauty & Personal Care",
    status: "approved",
    joinDate: "2024-01-10",
    revenue: "£8,920",
    products: 18,
    rating: 4.9,
    documents: "Complete",
    storeStats: {
      totalSales: 8920,
      totalOrders: 234,
      averageOrderValue: 38.12,
      conversionRate: 4.1,
      returnRate: 2.1,
      customerSatisfaction: 4.9,
      responseTime: "1.8 hours",
      fulfillmentRate: 99.2,
      activeProducts: 18,
      totalProducts: 22,
      monthlyGrowth: 18.7,
      topSellingProduct: "Natural Hair Growth Oil",
      customerReviews: 203,
      repeatCustomers: 89,
      socialMediaFollowers: 2100,
      websiteVisits: 12300,
      averageRating: 4.9,
      onTimeDelivery: 97.8,
      customerSupportScore: 4.8
    }
  },
  {
    id: "V003",
    name: "Kente Collections",
    email: "info@kentecollections.uk",
    phone: "+44 121 789 0123",
    location: "Birmingham, UK", 
    category: "Fashion & Clothing",
    status: "suspended",
    joinDate: "2024-01-08",
    revenue: "£15,680",
    products: 45,
    rating: 4.6,
    documents: "Incomplete",
    storeStats: {
      totalSales: 15680,
      totalOrders: 523,
      averageOrderValue: 29.98,
      conversionRate: 2.8,
      returnRate: 3.5,
      customerSatisfaction: 4.6,
      responseTime: "3.1 hours",
      fulfillmentRate: 97.1,
      activeProducts: 45,
      totalProducts: 52,
      monthlyGrowth: 8.3,
      topSellingProduct: "Traditional Kente Dress",
      customerReviews: 312,
      repeatCustomers: 145,
      socialMediaFollowers: 3400,
      websiteVisits: 15600,
      averageRating: 4.6,
      onTimeDelivery: 95.5,
      customerSupportScore: 4.4
    }
  }
];

// Generate mock products
const generateProducts = (vendorId: string, vendorName: string) => {
  const products = [];
  const categories = [
    "Spices & Seasonings", "Ready-to-Eat Meals", "Beverages", "Hair Care", 
    "Skin Care", "Body Care", "Traditional Dresses", "Modern African Fashion", 
    "Accessories", "Herbal Teas", "Supplements", "Essential Oils", 
    "Spice Blends", "Individual Spices", "Seasoning Mixes", "Shea Butter Products",
    "Beaded Jewelry", "Handmade Crafts", "Traditional Accessories", "Modern Jewelry",
    "Moringa Products", "Health Supplements", "Wellness Products", "Coffee Beans",
    "Ground Coffee", "Coffee Accessories", "Red Wines", "White Wines", "Sparkling Wines"
  ];

  for (let i = 1; i <= 150; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const price = Math.floor(Math.random() * 50) + 5;
    const stock = Math.floor(Math.random() * 100) + 1;
    const sales = Math.floor(Math.random() * 500) + 10;
    const reviews = Math.floor(Math.random() * 200) + 5;
    const rating = [4.2, 4.5, 4.7, 4.8, 4.9][Math.floor(Math.random() * 5)];

    products.push({
      id: `P${vendorId.slice(1)}${i.toString().padStart(3, '0')}`,
      name: `${category.split(' ')[0]} ${vendorName.split(' ')[0]} Product ${i}`,
      description: `High-quality ${category.toLowerCase()} product from ${vendorName}. This premium item offers exceptional value and authentic taste/quality that customers love. Perfect for daily use and special occasions.`,
      category,
      price: price.toFixed(2),
      stock,
      status: ["active", "pending", "out_of_stock"][Math.floor(Math.random() * 3)],
      rating,
      sales,
      reviews,
      images: [
        `https://picsum.photos/400/300?random=${i}`,
        `https://picsum.photos/400/300?random=${i + 100}`,
        `https://picsum.photos/400/300?random=${i + 200}`,
      ],
      specifications: {
        weight: `${Math.floor(Math.random() * 500) + 50}g`,
        dimensions: `${Math.floor(Math.random() * 20) + 5}cm x ${Math.floor(Math.random() * 15) + 3}cm x ${Math.floor(Math.random() * 10) + 2}cm`,
        material: ["Natural", "Organic", "Premium", "Handcrafted"][Math.floor(Math.random() * 4)],
        origin: ["Nigeria", "Ghana", "Kenya", "South Africa", "Ethiopia"][Math.floor(Math.random() * 5)],
        shelfLife: `${Math.floor(Math.random() * 24) + 6} months`,
        certifications: ["Organic", "Fair Trade", "Halal", "Kosher"].slice(0, Math.floor(Math.random() * 3) + 1)
      },
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      vendorId,
      vendorName
    });
  }
  return products;
};

export function VendorStore() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (vendorId) {
      const foundVendor = vendorData.find(v => v.id === vendorId);
      if (foundVendor) {
        setVendor(foundVendor);
        const vendorProducts = generateProducts(vendorId, foundVendor.name);
        setProducts(vendorProducts);
        setFilteredProducts(vendorProducts);
      } else {
        toast({
          title: "Vendor Not Found",
          description: "The requested vendor could not be found.",
          variant: "destructive",
        });
        navigate("/admin/vendors");
      }
    }
  }, [vendorId, navigate, toast]);

  useEffect(() => {
    let filtered = products;
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      case "out_of_stock":
        return <Badge className="bg-destructive text-destructive-foreground">Out of Stock</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleViewProduct = (product: any) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleExportProducts = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Export Successful",
        description: `Product catalog for ${vendor?.name} has been exported successfully.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export product catalog. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!vendor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading vendor store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/vendors")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Vendors</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Store className="h-6 w-6 text-blue-600" />
              {vendor.name} - Store
            </h1>
            <p className="text-muted-foreground">
              {products.length} products • {vendor.category} • {vendor.location}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportProducts}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export Catalog"}
          </Button>
        </div>
      </div>

      {/* Store Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold text-foreground">
                  {products.length.toLocaleString()}
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold text-foreground">
                  £{vendor.storeStats.totalSales.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer Rating</p>
                <p className="text-2xl font-bold text-foreground flex items-center">
                  {vendor.storeStats.averageRating}
                  <Star className="h-4 w-4 text-yellow-500 ml-1 fill-current" />
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                <p className="text-2xl font-bold text-foreground">
                  {products.filter(p => p.status === 'active').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>
            Showing {currentProducts.length} of {filteredProducts.length} products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-medium text-foreground">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="font-mono">£{product.price}</TableCell>
                  <TableCell className="text-center">{product.stock}</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="text-sm">★ {product.rating}</span>
                      <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{product.sales}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewProduct(product)}
                      title="View Product Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">{selectedProduct.name}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProductModal(false)}
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Images */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedProduct.images.map((image: string, index: number) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${selectedProduct.name} - Image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>

              {/* Product Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Product Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Product ID:</span>
                        <span className="font-mono">{selectedProduct.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <Badge variant="outline">{selectedProduct.category}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-semibold">£{selectedProduct.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stock:</span>
                        <span className="font-semibold">{selectedProduct.stock} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        {getStatusBadge(selectedProduct.status)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rating:</span>
                        <div className="flex items-center">
                          <span className="font-semibold">★ {selectedProduct.rating}</span>
                          <span className="text-sm text-muted-foreground ml-1">({selectedProduct.reviews} reviews)</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Sales:</span>
                        <span className="font-semibold">{selectedProduct.sales} units</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{selectedProduct.description}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Specifications</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Weight:</span>
                        <span>{selectedProduct.specifications.weight}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dimensions:</span>
                        <span>{selectedProduct.specifications.dimensions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Material:</span>
                        <span>{selectedProduct.specifications.material}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Origin:</span>
                        <span>{selectedProduct.specifications.origin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shelf Life:</span>
                        <span>{selectedProduct.specifications.shelfLife}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Certifications:</span>
                        <div className="flex gap-1">
                          {selectedProduct.specifications.certifications.map((cert: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Timeline</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(selectedProduct.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span>{new Date(selectedProduct.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Vendor Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vendor:</span>
                        <span>{selectedProduct.vendorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vendor ID:</span>
                        <span className="font-mono">{selectedProduct.vendorId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowProductModal(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    toast({
                      title: "Product Details Exported",
                      description: `Details for ${selectedProduct.name} have been exported.`,
                    });
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
