import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Layers, Loader2, Package, Percent, RefreshCw } from "lucide-react";

const DEFAULT_COMMISSION_PERCENT = 10;

type Category = {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  commissionRate: number | null;
  vendorCount: number;
  productCount: number;
};

type Product = {
  id: string;
  name: string;
  commissionRate: number | null;
  totalRevenue?: number;
  vendor: {
    businessName: string;
  };
  category: {
    name: string;
    commissionRate: number | null;
  } | null;
};

const formatPercent = (value: number) =>
  `${(Math.round(value * 100) / 100).toFixed(Number.isInteger(value) ? 0 : 2)}%`;

const formatRateLabel = (value: number | null | undefined) =>
  value === null || value === undefined ? `Default (${formatPercent(DEFAULT_COMMISSION_PERCENT)})` : formatPercent(value);

const fetchCategories = async (): Promise<Category[]> => {
  const response = await apiFetch<{ success: boolean; data: Category[] }>("/categories?limit=100");
  if (!response.success || !response.data) throw new Error("Failed to fetch categories");
  return response.data.map((category) => ({
    ...category,
    commissionRate:
      category.commissionRate === null || category.commissionRate === undefined
        ? null
        : Number(category.commissionRate),
  }));
};

const fetchProducts = async (): Promise<Product[]> => {
  const response = await apiFetch<{ success: boolean; data: { products: Product[] } }>(
    "/admin/products?limit=100&status=APPROVED"
  );
  if (!response.success || !response.data) throw new Error("Failed to fetch products");
  return response.data.products.map((product) => ({
    ...product,
    commissionRate:
      product.commissionRate === null || product.commissionRate === undefined
        ? null
        : Number(product.commissionRate),
    category: product.category
      ? {
          ...product.category,
          commissionRate:
            product.category.commissionRate === null || product.category.commissionRate === undefined
              ? null
              : Number(product.category.commissionRate),
        }
      : null,
  }));
};

export function CommissionManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [categoryDialog, setCategoryDialog] = useState<{ open: boolean; category: Category | null }>({
    open: false,
    category: null,
  });
  const [categoryRateInput, setCategoryRateInput] = useState("");

  const [productDialog, setProductDialog] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  });
  const [productRateInput, setProductRateInput] = useState("");

  const {
    data: categories = [],
    isLoading: loadingCategories,
    isFetching: fetchingCategories,
    isError: categoriesError,
    error: categoriesErrorValue,
  } = useQuery<Category[], Error>({
    queryKey: ["commission-categories"],
    queryFn: fetchCategories,
    refetchInterval: 30000,
  });

  const {
    data: products = [],
    isLoading: loadingProducts,
    isFetching: fetchingProducts,
    isError: productsError,
    error: productsErrorValue,
  } = useQuery<Product[], Error>({
    queryKey: ["commission-products"],
    queryFn: fetchProducts,
    refetchInterval: 30000,
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, commissionRate }: { id: string; commissionRate: number | null }) =>
      apiFetch<{ success: boolean; message?: string }>(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify({ commissionRate }),
      }),
    onSuccess: (response) => {
      toast({
        title: "Category updated",
        description: response.message ?? "Commission rate saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["commission-categories"] });
      queryClient.invalidateQueries({ queryKey: ["commission-products"] });
      closeCategoryDialog();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update category",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, commissionRate }: { id: string; commissionRate: number | null }) =>
      apiFetch<{ success: boolean; message?: string }>(`/admin/products/${id}/commission`, {
        method: "PUT",
        body: JSON.stringify({ commissionRate }),
      }),
    onSuccess: (response) => {
      toast({
        title: "Product updated",
        description: response.message ?? "Product commission override saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["commission-products"] });
      closeProductDialog();
    },
    onError: (error: Error) => {
    toast({
        title: "Failed to update product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const categoriesWithOverrides = useMemo(
    () => categories.filter((category) => category.commissionRate !== null && category.commissionRate !== undefined),
    [categories]
  );

  const productsWithOverrides = useMemo(
    () => products.filter((product) => product.commissionRate !== null && product.commissionRate !== undefined),
    [products]
  );

  const totalCommissionableRevenue = useMemo(
    () => products.reduce((sum, product) => sum + (product.totalRevenue ?? 0), 0),
    [products]
  );

  const isRefreshing = fetchingCategories || fetchingProducts;

  const openCategoryDialog = (category: Category) => {
    setCategoryDialog({ open: true, category });
    setCategoryRateInput(
      category.commissionRate === null || category.commissionRate === undefined
        ? ""
        : category.commissionRate.toString()
    );
  };

  const closeCategoryDialog = () => {
    setCategoryDialog({ open: false, category: null });
    setCategoryRateInput("");
  };

  const openProductDialog = (product: Product) => {
    setProductDialog({ open: true, product });
    setProductRateInput(
      product.commissionRate === null || product.commissionRate === undefined
        ? ""
        : product.commissionRate.toString()
    );
  };

  const closeProductDialog = () => {
    setProductDialog({ open: false, product: null });
    setProductRateInput("");
  };

  const parseRateInput = (value: string) => {
    if (!value.trim()) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? NaN : parsed;
  };

  const handleSaveCategoryRate = () => {
    if (!categoryDialog.category) return;
    const parsed = parseRateInput(categoryRateInput);
    if (Number.isNaN(parsed) || (parsed !== null && (parsed < 0 || parsed > 100))) {
      toast({
        title: "Invalid rate",
        description: "Enter a commission between 0 and 100.",
        variant: "destructive",
      });
      return;
    }
    updateCategoryMutation.mutate({ id: categoryDialog.category.id, commissionRate: parsed });
  };

  const handleSaveProductRate = () => {
    if (!productDialog.product) return;
    const parsed = parseRateInput(productRateInput);
    if (Number.isNaN(parsed) || (parsed !== null && (parsed < 0 || parsed > 100))) {
      toast({
        title: "Invalid rate",
        description: "Enter a commission between 0 and 100.",
        variant: "destructive",
      });
      return;
    }
    updateProductMutation.mutate({ id: productDialog.product.id, commissionRate: parsed });
  };

  const handleResetProductOverride = () => {
    if (!productDialog.product) return;
    updateProductMutation.mutate({ id: productDialog.product.id, commissionRate: null });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["commission-categories"] });
    queryClient.invalidateQueries({ queryKey: ["commission-products"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Commission Management</h1>
          <p className="text-muted-foreground">
            Configure category commission defaults and fine-tune product overrides.
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
          </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-0 shadow-sm bg-card/70 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Default Commission</CardTitle>
            <Percent className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatPercent(DEFAULT_COMMISSION_PERCENT)}
            </div>
            <p className="text-xs text-muted-foreground">
              Applied when no category or product override exists.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/70 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Category Overrides</CardTitle>
            <Layers className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{categoriesWithOverrides.length}</div>
            <p className="text-xs text-muted-foreground">
              Categories with custom commission rates configured.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/70 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Product Overrides</CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{productsWithOverrides.length}</div>
            <p className="text-xs text-muted-foreground">
              Products overriding their category or default commission.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card/70 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Managed</CardTitle>
            <Percent className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {new Intl.NumberFormat("en-GB", {
                style: "currency",
                currency: "GBP",
              }).format(totalCommissionableRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">Total revenue from approved products.</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="products">Product Overrides</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Category Commission Rates</CardTitle>
              <CardDescription>
                Set baseline commission rates per category. Product overrides take precedence.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCategories ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full rounded-md" />
                  ))}
                </div>
              ) : categoriesError ? (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                  {categoriesErrorValue?.message ?? "Unable to load categories."}
                </div>
              ) : categories.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">No categories available.</div>
              ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[200px]">Category</TableHead>
                      <TableHead>Status</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>Vendors</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                        <TableCell>
                            <div className="font-medium text-foreground">{category.name}</div>
                            {category.description && (
                              <div className="text-xs text-muted-foreground">{category.description}</div>
                            )}
                        </TableCell>
                        <TableCell>
                            <Badge
                              variant={category.status === "active" ? "outline" : "destructive"}
                              className="capitalize"
                            >
                              {category.status}
                          </Badge>
                        </TableCell>
                          <TableCell>{category.productCount}</TableCell>
                          <TableCell>{category.vendorCount}</TableCell>
                          <TableCell>{formatRateLabel(category.commissionRate)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => openCategoryDialog(category)}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Product Commission Overrides</CardTitle>
              <CardDescription>
                Override category defaults for specific products. Leave blank to inherit default rates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingProducts ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full rounded-md" />
                  ))}
                </div>
              ) : productsError ? (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                  {productsErrorValue?.message ?? "Unable to load products."}
                </div>
              ) : products.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground">No approved products yet.</div>
              ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[220px]">Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Category Rate</TableHead>
                        <TableHead>Override</TableHead>
                        <TableHead>Effective</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                        <TableCell>
                            <div className="font-medium text-foreground">{product.name}</div>
                            <div className="text-xs text-muted-foreground">{product.vendor.businessName}</div>
                        </TableCell>
                          <TableCell>{product.category?.name ?? "Unassigned"}</TableCell>
                          <TableCell>{formatRateLabel(product.category?.commissionRate)}</TableCell>
                          <TableCell>{formatRateLabel(product.commissionRate)}</TableCell>
                        <TableCell>
                            {formatPercent(
                              product.commissionRate ??
                                product.category?.commissionRate ??
                                DEFAULT_COMMISSION_PERCENT
                          )}
                        </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => openProductDialog(product)}>
                              Edit
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={categoryDialog.open}
        onOpenChange={(open) => {
          if (!open) closeCategoryDialog();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Category Commission</DialogTitle>
            <DialogDescription>
              Set the default commission rate for this category. Leave blank to fall back to the platform default.
            </DialogDescription>
          </DialogHeader>
            <div className="space-y-4">
              <div>
              <p className="text-sm font-medium text-foreground">{categoryDialog.category?.name}</p>
              <p className="text-xs text-muted-foreground">
                Current rate: {formatRateLabel(categoryDialog.category?.commissionRate)}
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="category-commission-input" className="text-sm font-medium text-foreground">
                Commission rate (%)
              </label>
                <Input
                id="category-commission-input"
                placeholder={`Leave blank to use ${formatPercent(DEFAULT_COMMISSION_PERCENT)}`}
                  type="number"
                min={0}
                max={100}
                step={0.1}
                value={categoryRateInput}
                onChange={(event) => setCategoryRateInput(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter a value between 0 and 100. This becomes the default for all products in the category unless
                overridden.
              </p>
            </div>
              </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeCategoryDialog} disabled={updateCategoryMutation.isPending}>
                  Cancel
                </Button>
            <Button onClick={handleSaveCategoryRate} disabled={updateCategoryMutation.isPending}>
              {updateCategoryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
                </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={productDialog.open}
        onOpenChange={(open) => {
          if (!open) closeProductDialog();
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product Commission Override</DialogTitle>
            <DialogDescription>
              Override the category commission for this product. Leave blank to inherit from the category/default rate.
            </DialogDescription>
          </DialogHeader>
            <div className="space-y-4">
                <div>
              <p className="text-sm font-medium text-foreground">{productDialog.product?.name}</p>
              <p className="text-xs text-muted-foreground">
                Category rate: {formatRateLabel(productDialog.product?.category?.commissionRate)} • Override:{" "}
                {formatRateLabel(productDialog.product?.commissionRate)}
              </p>
                </div>
            <div className="space-y-2">
              <label htmlFor="product-commission-input" className="text-sm font-medium text-foreground">
                Commission rate (%)
              </label>
                <Input
                id="product-commission-input"
                placeholder="Leave blank to inherit"
                  type="number"
                min={0}
                max={100}
                step={0.1}
                value={productRateInput}
                onChange={(event) => setProductRateInput(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter a value between 0 and 100. Clearing the field resets the product to the inherited rate.
              </p>
            </div>
              </div>
          <DialogFooter className="sm:justify-between">
            {productDialog.product?.commissionRate !== null &&
              productDialog.product?.commissionRate !== undefined && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResetProductOverride}
                  disabled={updateProductMutation.isPending}
                  className="sm:mr-auto"
                >
                  Reset to default
                </Button>
              )}
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button variant="outline" onClick={closeProductDialog} disabled={updateProductMutation.isPending}>
                Cancel
              </Button>
              <Button onClick={handleSaveProductRate} disabled={updateProductMutation.isPending}>
                {updateProductMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
                </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CommissionManagement;
