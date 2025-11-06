import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    productCount?: number;
  };
}

export function CategoryCard({ category }: CategoryCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/category/${category.id}`);
  };

  const categoryImage = category.image 
    ? (category.image.startsWith('http') ? category.image : `/categories/${category.image}`)
    : '/placeholder-category.jpg';

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 overflow-hidden relative h-full"
      onClick={handleClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
        {category.image ? (
          <img
            src={categoryImage}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-category.jpg';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-bold text-primary/30">
              {category.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="font-bold text-lg mb-1">{category.name}</h3>
          {category.description && (
            <p className="text-sm text-white/90 line-clamp-2 mb-2">
              {category.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            {category.productCount !== undefined && (
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {category.productCount} products
              </Badge>
            )}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Card>
  );
}

