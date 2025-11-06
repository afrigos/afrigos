import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { API_BASE_URL, BACKEND_URL } from "@/lib/api-config";
import { Label } from "@/components/ui/label";
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
  Wifi,
  X,
  Lock,
  Eye,
  EyeOff,
  Loader2
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
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [uploadingDocs, setUploadingDocs] = useState<{ [key: string]: boolean }>({});

  // Fetch vendor profile
  const { data: vendorProfile, isLoading: loadingProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['vendor-profile'],
    queryFn: async () => {
      const response = await apiFetch<{ success: boolean; data: any }>('/vendors/profile');
      return response.data;
    },
    enabled: !!user,
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiFetch<{ success: boolean; data: Array<{ id: string; name: string }> }>('/categories?limit=100');
      return response.data || [];
    },
  });

  // Check if vendor needs to submit documents
  useEffect(() => {
    if (vendorProfile && user?.isActive && vendorProfile.verificationStatus === 'VERIFIED') {
      const requiredDocs = ['BUSINESS_LICENSE', 'TAX_CERTIFICATE', 'INSURANCE', 'IDENTITY', 'BANK_STATEMENT'];
      const submittedDocs = vendorProfile.documents?.map((d: any) => d.type) || [];
      const missingDocs = requiredDocs.filter(doc => !submittedDocs.includes(doc));
      
      if (missingDocs.length > 0 && !showDocumentModal) {
        setShowDocumentModal(true);
      }
    }
  }, [vendorProfile, user, showDocumentModal]);

  // Update profile when data is fetched
  useEffect(() => {
    if (vendorProfile) {
      setProfile({
        ...profile,
        business: {
          ...profile.business,
          businessName: vendorProfile.businessName || profile.business.businessName,
          businessType: vendorProfile.businessType || profile.business.businessType,
          businessNumber: vendorProfile.businessNumber || profile.business.businessNumber,
          taxId: vendorProfile.taxId || profile.business.taxId,
          description: vendorProfile.description || profile.business.description,
          website: vendorProfile.website || profile.business.website,
        },
      });
    }
  }, [vendorProfile]);

  // Save profile mutation
  const saveProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiFetch('/vendors/profile', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
      setEditingSection(null);
      refetchProfile();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = async () => {
    const businessData = {
      businessName: profile.business.businessName,
      businessType: profile.business.businessType,
      businessNumber: profile.business.businessNumber,
      taxId: profile.business.taxId,
      description: profile.business.description,
      website: profile.business.website,
      foundedYear: profile.business.foundedYear,
      employees: profile.business.employees,
      revenue: profile.business.revenue,
    };
    saveProfileMutation.mutate(businessData);
  };

  // Handle document upload
  const handleDocumentUpload = async (type: string, file: File) => {
    setUploadingDocs(prev => ({ ...prev, [type]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const token = localStorage.getItem('afrigos-token');
      const response = await fetch(`${BACKEND_URL}/api/v1/vendors/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded successfully and is pending review.",
      });
      refetchProfile();
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingDocs(prev => ({ ...prev, [type]: false }));
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.new.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.new,
        }),
      });

      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
      setShowPasswordModal(false);
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to change password. Please check your current password.",
        variant: "destructive",
      });
    }
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
                  <Label className="text-sm font-medium">Business Type</Label>
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
                  <Label className="text-sm font-medium">Category</Label>
                  <Select
                    value={(profile.business as any).categoryId || ""}
                    onValueChange={(value) => setProfile({
                      ...profile,
                      business: { ...profile.business, categoryId: value } as any
                    })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesData?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
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
                <Label className="text-sm font-medium">Business Description</Label>
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

          {/* Document Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Required Documents</CardTitle>
              <CardDescription>Upload required documents for verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { type: 'BUSINESS_LICENSE', label: 'Business License', required: true },
                { type: 'TAX_CERTIFICATE', label: 'Tax Certificate', required: true },
                { type: 'INSURANCE', label: 'Insurance Certificate', required: true },
                { type: 'IDENTITY', label: 'Identity Document', required: true },
                { type: 'BANK_STATEMENT', label: 'Bank Statement', required: true },
              ].map((doc) => {
                const existingDoc = vendorProfile?.documents?.find((d: any) => d.type === doc.type);
                return (
                  <div key={doc.type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">{doc.label}</Label>
                      {existingDoc && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Status: <Badge variant={existingDoc.status === 'VERIFIED' ? 'default' : 'secondary'}>{existingDoc.status}</Badge>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleDocumentUpload(doc.type, file);
                          }
                        }}
                        disabled={uploadingDocs[doc.type]}
                        className="hidden"
                        id={`doc-${doc.type}`}
                      />
                      <Label htmlFor={`doc-${doc.type}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={uploadingDocs[doc.type]}
                          asChild
                        >
                          <span>
                            {uploadingDocs[doc.type] ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                {existingDoc ? 'Replace' : 'Upload'}
                              </>
                            )}
                          </span>
                        </Button>
                      </Label>
                    </div>
                  </div>
                );
              })}
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
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Password</Label>
                  <p className="text-sm text-muted-foreground">
                    Last changed: {new Date(profile.security.lastPasswordChange).toLocaleDateString()}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>
                    <Lock className="h-4 w-4 mr-2" />
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

      {/* Document Submission Modal */}
      <Dialog open={showDocumentModal} onOpenChange={setShowDocumentModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span>Document Submission Required</span>
            </DialogTitle>
            <DialogDescription>
              As an approved vendor, you need to submit the following required documents to continue using the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please go to the <strong>Business</strong> tab and upload the following documents:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Business License</li>
              <li>Tax Certificate</li>
              <li>Insurance Certificate</li>
              <li>Identity Document</li>
              <li>Bank Statement</li>
            </ul>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDocumentModal(false)}>
                I'll do it later
              </Button>
              <Button onClick={() => {
                setShowDocumentModal(false);
                setActiveTab("business");
              }}>
                Go to Business Tab
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Change Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPassword.current ? "text" : "password"}
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                >
                  {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword.new ? "text" : "password"}
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                >
                  {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPassword.confirm ? "text" : "password"}
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                >
                  {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setShowPasswordModal(false);
                setPasswordData({ current: "", new: "", confirm: "" });
              }}>
                Cancel
              </Button>
              <Button onClick={handlePasswordChange}>
                Change Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
