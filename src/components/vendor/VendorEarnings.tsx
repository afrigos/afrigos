import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DollarSign, 
  TrendingUp, 
  Download,
  RefreshCw,
  Calendar,
  Wallet,
  ArrowUpRight,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Receipt,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

type Earning = {
  id: string;
  amount: number;
  commission: number;
  netAmount: number;
  status: "PENDING" | "PROCESSING" | "PAID" | "FAILED";
  paidAt: string | null;
  movedToWithdrawal: boolean;
  movedToWithdrawalAt: string | null;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    createdAt: string;
    status: string;
  };
};

type EarningsResponse = {
  success: boolean;
  data: {
    earnings: Earning[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    summary: {
      totalEarnings: number;
      totalCommission: number;
      totalNetAmount: number;
      pendingEarnings: number; // Earnings not yet 48 hours old
      withdrawalBalance: number; // Available for withdrawal
      availableForWithdrawal: number; // Historical total moved to withdrawal
    };
  };
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case "PAID":
      return { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Paid" };
    case "PENDING":
      return { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Pending" };
    case "PROCESSING":
      return { color: "bg-blue-100 text-blue-800", icon: Clock, label: "Processing" };
    case "FAILED":
      return { color: "bg-red-100 text-red-800", icon: AlertTriangle, label: "Failed" };
    default:
      return { color: "bg-gray-100 text-gray-800", icon: Clock, label: status };
  }
};

export function VendorEarnings() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [withdrawalDialogOpen, setWithdrawalDialogOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");

  const {
    data: earningsData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<EarningsResponse>({
    queryKey: ["vendor-earnings", page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (statusFilter !== "all") {
        params.append("status", statusFilter.toUpperCase());
      }
      const response = await apiFetch<EarningsResponse>(`/vendors/earnings?${params}`);
      if (!response.success || !response.data) {
        throw new Error("Failed to fetch earnings");
      }
      return response;
    },
    enabled: !!user?.vendorId && !authLoading,
    refetchInterval: 120000, // Refetch every 2 minutes
  });

  const withdrawalMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiFetch<{
        success: boolean;
        message?: string;
        data?: {
          amount: number;
          remainingBalance: number;
          status: string;
          transferId?: string;
          estimatedArrival?: string;
        };
        requiresOnboarding?: boolean;
        stripeAccountId?: string;
      }>("/vendors/withdraw", {
        method: "POST",
        body: JSON.stringify({ amount }),
      });
      if (!response.success) {
        // Create an error object that preserves the response data
        const error = new Error(response.message || "Failed to process withdrawal") as Error & {
          response?: { data?: { requiresOnboarding?: boolean; stripeAccountId?: string } };
        };
        error.response = { data: response };
        throw error;
      }
      return response.data;
    },
    onSuccess: (data) => {
      const transferInfo = data?.transferId 
        ? ` Transfer ID: ${data.transferId}.`
        : "";
      const arrivalInfo = data?.estimatedArrival 
        ? ` Funds should arrive in your bank account within ${data.estimatedArrival}.`
        : "";
      
      toast({
        title: "Withdrawal Processed Successfully",
        description: `Your withdrawal request of ${formatCurrency(
          data?.amount || 0
        )} has been processed via Stripe Connect.${transferInfo}${arrivalInfo}`,
      });
      setWithdrawalDialogOpen(false);
      setWithdrawalAmount("");
      queryClient.invalidateQueries({ queryKey: ["vendor-earnings"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-profile"] });
    },
    onError: (error: Error & { response?: { data?: { requiresOnboarding?: boolean } } }) => {
      // Check if error response contains onboarding requirement
      const errorMessage = error.message || "Failed to process withdrawal request.";
      const requiresOnboarding = error?.response?.data?.requiresOnboarding;
      
      // Show toast with error message
      toast({
        title: "Withdrawal Failed",
        description: requiresOnboarding 
          ? `${errorMessage} Please complete Stripe onboarding in your profile to enable withdrawals.`
          : errorMessage,
        variant: "destructive",
        duration: requiresOnboarding ? 10000 : 5000,
      });
      
      // If onboarding is required, redirect to profile after a short delay
      if (requiresOnboarding) {
        setTimeout(() => {
          navigate("/vendor/profile");
        }, 2000);
      }
    },
  });

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount.",
        variant: "destructive",
      });
      return;
    }
    withdrawalMutation.mutate(amount);
  };

  const summary = earningsData?.data?.summary;
  const earnings = earningsData?.data?.earnings || [];
  const pagination = earningsData?.data?.pagination;

  if (authLoading || isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user?.vendorId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Earnings Unavailable</CardTitle>
          <CardDescription>You need to be logged in as a vendor to view earnings.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Earnings & Payouts</h1>
          <p className="text-muted-foreground">Track your earnings, commissions, and withdrawal balance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary?.totalEarnings || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime gross earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(summary?.pendingEarnings || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.pendingEarnings ? "Processing..." : "All processed"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Withdrawal Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary?.withdrawalBalance || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Available for withdrawal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary?.totalCommission || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Platform fees paid</p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Balance Card */}
      {summary && summary.withdrawalBalance > 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-green-600" />
              Withdrawal Available
            </CardTitle>
            <CardDescription>You have funds available for withdrawal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(summary.withdrawalBalance)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This amount is available for immediate withdrawal to your bank account.
                </p>
              </div>
              <Button
                onClick={() => setWithdrawalDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Request Withdrawal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Earnings Table */}
          <Card>
            <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Earnings History</CardTitle>
              <CardDescription>Your earnings from completed orders</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
            </CardHeader>
            <CardContent>
          {earnings.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No earnings found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Gross Amount</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Net Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Withdrawal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {earnings.map((earning) => {
                      const statusInfo = getStatusInfo(earning.status);
                      const StatusIcon = statusInfo.icon;
                      return (
                        <TableRow key={earning.id}>
                          <TableCell className="font-medium">{earning.order.orderNumber}</TableCell>
                          <TableCell>{formatDate(earning.createdAt)}</TableCell>
                          <TableCell>{formatCurrency(Number(earning.amount))}</TableCell>
                          <TableCell className="text-red-600">
                            -{formatCurrency(Number(earning.commission))}
                          </TableCell>
                          <TableCell className="font-bold">{formatCurrency(Number(earning.netAmount))}</TableCell>
                          <TableCell>
                            <Badge className={statusInfo.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {earning.movedToWithdrawal ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Available
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {pagination && pagination.pages > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
              </CardContent>
            </Card>

      {/* Withdrawal Dialog */}
      <Dialog open={withdrawalDialogOpen} onOpenChange={setWithdrawalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>
              Withdraw funds directly to your bank account via Stripe Connect. Funds will be transferred securely.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="withdrawal-amount">Amount</Label>
              <Input
                id="withdrawal-amount"
                type="number"
                step="0.01"
                min="0.01"
                max={summary?.withdrawalBalance || 0}
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-sm text-muted-foreground">
                Available balance: <span className="font-semibold">{formatCurrency(summary?.withdrawalBalance || 0)}</span>
              </p>
            </div>
            {summary && summary.withdrawalBalance === 0 && (
              <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800">
                <AlertTriangle className="h-4 w-4 inline mr-2" />
                You don't have any funds available for withdrawal. Earnings become available immediately after order completion.
              </div>
            )}
            <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
              <p className="font-semibold mb-1">Stripe Connect Payout</p>
              <p className="text-xs">
                Your withdrawal will be processed through Stripe Connect and transferred directly to your bank account. 
                Funds typically arrive within 1-2 business days. You'll receive a transfer ID for tracking.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawalDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={withdrawalMutation.isPending || !withdrawalAmount || parseFloat(withdrawalAmount) <= 0}
            >
              {withdrawalMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Process Withdrawal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
