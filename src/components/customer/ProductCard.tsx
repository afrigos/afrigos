import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/lib/products-api";
import { BACKEND_URL } from "@/lib/api-config";

interface ProductCardProps {
  product: Product;
  onView?: () => void;
}

export function ProductCard({ product, onView }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart, getItemQuantity } = useCart();
  const quantityInCart = getItemQuantity(product.id);
  const isInCart = quantityInCart > 0;

  const handleView = () => {
    if (onView) {
      onView();
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        comparePrice: product.comparePrice,
        image: product.images[0] || '',
        stock: product.stock,
        vendor: product.vendor,
        category: product.category,
      });
    }
  };

  const discountPercentage = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const mainImage = product.images[0] 
    ? (product.images[0].startsWith('http') ? product.images[0] : `${BACKEND_URL}${product.images[0]}`)
    : '/placeholder-product.jpg';

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 overflow-hidden h-full flex flex-col"
      onClick={handleView}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
          }}
        />
        {discountPercentage > 0 && (
          <Badge className="absolute top-2 left-2 bg-red-500 text-white">
            -{discountPercentage}%
          </Badge>
        )}
        {product.stock === 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2">
            Out of Stock
          </Badge>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 w-8 p-0 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              handleView();
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardContent className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
            {product.vendor.businessName}
          </p>
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-primary">
              £{product.price.toFixed(2)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                £{product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full"
          size="sm"
          variant={isInCart ? "secondary" : "default"}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isInCart ? `${quantityInCart} in Cart` : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
}

