import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

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
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Request Account Deletion
          </CardTitle>
          <CardDescription>
            Request to permanently delete your AfriGos account. Our team will process your request shortly.
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
                Enter the email address associated with your account
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

            <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
              <strong>Warning:</strong> This action will permanently delete your account, orders history, and all associated data. This cannot be undone.
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
    </div>
  );
};

export default DeleteAccount;

