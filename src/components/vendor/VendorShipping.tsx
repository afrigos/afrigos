import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Truck, 
  MapPin, 
  Package, 
  Clock, 
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Download,
  Eye,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Settings,
  Globe,
  Calculator,
  FileText,
  Mail,
  Phone,
  Home,
  Building,
  Navigation,
  Weight,
  Ruler,
  CreditCard,
  Shield,
  Zap,
  TrendingUp,
  BarChart3,
  Calendar,
  User,
  Target,
  Activity,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Info,
  Star,
  Heart,
  Flag,
  Lock,
  Unlock,
  Copy,
  Share,
  Send,
  Archive,
  Bookmark,
  Bell,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock comprehensive shipping data
const shippingData = {
  overview: {
    totalShipments: 1247,
    pendingShipments: 45,
    inTransit: 123,
    delivered: 1067,
    failedDeliveries: 12,
    avgDeliveryTime: "3.2 days",
    onTimeDelivery: 96.8,
    shippingRevenue: 15670.50,
    shippingCosts: 8920.30,
    netShippingProfit: 6750.20,
    topShippingMethod: "Standard Ground",
    avgShippingCost: 7.15,
    returnRate: 2.1
  },
  shippingMethods: [
    {
      id: "standard",
      name: "Standard Ground",
      description: "Regular shipping within 3-5 business days",
      baseRate: 5.99,
      freeThreshold: 75.00,
      estimatedDays: "3-5",
      zones: ["Domestic"],
      isActive: true,
      usage: 67.5,
      avgDeliveryTime: "3.2 days"
    },
    {
      id: "expedited",
      name: "Expedited",
      description: "Faster shipping within 1-2 business days",
      baseRate: 12.99,
      freeThreshold: 150.00,
      estimatedDays: "1-2",
      zones: ["Domestic"],
      isActive: true,
      usage: 22.3,
      avgDeliveryTime: "1.8 days"
    },
    {
      id: "overnight",
      name: "Overnight",
      description: "Next business day delivery",
      baseRate: 24.99,
      freeThreshold: 300.00,
      estimatedDays: "1",
      zones: ["Domestic"],
      isActive: true,
      usage: 8.7,
      avgDeliveryTime: "1.0 days"
    },
    {
      id: "international",
      name: "International",
      description: "International shipping 7-14 business days",
      baseRate: 29.99,
      freeThreshold: 500.00,
      estimatedDays: "7-14",
      zones: ["International"],
      isActive: true,
      usage: 1.5,
      avgDeliveryTime: "10.5 days"
    }
  ],
  shippingZones: [
    {
      id: "zone1",
      name: "Local (0-25 miles)",
      description: "Same-day or next-day delivery",
      baseRate: 3.99,
      deliveryTime: "Same day",
      coverage: "Local area",
      isActive: true,
      orderCount: 234,
      avgDeliveryTime: "0.8 days"
    },
    {
      id: "zone2", 
      name: "Regional (25-100 miles)",
      description: "Next-day delivery",
      baseRate: 5.99,
      deliveryTime: "1-2 days",
      coverage: "Regional area",
      isActive: true,
      orderCount: 456,
      avgDeliveryTime: "1.5 days"
    },
    {
      id: "zone3",
      name: "National (100+ miles)",
      description: "Standard ground shipping",
      baseRate: 7.99,
      deliveryTime: "3-5 days",
      coverage: "National",
      isActive: true,
      orderCount: 557,
      avgDeliveryTime: "3.8 days"
    }
  ],
  recentShipments: [
    {
      id: "SH001",
      orderId: "ORD-2024-001",
      customer: "Sarah Johnson",
      destination: "London, UK",
      method: "Standard Ground",
      status: "delivered",
      trackingNumber: "1Z999AA1234567890",
      shippedDate: "2024-01-15",
      deliveredDate: "2024-01-18",
      cost: 7.99,
      weight: "2.5 lbs",
      dimensions: "12x8x6 in",
      carrier: "UPS"
    },
    {
      id: "SH002",
      orderId: "ORD-2024-002", 
      customer: "Michael Brown",
      destination: "Manchester, UK",
      method: "Expedited",
      status: "in_transit",
      trackingNumber: "1Z999AA1234567891",
      shippedDate: "2024-01-16",
      deliveredDate: null,
      cost: 12.99,
      weight: "1.8 lbs",
      dimensions: "10x6x4 in",
      carrier: "FedEx"
    },
    {
      id: "SH003",
      orderId: "ORD-2024-003",
      customer: "Emma Wilson",
      destination: "Birmingham, UK", 
      method: "Overnight",
      status: "delivered",
      trackingNumber: "1Z999AA1234567892",
      shippedDate: "2024-01-17",
      deliveredDate: "2024-01-18",
      cost: 24.99,
      weight: "3.2 lbs",
      dimensions: "14x10x8 in",
      carrier: "UPS"
    }
  ],
  shippingSettings: {
    freeShippingThreshold: 75.00,
    handlingFee: 2.50,
    insuranceRequired: false,
    signatureRequired: false,
    allowInternational: true,
    autoCalculateRates: true,
    displayShippingCosts: true,
    allowCustomerChoice: true,
    defaultCarrier: "UPS",
    packagingOptions: ["Standard Box", "Custom Box", "Envelope"],
    weightUnit: "lbs",
    dimensionUnit: "in"
  }
};

export function VendorShipping() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [showAddZone, setShowAddZone] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newMethod, setNewMethod] = useState({
    name: "",
    description: "",
    baseRate: "",
    freeThreshold: "",
    estimatedDays: "",
    zones: []
  });
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      delivered: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      in_transit: { variant: "secondary" as const, icon: Truck, color: "text-blue-600" },
      pending: { variant: "outline" as const, icon: Clock, color: "text-yellow-600" },
      failed: { variant: "destructive" as const, icon: AlertTriangle, color: "text-red-600" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <IconComponent className="h-3 w-3" />
        <span className="capitalize">{status.replace('_', ' ')}</span>
      </Badge>
    );
  };

  const handleCreateShippingLabel = (shipmentId: string) => {
    toast({
      title: "Shipping Label Created",
      description: `Label for shipment ${shipmentId} has been generated and sent to your email.`,
    });
  };

  const handleTrackShipment = (trackingNumber: string) => {
    toast({
      title: "Tracking Information",
      description: `Opening tracking page for ${trackingNumber}`,
    });
  };

  const handleAddMethod = () => {
    // Validate form
    if (!newMethod.name || !newMethod.baseRate || !newMethod.estimatedDays) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Base Rate, Estimated Days).",
        variant: "destructive",
      });
      return;
    }

    // Simulate API call
    toast({
      title: "Shipping Method Added",
      description: `${newMethod.name} has been successfully added to your shipping methods.`,
    });

    // Reset form
    setNewMethod({
      name: "",
      description: "",
      baseRate: "",
      freeThreshold: "",
      estimatedDays: "",
      zones: []
    });
    setShowAddMethod(false);
  };

  const handleAddZone = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Zone management will be available in the next update.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shipping Management</h1>
          <p className="text-muted-foreground">
            Manage shipping methods, zones, and track shipments
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Dialog open={showAddMethod} onOpenChange={setShowAddMethod}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Method
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Shipping Method</DialogTitle>
                <DialogDescription>
                  Create a new shipping method for your store
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Method Name *</label>
                  <Input
                    placeholder="e.g., Express Delivery"
                    value={newMethod.name}
                    onChange={(e) => setNewMethod({...newMethod, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Describe this shipping method..."
                    value={newMethod.description}
                    onChange={(e) => setNewMethod({...newMethod, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Base Rate (£) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="9.99"
                      value={newMethod.baseRate}
                      onChange={(e) => setNewMethod({...newMethod, baseRate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Free Threshold (£)</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="100.00"
                      value={newMethod.freeThreshold}
                      onChange={(e) => setNewMethod({...newMethod, freeThreshold: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estimated Delivery Time *</label>
                  <Input
                    placeholder="e.g., 2-3 business days"
                    value={newMethod.estimatedDays}
                    onChange={(e) => setNewMethod({...newMethod, estimatedDays: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Available Zones</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select zones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="domestic">Domestic</SelectItem>
                      <SelectItem value="international">International</SelectItem>
                      <SelectItem value="local">Local Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowAddMethod(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddMethod}>
                    Add Method
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shippingData.overview.totalShipments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {shippingData.overview.pendingShipments} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shippingData.overview.onTimeDelivery}%</div>
            <p className="text-xs text-muted-foreground">
              Avg delivery: {shippingData.overview.avgDeliveryTime}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipping Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(shippingData.overview.shippingRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Net profit: {formatCurrency(shippingData.overview.netShippingProfit)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Shipping Cost</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(shippingData.overview.avgShippingCost)}</div>
            <p className="text-xs text-muted-foreground">
              Top method: {shippingData.overview.topShippingMethod}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="methods">Methods</TabsTrigger>
          <TabsTrigger value="zones">Zones</TabsTrigger>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Shipping Performance</span>
                </CardTitle>
                <CardDescription>Key shipping metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Delivery Success Rate</span>
                    <span className="font-bold text-green-600">96.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Return Rate</span>
                    <span className="font-bold text-orange-600">2.1%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Failed Deliveries</span>
                    <span className="font-bold text-red-600">{shippingData.overview.failedDeliveries}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">In Transit</span>
                    <span className="font-bold text-blue-600">{shippingData.overview.inTransit}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Shipping Methods Usage</span>
                </CardTitle>
                <CardDescription>Distribution of shipping methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shippingData.shippingMethods.map((method) => (
                    <div key={method.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{method.name}</span>
                        <span className="text-sm font-bold">{method.usage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${method.usage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Rate: {formatCurrency(method.baseRate)}</span>
                        <span>Avg: {method.avgDeliveryTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Methods Tab */}
        <TabsContent value="methods" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {shippingData.shippingMethods.map((method) => (
              <Card key={method.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{method.name}</CardTitle>
                      <CardDescription>{method.description}</CardDescription>
                    </div>
                    <Badge variant={method.isActive ? "default" : "secondary"}>
                      {method.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Base Rate:</span>
                      <span className="font-bold">{formatCurrency(method.baseRate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Free Threshold:</span>
                      <span className="font-bold">{formatCurrency(method.freeThreshold)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Delivery Time:</span>
                      <span className="font-bold">{method.estimatedDays} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Usage:</span>
                      <span className="font-bold">{method.usage}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Zones:</span>
                      <div className="flex space-x-1">
                        {method.zones.map((zone) => (
                          <Badge key={zone} variant="outline" className="text-xs">
                            {zone}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          toast({
                            title: "Edit Shipping Method",
                            description: `Editing ${method.name} - Feature coming soon!`,
                          });
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: "Method Settings",
                            description: `Opening settings for ${method.name}`,
                          });
                        }}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Zones Tab */}
        <TabsContent value="zones" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {shippingData.shippingZones.map((zone) => (
              <Card key={zone.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{zone.name}</CardTitle>
                      <CardDescription>{zone.description}</CardDescription>
                    </div>
                    <Badge variant={zone.isActive ? "default" : "secondary"}>
                      {zone.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Base Rate:</span>
                      <span className="font-bold">{formatCurrency(zone.baseRate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Delivery Time:</span>
                      <span className="font-bold">{zone.deliveryTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Orders:</span>
                      <span className="font-bold">{zone.orderCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Coverage:</span>
                      <span className="font-bold text-sm">{zone.coverage}</span>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          toast({
                            title: "Edit Shipping Zone",
                            description: `Editing ${zone.name} - Feature coming soon!`,
                          });
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          toast({
                            title: "Zone Coverage",
                            description: `Viewing coverage map for ${zone.name}`,
                          });
                        }}
                      >
                        <MapPin className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Shipments Tab */}
        <TabsContent value="shipments" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search shipments by ID, order, or customer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Shipments</CardTitle>
              <CardDescription>Track and manage all your shipments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shipment ID</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shippingData.recentShipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-medium">{shipment.id}</TableCell>
                      <TableCell>{shipment.orderId}</TableCell>
                      <TableCell>{shipment.customer}</TableCell>
                      <TableCell>{shipment.destination}</TableCell>
                      <TableCell>{shipment.method}</TableCell>
                      <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                      <TableCell>{formatCurrency(shipment.cost)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCreateShippingLabel(shipment.id)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTrackShipment(shipment.trackingNumber)}
                          >
                            <Eye className="h-3 w-3" />
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

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Configuration</CardTitle>
                <CardDescription>Configure your shipping settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Free Shipping Threshold</label>
                  <Input 
                    type="number" 
                    value={shippingData.shippingSettings.freeShippingThreshold}
                    placeholder="75.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Handling Fee</label>
                  <Input 
                    type="number" 
                    value={shippingData.shippingSettings.handlingFee}
                    placeholder="2.50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Carrier</label>
                  <Select defaultValue={shippingData.shippingSettings.defaultCarrier}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPS">UPS</SelectItem>
                      <SelectItem value="FedEx">FedEx</SelectItem>
                      <SelectItem value="DHL">DHL</SelectItem>
                      <SelectItem value="Royal Mail">Royal Mail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={shippingData.shippingSettings.autoCalculateRates}
                    className="rounded"
                  />
                  <label className="text-sm">Auto-calculate shipping rates</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={shippingData.shippingSettings.allowInternational}
                    className="rounded"
                  />
                  <label className="text-sm">Allow international shipping</label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Packaging Options</CardTitle>
                <CardDescription>Configure available packaging</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {shippingData.shippingSettings.packagingOptions.map((option) => (
                    <div key={option} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <span className="font-medium">{option}</span>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Packaging Option
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Packaging Option</DialogTitle>
                        <DialogDescription>
                          Add a new packaging option for your shipments
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Packaging Name</label>
                          <Input placeholder="e.g., Large Box, Envelope, Custom Box" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Description</label>
                          <Textarea placeholder="Describe this packaging option..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Max Weight (lbs)</label>
                            <Input type="number" placeholder="10" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Max Dimensions (in)</label>
                            <Input placeholder="12x8x6" />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button variant="outline">
                            Cancel
                          </Button>
                          <Button onClick={() => {
                            toast({
                              title: "Packaging Option Added",
                              description: "New packaging option has been added successfully.",
                            });
                          }}>
                            Add Option
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
