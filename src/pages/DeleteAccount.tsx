import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2, Trash2, CheckCircle, XCircle, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const DeleteAccount = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");

  const deleteAccountMutation = useMutation({
    mutationFn: async ({ email, reason }: { email: string; reason?: string }) => {
      const response = await apiFetch<{ success: boolean; message?: string }>(
        "/users/request-deletion-public",
        {
          method: "POST",
          body: JSON.stringify({ email, reason: reason || undefined }),
        }
      );

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
      setEmail("");
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
    deleteAccountMutation.mutate({ email: email.trim(), reason: reason.trim() || undefined });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Delete Your AfriGos Account</h1>
        <p className="text-muted-foreground">
          Request permanent deletion of your AfriGos account and associated data
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Step 1</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Enter your account email address below
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Step 2</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Optionally provide a reason for leaving
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

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Request Account Deletion
          </CardTitle>
          <CardDescription>
            Request to permanently delete your AfriGos account. Our team will process your request within 7 business days.
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
                disabled={deleteAccountMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Enter the email address associated with your AfriGos account
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                Reason (optional)
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please let us know why you're leaving..."
                rows={4}
                disabled={deleteAccountMutation.isPending}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">What Gets Deleted</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-medium">Account Information</p>
                      <p className="text-sm text-muted-foreground">Email, name, phone, profile data</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-medium">Order History</p>
                      <p className="text-sm text-muted-foreground">All past orders and transaction records</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-medium">Addresses & Preferences</p>
                      <p className="text-sm text-muted-foreground">Saved addresses and account settings</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-medium">Reviews & Ratings</p>
                      <p className="text-sm text-muted-foreground">All product reviews you've written</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-medium">Wishlists & Favorites</p>
                      <p className="text-sm text-muted-foreground">Saved items and wishlists</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-medium">Vendor Data (if applicable)</p>
                      <p className="text-sm text-muted-foreground">Products, earnings, and vendor profile</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">What We Keep</h3>
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-amber-900">Legal & Financial Records</p>
                    <p className="text-amber-800">
                      We may retain certain information as required by law or for legitimate business purposes, including:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-amber-800 ml-2">
                      <li>Transaction records for tax and accounting purposes (retained for 7 years as required by UK law)</li>
                      <li>Fraud prevention and security logs</li>
                      <li>Dispute resolution records</li>
                      <li>Anonymized analytics data (no personal identifiers)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Important: This action cannot be undone</p>
                  <p>
                    Once your account is deleted, you will not be able to recover any of your data, order history, or account information. 
                    If you have pending orders, please wait until they are completed before requesting deletion.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="submit"
                variant="destructive"
                disabled={deleteAccountMutation.isPending || !email.trim()}
                className="w-full sm:w-auto"
              >
                {deleteAccountMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Submit Deletion Request
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
            If you have questions about account deletion or need assistance, please contact our support team:
          </p>
          <a href="mailto:enquiries@afrigos.com" className="text-primary hover:underline text-sm">
            enquiries@afrigos.com
          </a>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteAccount;
