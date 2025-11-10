import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Star, Search, RefreshCw, Loader2, Package, MessageCircle } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

const ITEMS_PER_PAGE = 10;

type VendorReviewProductStats = {
  averageRating: number;
  reviewCount: number;
};

type VendorReviewItem = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  product: {
    id: string;
    name: string;
    image?: string | null;
    price?: number | null;
    stats?: VendorReviewProductStats;
  };
  customer: {
    id: string;
    name: string;
    email?: string | null;
  };
  order?: {
    id: string;
    orderNumber?: string | null;
    createdAt?: string | Date;
  } | null;
};

type VendorReviewsResponse = {
  overview: {
    totalReviews: number;
    averageRating: number;
    recentReviews: number;
    distribution: Record<number, number>;
  };
  reviews: VendorReviewItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

const renderStars = (rating: number) =>
  Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={`h-4 w-4 ${index < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
    />
  ));

const formatDate = (value: string | Date | undefined) => {
  if (!value) return "—";
  return format(new Date(value), "dd MMM yyyy");
};

export function VendorReviews() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, ratingFilter]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vendor-reviews", currentPage, debouncedSearch, ratingFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      if (ratingFilter !== "all") {
        params.append("rating", ratingFilter);
      }

      const response = await apiFetch<{ success: boolean; data: VendorReviewsResponse; message?: string }>(
        `/reviews/vendor?${params.toString()}`
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch vendor reviews");
      }

      return response.data;
    },
    keepPreviousData: true,
  });

  const reviews = data?.reviews ?? [];
  const distribution = data?.overview.distribution ?? {};
  const totalReviews = data?.overview.totalReviews ?? 0;

  const productOptions = useMemo(() => {
    const map = new Map<string, string>();
    reviews.forEach((review) => {
      if (review.product?.id) {
        map.set(review.product.id, review.product.name);
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (productFilter === "all") return reviews;
    return reviews.filter((review) => review.product?.id === productFilter);
  }, [reviews, productFilter]);

  const totalPages = data?.pagination.pages ?? 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Reviews</h1>
          <p className="text-muted-foreground">
            Track ratings, identify feedback trends, and respond to your customers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.overview.averageRating ? data.overview.averageRating.toFixed(1) : "0.0"}/5.0
            </div>
            <div className="mt-2 flex items-center gap-1">
              {renderStars(Math.round(data?.overview.averageRating ?? 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              +{data?.overview.recentReviews ?? 0} in the last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Five-Star Share</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalReviews > 0 ? Math.round(((distribution[5] ?? 0) / totalReviews) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">{distribution[5] ?? 0} reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filter Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Active filters</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {debouncedSearch && <Badge variant="secondary">Search: {debouncedSearch}</Badge>}
              {ratingFilter !== "all" && <Badge variant="secondary">{ratingFilter}-Star</Badge>}
              {productFilter !== "all" && (
                <Badge variant="secondary">
                  {productOptions.find((option) => option.value === productFilter)?.label ?? "Product"}
                </Badge>
              )}
              {!debouncedSearch && ratingFilter === "all" && productFilter === "all" && (
                <span className="text-sm text-muted-foreground">No filters applied</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
          <CardDescription>How customers rate your store overall.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = distribution[rating] ?? 0;
              const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex w-16 items-center gap-1">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-sm font-medium">{count}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by customer, product, or comment..."
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ratings</SelectItem>
                {["5", "4", "3", "2", "1"].map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}-Star
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={productFilter}
              onValueChange={(value) => {
                setProductFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All products</SelectItem>
                {productOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Customer Reviews ({filteredReviews.length.toLocaleString()})
            {isLoading && <Loader2 className="ml-2 inline h-4 w-4 animate-spin text-muted-foreground" />}
          </CardTitle>
          <CardDescription>Latest feedback from customers who purchased your products.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {(error as Error)?.message ?? "We couldn't load reviews right now. Please try again shortly."}
            </div>
          )}

          {!isLoading && filteredReviews.length === 0 && (
            <div className="rounded-md border border-dashed p-8 text-center">
              <p className="font-medium text-foreground">No reviews match these filters.</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting the search term, rating, or product filter.
              </p>
            </div>
          )}

          {filteredReviews.map((review) => (
            <div key={review.id} className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{review.customer.name}</span>
                    {review.customer.email && <span>{review.customer.email}</span>}
                    {review.order?.orderNumber && (
                      <Badge variant="outline">Order #{review.order.orderNumber}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{review.product.name}</p>
                  {review.product.stats && (
                    <p className="text-xs text-muted-foreground">
                      {review.product.stats.averageRating
                        ? `${review.product.stats.averageRating.toFixed(1)}/5 • `
                        : ""}
                      {review.product.stats.reviewCount} total reviews
                    </p>
                  )}
                </div>
                {review.product.image && (
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border bg-muted">
                    <img
                      src={review.product.image}
                      alt={review.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              {review.comment && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={data?.pagination.total ?? 0}
        itemsPerPage={data?.pagination.limit ?? ITEMS_PER_PAGE}
      />
    </div>
  );
}

