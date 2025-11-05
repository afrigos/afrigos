import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Switch,
} from "@/components/ui/switch";
import { 
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { 
  User, 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Edit, 
  Save, 
  Upload, 
  Camera,
  Shield,
  Bell,
  CreditCard,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Calendar,
  Building,
  Flag,
  Languages,
  Clock3,
  ShieldCheck,
  CreditCard as CardIcon,
  Smartphone,
  Monitor,
  Wifi
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Mock vendor profile data
const mockVendorProfile = {
  personal: {
    firstName: "Aisha",
    lastName: "Johnson",
    email: "aisha.johnson@afrigos.com",
    phone: "+44 20 7946 0958",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    dateJoined: "2023-08-15",
    lastLogin: "2024-01-21T14:30:00Z",
    status: "active",
    verificationStatus: "verified"
  },
  business: {
    businessName: "Authentic African Flavors",
    businessType: "Sole Proprietorship",
    businessNumber: "AF2023001",
    taxId: "GB123456789",
    description: "Specializing in authentic African spices, traditional foods, and handcrafted products from West Africa. We bring the rich flavors and cultural heritage of Africa to the UK market.",
    foundedYear: "2020",
    employees: "1-5",
    revenue: "£50,000 - £100,000",
    website: "https://africanflavors.co.uk",
    socialMedia: {
      facebook: "https://facebook.com/africanflavors",
      instagram: "https://instagram.com/africanflavors",
      twitter: "https://twitter.com/africanflavors"
    }
  },
  address: {
    street: "123 Victoria Street",
    city: "London",
    state: "England",
    postalCode: "SW1E 5LB",
    country: "United Kingdom",
    isPrimary: true,
    addressType: "business"
  },
  preferences: {
    language: "en",
    currency: "GBP",
    timezone: "Europe/London",
    notifications: {
      email: true,
      sms: true,
      push: true,
      orderUpdates: true,
      marketing: false,
      security: true
    },
    privacy: {
      profileVisibility: "public",
      showSalesData: false,
      allowDirectMessages: true
    }
  },
  performance: {
    rating: 4.8,
    totalReviews: 247,
    totalSales: 1247,
    totalRevenue: 45670.50,
    responseTime: "2 hours",
    fulfillmentRate: 98.5,
    returnRate: 2.1
  },
  documents: [
    {
      id: "doc1",
      name: "Business License",
      type: "license",
      status: "verified",
      uploadedDate: "2023-08-15",
      expiryDate: "2024-08-15"
    },
    {
      id: "doc2",
      name: "Tax Certificate",
      type: "tax",
      status: "verified",
      uploadedDate: "2023-08-20",
      expiryDate: "2024-04-05"
    },
    {
      id: "doc3",
      name: "Insurance Certificate",
      type: "insurance",
      status: "pending",
      uploadedDate: "2024-01-10",
      expiryDate: "2024-12-31"
    }
  ],
  security: {
    twoFactorEnabled: true,
    lastPasswordChange: "2023-12-15",
    loginHistory: [
      { date: "2024-01-21T14:30:00Z", ip: "192.168.1.100", device: "Chrome on macOS", location: "London, UK" },
      { date: "2024-01-21T09:15:00Z", ip: "192.168.1.100", device: "Safari on iPhone", location: "London, UK" },
      { date: "2024-01-20T16:45:00Z", ip: "192.168.1.100", device: "Chrome on macOS", location: "London, UK" }
    ]
  }
};

const BUSINESS_TYPES = [
  "Sole Proprietorship",
  "Partnership",
  "Limited Liability Company (LLC)",
  "Corporation",
  "Non-Profit Organization",
  "Cooperative"
];

const EMPLOYEE_RANGES = [
  "Just me",
  "1-5 employees",
  "6-10 employees",
  "11-50 employees",
  "51-200 employees",
  "200+ employees"
];

const REVENUE_RANGES = [
  "Under £10,000",
  "£10,000 - £25,000",
  "£25,000 - £50,000",
  "£50,000 - £100,000",
  "£100,000 - £250,000",
  "£250,000 - £500,000",
  "£500,000+"
];

const COUNTRIES = [
  "United Kingdom",
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Uganda",
  "Tanzania",
  "Other"
];

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "pt", name: "Português" },
  { code: "ar", name: "العربية" },
  { code: "sw", name: "Kiswahili" },
  { code: "yo", name: "Yorùbá" },
  { code: "ha", name: "Hausa" },
  { code: "ig", name: "Igbo" }
];

export function VendorProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState(mockVendorProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isUploading, setIsUploading] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
    setIsEditing(false);
    setEditingSection(null);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newAvatarUrl = URL.createObjectURL(file);
      setProfile({
        ...profile,
        personal: {
          ...profile.personal,
          avatar: newAvatarUrl
        }
      });

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return AlertTriangle;
      case 'active': return CheckCircle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Afri GoS gradient */}
      <div className="bg-afrigos-hero rounded-xl p-6 shadow-afrigos">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            <p className="text-white/90">Manage your vendor account and store information</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
            {isEditing && (
              <Button onClick={handleSave} className="bg-white text-afrigos hover:bg-white/90">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 bg-white shadow-md">
          <TabsTrigger value="overview" className="data-[state=active]:bg-afrigos-gradient data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="personal" className="data-[state=active]:bg-afrigos-gradient data-[state=active]:text-white">Personal</TabsTrigger>
          <TabsTrigger value="business" className="data-[state=active]:bg-afrigos-gradient data-[state=active]:text-white">Business</TabsTrigger>
          <TabsTrigger value="address" className="data-[state=active]:bg-afrigos-gradient data-[state=active]:text-white">Address</TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-afrigos-gradient data-[state=active]:text-white">Preferences</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-afrigos-gradient data-[state=active]:text-white">Security</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Profile Card */}
            <Card className="lg:col-span-1 border-afrigos/20 shadow-afrigos">
              <CardHeader className="bg-afrigos-gradient/10">
                <CardTitle className="flex items-center space-x-2 text-afrigos">
                  <User className="h-5 w-5" />
                  <span>Profile Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile.personal.avatar} alt="Profile" />
                      <AvatarFallback>
                        {profile.personal.firstName[0]}{profile.personal.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-afrigos-gradient text-white rounded-full p-2 cursor-pointer hover:opacity-90 transition-all shadow-lg">
                        <Camera className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">
                      {profile.personal.firstName} {profile.personal.lastName}
                    </h3>
                    <p className="text-muted-foreground">{profile.business.businessName}</p>
                      <Badge className={getStatusColor(profile.personal.verificationStatus)}>
                        <span className="mr-1">
                          {(() => {
                            const IconComponent = getStatusIcon(profile.personal.verificationStatus);
                            return <IconComponent className="h-4 w-4" />;
                          })()}
                        </span>
                        <span className="capitalize">{profile.personal.verificationStatus}</span>
                      </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.personal.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.personal.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.address.city}, {profile.address.country}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {new Date(profile.personal.dateJoined).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="lg:col-span-2 border-afrigos/20 shadow-afrigos">
              <CardHeader className="bg-afrigos-gradient/10">
                <CardTitle className="flex items-center space-x-2 text-afrigos">
                  <TrendingUp className="h-5 w-5" />
                  <span>Performance Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-afrigos-glow" />
                      <span className="text-sm font-medium">Rating</span>
                    </div>
                    <p className="text-2xl font-bold text-afrigos">{profile.performance.rating}/5.0</p>
                    <p className="text-xs text-muted-foreground">{profile.performance.totalReviews} reviews</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Package className="h-4 w-4 text-afrigos" />
                      <span className="text-sm font-medium">Total Sales</span>
                    </div>
                    <p className="text-2xl font-bold text-afrigos">{profile.performance.totalSales}</p>
                    <p className="text-xs text-muted-foreground">products sold</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-afrigos" />
                      <span className="text-sm font-medium">Total Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-afrigos">{formatCurrency(profile.performance.totalRevenue)}</p>
                    <p className="text-xs text-muted-foreground">lifetime earnings</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-afrigos" />
                      <span className="text-sm font-medium">Fulfillment Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-afrigos">{profile.performance.fulfillmentRate}%</p>
                    <p className="text-xs text-muted-foreground">on-time delivery</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documents Status */}
          <Card className="border-afrigos/20 shadow-afrigos">
            <CardHeader className="bg-afrigos-gradient/10">
              <CardTitle className="flex items-center space-x-2 text-afrigos">
                <FileText className="h-5 w-5" />
                <span>Document Verification</span>
              </CardTitle>
              <CardDescription>Required documents for vendor verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profile.documents.map((doc) => {
                  const statusInfo = getStatusColor(doc.status);
                  const StatusIconComponent = getStatusIcon(doc.status);
                  return (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={statusInfo}>
                        <StatusIconComponent className="h-3 w-3 mr-1" />
                        {doc.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    value={profile.personal.firstName}
                    onChange={(e) => setProfile({
                      ...profile,
                      personal: { ...profile.personal, firstName: e.target.value }
                    })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    value={profile.personal.lastName}
                    onChange={(e) => setProfile({
                      ...profile,
                      personal: { ...profile.personal, lastName: e.target.value }
                    })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    value={profile.personal.email}
                    onChange={(e) => setProfile({
                      ...profile,
                      personal: { ...profile.personal, email: e.target.value }
                    })}
                    disabled={!isEditing}
                    type="email"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input
                    value={profile.personal.phone}
                    onChange={(e) => setProfile({
                      ...profile,
                      personal: { ...profile.personal, phone: e.target.value }
                    })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Information Tab */}
        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Your business details and legal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Business Name</label>
                  <Input
                    value={profile.business.businessName}
                    onChange={(e) => setProfile({
                      ...profile,
                      business: { ...profile.business, businessName: e.target.value }
                    })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Business Type</label>
                  <Select
                    value={profile.business.businessType}
                    onValueChange={(value) => setProfile({
                      ...profile,
                      business: { ...profile.business, businessType: value }
                    })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Business Number</label>
                  <Input
                    value={profile.business.businessNumber}
                    onChange={(e) => setProfile({
                      ...profile,
                      business: { ...profile.business, businessNumber: e.target.value }
                    })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tax ID</label>
                  <Input
                    value={profile.business.taxId}
                    onChange={(e) => setProfile({
                      ...profile,
                      business: { ...profile.business, taxId: e.target.value }
                    })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Founded Year</label>
                  <Input
                    value={profile.business.foundedYear}
                    onChange={(e) => setProfile({
                      ...profile,
                      business: { ...profile.business, foundedYear: e.target.value }
                    })}
                    disabled={!isEditing}
                    type="text"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Number of Employees</label>
                  <Select
                    value={profile.business.employees}
                    onValueChange={(value) => setProfile({
                      ...profile,
                      business: { ...profile.business, employees: value }
                    })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_RANGES.map((range) => (
                        <SelectItem key={range} value={range}>{range}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Annual Revenue</label>
                  <Select
                    value={profile.business.revenue}
                    onValueChange={(value) => setProfile({
                      ...profile,
                      business: { ...profile.business, revenue: value }
                    })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REVENUE_RANGES.map((range) => (
                        <SelectItem key={range} value={range}>{range}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    value={profile.business.website}
                    onChange={(e) => setProfile({
                      ...profile,
                      business: { ...profile.business, website: e.target.value }
                    })}
                    disabled={!isEditing}
                    placeholder="https://your-website.com"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Business Description</label>
                <Textarea
                  value={profile.business.description}
                  onChange={(e) => setProfile({
                    ...profile,
                    business: { ...profile.business, description: e.target.value }
                  })}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Describe your business..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Address Tab */}
        <TabsContent value="address" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Address</CardTitle>
              <CardDescription>Your business location and shipping address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Street Address</label>
                  <Input
                    value={profile.address.street}
                    onChange={(e) => setProfile({
                      ...profile,
                      address: { ...profile.address, street: e.target.value }
                    })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input
                    value={profile.address.city}
                    onChange={(e) => setProfile({
                      ...profile,
                      address: { ...profile.address, city: e.target.value }
                    })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">State/Region</label>
                  <Input
                    value={profile.address.state}
                    onChange={(e) => setProfile({
                      ...profile,
                      address: { ...profile.address, state: e.target.value }
                    })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Postal Code</label>
                  <Input
                    value={profile.address.postalCode}
                    onChange={(e) => setProfile({
                      ...profile,
                      address: { ...profile.address, postalCode: e.target.value }
                    })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Country</label>
                  <Select
                    value={profile.address.country}
                    onValueChange={(value) => setProfile({
                      ...profile,
                      address: { ...profile.address, country: value }
                    })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Preferences</CardTitle>
                <CardDescription>Customize your account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Language</label>
                  <Select
                    value={profile.preferences.language}
                    onValueChange={(value) => setProfile({
                      ...profile,
                      preferences: { ...profile.preferences, language: value }
                    })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <Select
                    value={profile.preferences.currency}
                    onValueChange={(value) => setProfile({
                      ...profile,
                      preferences: { ...profile.preferences, currency: value }
                    })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="NGN">Nigerian Naira (NGN)</SelectItem>
                      <SelectItem value="GHS">Ghanaian Cedi (GHS)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Timezone</label>
                  <Select
                    value={profile.preferences.timezone}
                    onValueChange={(value) => setProfile({
                      ...profile,
                      preferences: { ...profile.preferences, timezone: value }
                    })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Africa/Lagos">Lagos (WAT)</SelectItem>
                      <SelectItem value="Africa/Accra">Accra (GMT)</SelectItem>
                      <SelectItem value="Africa/Nairobi">Nairobi (EAT)</SelectItem>
                      <SelectItem value="Africa/Johannesburg">Johannesburg (SAST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Email Notifications</label>
                    <p className="text-xs text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications.email}
                    onCheckedChange={(checked) => setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        notifications: { ...profile.preferences.notifications, email: checked }
                      }
                    })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">SMS Notifications</label>
                    <p className="text-xs text-muted-foreground">Receive updates via SMS</p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications.sms}
                    onCheckedChange={(checked) => setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        notifications: { ...profile.preferences.notifications, sms: checked }
                      }
                    })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Push Notifications</label>
                    <p className="text-xs text-muted-foreground">Receive browser notifications</p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications.push}
                    onCheckedChange={(checked) => setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        notifications: { ...profile.preferences.notifications, push: checked }
                      }
                    })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Order Updates</label>
                    <p className="text-xs text-muted-foreground">Get notified about order changes</p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications.orderUpdates}
                    onCheckedChange={(checked) => setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        notifications: { ...profile.preferences.notifications, orderUpdates: checked }
                      }
                    })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Marketing</label>
                    <p className="text-xs text-muted-foreground">Receive promotional content</p>
                  </div>
                  <Switch
                    checked={profile.preferences.notifications.marketing}
                    onCheckedChange={(checked) => setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        notifications: { ...profile.preferences.notifications, marketing: checked }
                      }
                    })}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">Two-Factor Authentication</label>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={profile.security.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {profile.security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Button variant="outline" size="sm">
                      {profile.security.twoFactorEnabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Password Change</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(profile.security.lastPasswordChange).toLocaleDateString()}
                  </p>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Login Activity</CardTitle>
                <CardDescription>Monitor your account access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.security.loginHistory.slice(0, 3).map((login, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          {login.device.includes('iPhone') ? (
                            <Smartphone className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Monitor className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{login.device}</p>
                          <p className="text-xs text-muted-foreground">{login.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{login.ip}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(login.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
