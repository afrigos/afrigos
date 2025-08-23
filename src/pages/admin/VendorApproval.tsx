import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Download, 
  FileText,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Star,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const pendingVendors = [
  {
    id: "VA001",
    name: "Lagos Delights",
    email: "contact@lagosdelights.co.uk",
    phone: "+44 20 7890 1234",
    location: "London, UK",
    category: "Food",
    appliedDate: "2024-01-20",
    businessType: "Restaurant",
    description: "Authentic Nigerian cuisine delivered across London",
    documents: {
      businessLicense: "complete",
      insurance: "complete", 
      bankDetails: "complete",
      identification: "pending"
    },
    status: "pending",
    riskScore: "low"
  },
  {
    id: "VA002",
    name: "Ankara Express",
    email: "info@ankaraexpress.uk",
    phone: "+44 161 567 8901",
    location: "Manchester, UK", 
    category: "Clothing",
    appliedDate: "2024-01-18",
    businessType: "Fashion Retailer",
    description: "Traditional and modern African clothing and accessories",
    documents: {
      businessLicense: "complete",
      insurance: "review",
      bankDetails: "complete", 
      identification: "complete"
    },
    status: "review",
    riskScore: "medium"
  },
  {
    id: "VA003",
    name: "Shea Butter Co",
    email: "hello@sheabutterco.com",
    phone: "+44 121 345 6789",
    location: "Birmingham, UK",
    category: "Beauty",
    appliedDate: "2024-01-22",
    businessType: "Beauty Products",
    description: "Premium shea butter and natural beauty products from Ghana",
    documents: {
      businessLicense: "complete",
      insurance: "complete",
      bankDetails: "pending",
      identification: "complete"
    },
    status: "pending",
    riskScore: "low"
  }
];

export function VendorApproval() {
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [reviewNote, setReviewNote] = useState("");
  const { toast } = useToast();

  const handleApprove = (vendorId: string) => {
    toast({
      title: "Vendor Approved",
      description: `${vendorId} has been approved and notified via email.`,
    });
  };

  const handleReject = (vendorId: string) => {
    toast({
      title: "Vendor Rejected", 
      description: `${vendorId} has been rejected. Rejection reason sent via email.`,
      variant: "destructive",
    });
  };

  const handleRequestMore = (vendorId: string) => {
    toast({
      title: "Additional Info Requested",
      description: `Request for more information sent to ${vendorId}.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-warning text-warning-foreground"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "review":
        return <Badge className="bg-primary text-primary-foreground"><Eye className="h-3 w-3 mr-1" />Review</Badge>;
      case "approved":
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge className="bg-destructive text-destructive-foreground"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "low":
        return <Badge className="bg-success text-success-foreground">Low Risk</Badge>;
      case "medium":
        return <Badge className="bg-warning text-warning-foreground">Medium Risk</Badge>;
      case "high":
        return <Badge className="bg-destructive text-destructive-foreground">High Risk</Badge>;
      default:
        return <Badge variant="outline">{risk}</Badge>;
    }
  };

  const getDocumentStatus = (status: string) => {
    switch (status) {
      case "complete":
        return <Badge className="bg-success text-success-foreground text-xs">Complete</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground text-xs">Pending</Badge>;
      case "review":
        return <Badge className="bg-primary text-primary-foreground text-xs">Review</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendor Approval</h1>
          <p className="text-muted-foreground">Review and approve new vendor applications</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <div className="text-2xl font-bold text-foreground">3</div>
                <div className="text-sm text-muted-foreground">Pending Review</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <div className="text-2xl font-bold text-foreground">12</div>
                <div className="text-sm text-muted-foreground">Approved Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <div className="text-2xl font-bold text-foreground">2</div>
                <div className="text-sm text-muted-foreground">High Risk</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold text-foreground">4.8</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-card">
          <TabsTrigger value="pending">Pending (3)</TabsTrigger>
          <TabsTrigger value="review">In Review (2)</TabsTrigger>
          <TabsTrigger value="approved">Approved (15)</TabsTrigger>
          <TabsTrigger value="rejected">Rejected (4)</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-warning" />
                <span>Pending Applications</span>
              </CardTitle>
              <CardDescription>New vendor applications awaiting review</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor Details</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingVendors.filter(v => v.status === "pending").map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">{vendor.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {vendor.email}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {vendor.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{vendor.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-1" />
                          {vendor.appliedDate}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {Object.entries(vendor.documents).map(([doc, status]) => (
                            <div key={doc} className="flex items-center justify-between">
                              <span className="text-xs capitalize">{doc.replace(/([A-Z])/g, ' $1')}</span>
                              {getDocumentStatus(status)}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{getRiskBadge(vendor.riskScore)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedVendor(vendor)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Vendor Application Review</DialogTitle>
                                <DialogDescription>
                                  Review {vendor.name}'s application details
                                </DialogDescription>
                              </DialogHeader>
                              {selectedVendor && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-sm font-medium">Business Name</Label>
                                        <div className="text-lg font-semibold">{selectedVendor.name}</div>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Contact Information</Label>
                                        <div className="space-y-1 text-sm">
                                          <div className="flex items-center">
                                            <Mail className="h-3 w-3 mr-2" />
                                            {selectedVendor.email}
                                          </div>
                                          <div className="flex items-center">
                                            <Phone className="h-3 w-3 mr-2" />
                                            {selectedVendor.phone}
                                          </div>
                                          <div className="flex items-center">
                                            <MapPin className="h-3 w-3 mr-2" />
                                            {selectedVendor.location}
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Business Type</Label>
                                        <div className="flex items-center space-x-2">
                                          <Building className="h-4 w-4" />
                                          <span>{selectedVendor.businessType}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-sm font-medium">Category</Label>
                                        <Badge variant="outline" className="ml-2">{selectedVendor.category}</Badge>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Risk Assessment</Label>
                                        <div className="mt-1">{getRiskBadge(selectedVendor.riskScore)}</div>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Application Date</Label>
                                        <div className="flex items-center">
                                          <Calendar className="h-3 w-3 mr-2" />
                                          {selectedVendor.appliedDate}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-medium">Business Description</Label>
                                    <p className="mt-1 text-sm text-muted-foreground">{selectedVendor.description}</p>
                                  </div>

                                  <div>
                                    <Label className="text-sm font-medium">Document Status</Label>
                                    <div className="mt-2 grid grid-cols-2 gap-4">
                                      {Object.entries(selectedVendor.documents).map(([doc, status]) => (
                                        <div key={doc} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                          <div className="flex items-center space-x-2">
                                            <FileText className="h-4 w-4" />
                                            <span className="capitalize">{doc.replace(/([A-Z])/g, ' $1')}</span>
                                          </div>
                                           {getDocumentStatus(status as string)}
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div>
                                    <Label htmlFor="reviewNote">Review Notes</Label>
                                    <Textarea
                                      id="reviewNote"
                                      placeholder="Add notes about this application..."
                                      value={reviewNote}
                                      onChange={(e) => setReviewNote(e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>

                                  <div className="flex space-x-2 pt-4">
                                    <Button 
                                      onClick={() => handleApprove(selectedVendor.id)}
                                      className="bg-success text-success-foreground hover:bg-success/90"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve Vendor
                                    </Button>
                                    <Button 
                                      onClick={() => handleRequestMore(selectedVendor.id)}
                                      variant="outline"
                                    >
                                      Request More Info
                                    </Button>
                                    <Button 
                                      onClick={() => handleReject(selectedVendor.id)}
                                      variant="destructive"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleApprove(vendor.id)}
                          >
                            <CheckCircle className="h-4 w-4 text-success" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleReject(vendor.id)}
                          >
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

        {/* Other tabs would have similar content with filtered data */}
        <TabsContent value="review">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Applications Under Review</h3>
              <p className="text-muted-foreground">Vendors currently being reviewed by the team</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Approved Vendors</h3>
              <p className="text-muted-foreground">Successfully approved and active vendors</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Rejected Applications</h3>
              <p className="text-muted-foreground">Applications that didn't meet requirements</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
