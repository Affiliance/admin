import { useEffect, useState } from "react";
import OverviewCards from "@/components/dashboard/OverviewCards";
import RevenueChart from "@/components/dashboard/RevenueChart";
import TopPerformersList from "@/components/dashboard/TopPerformersList";
import {
  analyticsService,
  type PlatformOverview,
  type RevenueBreakdown,
  type TopPerformer,
} from "@/services/analyticsService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<PlatformOverview | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueBreakdown[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewData, revenueData, performersData] = await Promise.all([
          analyticsService.getPlatformOverview(),
          analyticsService.getRevenueBreakdown(),
          analyticsService.getTopPerformers(),
        ]);

        setOverview(overviewData);
        setRevenueData(revenueData);
        setTopPerformers(performersData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <>
      <title>Admin - Analytics</title>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-brand-primary">Dashboard</h2>
        </div>
        <div className="space-y-4">
          {overview && <OverviewCards data={overview} />}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <RevenueChart data={revenueData} />
            <TopPerformersList data={topPerformers} />
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;