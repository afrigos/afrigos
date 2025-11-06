import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/customer/ProductCard";
import { productsApi, ProductsQueryParams } from "@/lib/products-api";
import { apiFetch } from "@/lib/api-client";
import { Loader2, Filter, Grid, List, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { categoryId: categoryIdFromPath } = useParams<{ categoryId?: string }>();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Get query params - prioritize category from URL path if present
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const categoryFromQuery = searchParams.get('category') || '';
  // Use category from URL path if available, otherwise use query param
  const category = categoryIdFromPath || categoryFromQuery;
  const sort = (searchParams.get('sort') || 'newest') as ProductsQueryParams['sort'];
  const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiFetch<{ success: boolean; data: Array<{ id: string; name: string }> }>('/categories?limit=100');
      return response.data || [];
    },
  });

  // Fetch products
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', page, search, categoryIdFromPath, category, sort, minPrice, maxPrice],
    queryFn: () => productsApi.getProducts({
      page,
      limit: 24,
      search,
      category,
      sort,
      minPrice,
      maxPrice,
    }),
  });

  // Get unique vendors from products
  const vendors = productsData?.data
    ? Array.from(new Map(productsData.data.map(p => [p.vendor.id, p.vendor])).values())
    : [];

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to first page
    
    // If changing category and we're on a category page, navigate to the new category page
    if (key === 'category') {
      // Remove category from query params since it will be in the path
      newParams.delete('category');
      if (value && value !== 'all') {
        navigate(`/category/${value}?${newParams.toString()}`);
      } else {
        navigate(`/products?${newParams.toString()}`);
      }
    } else if (categoryIdFromPath) {
      // If we're on a category page and changing other filters, keep the category in the path
      navigate(`/category/${categoryIdFromPath}?${newParams.toString()}`);
    } else {
      setSearchParams(newParams);
    }
  };

  const handlePriceRangeChange = (values: number[]) => {
    const newParams = new URLSearchParams(searchParams);
    if (values[0] > 0) {
      newParams.set('minPrice', values[0].toString());
    } else {
      newParams.delete('minPrice');
    }
    if (values[1] < 1000) {
      newParams.set('maxPrice', values[1].toString());
    } else {
      newParams.delete('maxPrice');
    }
    newParams.set('page', '1');
    
    // If we're on a category page, navigate to preserve the category in the path
    if (categoryIdFromPath) {
      newParams.delete('category'); // Remove category from query params since it's in the path
      navigate(`/category/${categoryIdFromPath}?${newParams.toString()}`);
    } else {
      setSearchParams(newParams);
    }
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    
    // If we're on a category page, navigate to preserve the category in the path
    if (categoryIdFromPath) {
      newParams.delete('category'); // Remove category from query params since it's in the path
      navigate(`/category/${categoryIdFromPath}?${newParams.toString()}`);
    } else {
      setSearchParams(newParams);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedCategory = categoriesData?.find(c => c.id === category);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {search ? `Search: "${search}"` : selectedCategory ? selectedCategory.name : 'All Products'}
          </h1>
          {productsData && (
            <p className="text-muted-foreground">
              {productsData.pagination.total} {productsData.pagination.total === 1 ? 'product' : 'products'} found
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Filters</h3>
                
                {/* Category Filter */}
                <div className="mb-6">
                  <Label className="mb-2 block">Category</Label>
                  <Select value={category || 'all'} onValueChange={(value) => handleFilterChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categoriesData?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <Label className="mb-2 block">Price Range</Label>
                  <Slider
                    value={[minPrice || 0, maxPrice || 1000]}
                    max={1000}
                    min={0}
                    step={10}
                    onValueChange={handlePriceRangeChange}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>£{minPrice || 0}</span>
                    <span>£{maxPrice || 1000}+</span>
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <Label className="mb-2 block">Sort By</Label>
                  <Select value={sort} onValueChange={(value) => handleFilterChange('sort', value)}>
                    <SelectTrigger>
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
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-2">
                {/* Mobile Filters */}
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px]">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      <div>
                        <Label className="mb-2 block">Category</Label>
                        <Select value={category || 'all'} onValueChange={(value) => { handleFilterChange('category', value); setFiltersOpen(false); }}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categoriesData?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="mb-2 block">Price Range</Label>
                        <Slider
                          value={[minPrice || 0, maxPrice || 1000]}
                          max={1000}
                          min={0}
                          step={10}
                          onValueChange={(values) => {
                            handlePriceRangeChange(values);
                            setFiltersOpen(false);
                          }}
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">Sort By</Label>
                        <Select value={sort} onValueChange={(value) => { handleFilterChange('sort', value); setFiltersOpen(false); }}>
                          <SelectTrigger>
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
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort - Desktop */}
                <Select value={sort} onValueChange={(value) => handleFilterChange('sort', value)}>
                  <SelectTrigger className="w-[180px] hidden lg:flex">
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

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            {error ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-destructive text-lg mb-2">Error loading products</p>
                <p className="text-muted-foreground text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : productsData?.data && productsData.data.length > 0 ? (
              <>
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                  : "space-y-4"
                }>
                  {productsData.data.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {productsData.pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
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
                <p className="text-muted-foreground text-lg mb-4">No products found</p>
                <Button onClick={() => navigate('/products')}>
                  Browse All Products
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

