import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Download,
  Edit,
  Loader2,
  Mail,
  MapPin, 
  Phone, 
  Store,
  Upload, 
  CreditCard,
  Building2,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api-config";
import { Pagination } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type VendorDocumentType =
  | "BUSINESS_LICENSE"
  | "TAX_CERTIFICATE"
  | "INSURANCE"
  | "IDENTITY"
  | "BANK_STATEMENT";

type VendorDocument = {
  id: string;
  name: string;
  type: VendorDocumentType;
  url: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  uploadedAt: string;
  expiresAt?: string | null;
};

type VendorProfileApi = {
  id: string;
  businessName: string;
  businessType: string;
  businessNumber?: string | null;
  taxId?: string | null;
  description?: string | null;
  foundedYear?: string | null;
  employees?: string | null;
  revenue?: string | null;
  website?: string | null;
  socialMedia?: Record<string, string> | null;
  isVerified: boolean;
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  stripeAccountId?: string | null;
  bankAccountNumber?: string | null;
  bankRoutingNumber?: string | null;
  bankAccountHolderName?: string | null;
  bankName?: string | null;
  stripeAccountStatus?: string | null;
  stripePaymentDetailsEditCount?: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatar?: string | null;
    phone?: string | null;
    addresses?: Array<{
      id: string;
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      type: string;
      isDefault: boolean;
    }>;
  };
  documents: VendorDocument[];
  _count: {
    products: number;
    orders: number;
    reviews: number;
  };
  financialSummary?: {
    totalGross: number;
    totalCommission: number;
    totalNet: number;
    pendingOrderValue: number;
  };
};

const DOCUMENT_REQUIREMENTS: Array<{ type: VendorDocumentType; label: string }> = [
  { type: "BUSINESS_LICENSE", label: "Business License" },
  { type: "TAX_CERTIFICATE", label: "Tax Certificate" },
  { type: "INSURANCE", label: "Insurance Certificate" },
  { type: "IDENTITY", label: "Identity Document" },
  { type: "BANK_STATEMENT", label: "Bank Statement" },
];

const BUSINESS_TYPES = [
  "Sole Proprietorship",
  "Partnership",
  "Limited Liability Company",
  "Corporation",
  "Non-Profit Organization",
  "Cooperative",
];

const EMPLOYEE_RANGES = [
  "Just me",
  "1-5 employees",
  "6-10 employees",
  "11-50 employees",
  "51-200 employees",
  "200+ employees",
];

const REVENUE_RANGES = [
  "Under £10,000",
  "£10,000 - £25,000",
  "£25,000 - £50,000",
  "£50,000 - £100,000",
  "£100,000 - £250,000",
  "£250,000 - £500,000",
  "£500,000+",
];

const statusStyles: Record<string, string> = {
  VERIFIED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  REJECTED: "bg-red-100 text-red-700",
};

const documentStatusStyles: Record<string, string> = {
  VERIFIED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  REJECTED: "bg-red-100 text-red-700",
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount?: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(amount ?? 0);

type BusinessFormState = {
  businessName: string;
  businessType: string;
  businessNumber: string;
  taxId: string;
  description: string;
  website: string;
  foundedYear: string;
  employees: string;
  revenue: string;
    phone: string;
  firstName: string;
  lastName: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
  bankAccountHolderName: string;
  bankName: string;
};

const initialBusinessForm: BusinessFormState = {
  businessName: "",
  businessType: "",
  businessNumber: "",
  taxId: "",
  description: "",
  website: "",
  foundedYear: "",
  employees: "",
  revenue: "",
  phone: "",
  firstName: "",
  lastName: "",
  bankAccountNumber: "",
  bankRoutingNumber: "",
  bankAccountHolderName: "",
  bankName: "",
};

export function VendorProfile() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [businessForm, setBusinessForm] = useState<BusinessFormState>(initialBusinessForm);
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [isCreatingOnboardingLink, setIsCreatingOnboardingLink] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");

  const {
    data: profile,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["vendor-profile"],
    enabled: !!user?.vendorId,
    queryFn: async () => {
      const result = await apiFetch<{ success: boolean; data: VendorProfileApi; message?: string }>("/vendors/profile");
      if (!result.success || !result.data) {
        throw new Error("Unable to fetch vendor profile.");
      }
      return result.data;
    },
  });

  useEffect(() => {
    if (profile) {
      setBusinessForm({
        businessName: profile.businessName ?? "",
        businessType: profile.businessType ?? "",
        businessNumber: profile.businessNumber ?? "",
        taxId: profile.taxId ?? "",
        description: profile.description ?? "",
        website: profile.website ?? "",
        foundedYear: profile.foundedYear ?? "",
        employees: profile.employees ?? "",
        revenue: profile.revenue ?? "",
        phone: profile.user.phone ?? "",
        firstName: profile.user.firstName ?? "",
        lastName: profile.user.lastName ?? "",
        bankAccountNumber: profile.bankAccountNumber ?? "",
        bankRoutingNumber: profile.bankRoutingNumber ?? "",
        bankAccountHolderName: profile.bankAccountHolderName ?? "",
        bankName: profile.bankName ?? "",
      });
    }
  }, [profile]);

  // Check for onboarding success/refresh in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const refresh = urlParams.get('refresh');
    
    if (success === 'true') {
    toast({
        title: "Stripe onboarding completed",
        description: "Your Stripe account has been set up. Please wait while we verify your account.",
      });
      refetch();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (refresh === 'true') {
      refetch();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [toast, refetch]);

  const updateBusinessMutation = useMutation({
    mutationFn: async (payload: BusinessFormState) => {
      // Helper to normalize empty strings to null
      const normalize = (value: string) => (value?.trim() || null);
      
      const response = await apiFetch<{ success: boolean; message?: string }>(
        "/vendors/profile",
        {
          method: "POST",
          body: JSON.stringify({
            businessName: payload.businessName.trim(),
            businessType: payload.businessType.trim(),
            businessNumber: normalize(payload.businessNumber),
            taxId: normalize(payload.taxId),
            description: normalize(payload.description),
            website: normalize(payload.website),
            foundedYear: normalize(payload.foundedYear),
            employees: normalize(payload.employees),
            revenue: normalize(payload.revenue),
            phone: normalize(payload.phone),
            firstName: payload.firstName.trim() || null,
            lastName: payload.lastName.trim() || null,
            // stripeAccountId and stripeAccountStatus are managed by Stripe, not sent in updates
            bankAccountNumber: normalize(payload.bankAccountNumber),
            bankRoutingNumber: normalize(payload.bankRoutingNumber),
            bankAccountHolderName: normalize(payload.bankAccountHolderName),
            bankName: normalize(payload.bankName),
          }),
        }
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to update business profile.");
      }
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your business information has been saved.",
      });
      setIsEditing(false);
      refetch();
    },
    onError: (mutationError: unknown) => {
      // Check if error is due to edit limit
      const errorMessage = mutationError instanceof Error ? mutationError.message : "Unable to update profile right now.";
      const isEditLimitError = errorMessage.includes("maximum limit") || errorMessage.includes("5 edits");
      
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
        duration: isEditLimitError ? 10000 : 5000, // Show longer if edit limit error
      });
      
      // Refetch profile to update edit count display
      if (isEditLimitError) {
        refetch();
      }
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (reason?: string) => {
      const response = await apiFetch<{ success: boolean; message?: string }>("/users/request-deletion", {
        method: "POST",
        body: JSON.stringify({ reason: reason || undefined }),
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to submit account deletion request");
      }

      return response;
    },
    onSuccess: () => {
      toast({
        title: "Request submitted",
        description: "Your account deletion request has been sent. Our team will process it shortly.",
      });
      setDeleteAccountDialogOpen(false);
      setDeleteReason("");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Unable to submit request right now.";
      toast({
        title: "Request failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate(deleteReason.trim() || undefined);
  };

  const handleDocumentUpload = async (type: VendorDocumentType, file: File) => {
    setUploadingDocs((prev) => ({ ...prev, [type]: true }));
    try {
      const token = localStorage.getItem("afrigos-token");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch(`${API_BASE_URL}/vendors/documents`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to upload document.");
      }

      toast({
        title: "Document uploaded",
        description: "Your document has been submitted and is pending review.",
      });
      refetch();
    } catch (uploadError: unknown) {
      toast({
        title: "Upload failed",
        description: uploadError instanceof Error ? uploadError.message : "Unable to upload document.",
        variant: "destructive",
      });
    } finally {
      setUploadingDocs((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleStripeOnboarding = async () => {
    setIsCreatingOnboardingLink(true);
    try {
      const response = await apiFetch<{
        success: boolean;
        data: { onboardingUrl: string; stripeAccountId: string };
        message?: string;
      }>("/vendors/stripe-onboarding", {
        method: "POST",
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to create Stripe onboarding link.");
      }

      // Redirect to Stripe onboarding
      window.location.href = response.data.onboardingUrl;
    } catch (error: unknown) {
      toast({
        title: "Onboarding failed",
        description: error instanceof Error ? error.message : "Unable to start Stripe onboarding.",
        variant: "destructive",
      });
      setIsCreatingOnboardingLink(false);
    }
  };

  const displayName = useMemo(() => {
    if (!profile) return "Vendor";
    if (profile.businessName?.trim()) return profile.businessName.trim();
    const first = profile.user.firstName ?? "";
    const last = profile.user.lastName ?? "";
    const fallback = `${first} ${last}`.trim();
    return fallback || profile.user.email;
  }, [profile]);

  const verificationStatus = profile?.verificationStatus ?? "PENDING";

  const stats = useMemo(() => {
    if (!profile) {
      return [
        { label: "Products", value: "0" },
        { label: "Orders", value: "0" },
        { label: "Reviews", value: "0" },
        { label: "Net Revenue", value: formatCurrency(0) },
      ];
    }

    return [
      { label: "Products", value: profile._count.products.toString() },
      { label: "Orders", value: profile._count.orders.toString() },
      { label: "Reviews", value: profile._count.reviews.toString() },
      {
        label: "Net Revenue",
        value: formatCurrency(profile.financialSummary?.totalNet ?? 0),
      },
    ];
  }, [profile]);

  const businessNameError = isEditing && !businessForm.businessName.trim();
  const businessTypeError = isEditing && !businessForm.businessType.trim();
  
  // Check if payment details editing is disabled due to edit limit
  const paymentDetailsEditLimitReached = profile?.stripePaymentDetailsEditCount !== undefined && 
                                         profile.stripePaymentDetailsEditCount >= 5;
  
  // Check if payment details are being changed (only when editing)
  const isChangingPaymentDetails = isEditing && (
    (businessForm.bankAccountNumber !== (profile?.bankAccountNumber || "")) ||
    (businessForm.bankRoutingNumber !== (profile?.bankRoutingNumber || "")) ||
    (businessForm.bankAccountHolderName !== (profile?.bankAccountHolderName || "")) ||
    (businessForm.bankName !== (profile?.bankName || ""))
  );
  
  // Check if user has any payment details filled (to determine if they're trying to edit payment details)
  const hasPaymentDetails = !!(profile?.bankAccountNumber || profile?.bankRoutingNumber || 
                               profile?.bankAccountHolderName || profile?.bankName);

  if (authLoading || isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
                    </div>
                  </div>
    );
  }

  if (error) {
    return (
          <Card>
            <CardHeader>
          <CardTitle>Unable to load profile</CardTitle>
          <CardDescription>{error instanceof Error ? error.message : "Please try again later."}</CardDescription>
            </CardHeader>
            <CardContent>
          <Button onClick={() => refetch()}>Retry</Button>
            </CardContent>
          </Card>
    );
  }

  if (!user?.vendorId || !profile) {
    return (
          <Card>
            <CardHeader>
          <CardTitle>Vendor profile unavailable</CardTitle>
          <CardDescription>
            We couldn’t find an active vendor profile for this account. Please contact support if you believe
            this is an error.
          </CardDescription>
            </CardHeader>
      </Card>
    );
  }

                  return (
    <div className="space-y-6">
      <Card className="border border-border shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-muted/40 rounded-t-xl">
                <div>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Store className="h-6 w-6 text-primary" />
              {displayName}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 pt-2">
              <span>{profile.user.email}</span>
              {profile.user.phone ? (
                <>
                  <span>•</span>
                  <span>{profile.user.phone}</span>
                </>
              ) : null}
            </CardDescription>
                </div>
          <div className="flex items-center gap-2">
            <Badge className={cn("capitalize", statusStyles[verificationStatus] ?? statusStyles.PENDING)}>
              {verificationStatus.toLowerCase()}
                      </Badge>
            <Button
              variant={isEditing ? "secondary" : "outline"}
              onClick={() => {
                if (!isEditing && paymentDetailsEditLimitReached && hasPaymentDetails) {
                  toast({
                    title: "Edit Limit Reached",
                    description: "You have reached the maximum limit of 5 edits for payment details. You can still edit other profile information, but payment details are locked. Please contact support to update your payment information.",
                    variant: "destructive",
                  });
                  return;
                }
                setIsEditing((prev) => !prev);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
            {isEditing && (
              <Button
                onClick={() => {
                  // Check if trying to change payment details when limit is reached
                  if (isChangingPaymentDetails && paymentDetailsEditLimitReached) {
                    toast({
                      title: "Edit Limit Reached",
                      description: "You have reached the maximum limit of 5 edits for payment details. Please contact support to update your payment information.",
                      variant: "destructive",
                    });
                    return;
                  }
                  updateBusinessMutation.mutate(businessForm);
                }}
                disabled={updateBusinessMutation.isPending || businessNameError || businessTypeError || (isChangingPaymentDetails && paymentDetailsEditLimitReached)}
              >
                {updateBusinessMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            )}
                </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4 pt-4">
          {stats.map((item) => (
            <Card key={item.label} className="border-muted/60 bg-muted/30">
              <CardHeader className="pb-2">
                <CardDescription>{item.label}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{item.value}</p>
            </CardContent>
          </Card>
          ))}
            </CardContent>
          </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
            <CardHeader>
            <CardTitle>Business details</CardTitle>
            <CardDescription>Keep your storefront information up to date.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Store name</label>
                  <Input
                  value={businessForm.businessName}
                  onChange={(event) =>
                    setBusinessForm((prev) => ({ ...prev, businessName: event.target.value }))
                  }
                    disabled={!isEditing}
                  placeholder="e.g. Mama Asha's Kitchen"
                  />
                {businessNameError && (
                  <p className="text-xs text-destructive mt-1">Store name is required.</p>
                )}
                </div>
                <div>
                <label className="text-sm font-medium">Business type</label>
                  <Select
                  value={businessForm.businessType || ""}
                  onValueChange={(value) => setBusinessForm((prev) => ({ ...prev, businessType: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                {businessTypeError && (
                  <p className="text-xs text-destructive mt-1">Business type is required.</p>
                )}
                </div>
                <div>
                <label className="text-sm font-medium">Business number</label>
                  <Input
                  value={businessForm.businessNumber}
                  onChange={(event) =>
                    setBusinessForm((prev) => ({ ...prev, businessNumber: event.target.value }))
                  }
                    disabled={!isEditing}
                  placeholder="Registration number"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tax ID</label>
                  <Input
                  value={businessForm.taxId}
                  onChange={(event) => setBusinessForm((prev) => ({ ...prev, taxId: event.target.value }))}
                    disabled={!isEditing}
                  placeholder="Tax identification"
                  />
                </div>
                <div>
                <label className="text-sm font-medium">Founded year</label>
                  <Input
                  value={businessForm.foundedYear}
                  onChange={(event) =>
                    setBusinessForm((prev) => ({ ...prev, foundedYear: event.target.value }))
                  }
                    disabled={!isEditing}
                  placeholder="e.g. 2022"
                  />
                </div>
                <div>
                <label className="text-sm font-medium">Employees</label>
                  <Select
                  value={businessForm.employees || ""}
                  onValueChange={(value) => setBusinessForm((prev) => ({ ...prev, employees: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_RANGES.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                <label className="text-sm font-medium">Annual revenue</label>
                  <Select
                  value={businessForm.revenue || ""}
                  onValueChange={(value) => setBusinessForm((prev) => ({ ...prev, revenue: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      {REVENUE_RANGES.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Website</label>
                  <Input
                  value={businessForm.website}
                  onChange={(event) =>
                    setBusinessForm((prev) => ({ ...prev, website: event.target.value }))
                  }
                    disabled={!isEditing}
                  placeholder="https://yourstore.com"
                  />
                </div>
              </div>
              <div>
              <label className="text-sm font-medium">Store description</label>
                <Textarea
                value={businessForm.description}
                onChange={(event) =>
                  setBusinessForm((prev) => ({ ...prev, description: event.target.value }))
                }
                  disabled={!isEditing}
                  rows={4}
                placeholder="Tell customers about your products and story."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
            <CardTitle>Contact information</CardTitle>
            <CardDescription>How customers and AfriGos can reach you.</CardDescription>
            </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                {isEditing ? (
                  <Input
                    value={businessForm.firstName}
                    onChange={(event) =>
                      setBusinessForm((prev) => ({ ...prev, firstName: event.target.value }))
                    }
                    placeholder="First name"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.user.firstName || "Not provided"}</span>
                </div>
                )}
                </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                {isEditing ? (
                  <Input
                    value={businessForm.lastName}
                    onChange={(event) =>
                      setBusinessForm((prev) => ({ ...prev, lastName: event.target.value }))
                    }
                    placeholder="Last name"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.user.lastName || "Not provided"}</span>
                </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{profile.user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {isEditing ? (
                  <Input
                  value={businessForm.phone}
                  onChange={(event) =>
                    setBusinessForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  placeholder="Business contact number"
                />
              ) : (
                <span>{profile.user.phone || "Not provided"}</span>
              )}
                </div>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-muted-foreground">Business addresses</p>
              {profile.user.addresses && profile.user.addresses.length > 0 ? (
                profile.user.addresses.map((address) => (
                  <div
                    key={address.id}
                    className={cn(
                      "rounded-lg border p-3 text-sm space-y-1",
                      address.isDefault ? "border-primary/40 bg-primary/5" : "border-border"
                    )}
                  >
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{address.type.toLowerCase()} address</span>
                      {address.isDefault && (
                        <Badge variant="outline" className="text-xs text-primary border-primary/40">
                          Default
                        </Badge>
                      )}
                </div>
                    <p>
                      {address.street}
                      <br />
                      {address.city}, {address.state}
                      <br />
                      {address.postalCode}, {address.country}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No business addresses on file yet. Add one from your account settings.
                </p>
              )}
              </div>
            </CardContent>
          </Card>
      </div>

            <Card>
              <CardHeader>
          <div className="flex items-center justify-between">
                <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Stripe Payment Credentials
              </CardTitle>
              <CardDescription>
                Add your banking details to receive payouts via Stripe Connect. This information is encrypted and secure.
              </CardDescription>
                </div>
            {!isEditing && profile?.stripeAccountStatus && (
              <Badge
                className={
                  profile.stripeAccountStatus === "verified"
                    ? "bg-green-100 text-green-700 border-green-200"
                    : profile.stripeAccountStatus === "pending"
                    ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                    : "bg-red-100 text-red-700 border-red-200"
                }
              >
                {profile.stripeAccountStatus === "verified" ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </>
                ) : profile.stripeAccountStatus === "pending" ? (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Pending
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    {profile.stripeAccountStatus}
                  </>
                )}
              </Badge>
            )}
                </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.stripeAccountId && (
            <div className="rounded-md bg-blue-50 border border-blue-200 p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-900">Stripe Account ID</p>
                  <p className="text-xs text-blue-700 mt-1">
                    <code className="bg-blue-100 px-2 py-1 rounded font-mono text-sm">{profile.stripeAccountId}</code>
                  </p>
                  {profile.stripeAccountStatus && (
                    <p className="text-xs text-blue-600 mt-2">
                      Status: <span className="font-semibold capitalize">{profile.stripeAccountStatus}</span>
                    </p>
                  )}
                  {profile.stripeAccountStatus !== "verified" && !isEditing && (
                    <p className="text-xs text-blue-700 mt-2">
                      Complete Stripe onboarding to enable automatic payouts.
                    </p>
                  )}
                </div>
                {!isEditing && profile.stripeAccountStatus !== "verified" && (
                  <Button
                    onClick={handleStripeOnboarding}
                    disabled={isCreatingOnboardingLink}
                    variant="outline"
                    size="sm"
                  >
                    {isCreatingOnboardingLink ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Complete Onboarding
                      </>
                    )}
                  </Button>
                )}
                </div>
                  </div>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Account Holder Name</label>
              <Input
                value={businessForm.bankAccountHolderName}
                onChange={(event) =>
                  setBusinessForm((prev) => ({ ...prev, bankAccountHolderName: event.target.value }))
                }
                disabled={!isEditing || paymentDetailsEditLimitReached}
                placeholder="John Doe"
                className="mt-1"
                  />
                </div>
            <div>
              <label className="text-sm font-medium">Bank Name</label>
              <Input
                value={businessForm.bankName}
                onChange={(event) =>
                  setBusinessForm((prev) => ({ ...prev, bankName: event.target.value }))
                }
                disabled={!isEditing || paymentDetailsEditLimitReached}
                placeholder="e.g. Barclays Bank"
                className="mt-1"
                  />
                </div>
            <div>
              <label className="text-sm font-medium">Bank Account Number</label>
              {isEditing ? (
                <Input
                  type="text"
                  value={businessForm.bankAccountNumber}
                  onChange={(event) =>
                    setBusinessForm((prev) => ({ ...prev, bankAccountNumber: event.target.value }))
                  }
                  disabled={paymentDetailsEditLimitReached}
                  placeholder="12345678"
                  className="mt-1"
                />
              ) : (
                <div className="mt-1 p-2 border rounded-md bg-muted/50">
                  {businessForm.bankAccountNumber
                    ? `••••${businessForm.bankAccountNumber.slice(-4)}`
                    : "Not provided"}
                </div>
              )}
                  </div>
            <div>
              <label className="text-sm font-medium">Routing Number / Sort Code</label>
              <Input
                type="text"
                value={businessForm.bankRoutingNumber}
                onChange={(event) =>
                  setBusinessForm((prev) => ({ ...prev, bankRoutingNumber: event.target.value }))
                }
                disabled={!isEditing || paymentDetailsEditLimitReached}
                placeholder="12-34-56 or 123456"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                UK: Sort code (e.g., 12-34-56) | US: Routing number (9 digits)
              </p>
                </div>
                  </div>
          {!isEditing && (
            <div className="rounded-md bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
              <p className="font-semibold mb-2">Stripe Connect Integration</p>
              <p className="mb-2">
                Your banking information is securely stored and encrypted. When you save your bank details, a Stripe Connect account is automatically created.
              </p>
              {profile?.stripeAccountStatus === "verified" ? (
                <p className="text-xs text-blue-700">
                  <strong>✓ Account Verified:</strong> Your Stripe account is verified and ready for automatic payouts. You can now withdraw earnings directly to your bank account.
                </p>
              ) : profile?.stripeAccountId ? (
                <p className="text-xs text-blue-700">
                  <strong>Action Required:</strong> Complete Stripe onboarding to enable automatic payouts. Click the "Complete Onboarding" button above to get started.
                </p>
              ) : (
                <p className="text-xs text-blue-700">
                  <strong>Getting Started:</strong> Add your bank details below and save to automatically create a Stripe Connect account. Then complete the onboarding process to enable payouts.
                </p>
              )}
              {/* Edit Count Display */}
              {profile?.stripePaymentDetailsEditCount !== undefined && (
                <div className="mt-3 pt-3 border-t border-blue-300">
                  <p className="text-xs text-blue-700">
                    <strong>Payment Details Edits:</strong> You have used {profile.stripePaymentDetailsEditCount} of 5 allowed edits.
                    {profile.stripePaymentDetailsEditCount >= 5 ? (
                      <span className="block mt-1 text-red-700 font-semibold">
                        ⚠️ You have reached the maximum edit limit. Please contact support to update your payment information.
                      </span>
                    ) : profile.stripePaymentDetailsEditCount >= 3 ? (
                      <span className="block mt-1 text-amber-700 font-semibold">
                        ⚠️ You have {5 - profile.stripePaymentDetailsEditCount} edit(s) remaining. Please verify your details carefully.
                      </span>
                    ) : (
                      <span className="block mt-1 text-blue-600">
                        {5 - profile.stripePaymentDetailsEditCount} edit(s) remaining.
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
          {isEditing && (
            <div className="space-y-3">
              <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
                <p className="font-semibold mb-2">Important Information:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>When you save your bank details, a Stripe Connect account will be automatically created.</li>
                  <li>After saving, you'll need to complete Stripe onboarding to verify your account.</li>
                  <li>Once verified, you can withdraw earnings directly to your bank account.</li>
                  <li><strong>Example UK Bank Details:</strong> Account Number: 12345678 (8 digits), Sort Code: 20-45-67 (format: XX-XX-XX)</li>
                </ul>
              </div>
              {/* Edit Count Warning */}
              {profile?.stripePaymentDetailsEditCount !== undefined && (
                <div className={`rounded-md border p-4 text-sm ${
                  profile.stripePaymentDetailsEditCount >= 5
                    ? "bg-red-50 border-red-200 text-red-800"
                    : profile.stripePaymentDetailsEditCount >= 3
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-blue-50 border-blue-200 text-blue-800"
                }`}>
                  <p className="font-semibold mb-1">
                    {profile.stripePaymentDetailsEditCount >= 5 ? (
                      <>⚠️ Maximum Edit Limit Reached</>
                    ) : (
                      <>Payment Details Edit Limit</>
                    )}
                  </p>
                  <p className="text-xs">
                    {profile.stripePaymentDetailsEditCount >= 5 ? (
                      <>
                        You have reached the maximum limit of 5 edits for Stripe payment details. 
                        Your payment details are now locked. Please contact support if you need to update your payment information.
                      </>
                    ) : (
                      <>
                        You have used <strong>{profile.stripePaymentDetailsEditCount} of 5</strong> allowed edits for payment details.
                        {profile.stripePaymentDetailsEditCount >= 3 && (
                          <span className="block mt-1 font-semibold">
                            ⚠️ Only {5 - profile.stripePaymentDetailsEditCount} edit(s) remaining. Please verify all details carefully before saving.
                          </span>
                        )}
                        {profile.stripePaymentDetailsEditCount < 3 && (
                          <span className="block mt-1">
                            {5 - profile.stripePaymentDetailsEditCount} edit(s) remaining.
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
          <CardTitle>Verification documents</CardTitle>
          <CardDescription>Upload official documents to verify your business.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
          {DOCUMENT_REQUIREMENTS.map(({ type, label }) => {
            const existing = profile.documents.find((doc) => doc.type === type);
            const isUploading = uploadingDocs[type];

            return (
              <div
                key={type}
                className="flex flex-col gap-3 rounded-md border border-dashed border-border/70 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">
                    {existing
                      ? `Uploaded ${formatDate(existing.uploadedAt)}`
                      : "Required for vendor verification."}
                  </p>
                  {existing ? (
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          "capitalize",
                          documentStatusStyles[existing.status] ?? documentStatusStyles.PENDING
                        )}
                      >
                        {existing.status.toLowerCase()}
                    </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={existing.url} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          View document
                        </a>
                    </Button>
                  </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={(el) => {
                      fileInputRefs.current[type] = el;
                    }}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden="true"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        handleDocumentUpload(type, file);
                      }
                      event.target.value = "";
                    }}
                    disabled={isUploading}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => fileInputRefs.current[type]?.click()}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        {existing ? "Replace" : "Upload"}
                      </>
                    )}
                  </Button>
                </div>
                  </div>
            );
          })}
              </CardContent>
            </Card>

      {profile.financialSummary ? (
            <Card>
              <CardHeader>
            <CardTitle>Financial summary</CardTitle>
            <CardDescription>Lifetime performance across AfriGos.</CardDescription>
              </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase text-muted-foreground">Gross revenue</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {formatCurrency(profile.financialSummary.totalGross)}
              </p>
                        </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase text-muted-foreground">Commission paid</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {formatCurrency(profile.financialSummary.totalCommission)}
              </p>
                        </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase text-muted-foreground">Net earnings</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {formatCurrency(profile.financialSummary.totalNet)}
              </p>
                      </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs uppercase text-muted-foreground">Pending order value</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {formatCurrency(profile.financialSummary.pendingOrderValue)}
              </p>
                </div>
              </CardContent>
            </Card>
      ) : null}

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Account Deletion
              </CardTitle>
              <CardDescription>
                Request to permanently delete your account. This action cannot be undone and will affect all your products, orders, and earnings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setDeleteAccountDialogOpen(true)}
                className="w-full sm:w-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Request Account Deletion
              </Button>
            </CardContent>
          </Card>
        </div>

        <Dialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Request Account Deletion
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to request account deletion? This will send a request to our team. 
                Your account, products, orders, and earnings will be permanently deleted after review.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="delete-reason" className="text-sm font-medium">
                  Reason (optional)
                </Label>
                <Textarea
                  id="delete-reason"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Please let us know why you're leaving..."
                  rows={4}
                />
              </div>

              <div className="rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
                <strong>Warning:</strong> This action will permanently delete your vendor account, all products, orders history, earnings, and all associated data.
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteAccountDialogOpen(false);
                  setDeleteReason("");
                }}
                disabled={deleteAccountMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteAccountMutation.isPending}
              >
                {deleteAccountMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
    </div>
  );
}

export default VendorProfile;

