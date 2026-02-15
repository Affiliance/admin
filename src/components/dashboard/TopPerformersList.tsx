import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type TopPerformer } from "@/services/analyticsService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "motion/react";

interface TopPerformersListProps {
  data: TopPerformer[];
}

const TopPerformersList = ({ data }: TopPerformersListProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="col-span-3"
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>
            Highest performing marketers/companies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {data.map((performer) => (
              <div key={performer.id} className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={performer.avatarUrl} alt={performer.name} />
                  <AvatarFallback>
                    {performer.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {performer.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {performer.conversions} Conversions
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  +${performer.revenue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TopPerformersList;
