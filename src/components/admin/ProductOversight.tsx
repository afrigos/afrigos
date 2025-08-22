import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle
} from "lucide-react";

const productData = [
  {
    id: "P001",
    name: "Authentic Jollof Rice Spice Mix",
    vendor: "Mama Asha's Kitchen",
    category: "Food",
    price: "£12.99",
    status: "approved",
    stock: 45,
    images: 3,
    description: "Premium West African spice blend...",
    submitted: "2024-01-15"
  },
  {
    id: "P002",
    name: "Shea Butter Hair Care Set",
    vendor: "Adunni Beauty",
    category: "Beauty",
    price: "£24.99",
    status: "pending",
    stock: 12,
    images: 5,
    description: "Natural hair care products...",
    submitted: "2024-01-16"
  },
  {
    id: "P003",
    name: "Traditional Kente Cloth Scarf",
    vendor: "Kente Collections",
    category: "Clothing",
    price: "£89.99",
    status: "rejected",
    stock: 0,
    images: 2,
    description: "Handwoven traditional patterns...",
    submitted: "2024-01-14"
  },
  {
    id: "P004",
    name: "Moringa Leaf Powder",
    vendor: "Afro Herbs Ltd",
    category: "Herbal",
    price: "£18.50",
    status: "review",
    stock: 28,
    images: 4,
    description: "Organic superfood supplement...",
    submitted: "2024-01-17"
  }
];

export function ProductOversight() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Oversight</h1>
          <p className="text-muted-foreground">Review and manage product listings</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">Bulk Actions</Button>
          <Button size="sm" className="bg-gradient-to-r from-primary to-dashboard-accent">
            Review Queue
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
                placeholder="Search products by name, vendor, or category..."
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Category
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Status
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Status Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-card">
          <TabsTrigger value="all">All ({productData.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending (1)</TabsTrigger>
          <TabsTrigger value="approved">Approved (1)</TabsTrigger>
          <TabsTrigger value="review">Review (1)</TabsTrigger>
          <TabsTrigger value="rejected">Rejected (1)</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-4">
            {productData.map((product) => (
              <Card key={product.id} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4">
                      <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">{product.images} imgs</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-foreground">{product.name}</h3>
                          {getStatusBadge(product.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Vendor:</span>
                            <p>{product.vendor}</p>
                          </div>
                          <div>
                            <span className="font-medium">Category:</span>
                            <p>{product.category}</p>
                          </div>
                          <div>
                            <span className="font-medium">Price:</span>
                            <p className="font-mono text-foreground">{product.price}</p>
                          </div>
                          <div>
                            <span className="font-medium">Stock:</span>
                            <p className={product.stock > 10 ? "text-success" : "text-warning"}>
                              {product.stock} units
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <CheckCircle className="h-4 w-4 text-success" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span>Pending Review</span>
              </CardTitle>
              <CardDescription>Products awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">1 Product Pending Review</h3>
                <p className="text-muted-foreground mb-4">
                  Review pending products to maintain marketplace quality
                </p>
                <Button className="bg-gradient-to-r from-primary to-dashboard-accent">
                  Start Review Process
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}