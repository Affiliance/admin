import { useState, useEffect } from "react";
import { paymentService, type FinancialReport } from "@/services/paymentService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, AlertCircle, FileText, DollarSign, Wallet, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

const FinancialReportsPage = () => {
  const [data, setData] = useState<FinancialReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const result = await paymentService.getFinancialReports(params);

      // Handle empty response or unexpected structure
      if (!result) {
        throw new Error("No data received from server");
      }

      // If it's a specific structure like { data: ... }, extract it
      // Based on other endpoints, it might be result.data or result
      // Just storing result for now to display
      setData(result);

    } catch (err: any) {
      console.error(err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to load financial reports";
      setError(errorMessage);
      toast.error(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []); // Initial load

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  return (
    <>
      <title>Admin - Financial Reports</title>
      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Financial Reports
          </h2>
          <p className="text-muted-foreground">
            View financial statements and transaction reports.
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Filter Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="grid gap-2 w-full sm:w-auto">
                <label htmlFor="startDate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Start Date
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full sm:w-[200px]"
                />
              </div>
              <div className="grid gap-2 w-full sm:w-auto">
                <label htmlFor="endDate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  End Date
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full sm:w-[200px]"
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                Filter
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-destructive/50 bg-destructive/10">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                  <AlertCircle className="w-10 h-10 text-destructive mb-4" />
                  <h3 className="text-lg font-semibold text-destructive">Error Loading Reports</h3>
                  <p className="text-muted-foreground max-w-md mt-2">
                    {error}. Please try again later or adjust your filters.
                  </p>
                  <Button variant="outline" className="mt-4 border-destructive/30 hover:bg-destructive/20" onClick={fetchReports}>
                    Retry
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : !data || (Array.isArray(data) && data.length === 0) ? (
            <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Reports Found</h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting the date range filters to find records.
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {/* Net Balance */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${data.netBalance?.toLocaleString() ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Current available balance
                  </p>
                </CardContent>
              </Card>

              {/* Total Commissions */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">${data.totalCommissions?.toLocaleString() ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Total earnings generated
                  </p>
                </CardContent>
              </Card>

              {/* Total Withdrawals */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">${data.totalWithdrawals?.toLocaleString() ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Total amount withdrawn
                  </p>
                </CardContent>
              </Card>

              {/* Completed Withdrawals */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Withdrawals</CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${data.completedWithdrawals?.toLocaleString() ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Successfully processed
                  </p>
                </CardContent>
              </Card>

              {/* Pending Withdrawals */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
                  <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">${data.pendingWithdrawals?.toLocaleString() ?? 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting processing
                  </p>
                </CardContent>
              </Card>

              {/* Period Info */}
              <Card className="col-span-full md:col-span-1 border-dashed">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Report Period</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium">
                    Start: {data.periodStart !== "0001-01-01T00:00:00" ? new Date(data.periodStart).toLocaleDateString() : "All Time"}
                  </div>
                  <div className="text-sm font-medium mt-1">
                    End: {data.periodEnd !== "0001-01-01T00:00:00" ? new Date(data.periodEnd).toLocaleDateString() : "Now"}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default FinancialReportsPage;