import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Loader2, Database, CheckCircle, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const DeleteData = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [dataTypes, setDataTypes] = useState({
    orderHistory: false,
    addresses: false,
    reviews: false,
    wishlists: false,
    preferences: false,
    all: false,
  });
  const [reason, setReason] = useState("");

  const deleteDataMutation = useMutation({
    mutationFn: async ({ 
      email, 
      dataTypes, 
      reason 
    }: { 
      email: string; 
      dataTypes: typeof dataTypes; 
      reason?: string 
    }) => {
      const response = await apiFetch<{ success: boolean; message?: string }>(
        "/users/request-deletion-public",
        {
          method: "POST",
          body: JSON.stringify({ 
            email, 
            reason: `Data Deletion Request - Types: ${Object.entries(dataTypes)
              .filter(([_, selected]) => selected)
              .map(([key]) => key)
              .join(", ")}. ${reason || ""}`.trim() || undefined 
          }),
        }
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to submit data deletion request");
      }

      return response;
    },
    onSuccess: () => {
      toast({
        title: "Request submitted",
        description: "Your data deletion request has been sent. Our team will process it shortly.",
      });
      setEmail("");
      setDataTypes({
        orderHistory: false,
        addresses: false,
        reviews: false,
        wishlists: false,
        preferences: false,
        all: false,
      });
      setReason("");
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

  const handleDataTypeChange = (type: keyof typeof dataTypes) => {
    if (type === "all") {
      const newValue = !dataTypes.all;
      setDataTypes({
        orderHistory: newValue,
        addresses: newValue,
        reviews: newValue,
        wishlists: newValue,
        preferences: newValue,
        all: newValue,
      });
    } else {
      setDataTypes((prev) => {
        const updated = { ...prev, [type]: !prev[type] };
        // Update "all" checkbox based on whether all others are selected
        updated.all = 
          updated.orderHistory &&
          updated.addresses &&
          updated.reviews &&
          updated.wishlists &&
          updated.preferences;
        return updated;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    const hasSelection = Object.values(dataTypes).some((selected) => selected);
    if (!hasSelection) {
      toast({
        title: "Selection required",
        description: "Please select at least one type of data to delete.",
        variant: "destructive",
      });
      return;
    }

    deleteDataMutation.mutate({ 
      email: email.trim(), 
      dataTypes, 
      reason: reason.trim() || undefined 
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Delete Your Data from AfriGos</h1>
        <p className="text-muted-foreground">
          Request deletion of specific data without deleting your account
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Step 1</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Enter your account email address
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Step 2</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Select the types of data you want to delete
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Step 3</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Submit your request - we'll process it within 7 business days
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Request Data Deletion
          </CardTitle>
          <CardDescription>
            Select which types of data you'd like to delete from your AfriGos account. Your account will remain active.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={deleteDataMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Enter the email address associated with your AfriGos account
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label className="text-sm font-medium">Select Data to Delete</Label>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="all"
                    checked={dataTypes.all}
                    onCheckedChange={() => handleDataTypeChange("all")}
                    disabled={deleteDataMutation.isPending}
                  />
                  <div className="flex-1">
                    <Label htmlFor="all" className="font-medium cursor-pointer">
                      Delete All Personal Data
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Remove all personal data while keeping your account active
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="orderHistory"
                    checked={dataTypes.orderHistory}
                    onCheckedChange={() => handleDataTypeChange("orderHistory")}
                    disabled={deleteDataMutation.isPending || dataTypes.all}
                  />
                  <div className="flex-1">
                    <Label htmlFor="orderHistory" className="font-medium cursor-pointer">
                      Order History
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Delete all past order records and transaction history
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="addresses"
                    checked={dataTypes.addresses}
                    onCheckedChange={() => handleDataTypeChange("addresses")}
                    disabled={deleteDataMutation.isPending || dataTypes.all}
                  />
                  <div className="flex-1">
                    <Label htmlFor="addresses" className="font-medium cursor-pointer">
                      Saved Addresses
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Remove all saved shipping and billing addresses
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="reviews"
                    checked={dataTypes.reviews}
                    onCheckedChange={() => handleDataTypeChange("reviews")}
                    disabled={deleteDataMutation.isPending || dataTypes.all}
                  />
                  <div className="flex-1">
                    <Label htmlFor="reviews" className="font-medium cursor-pointer">
                      Reviews & Ratings
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Delete all product reviews and ratings you've submitted
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="wishlists"
                    checked={dataTypes.wishlists}
                    onCheckedChange={() => handleDataTypeChange("wishlists")}
                    disabled={deleteDataMutation.isPending || dataTypes.all}
                  />
                  <div className="flex-1">
                    <Label htmlFor="wishlists" className="font-medium cursor-pointer">
                      Wishlists & Favorites
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Remove all saved items, wishlists, and favorites
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="preferences"
                    checked={dataTypes.preferences}
                    onCheckedChange={() => handleDataTypeChange("preferences")}
                    disabled={deleteDataMutation.isPending || dataTypes.all}
                  />
                  <div className="flex-1">
                    <Label htmlFor="preferences" className="font-medium cursor-pointer">
                      Preferences & Settings
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Reset account preferences and notification settings
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                Reason (optional)
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please let us know why you're requesting data deletion..."
                rows={4}
                disabled={deleteDataMutation.isPending}
              />
            </div>

            <Separator />

            <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-blue-900">What Happens Next?</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-800 ml-2">
                    <li>Your account will remain active - only the selected data will be deleted</li>
                    <li>We'll process your request within 7 business days</li>
                    <li>You'll receive a confirmation email once the deletion is complete</li>
                    <li>Some data may be retained for legal or security purposes as required by law</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="submit"
                variant="default"
                disabled={deleteDataMutation.isPending || !email.trim()}
                className="w-full sm:w-auto"
              >
                {deleteDataMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Submit Data Deletion Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            If you have questions about data deletion or need assistance, please contact our support team:
          </p>
          <a href="mailto:enquiries@afrigos.com" className="text-primary hover:underline text-sm">
            enquiries@afrigos.com
          </a>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteData;

