import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft, Store, Star, Package, Search } from "lucide-react";
import { ProductCard } from "@/components/customer/ProductCard";
import { productsApi } from "@/lib/products-api";
import { apiFetch } from "@/lib/api-client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VendorInfo {
  id: string;
  businessName: string;
  businessType: string;
  description?: string;
  website?: string;
  avgRating: number;
  totalProducts: number;
  totalOrders: number;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const fetchVendorInfo = async (vendorId: string): Promise<VendorInfo> => {
  const response = await apiFetch<{ success: boolean; data: VendorInfo }>(`/vendors/${vendorId}/public`);
  if (!response.success || !response.data) {
    throw new Error('Failed to fetch vendor information');
  }
  return response.data;
};

export default function VendorStorePage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<'newest' | 'price-low' | 'price-high' | 'name' | 'popular'>('newest');

  // Fetch vendor information
  const { data: vendorInfo, isLoading: vendorLoading, error: vendorError } = useQuery({
    queryKey: ['vendor-info', vendorId],
    queryFn: () => fetchVendorInfo(vendorId!),
    enabled: !!vendorId,
  });

  // Fetch vendor products
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['vendor-products', vendorId, page, search, sort],
    queryFn: () => productsApi.getProducts({
      vendorId: vendorId!,
      page,
      limit: 24,
      search: search || undefined,
      sort,
    }),
    enabled: !!vendorId,
  });

  if (!vendorId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Vendor ID is missing</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (vendorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading store...</p>
        </div>
      </div>
    );
  }

  if (vendorError || !vendorInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-destructive mb-4">Failed to load store information</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                  <Store className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">{vendorInfo.businessName}</h1>
                  <p className="text-muted-foreground">{vendorInfo.businessType}</p>
                </div>
              </div>
              {vendorInfo.description && (
                <p className="text-muted-foreground mt-2 max-w-2xl">{vendorInfo.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{vendorInfo.avgRating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>{vendorInfo.totalProducts} Products</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Store className="h-4 w-4" />
                  <span>{vendorInfo.totalOrders} Orders</span>
                </div>
              </div>
            </div>
            {vendorInfo.website && (
              <Button
                variant="outline"
                onClick={() => window.open(vendorInfo.website, '_blank')}
              >
                Visit Website
              </Button>
            )}
          </div>
        </div>

        {/* Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select value={sort} onValueChange={(value: any) => setSort(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name">Name: A to Z</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : productsError ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-destructive text-lg mb-2">Error loading products</p>
            <p className="text-muted-foreground text-sm">
              {productsError instanceof Error ? productsError.message : 'Unknown error'}
            </p>
          </div>
        ) : productsData?.data && productsData.data.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {productsData.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {productsData.pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(5, productsData.pagination.pages) }, (_, i) => {
                  let pageNum;
                  if (productsData.pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= productsData.pagination.pages - 2) {
                    pageNum = productsData.pagination.pages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === productsData.pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-4">No products found</p>
            <p className="text-sm text-muted-foreground">
              {search ? 'Try adjusting your search terms' : 'This store has no products available yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

