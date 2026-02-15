import { useEffect, useState } from "react";
import { campaignService, type Campaign } from "@/services/campaignService";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import { motion } from "motion/react";

const CampaignPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      const data = await campaignService.getCampaigns();
      // Safety check: ensure we always set an array, even if the service fails to
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load campaigns");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await campaignService.approveCampaign(id);
      toast.success("Campaign approved successfully");
      // Optimistic update
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "Active" } : c))
      );
    } catch (error) {
      toast.error("Failed to approve campaign");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await campaignService.rejectCampaign(id);
      toast.success("Campaign rejected successfully");
      // Optimistic update
      setCampaigns((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "Rejected" } : c))
      );
    } catch (error) {
      toast.error("Failed to reject campaign");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <title>Admin - Campaign</title>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Campaigns
            </h2>
            <p className="text-muted-foreground mt-2">
              Manage and review affiliate campaigns
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Safety: Added ? before .map */}
          {campaigns?.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col overflow-hidden border-muted/40 hover:border-primary/50 transition-colors">
                {campaign.imageUrl && (
                  <div className="h-48 w-full overflow-hidden">
                    <img
                      src={campaign.imageUrl}
                      alt={campaign.name}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{campaign.name}</CardTitle>
                      {campaign.companyName && (
                        <CardDescription className="font-medium text-primary">
                          {campaign.companyName}
                        </CardDescription>
                      )}
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${campaign.status === "Active" ||
                          campaign.status === "Approved"
                          ? "bg-green-500/10 text-green-500"
                          : campaign.status === "Rejected"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}
                    >
                      {campaign.status}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {campaign.description || "No description provided."}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      {/* Safety: Ensure payout is a number before calling toLocaleString() */}
                      ${Number(campaign.payout || 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      Payout
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-3 pt-6">
                  {(campaign.status === "Pending" ||
                    campaign.status === "Rejected") && (
                      <Button
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => handleApprove(campaign.id)}
                        disabled={processingId === campaign.id || processingId !== null}
                      >
                        {processingId === campaign.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </>
                        )}
                      </Button>
                    )}
                  {(campaign.status === "Pending" ||
                    campaign.status === "Approved" ||
                    campaign.status === "Active") && (
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleReject(campaign.id)}
                        disabled={processingId === campaign.id || processingId !== null}
                      >
                        {processingId === campaign.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </>
                        )}
                      </Button>
                    )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Safety: Use optional chaining on length check */}
        {campaigns?.length === 0 && !isLoading && (
          <div className="text-center py-20 text-muted-foreground">
            <p>No campaigns found.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default CampaignPage;