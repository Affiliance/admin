import { useEffect, useState } from "react";
import {
  companyService,
  type Company,
  type CompanyFilterParams,
} from "@/services/companyService";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Check,
  X,
  Loader2,
  ShieldCheck,
  Ban,
  Search,
  RotateCw,
} from "lucide-react";
import { motion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CompanyPage = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Filter States for "All" tab
  const [filters, setFilters] = useState<CompanyFilterParams>({
    Page: 1,
    PageSize: 10,
    SearchKeyword: "",
  });

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      let data: Company[] = [];
      if (activeTab === "pending") {
        data = await companyService.getPendingCompanies();
      } else if (activeTab === "verified") {
        data = await companyService.getVerifiedCompanies();
      } else if (activeTab === "all") {
        data = await companyService.getAllCompanies(filters);
      }
      setCompanies(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load companies");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [activeTab, filters]); // Refetch on tab or filter change

  // --- Actions ---

  const handleAction = async (
    id: number,
    action: () => Promise<void>,
    successMessage: string
  ) => {
    setProcessingId(id);
    try {
      await action();
      toast.success(successMessage);
      // Refresh list
      fetchCompanies();
    } catch (error) {
      toast.error("Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = (id: number) =>
    handleAction(
      id,
      () => companyService.approveCompany(id),
      "Company approved"
    );

  const handleReject = (id: number) =>
    handleAction(
      id,
      () => companyService.rejectCompany(id),
      "Company rejected"
    );

  const handleSuspend = (id: number) =>
    handleAction(
      id,
      () => companyService.suspendCompany(id),
      "Company suspended"
    );

  const handleReactivate = (id: number) =>
    handleAction(
      id,
      () => companyService.reactivateCompany(id),
      "Company reactivated"
    );

  const handleVerify = (id: number) =>
    handleAction(
      id,
      () => companyService.verifyCompany(id),
      "Company verified"
    );

  // --- Render Helpers ---

  const renderCompanyCard = (company: Company) => {
    return (
      <motion.div
        key={company.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="h-full flex flex-col border-muted/40 hover:border-primary/50 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            <div className="w-12 h-12 rounded-full overflow-hidden border bg-muted flex items-center justify-center shrink-0">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.campanyName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-bold text-muted-foreground">{company.campanyName?.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold truncate flex items-center gap-2">
                {company.campanyName}
                {company.isVerified && <ShieldCheck className="w-4 h-4 text-blue-500" fill="currentColor" fillOpacity={0.2} />}
              </CardTitle>
              <CardDescription className="truncate text-xs">
                {company.website}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {company.description || "No description provided."}
              </p>
              <div className="mt-2 text-xs flex items-center gap-1 text-muted-foreground">
                <span className="font-medium text-foreground">Contact:</span> {company.contactEmail}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2 gap-2">
            {activeTab === "pending" && (
              <>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                  onClick={() => handleApprove(company.id)}
                  disabled={processingId === company.id}
                >
                  {processingId === company.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleReject(company.id)}
                  disabled={processingId === company.id}
                >
                  {processingId === company.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-4 h-4 mr-1" />}
                  Reject
                </Button>
              </>
            )}

            {activeTab === "verified" && (
              <Button
                variant="destructive"
                size="sm"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => handleSuspend(company.id)}
                disabled={processingId === company.id}
              >
                {processingId === company.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-4 h-4 mr-1" />}
                Suspend
              </Button>
            )}

            {activeTab === "all" && (
              <div className="grid grid-cols-2 gap-2 w-full">
                {!company.isVerified && (
                  <Button size="sm" variant="outline" onClick={() => handleVerify(company.id)} disabled={processingId === company.id}>
                    <ShieldCheck className="w-3 h-3 mr-1 text-blue-500" /> Verify
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={() => handleSuspend(company.id)} disabled={processingId === company.id}>
                  <Ban className="w-3 h-3 mr-1" /> Suspend
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleReactivate(company.id)} disabled={processingId === company.id}>
                  <RotateCw className="w-3 h-3 mr-1" /> Reactivate
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Companies
        </h2>
        <p className="text-muted-foreground">
          Manage companies, approvals, and verifications.
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="verified">Verified Companies</TabsTrigger>
            <TabsTrigger value="all">All Companies</TabsTrigger>
          </TabsList>

          {activeTab === "all" && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search companies..."
                  className="pl-8 w-[200px] lg:w-[300px]"
                  value={filters.SearchKeyword}
                  onChange={(e) => setFilters({ ...filters, SearchKeyword: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>

        <TabsContent value="pending" className="mt-0">
          {isLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {companies.length > 0 ? companies.map(renderCompanyCard) : <div className="col-span-full text-center py-20 text-muted-foreground">No pending companies found.</div>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="verified" className="mt-0">
          {isLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {companies.length > 0 ? companies.map(renderCompanyCard) : <div className="col-span-full text-center py-20 text-muted-foreground">No verified companies found.</div>}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-0">
          {isLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {companies.length > 0 ? companies.map(renderCompanyCard) : <div className="col-span-full text-center py-20 text-muted-foreground">No companies found matching your criteria.</div>}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyPage;