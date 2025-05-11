import React from "react";
import { motion } from "framer-motion";
import { ProgressRing } from "@/components/ui/progress-ring";

interface DailyProgressSummaryProps {
  completedHabits: number;
  totalHabits: number;
}

const DailyProgressSummary: React.FC<DailyProgressSummaryProps> = ({
  completedHabits,
  totalHabits,
}) => {
  const percentage = totalHabits > 0 
    ? Math.round((completedHabits / totalHabits) * 100) 
    : 0;

  return (
    <motion.section 
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="bg-muted rounded-[12px] p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium mb-1">Daily Progress</h2>
          <p className="text-muted-foreground text-sm">
            {completedHabits} of {totalHabits} habits completed
          </p>
        </div>
        <ProgressRing value={percentage} />
      </div>
    </motion.section>
  );
};

export default DailyProgressSummary;
