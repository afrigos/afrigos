import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DollarSign, 
  Percent, 
  Settings, 
  Plus, 
  Edit, 
  Trash2,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Package,
  Tag,
  Calculator,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Commission structure interfaces
export interface CommissionStructure {
  defaultRate: number;
  categoryRates: { [category: string]: number };
  productOverrides: { [productId: string]: number };
  minimumPayout: number;
  payoutFrequency: 'weekly' | 'monthly' | 'quarterly';
  transactionFee: number;
  serviceFee: number;
}

export interface CategoryCommission {
  category: string;
  rate: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCommission {
  productId: string;
  productName: string;
  vendorName: string;
  category: string;
  defaultRate: number;
  overrideRate: number;
  isOverride: boolean;
  effectiveRate: number;
  lastUpdated: string;
}

// Mock data for commission management
const commissionData: CommissionStructure = {
  defaultRate: 15,
  categoryRates: {
    "Food & Beverages": 12,
    "Beauty & Personal Care": 18,
    "Fashion & Clothing": 20,
    "Health & Wellness": 14,
    "Electronics & Technology": 25,
    "Home & Garden": 16,
    "Books & Education": 10,
    "Sports & Fitness": 15,
    "Jewelry & Accessories": 22,
    "Toys & Games": 12
  },
  productOverrides: {
    "P001": 8,  // Jollof Rice Spice Mix - special rate
    "P015": 30, // Premium Electronics - higher rate
    "P023": 5   // Educational Books - promotional rate
  },
  minimumPayout: 50,
  payoutFrequency: 'monthly',
  transactionFee: 2.5,
  serviceFee: 1.0
};

const categoryCommissions: CategoryCommission[] = [
  {
    category: "Food & Beverages",
    rate: 12,
    description: "Lower rate for food products to encourage vendors",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    category: "Beauty & Personal Care",
    rate: 18,
    description: "Standard rate for beauty and personal care products",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-10T14:20:00Z"
  },
  {
    category: "Fashion & Clothing",
    rate: 20,
    description: "Higher rate for fashion items due to higher margins",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-12T09:15:00Z"
  },
  {
    category: "Electronics & Technology",
    rate: 25,
    description: "Premium rate for electronics due to high value",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-08T16:45:00Z"
  }
];

const productCommissions: ProductCommission[] = [
  {
    productId: "P001",
    productName: "Jollof Rice Spice Mix",
    vendorName: "Mama Asha's Kitchen",
    category: "Food & Beverages",
    defaultRate: 12,
    overrideRate: 8,
    isOverride: true,
    effectiveRate: 8,
    lastUpdated: "2024-01-20T14:30:00Z"
  },
  {
    productId: "P002",
    productName: "Shea Butter Hair Care Set",
    vendorName: "Adunni Beauty",
    category: "Beauty & Personal Care",
    defaultRate: 18,
    overrideRate: 18,
    isOverride: false,
    effectiveRate: 18,
    lastUpdated: "2024-01-18T11:20:00Z"
  },
  {
    productId: "P015",
    productName: "Premium Wireless Headphones",
    vendorName: "Tech Africa",
    category: "Electronics & Technology",
    defaultRate: 25,
    overrideRate: 30,
    isOverride: true,
    effectiveRate: 30,
    lastUpdated: "2024-01-15T09:45:00Z"
  },
  {
    productId: "P023",
    productName: "African History Textbook",
    vendorName: "Educational Books Ltd",
    category: "Books & Education",
    defaultRate: 10,
    overrideRate: 5,
    isOverride: true,
    effectiveRate: 5,
    lastUpdated: "2024-01-12T13:15:00Z"
  }
];

export function CommissionManagement() {
  const [commissionStructure, setCommissionStructure] = useState<CommissionStructure>(commissionData);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryCommission | null>(null);
  const [isProductOverrideDialogOpen, setIsProductOverrideDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductCommission | null>(null);
  const { toast } = useToast();

  // Form states
  const [defaultRate, setDefaultRate] = useState(commissionStructure.defaultRate);
  const [minimumPayout, setMinimumPayout] = useState(commissionStructure.minimumPayout);
  const [transactionFee, setTransactionFee] = useState(commissionStructure.transactionFee);
  const [serviceFee, setServiceFee] = useState(commissionStructure.serviceFee);
  const [payoutFrequency, setPayoutFrequency] = useState(commissionStructure.payoutFrequency);

  const handleSaveDefaultSettings = () => {
    const updatedStructure = {
      ...commissionStructure,
      defaultRate,
      minimumPayout,
      transactionFee,
      serviceFee,
      payoutFrequency
    };
    
    setCommissionStructure(updatedStructure);
    toast({
      title: "Settings Saved",
      description: "Default commission settings have been updated successfully.",
    });
  };

  const handleSaveCategoryRate = (category: string, rate: number) => {
    const updatedStructure = {
      ...commissionStructure,
      categoryRates: {
        ...commissionStructure.categoryRates,
        [category]: rate
      }
    };
    
    setCommissionStructure(updatedStructure);
    setIsEditDialogOpen(false);
    setEditingCategory(null);
    
    toast({
      title: "Category Rate Updated",
      description: `${category} commission rate has been updated to ${rate}%.`,
    });
  };

  const handleSaveProductOverride = (productId: string, rate: number) => {
    const updatedStructure = {
      ...commissionStructure,
      productOverrides: {
        ...commissionStructure.productOverrides,
        [productId]: rate
      }
    };
    
    setCommissionStructure(updatedStructure);
    setIsProductOverrideDialogOpen(false);
    setSelectedProduct(null);
    
    toast({
      title: "Product Override Saved",
      description: `Commission rate for ${selectedProduct?.productName} has been set to ${rate}%.`,
    });
  };

  const handleRemoveProductOverride = (productId: string) => {
    const { [productId]: removed, ...remainingOverrides } = commissionStructure.productOverrides;
    
    const updatedStructure = {
      ...commissionStructure,
      productOverrides: remainingOverrides
    };
    
    setCommissionStructure(updatedStructure);
    
    toast({
      title: "Override Removed",
      description: "Product will now use the default category rate.",
    });
  };

  const calculateEffectiveRate = (product: ProductCommission): number => {
    // Check for product override first
    if (product.isOverride) {
      return product.overrideRate;
    }
    
    // Check for category rate
    const categoryRate = commissionStructure.categoryRates[product.category];
    if (categoryRate !== undefined) {
      return categoryRate;
    }
    
    // Fall back to default rate
    return commissionStructure.defaultRate;
  };

  const getRateColor = (rate: number): string => {
    if (rate <= 10) return "text-green-600";
    if (rate <= 15) return "text-blue-600";
    if (rate <= 20) return "text-orange-600";
    return "text-red-600";
  };

  const getRateBadge = (rate: number) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    if (rate <= 10) variant = "outline";
    else if (rate <= 15) variant = "default";
    else if (rate <= 20) variant = "secondary";
    else variant = "destructive";

    return (
      <Badge variant={variant} className={getRateColor(rate)}>
        {rate}%
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Commission Management</h1>
          <p className="text-muted-foreground">Configure flexible commission rates and payout settings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Commission Report
          </Button>
          <Button size="sm">
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Payouts
          </Button>
        </div>
      </div>

      {/* Commission Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Default Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commissionStructure.defaultRate}%</div>
            <p className="text-xs text-muted-foreground">Base commission rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Category Rates</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(commissionStructure.categoryRates).length}</div>
            <p className="text-xs text-muted-foreground">Custom category rates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Overrides</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(commissionStructure.productOverrides).length}</div>
            <p className="text-xs text-muted-foreground">Individual product rates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Min Payout</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{commissionStructure.minimumPayout}</div>
            <p className="text-xs text-muted-foreground">Minimum payout threshold</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="default" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="default">Default Settings</TabsTrigger>
          <TabsTrigger value="categories">Category Rates</TabsTrigger>
          <TabsTrigger value="products">Product Overrides</TabsTrigger>
          <TabsTrigger value="payouts">Payout Settings</TabsTrigger>
        </TabsList>

        {/* Default Settings Tab */}
        <TabsContent value="default" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Commission Settings</CardTitle>
              <CardDescription>Configure base commission rates and fees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultRate">Default Commission Rate (%)</Label>
                  <Input
                    id="defaultRate"
                    type="number"
                    value={defaultRate}
                    onChange={(e) => setDefaultRate(Number(e.target.value))}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="minimumPayout">Minimum Payout (£)</Label>
                  <Input
                    id="minimumPayout"
                    type="number"
                    value={minimumPayout}
                    onChange={(e) => setMinimumPayout(Number(e.target.value))}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="transactionFee">Transaction Fee (%)</Label>
                  <Input
                    id="transactionFee"
                    type="number"
                    value={transactionFee}
                    onChange={(e) => setTransactionFee(Number(e.target.value))}
                    min="0"
                    max="10"
                    step="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="serviceFee">Service Fee (%)</Label>
                  <Input
                    id="serviceFee"
                    type="number"
                    value={serviceFee}
                    onChange={(e) => setServiceFee(Number(e.target.value))}
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="payoutFrequency">Payout Frequency</Label>
                <Select value={payoutFrequency} onValueChange={(value: 'weekly' | 'monthly' | 'quarterly') => setPayoutFrequency(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveDefaultSettings}>
                <Save className="h-4 w-4 mr-2" />
                Save Default Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Category Rates Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Commission Rates</CardTitle>
              <CardDescription>Set custom commission rates for different product categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Current Rate</TableHead>
                      <TableHead>Default Rate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryCommissions.map((category) => (
                      <TableRow key={category.category}>
                        <TableCell className="font-medium">{category.category}</TableCell>
                        <TableCell>
                          {getRateBadge(category.rate)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{commissionStructure.defaultRate}%</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={category.isActive ? "default" : "secondary"}>
                            {category.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(category.updatedAt).toLocaleDateString('en-GB')}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCategory(category);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Overrides Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Commission Overrides</CardTitle>
              <CardDescription>Set individual commission rates for specific products</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Category Rate</TableHead>
                      <TableHead>Override Rate</TableHead>
                      <TableHead>Effective Rate</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productCommissions.map((product) => (
                      <TableRow key={product.productId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.productName}</div>
                            <div className="text-sm text-muted-foreground">ID: {product.productId}</div>
                          </div>
                        </TableCell>
                        <TableCell>{product.vendorName}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          {getRateBadge(product.defaultRate)}
                        </TableCell>
                        <TableCell>
                          {product.isOverride ? (
                            <Badge variant="destructive">{product.overrideRate}%</Badge>
                          ) : (
                            <span className="text-muted-foreground">No override</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {getRateBadge(calculateEffectiveRate(product))}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsProductOverrideDialogOpen(true);
                              }}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              {product.isOverride ? "Edit" : "Set Override"}
                            </Button>
                            {product.isOverride && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveProductOverride(product.productId)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payout Settings Tab */}
        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout Configuration</CardTitle>
              <CardDescription>Configure payout thresholds and frequency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Current Payout Frequency</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="default">{commissionStructure.payoutFrequency}</Badge>
                    <span className="text-sm text-muted-foreground">payouts</span>
                  </div>
                </div>
                <div>
                  <Label>Minimum Payout Threshold</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">£{commissionStructure.minimumPayout}</span>
                  </div>
                </div>
                <div>
                  <Label>Transaction Fee</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Percent className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">{commissionStructure.transactionFee}%</span>
                  </div>
                </div>
                <div>
                  <Label>Service Fee</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Percent className="h-4 w-4 text-red-600" />
                    <span className="font-medium">{commissionStructure.serviceFee}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Category Rate Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category Commission Rate</DialogTitle>
            <DialogDescription>
              Update the commission rate for {editingCategory?.category}
            </DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="categoryRate">Commission Rate (%)</Label>
                <Input
                  id="categoryRate"
                  type="number"
                  defaultValue={editingCategory.rate}
                  min="0"
                  max="100"
                  step="0.1"
                  onChange={(e) => {
                    const newRate = Number(e.target.value);
                    setEditingCategory({ ...editingCategory, rate: newRate });
                  }}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleSaveCategoryRate(editingCategory.category, editingCategory.rate)}>
                  Save Rate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Override Dialog */}
      <Dialog open={isProductOverrideDialogOpen} onOpenChange={setIsProductOverrideDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Product Commission Override</DialogTitle>
            <DialogDescription>
              Set a custom commission rate for {selectedProduct?.productName}
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category Rate</Label>
                  <div className="text-sm text-muted-foreground">{selectedProduct.defaultRate}%</div>
                </div>
                <div>
                  <Label>Current Override</Label>
                  <div className="text-sm text-muted-foreground">
                    {selectedProduct.isOverride ? `${selectedProduct.overrideRate}%` : "None"}
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="overrideRate">Override Rate (%)</Label>
                <Input
                  id="overrideRate"
                  type="number"
                  defaultValue={selectedProduct.overrideRate}
                  min="0"
                  max="100"
                  step="0.1"
                  onChange={(e) => {
                    const newRate = Number(e.target.value);
                    setSelectedProduct({ ...selectedProduct, overrideRate: newRate });
                  }}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsProductOverrideDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleSaveProductOverride(selectedProduct.productId, selectedProduct.overrideRate)}>
                  Save Override
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

