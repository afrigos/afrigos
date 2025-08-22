import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

const vendorData = [
  {
    id: "V001",
    name: "Mama Asha's Kitchen",
    email: "contact@mamaashas.co.uk",
    phone: "+44 20 7123 4567",
    location: "London, UK",
    category: "Food",
    status: "pending",
    joinDate: "2024-01-15",
    revenue: "£12,450",
    products: 24,
    rating: 4.8,
    documents: "Complete"
  },
  {
    id: "V002", 
    name: "Adunni Beauty",
    email: "hello@adunnibeauty.com",
    phone: "+44 161 456 7890",
    location: "Manchester, UK",
    category: "Beauty",
    status: "approved",
    joinDate: "2024-01-10",
    revenue: "£8,920",
    products: 18,
    rating: 4.9,
    documents: "Complete"
  },
  {
    id: "V003",
    name: "Kente Collections",
    email: "info@kentecollections.uk",
    phone: "+44 121 789 0123",
    location: "Birmingham, UK", 
    category: "Clothing",
    status: "suspended",
    joinDate: "2024-01-08",
    revenue: "£15,680",
    products: 45,
    rating: 4.6,
    documents: "Incomplete"
  },
  {
    id: "V004",
    name: "Afro Herbs Ltd",
    email: "support@afroherbs.co.uk",
    phone: "+44 113 234 5678",
    location: "Leeds, UK",
    category: "Herbal",
    status: "review",
    joinDate: "2024-01-12",
    revenue: "£6,340",
    products: 12,
    rating: 4.7,
    documents: "Pending"
  }
];

export function VendorManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      case "suspended":
        return <Badge className="bg-destructive text-destructive-foreground">Suspended</Badge>;
      case "review":
        return <Badge variant="outline">Under Review</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredVendors = vendorData.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || vendor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendor Management</h1>
          <p className="text-muted-foreground">Manage and monitor marketplace vendors</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-primary to-dashboard-accent">
            Add Vendor
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-card">
          <TabsTrigger value="all">All ({vendorData.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending (1)</TabsTrigger>
          <TabsTrigger value="approved">Approved (1)</TabsTrigger>
          <TabsTrigger value="review">Review (1)</TabsTrigger>
          <TabsTrigger value="suspended">Suspended (1)</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>All Vendors</CardTitle>
              <CardDescription>Complete list of marketplace vendors</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{vendor.name}</div>
                          <div className="text-sm text-muted-foreground">{vendor.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {vendor.email}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            {vendor.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{vendor.category}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                      <TableCell className="text-center">{vendor.products}</TableCell>
                      <TableCell className="font-mono">{vendor.revenue}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-sm">★ {vendor.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <CheckCircle className="h-4 w-4 text-success" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tab contents would be similar but filtered */}
        <TabsContent value="pending">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-warning" />
                <span>Pending Approval</span>
              </CardTitle>
              <CardDescription>Vendors awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Filtered content for pending vendors would appear here...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Add similar TabsContent for other statuses */}
      </Tabs>
    </div>
  );
}
