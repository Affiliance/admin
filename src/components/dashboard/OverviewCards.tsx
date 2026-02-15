import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type PlatformOverview } from "@/services/analyticsService";
import { Users, DollarSign, Activity, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

interface OverviewCardsProps {
  data: PlatformOverview;
}

const OverviewCards = ({ data }: OverviewCardsProps) => {
  const cards = [
    {
      title: "Total Users",
      value: data.totalUsers,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Total Revenue",
      value: `$${data.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Active Campaigns",
      value: data.activeCampaigns,
      icon: Activity,
      color: "text-orange-500",
    },
    {
      title: "Conversions",
      value: data.totalConversions,
      icon: TrendingUp,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default OverviewCards;
