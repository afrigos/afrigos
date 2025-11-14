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
      imageUrl: "/banners/banner-4.jpg",
      isImage: true,
      showWriteups: false, // No writeups - images only
      link: "/products?sort=popular",
      buttonText: "Shop Now"
    },
    {
      id: 2,
      title: "New Arrivals",
      subtitle: "Fresh Products",
      description: "Discover the latest additions to our catalog",
      imageUrl: "/banners/banner-6.jpg",
      isImage: true,
      showWriteups: false, // No writeups - images only
      link: "/products?sort=newest",
      buttonText: "Explore"
    },
    {
      id: 3,
      title: "Best Sellers",
      subtitle: "Top Rated",
      description: "Products loved by thousands of customers",
      imageUrl: "/banners/banner-3.jpg",
      isImage: true,
      showWriteups: false, // No writeups - images only
      link: "/products?sort=popular",
      buttonText: "View All"
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

  // Map category names to image files (matching exact online category names)
  const getCategoryImage = (categoryName: string): string | null => {
    const nameLower = categoryName.toLowerCase().trim();
    
    // Direct name mappings - using EXACT category names as they appear online
    const imageMap: Record<string, string> = {
      // Exact matches - must match exactly how they appear online (case-insensitive)
      'food': 'food.jpg',
      'handcraft': 'handcraft.jpg',
      'scent and waxes': 'scentandwaxes.jpg',
      'furniture': 'furtniture.jpg', // Note: keeping the typo from filename
      'interior decoration': 'furtniture.jpg', // Using furniture image
      'car/van hire': 'carvanhire.jpg',
      'delivery': 'delivery.jpg',
      'short term rent': 'shorttermrent.jpg',
      'lettings': 'lettings.jpg',
      'event': 'events.jpg',
      'herbal': 'herbal.jpg',
      'footwear': 'footwear.jpg',
    };
    
    // Check direct match first
    if (imageMap[nameLower]) {
      return `/categories/${imageMap[nameLower]}`;
    }
    
    // Check if category name contains any key words (fuzzy matching)
    for (const [key, image] of Object.entries(imageMap)) {
      if (nameLower.includes(key) || key.includes(nameLower)) {
        return `/categories/${image}`;
      }
    }
    
    // For categories without images (Interior Decoration, Event, Herbal), return null
    // They will show the fallback placeholder
    return null;
  };

  // Fetch categories
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiFetch<{ success: boolean; data: Array<{ id: string; name: string; description?: string; image?: string; productCount?: number }> }>('/categories?limit=8');
      const categories = response.data || [];
      
      // Map images to categories
      return categories.map(category => {
        const mappedImage = category.image || getCategoryImage(category.name);
        if (mappedImage) {
          console.log(`Category "${category.name}" mapped to image: ${mappedImage}`);
        } else {
          console.warn(`No image found for category: "${category.name}"`);
        }
        return {
          ...category,
          image: mappedImage || undefined
        };
      });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner Section */}
      <section className="bg-primary text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Flame className="h-4 w-4 text-yellow-300" />
            <span className="font-semibold">FLASH SALE: 5-10% OFF on Selected Items</span>
          </div>
        </div>
      </section>

      {/* Main Banner Slider */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 md:py-4 lg:py-6">
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
                    <div className="rounded-lg overflow-hidden relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[21/8] lg:aspect-[21/7] xl:aspect-[21/6]">
                      {/* Background image or gradient */}
                      {banner.isImage ? (
                        <img 
                          src={banner.imageUrl} 
                          alt={banner.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="eager"
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
                      {/* Overlay - always shown for visual consistency */}
                      <div className="absolute inset-0 bg-black/30" />
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            {banners.length > 1 && (
              <>
                <CarouselPrevious className="left-1 md:left-2 lg:left-4 h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 bg-white/90 hover:bg-white border-gray-200 shadow-lg" />
                <CarouselNext className="right-1 md:right-2 lg:right-4 h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 bg-white/90 hover:bg-white border-gray-200 shadow-lg" />
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {categoriesData.map((category) => (
                <Link 
                  key={category.id} 
                  to={`/category/${category.id}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      {(() => {
                        const categoryImage = category.image || getCategoryImage(category.name);
                        
                        if (!categoryImage) {
                          return (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                              <span className="text-5xl font-bold text-primary/30">
                                {category.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          );
                        }
                        
                        // Handle both full paths and filenames
                        // getCategoryImage already returns full path like "/categories/filename.jpg"
                        // Ensure the path always starts with / for absolute paths (works in production)
                        let imageSrc = categoryImage;
                        if (categoryImage.startsWith('http')) {
                          imageSrc = categoryImage; // External URL
                        } else if (categoryImage.startsWith('/')) {
                          imageSrc = categoryImage; // Already absolute path
                        } else {
                          imageSrc = `/categories/${categoryImage}`; // Relative path - make absolute
                        }
                        
                        // Remove duplicate /categories/ if somehow present
                        imageSrc = imageSrc.replace(/\/categories\/categories\//g, '/categories/');
                        
                        return (
                          <img
                            key={`${category.id}-${imageSrc}`}
                            src={imageSrc}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="eager"
                            onError={(e) => {
                              console.error(`Failed to load category image for "${category.name}": ${imageSrc}`);
                              console.error(`Category name: "${category.name}", Lowercase: "${category.name.toLowerCase().trim()}"`);
                              // Hide image on error and show placeholder
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const placeholder = target.parentElement?.querySelector('.category-placeholder') as HTMLElement;
                              if (placeholder) {
                                placeholder.style.display = 'flex';
                              }
                            }}
                            onLoad={() => {
                              console.log(`Successfully loaded image for "${category.name}": ${imageSrc}`);
                            }}
                          />
                        );
                      })()}
                      {/* Fallback placeholder - hidden by default, shown on image error */}
                      <div 
                        className="category-placeholder w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 absolute inset-0"
                        style={{ display: 'none' }}
                      >
                        <span className="text-5xl font-bold text-primary/30">
                          {category.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {/* Gradient overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      {/* Category info overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="font-bold text-lg mb-1 drop-shadow-lg">{category.name}</h3>
                        {category.productCount !== undefined && category.productCount > 0 && (
                          <p className="text-sm text-white/90 font-medium">
                            {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                          </p>
                        )}
                        {category.description && (
                          <p className="text-xs text-white/80 mt-1 line-clamp-2 hidden sm:block">
                            {category.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Hover indicator */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/90 rounded-full p-2 shadow-lg">
                          <ArrowRight className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
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

      {/* Portrait Ad Section */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Mobile: Horizontal Scrollable Carousel */}
          <div className="block md:hidden">
            <Carousel
              opts={{
                align: "start",
                loop: false,
                dragFree: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2">
                {[1, 2, 3, 4].map((adNum) => (
                  <CarouselItem key={adNum} className="pl-2 basis-auto">
                    <Link to="/products" className="block w-[280px]">
                      <div className="rounded-lg overflow-hidden relative w-full aspect-[2/3] bg-gradient-to-br from-primary/20 to-primary/5 hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-sm text-muted-foreground">Portrait Ad {adNum}</p>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 justify-items-center">
            {[1, 2, 3, 4].map((adNum) => (
              <Link 
                key={adNum} 
                to="/products" 
                className="block w-full max-w-[300px] lg:max-w-[400px]"
              >
                <div className="rounded-lg overflow-hidden relative w-full aspect-[2/3] bg-gradient-to-br from-primary/20 to-primary/5 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Portrait Ad {adNum}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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
