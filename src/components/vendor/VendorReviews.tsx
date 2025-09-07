import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Star, 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown,
  Filter,
  Search,
  Reply,
  Flag,
  Eye,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Package,
  Users,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock reviews data for vendor
const vendorReviewsData = {
  overview: {
    totalReviews: 312,
    averageRating: 4.8,
    fiveStar: 245,
    fourStar: 45,
    threeStar: 15,
    twoStar: 5,
    oneStar: 2,
    responseRate: 89,
    recentReviews: 23
  },
  reviews: [
    {
      id: "REV001",
      customer: "Sarah Johnson",
      customerEmail: "sarah.j@email.com",
      product: "Jollof Rice Spice Mix",
      productId: "P001",
      rating: 5,
      title: "Amazing authentic flavor!",
      comment: "This spice mix is absolutely incredible! The flavor is so authentic and reminds me of my grandmother's cooking. The packaging is also very professional and the delivery was super fast. Will definitely order again!",
      date: "2024-01-20",
      verified: true,
      helpful: 12,
      notHelpful: 1,
      vendorResponse: null,
      status: "published"
    },
    {
      id: "REV002",
      customer: "Michael Chen",
      customerEmail: "m.chen@email.com",
      product: "Shea Butter Hair Care Set",
      productId: "P002",
      rating: 4,
      title: "Great quality, fast delivery",
      comment: "The shea butter products are of excellent quality. My hair feels much healthier after using them. The delivery was quick and the packaging was secure. Only giving 4 stars because the scent is a bit strong for my preference.",
      date: "2024-01-18",
      verified: true,
      helpful: 8,
      notHelpful: 2,
      vendorResponse: {
        text: "Thank you for your feedback, Michael! We're glad you're enjoying the products. We're working on developing a lighter scent option for customers who prefer subtler fragrances.",
        date: "2024-01-19"
      },
      status: "published"
    },
    {
      id: "REV003",
      customer: "Emma Wilson",
      customerEmail: "emma.w@email.com",
      product: "Traditional Kente Cloth Scarf",
      productId: "P003",
      rating: 5,
      title: "Beautiful craftsmanship",
      comment: "This scarf is absolutely stunning! The colors are vibrant and the quality is exceptional. It's clear that this is authentic Kente cloth with traditional patterns. Highly recommend!",
      date: "2024-01-15",
      verified: true,
      helpful: 15,
      notHelpful: 0,
      vendorResponse: null,
      status: "published"
    },
    {
      id: "REV004",
      customer: "David Brown",
      customerEmail: "d.brown@email.com",
      product: "Plantain Chips",
      productId: "P004",
      rating: 3,
      title: "Good but could be better",
      comment: "The chips taste good and are crispy, but I found them a bit too salty for my taste. The packaging was good and they arrived in perfect condition. Would order again but with less salt.",
      date: "2024-01-12",
      verified: true,
      helpful: 5,
      notHelpful: 3,
      vendorResponse: {
        text: "Thank you for your honest feedback, David! We're currently working on a low-sodium version of our plantain chips. We'll notify you when it's available.",
        date: "2024-01-13"
      },
      status: "published"
    },
    {
      id: "REV005",
      customer: "Lisa Thompson",
      customerEmail: "lisa.t@email.com",
      product: "Moringa Leaf Powder",
      productId: "P005",
      rating: 5,
      title: "Excellent health benefits",
      comment: "I've been using this moringa powder for a month now and I can feel the difference in my energy levels. The powder is fine and dissolves easily in smoothies. Great product!",
      date: "2024-01-10",
      verified: true,
      helpful: 9,
      notHelpful: 1,
      vendorResponse: null,
      status: "published"
    }
  ],
  productRatings: [
    {
      product: "Jollof Rice Spice Mix",
      averageRating: 4.9,
      totalReviews: 156,
      fiveStar: 134,
      fourStar: 18,
      threeStar: 3,
      twoStar: 1,
      oneStar: 0
    },
    {
      product: "Shea Butter Hair Care Set",
      averageRating: 4.7,
      totalReviews: 89,
      fiveStar: 67,
      fourStar: 18,
      threeStar: 3,
      twoStar: 1,
      oneStar: 0
    },
    {
      product: "Traditional Kente Cloth Scarf",
      averageRating: 4.8,
      totalReviews: 67,
      fiveStar: 56,
      fourStar: 9,
      threeStar: 2,
      twoStar: 0,
      oneStar: 0
    }
  ]
};

export function VendorReviews() {
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const { toast } = useToast();

  const filteredReviews = vendorReviewsData.reviews.filter(review => {
    const matchesSearch = review.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === "all" || review.rating === parseInt(ratingFilter);
    const matchesProduct = productFilter === "all" || review.product === productFilter;
    return matchesSearch && matchesRating && matchesProduct;
  });

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-current text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const handleReply = (review: any) => {
    setSelectedReview(review);
    setReplyText("");
    setIsReplyDialogOpen(true);
  };

  const submitReply = () => {
    if (!replyText.trim()) {
      toast({
        title: "Reply Required",
        description: "Please enter a reply before submitting.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would make an API call
    toast({
      title: "Reply Submitted",
      description: "Your reply has been posted successfully.",
    });
    
    setIsReplyDialogOpen(false);
    setSelectedReview(null);
    setReplyText("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Reviews</h1>
          <p className="text-muted-foreground">Manage and respond to customer feedback</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Reviews
          </Button>
          <Button size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View All Reviews
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorReviewsData.overview.averageRating}/5.0</div>
            <div className="flex items-center mt-1">
              {renderStars(Math.round(vendorReviewsData.overview.averageRating))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorReviewsData.overview.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              +{vendorReviewsData.overview.recentReviews} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Reply className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorReviewsData.overview.responseRate}%</div>
            <p className="text-xs text-muted-foreground">
              Of reviews responded to
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">5-Star Reviews</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorReviewsData.overview.fiveStar}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((vendorReviewsData.overview.fiveStar / vendorReviewsData.overview.totalReviews) * 100)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
          <CardDescription>Breakdown of customer ratings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = vendorReviewsData.overview[`${rating === 5 ? 'five' : rating === 4 ? 'four' : rating === 3 ? 'three' : rating === 2 ? 'two' : 'one'}Star` as keyof typeof vendorReviewsData.overview] as number;
              const percentage = Math.round((count / vendorReviewsData.overview.totalReviews) * 100);
              
              return (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-3 w-3 fill-current text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-12 text-right">
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews by customer, product, or comment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {Array.from(new Set(vendorReviewsData.reviews.map(r => r.product))).map((product) => (
                  <SelectItem key={product} value={product}>
                    {product}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews ({filteredReviews.length})</CardTitle>
          <CardDescription>Manage and respond to customer feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">{review.customer}</p>
                      <p className="text-sm text-muted-foreground">{review.product}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-sm text-muted-foreground">{formatDate(review.date)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium">{review.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{review.helpful}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <ThumbsDown className="h-3 w-3" />
                      <span>{review.notHelpful}</span>
                    </span>
                    {review.verified && (
                      <span className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span>Verified Purchase</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {!review.vendorResponse && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleReply(review)}
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Flag className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {review.vendorResponse && (
                  <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r-lg">
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Package className="h-3 w-3 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-orange-800">Vendor Response</p>
                        <p className="text-sm text-orange-700 mt-1">{review.vendorResponse.text}</p>
                        <p className="text-xs text-orange-600 mt-1">{formatDate(review.vendorResponse.date)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
            <DialogDescription>
              Respond to customer feedback professionally
            </DialogDescription>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="bg-muted/20 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium">{selectedReview.customer}</span>
                  <div className="flex items-center space-x-1">
                    {renderStars(selectedReview.rating)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{selectedReview.comment}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Your Response</label>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a professional and helpful response..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submitReply}>
                  Submit Reply
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

