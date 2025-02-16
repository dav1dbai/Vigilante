import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import getAllAnalysesEntries from "@/lib/queries/get-all-analyses-entries";
import getAllClaimsEntries from "@/lib/queries/get-all-claims-entries";
import { cn } from "@/lib/utils";
import { Flag, ListCheck, MessageSquare } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import useSWR from "swr";

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  value?: number;
  foregroundColor: string;
  backgroundColor: string;
  label: string;
}

function StatCard({
  icon: Icon,
  value,
  foregroundColor,
  backgroundColor,
  label,
}: StatCardProps) {
  return (
    <Card className="p-6 border">
      <div className="flex items-center gap-4">
        <div className={cn("p-4 rounded-full", backgroundColor)}>
          {Icon && <Icon className={cn("size-7", foregroundColor)} />}
        </div>
        <div className="flex flex-col">
          <AnimatePresence mode="wait">
            {value !== undefined ? (
              <motion.span
                key={value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-3xl font-semibold"
              >
                {value.toLocaleString()}
              </motion.span>
            ) : (
              <Skeleton className="w-16 h-9" />
            )}
          </AnimatePresence>
          <span className="opacity-50 text-md">{label}</span>
        </div>
      </div>
    </Card>
  );
}

export default function Stats() {
  const { data: analysesData } = useSWR("analyses", getAllAnalysesEntries, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  const { data: claimsData } = useSWR("claims", getAllClaimsEntries, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  const tweetsAnalyzed = analysesData?.length;
  const claimsInterpreted = claimsData?.length;
  const tweetsFlagged = analysesData?.filter(
    (v) => (v as { is_misleading: string }).is_misleading === "misleading"
  ).length;

  console.log({ analysesData, claimsData });

  return (
    <div className="w-full h-28 grid grid-cols-3 gap-8">
      <StatCard
        icon={MessageSquare}
        value={tweetsAnalyzed}
        label="Tweets Analysed"
        foregroundColor="text-blue-500"
        backgroundColor="bg-blue-100"
      />
      <StatCard
        icon={ListCheck}
        value={claimsInterpreted}
        label="Claims Interpreted"
        foregroundColor="text-amber-500"
        backgroundColor="bg-amber-100"
      />
      <StatCard
        icon={Flag}
        value={tweetsFlagged}
        label="Tweets Flagged"
        foregroundColor="text-red-500"
        backgroundColor="bg-red-100"
      />
    </div>
  );
}
