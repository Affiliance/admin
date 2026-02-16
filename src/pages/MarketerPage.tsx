import { useState, useEffect } from "react";
import { marketerService, type Marketer } from "@/services/marketerService";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Check,
  X,
  Loader2,
  ShieldCheck,
  Star,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { motion } from "motion/react";

const MarketerPage = () => {
  const [marketers, setMarketers] = useState<Marketer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Score Dialog State
  const [isScoreOpen, setIsScoreOpen] = useState(false);
  const [selectedMarketer, setSelectedMarketer] = useState<Marketer | null>(null);
  const [newScore, setNewScore] = useState<number>(0);

  const fetchMarketers = async () => {
    setIsLoading(true);
    try {
      // Assuming initial page load grabs page 1, pageSize 20 or similar default
      const data = await marketerService.getPendingMarketers({ page: 1, pageSize: 20 });
      setMarketers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load pending marketers");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketers();
  }, []);

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
      // Refresh list to remove processed item
      fetchMarketers();
    } catch (error) {
      toast.error("Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleVerify = (id: number) =>
    handleAction(
      id,
      () => marketerService.verifyMarketer(id),
      "Marketer verified"
    );

  const handleUnverify = (id: number) =>
    handleAction(
      id,
      () => marketerService.unverifyMarketer(id),
      "Marketer unverified"
    );

  const openScoreDialog = (marketer: Marketer) => {
    setSelectedMarketer(marketer);
    setNewScore(marketer.performanceScore || 0);
    setIsScoreOpen(true);
  };

  const handleScoreSubmit = async () => {
    if (!selectedMarketer) return;
    setProcessingId(selectedMarketer.id); // Show loading on dialog button maybe? Or just keep dialog open
    // Ideally we use a local submitting state for dialog
    try {
      await marketerService.updatePerformanceScore(selectedMarketer.id, newScore);
      toast.success("Performance score updated");
      setIsScoreOpen(false);
      fetchMarketers();
    } catch (error) {
      toast.error("Failed to update score");
    } finally {
      setProcessingId(null);
    }
  };

  const renderMarketerCard = (marketer: Marketer) => {
    return (
      <motion.div
        key={marketer.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="h-full flex flex-col border-muted/40 hover:border-primary/50 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            <div className="w-12 h-12 rounded-full overflow-hidden border bg-muted flex items-center justify-center shrink-0">
              {marketer.avatarUrl ? (
                <img src={marketer.avatarUrl} alt={marketer.firstName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold truncate flex items-center gap-2">
                {marketer.firstName} {marketer.lastName}
                {marketer.isVerified && <ShieldCheck className="w-4 h-4 text-blue-500" fill="currentColor" fillOpacity={0.2} />}
              </CardTitle>
              <CardDescription className="truncate text-xs flex items-center gap-1 mt-1">
                <Mail className="w-3 h-3" /> {marketer.email}
              </CardDescription>
              {marketer.phoneNumber && (
                <CardDescription className="truncate text-xs flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" /> {marketer.phoneNumber}
                </CardDescription>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded-md">
                <Star className="w-3 h-3 fill-yellow-600" />
                <span className="font-bold">{marketer.performanceScore || 0}</span>
              </div>
              <span className="text-muted-foreground text-xs">Performance Score</span>
            </div>
          </CardContent>
          <CardFooter className="pt-2 gap-2 flex-wrap">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              size="sm"
              onClick={() => handleVerify(marketer.id)}
              disabled={processingId === marketer.id}
            >
              {processingId === marketer.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
              Verify
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => handleUnverify(marketer.id)} // Assuming unverify effectively rejects/unverifies
              disabled={processingId === marketer.id}
            >
              {processingId === marketer.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-4 h-4 mr-1" />}
              Unverify
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => openScoreDialog(marketer)}
              disabled={processingId === marketer.id}
            >
              <Star className="w-3 h-3 mr-1" /> Update Score
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };

  return (
    <>
      <title>Admin - Marketers</title>
      <div className="p-8 space-y-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Marketer Management
          </h2>
          <p className="text-muted-foreground">
            Review pending marketers and manage performance.
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {marketers.length > 0 ? marketers.map(renderMarketerCard) : <div className="col-span-full text-center py-20 text-muted-foreground">No pending marketers found.</div>}
          </div>
        )}

        {/* Score Dialog */}
        <Dialog open={isScoreOpen} onOpenChange={setIsScoreOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Performance Score</DialogTitle>
              <DialogDescription>
                Set a new performance score for {selectedMarketer?.firstName}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Score</Label>
                <Input
                  type="number"
                  value={newScore}
                  onChange={(e) => setNewScore(Number(e.target.value))}
                  min={0}
                  max={100} // Assuming 0-100 scale?
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleScoreSubmit} disabled={processingId === selectedMarketer?.id}>
                {processingId === selectedMarketer?.id && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Update Score
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default MarketerPage;