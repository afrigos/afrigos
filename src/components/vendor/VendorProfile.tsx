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
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api-config";
import { Pagination } from "@/components/ui/pagination";

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
};

export function VendorProfile() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [businessForm, setBusinessForm] = useState<BusinessFormState>(initialBusinessForm);
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const {
    data: profile,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["vendor-profile"],
    enabled: !!user?.vendorId,
    queryFn: async () => {
      const result = await apiFetch<{ success: boolean; data: VendorProfileApi }>("/vendors/profile");
      if (!result.success || !result.data) {
        throw new Error(result.message || "Unable to fetch vendor profile.");
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
      });
    }
  }, [profile]);

  const updateBusinessMutation = useMutation({
    mutationFn: async (payload: BusinessFormState) => {
      const response = await apiFetch<{ success: boolean; message?: string }>(
        "/vendors/profile",
        {
          method: "POST",
          body: JSON.stringify({
            businessName: payload.businessName,
            businessType: payload.businessType,
            businessNumber: payload.businessNumber || null,
            taxId: payload.taxId || null,
            description: payload.description || null,
            website: payload.website || null,
            foundedYear: payload.foundedYear || null,
            employees: payload.employees || null,
            revenue: payload.revenue || null,
            phone: payload.phone || null,
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
    onError: (mutationError: any) => {
      toast({
        title: "Update failed",
        description:
          mutationError instanceof Error ? mutationError.message : "Unable to update profile right now.",
        variant: "destructive",
      });
    },
  });

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
    } catch (uploadError: any) {
      toast({
        title: "Upload failed",
        description: uploadError instanceof Error ? uploadError.message : "Unable to upload document.",
        variant: "destructive",
      });
    } finally {
      setUploadingDocs((prev) => ({ ...prev, [type]: false }));
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
              onClick={() => setIsEditing((prev) => !prev)}
            >
              <Edit className="mr-2 h-4 w-4" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
            {isEditing && (
              <Button
                onClick={() => updateBusinessMutation.mutate(businessForm)}
                disabled={updateBusinessMutation.isPending || businessNameError || businessTypeError}
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
    </div>
  );
}

export default VendorProfile;

