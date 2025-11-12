import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Clock, Loader2, Shield, Truck, Star, Percent, Flame } from "lucide-react";
import { ProductCard } from "@/components/customer/ProductCard";
import { CategoryCard } from "@/components/customer/CategoryCard";
import { productsApi } from "@/lib/products-api";
import { apiFetch } from "@/lib/api-client";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { useEffect, useState } from "react";

export default function Marketplace() {
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hardcoded banners for now
  const banners = [
    {
      id: 1,
      title: "Mega Sale",
      subtitle: "Up to 70% OFF",
      description: "Shop the biggest deals on African products",
      imageUrl: "/banners/banner-1.jpg",
      isImage: true,
      link: "/products?sort=popular",
      buttonText: "Shop Now"
    },
    {
      id: 2,
      title: "New Arrivals",
      subtitle: "Fresh Products",
      description: "Discover the latest additions to our catalog",
      imageUrl: "bg-gradient-to-r from-blue-600 to-blue-700",
      isImage: false,
      link: "/products?sort=newest",
      buttonText: "Explore"
    },
    {
      id: 3,
      title: "Best Sellers",
      subtitle: "Top Rated",
      description: "Products loved by thousands of customers",
      imageUrl: "bg-gradient-to-r from-green-600 to-green-700",
      isImage: false,
      link: "/products?sort=popular",
      buttonText: "View All"
    },
    {
      id: 4,
      title: "Authentic Products",
      subtitle: "Quality Guaranteed",
      description: "Shop verified authentic African products with confidence",
      imageUrl: "bg-gradient-to-r from-purple-600 to-purple-700",
      isImage: false,
      link: "/products",
      buttonText: "Shop Now"
    }
  ];

  // Update current slide when carousel changes
  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrentSlide(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap());
    });
  }, [api]);

  // Auto-play carousel
  useEffect(() => {
    if (!api) return;
    
    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [api]);

  // Fetch featured products
  const { data: featuredProducts, isLoading: loadingFeatured } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsApi.getFeaturedProducts(12),
  });

  // Fetch popular products (by sales)
  const { data: popularProducts, isLoading: loadingPopular } = useQuery({
    queryKey: ['popular-products'],
    queryFn: () => productsApi.getProducts({ limit: 12, sort: 'popular' }),
  });

  // Fetch new arrivals
  const { data: newProducts, isLoading: loadingNew } = useQuery({
    queryKey: ['new-products'],
    queryFn: () => productsApi.getProducts({ limit: 12, sort: 'newest' }),
  });

  // Fetch categories
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiFetch<{ success: boolean; data: Array<{ id: string; name: string; description?: string; image?: string; productCount?: number }> }>('/categories?limit=8');
      return response.data || [];
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner Section */}
      <section className="bg-primary text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Flame className="h-4 w-4 text-yellow-300" />
            <span className="font-semibold">FLASH SALE: Up to 50% OFF on Selected Items</span>
          </div>
        </div>
      </section>

      {/* Main Banner Slider */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {banners.map((banner) => (
                <CarouselItem key={banner.id} className="pl-2 md:pl-4 basis-full">
                  <Link to={banner.link || '/products'}>
                    <div className="rounded-lg overflow-hidden relative h-48 md:h-64 lg:h-80 w-full">
                      {/* Background image or gradient */}
                      {banner.isImage ? (
                        <img 
                          src={banner.imageUrl} 
                          alt={banner.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to gradient if image fails to load
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.className = `${parent.className} bg-gradient-to-r from-red-600 to-red-700`;
                            }
                          }}
                        />
                      ) : (
                        <div className={`absolute inset-0 ${banner.imageUrl}`} />
                      )}
                      {/* Overlay for better text readability - only for non-image banners */}
                      {!banner.isImage && <div className="absolute inset-0 bg-black/30" />}
                      {/* Text content - commented out for first banner (banner-1.jpg) */}
                      {!banner.isImage && (
                        <div className="absolute inset-0 flex items-center justify-between px-6 md:px-12 lg:px-16">
                          <div className="text-white max-w-md z-10">
                            {banner.subtitle && (
                              <div className="text-sm md:text-base font-medium mb-2 opacity-90">
                                {banner.subtitle}
                              </div>
                            )}
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
                              {banner.title}
                            </h2>
                            {banner.description && (
                              <p className="text-base md:text-lg mb-6 opacity-90">
                                {banner.description}
                              </p>
                            )}
                            <Button 
                              variant="secondary" 
                              size="lg"
                              className="bg-white text-gray-900 hover:bg-gray-100 font-semibold"
                              onClick={(e) => {
                                e.preventDefault();
                                window.location.href = banner.link || '/products';
                              }}
                            >
                              {banner.buttonText || 'Shop Now'}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                          {/* Decorative elements */}
                          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-1/3">
                            <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                          </div>
                        </div>
                      )}
                      {/* Commented out text content for first banner (banner-1.jpg) */}
                      {/* {banner.isImage && (
                        <div className="absolute inset-0 flex items-center justify-between px-6 md:px-12 lg:px-16">
                          <div className="text-white max-w-md z-10">
                            {banner.subtitle && (
                              <div className="text-sm md:text-base font-medium mb-2 opacity-90">
                                {banner.subtitle}
                              </div>
                            )}
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
                              {banner.title}
                            </h2>
                            {banner.description && (
                              <p className="text-base md:text-lg mb-6 opacity-90">
                                {banner.description}
                              </p>
                            )}
                            <Button 
                              variant="secondary" 
                              size="lg"
                              className="bg-white text-gray-900 hover:bg-gray-100 font-semibold"
                              onClick={(e) => {
                                e.preventDefault();
                                window.location.href = banner.link || '/products';
                              }}
                            >
                              {banner.buttonText || 'Shop Now'}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-1/3">
                            <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                          </div>
                        </div>
                      )} */}
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            {banners.length > 1 && (
              <>
                <CarouselPrevious className="left-2 md:left-4 h-8 w-8 md:h-10 md:w-10 bg-white/90 hover:bg-white border-gray-200 shadow-lg" />
                <CarouselNext className="right-2 md:right-4 h-8 w-8 md:h-10 md:w-10 bg-white/90 hover:bg-white border-gray-200 shadow-lg" />
              </>
            )}
          </Carousel>
          
          {/* Dots indicator */}
          {banners.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all ${
                    currentSlide === index 
                      ? 'w-8 bg-primary' 
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Shop by Category</h2>
              <p className="text-gray-600 text-sm">Browse our product categories</p>
            </div>
            <Link to="/products">
              <Button variant="ghost" className="hidden sm:flex text-primary hover:text-primary/80">
                View All Categories
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {loadingCategories ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : categoriesData && categoriesData.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
              {categoriesData.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No categories available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-5 w-5 text-red-600" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
              </div>
              <p className="text-gray-600 text-sm">Handpicked favorites from our vendors</p>
            </div>
            <Link to="/products?sort=popular">
              <Button variant="ghost" className="hidden sm:flex text-primary hover:text-primary/80">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loadingFeatured ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : featuredProducts?.data && featuredProducts.data.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
              {featuredProducts.data.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No featured products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Best Sellers</h2>
              </div>
              <p className="text-gray-600 text-sm">Most popular products this week</p>
            </div>
            <Link to="/products?sort=popular">
              <Button variant="ghost" className="hidden sm:flex text-primary hover:text-primary/80">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loadingPopular ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : popularProducts?.data && popularProducts.data.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
              {popularProducts.data.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No popular products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-5 w-5 text-blue-600" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">New Arrivals</h2>
              </div>
              <p className="text-gray-600 text-sm">Just added to our collection</p>
            </div>
            <Link to="/products?sort=newest">
              <Button variant="ghost" className="hidden sm:flex text-primary hover:text-primary/80">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loadingNew ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : newProducts?.data && newProducts.data.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6">
              {newProducts.data.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No new products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Shop With Us */}
      <section className="py-12 md:py-16 bg-white border-t">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Why Shop With AfriGos?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">Fast Delivery</h3>
              <p className="text-xs text-gray-600">Quick & reliable shipping</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">Secure Payment</h3>
              <p className="text-xs text-gray-600">100% secure transactions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-primary fill-yellow-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">Quality Products</h3>
              <p className="text-xs text-gray-600">Verified authentic items</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Percent className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">Best Prices</h3>
              <p className="text-xs text-gray-600">Competitive pricing</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Start Selling on AfriGos
            </h2>
            <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of vendors selling authentic African products. Reach customers across the continent.
            </p>
            <Link to="/auth/vendor-signup">
              <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100 px-8 py-6 text-base font-semibold">
                Register as Vendor
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
