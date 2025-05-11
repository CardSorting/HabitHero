import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  bgColor?: string;
  fgColor?: string;
  showLabel?: boolean;
  animate?: boolean;
}

export function ProgressRing({
  value,
  size = 64,
  strokeWidth = 6,
  className,
  bgColor = "hsl(var(--muted))",
  fgColor = "hsl(var(--primary))",
  showLabel = true,
  animate = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const valueInRange = Math.min(100, Math.max(0, value));
  const offset = circumference - (valueInRange / 100) * circumference;
  
  const center = size / 2;

  return (
    <div className={cn("relative h-16 w-16 flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Foreground circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={fgColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: animate ? offset : circumference }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span 
            className="text-lg font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {valueInRange}%
          </motion.span>
        </div>
      )}
    </div>
  );
}
