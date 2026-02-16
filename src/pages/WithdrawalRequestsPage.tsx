import { useState, useEffect } from "react";
import {
  paymentService,
  type WithdrawalRequest,
  type WithdrawalFilterParams,
} from "@/services/paymentService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
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
} from "@/components/ui/table.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { toast } from "sonner";
import {
  Loader2,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  FileX,
} from "lucide-react";
import { motion } from "motion/react";

const WithdrawalRequestsPage = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [filters, setFilters] = useState<WithdrawalFilterParams>({
    Page: 1,
    PageSize: 20,
    Status: "Pending", // Default filter
  });

  // Action Dialog State
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Data for Actions
  const [actionFormData, setActionFormData] = useState({
    reason: "",
    adminNotes: "",
    transactionId: "",
  });

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiFilters = { ...filters };
      if (apiFilters.Status === "all") {
        delete (apiFilters as any).Status;
      }
      const data = await paymentService.getWithdrawals(apiFilters);
      setWithdrawals(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      if (err.response) {
        if (err.response.status === 404) {
          setError("No withdrawal requests found matching your criteria.");
          setWithdrawals([]); // Ensure list is empty
        } else if (err.response.status === 500) {
          setError("Server error occurred while fetching requests. Please try again later.");
        } else {
          setError("Failed to load withdrawal requests.");
        }
      } else {
        setError("Network error. Please check your connection.");
      }
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [filters]); // Refetch when filters change

  // --- Filter Handlers ---

  const handleFilterChange = (key: keyof WithdrawalFilterParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, Page: 1 })); // Reset to page 1 on filter change
  };

  // --- Action Handlers ---

  const openApproveDialog = (request: WithdrawalRequest) => {
    setSelectedRequest(request);
    setActionFormData({ reason: "Approved", adminNotes: "", transactionId: "" });
    setIsApproveOpen(true);
  };

  const openRejectDialog = (request: WithdrawalRequest) => {
    setSelectedRequest(request);
    setActionFormData({ reason: "", adminNotes: "", transactionId: "" });
    setIsRejectOpen(true);
  };

  const handleApproveSubmit = async () => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    try {
      await paymentService.approveWithdrawal(selectedRequest.id, {
        isApproved: true,
        reason: actionFormData.reason,
        adminNotes: actionFormData.adminNotes,
        transactionId: actionFormData.transactionId,
      });
      toast.success("Withdrawal approved successfully");
      setIsApproveOpen(false);
      fetchWithdrawals();
    } catch (error) {
      toast.error("Failed to approve withdrawal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedRequest) return;
    setIsSubmitting(true);
    try {
      await paymentService.rejectWithdrawal(selectedRequest.id, {
        isApproved: false,
        reason: actionFormData.reason,
        adminNotes: actionFormData.adminNotes,
        transactionId: actionFormData.transactionId, // Passing empty/placeholder as per schema
      });
      toast.success("Withdrawal rejected successfully");
      setIsRejectOpen(false);
      fetchWithdrawals();
    } catch (error) {
      toast.error("Failed to reject withdrawal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
      case "Completed":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Approved</Badge>;
      case "Pending":
      case "Processing":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">Pending</Badge>;
      case "Rejected":
      case "Failed":
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <title>Admin - Withdrawals</title>
      <div className="p-8 space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Withdrawal Requests
          </h2>
          <p className="text-muted-foreground">
            Manage payout requests from marketers.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          {/* Sidebar Filters */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Filter className="w-4 h-4" /> Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.Status}
                  onValueChange={(val: string) => handleFilterChange("Status", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <Input
                  type="date"
                  placeholder="Start Date"
                  value={filters.StartDate || ""}
                  onChange={(e) => handleFilterChange("StartDate", e.target.value)}
                />
                <Input
                  type="date"
                  placeholder="End Date"
                  value={filters.EndDate || ""}
                  onChange={(e) => handleFilterChange("EndDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Amount Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.MinAmount || ""}
                    onChange={(e) => handleFilterChange("MinAmount", e.target.value ? Number(e.target.value) : undefined)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.MaxAmount || ""}
                    onChange={(e) => handleFilterChange("MaxAmount", e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Marketer ID</Label>
                <Input
                  type="number"
                  placeholder="ID"
                  value={filters.MarketerId || ""}
                  onChange={(e) => handleFilterChange("MarketerId", e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <Button variant="outline" className="w-full" onClick={() => setFilters({ Page: 1, PageSize: 20, Status: "Pending" })}>
                Reset Filters
              </Button>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-20 bg-muted/10 rounded-lg border border-dashed">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex flex-col items-center justify-center py-20 bg-destructive/5 rounded-lg border border-destructive/20 text-center p-8">
                  {error.includes("No withdrawal requests") ? (
                    <FileX className="w-12 h-12 text-muted-foreground mb-4" />
                  ) : (
                    <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                  )}
                  <h3 className="text-lg font-semibold text-foreground">{error}</h3>
                  <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    Try adjusting your filters or check back later.
                  </p>
                  <Button variant="outline" className="mt-6" onClick={fetchWithdrawals}>
                    Retry
                  </Button>
                </div>
              </motion.div>
            ) : withdrawals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-lg border border-dashed text-center">
                <FileX className="w-10 h-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Results</h3>
                <p className="text-muted-foreground">No withdrawal requests found matching current filters.</p>
              </div>
            ) : (
              <div className="rounded-md border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Marketer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawals.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">#{request.id}</TableCell>
                        <TableCell>{request.marketerName || `Marketer #${request.marketerId}`}</TableCell>
                        <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                        <TableCell className="font-bold">${request.amount.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {request.status === "Pending" && (
                              <>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => openApproveDialog(request)} title="Approve">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => openRejectDialog(request)} title="Reject">
                                  <XCircle className="w-4 h-4 text-red-600" />
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="View Details">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        {/* Approve Dialog */}
        <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Withdrawal #{selectedRequest?.id}</DialogTitle>
              <DialogDescription>
                Confirm approval for ${selectedRequest?.amount.toLocaleString()} to {selectedRequest?.marketerName}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Transaction ID (Required)</Label>
                <Input
                  value={actionFormData.transactionId}
                  onChange={(e) => setActionFormData({ ...actionFormData, transactionId: e.target.value })}
                  placeholder="e.g. TXN-12345678"
                />
              </div>
              <div className="grid gap-2">
                <Label>Admin Notes</Label>
                <Input
                  value={actionFormData.adminNotes}
                  onChange={(e) => setActionFormData({ ...actionFormData, adminNotes: e.target.value })}
                  placeholder="Internal notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleApproveSubmit} disabled={isSubmitting || !actionFormData.transactionId}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Approve Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Withdrawal #{selectedRequest?.id}</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this request.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Rejection Reason (Required)</Label>
                <Input
                  value={actionFormData.reason}
                  onChange={(e) => setActionFormData({ ...actionFormData, reason: e.target.value })}
                  placeholder="e.g. Invalid bank details"
                />
              </div>
              <div className="grid gap-2">
                <Label>Admin Notes</Label>
                <Input
                  value={actionFormData.adminNotes}
                  onChange={(e) => setActionFormData({ ...actionFormData, adminNotes: e.target.value })}
                  placeholder="Internal notes..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="destructive" onClick={handleRejectSubmit} disabled={isSubmitting || !actionFormData.reason}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Reject Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default WithdrawalRequestsPage;