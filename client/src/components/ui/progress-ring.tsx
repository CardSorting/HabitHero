import React, { useState, useEffect } from "react";
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
  size = 60,
  strokeWidth = 6,
  className,
  bgColor = "hsl(var(--muted))",
  fgColor = "hsl(var(--primary))",
  showLabel = false,
  animate = true
}: ProgressRingProps) {
  const [progress, setProgress] = useState(0);
  
  // Animation effect
  useEffect(() => {
    if (animate) {
      const timeout = setTimeout(() => {
        setProgress(value);
      }, 300);
      
      return () => clearTimeout(timeout);
    } else {
      setProgress(value);
    }
  }, [value, animate]);
  
  // Clamp value between 0-100
  const clampedValue = Math.min(100, Math.max(0, progress));
  
  // Calculate radius and other properties
  const normalizedSize = size;
  const normalizedStrokeWidth = strokeWidth;
  const radius = (normalizedSize - normalizedStrokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;
  
  return (
    <div 
      className={cn("relative inline-flex items-center justify-center", className)} 
      style={{ width: normalizedSize, height: normalizedSize }}
    >
      {/* Background circle */}
      <svg 
        width={normalizedSize} 
        height={normalizedSize} 
        viewBox={`0 0 ${normalizedSize} ${normalizedSize}`}
        className="absolute"
      >
        <circle
          cx={normalizedSize / 2}
          cy={normalizedSize / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={normalizedStrokeWidth}
        />
      </svg>
      
      {/* Foreground circle (progress) */}
      <svg 
        width={normalizedSize} 
        height={normalizedSize} 
        viewBox={`0 0 ${normalizedSize} ${normalizedSize}`}
        className="absolute"
        style={{ transform: "rotate(-90deg)" }}
      >
        <motion.circle
          cx={normalizedSize / 2}
          cy={normalizedSize / 2}
          r={radius}
          fill="none"
          stroke={fgColor}
          strokeWidth={normalizedStrokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: animate ? 1 : 0, ease: "easeOut" }}
          style={{ 
            transformOrigin: "center",
          }}
        />
      </svg>
      
      {/* Label in the center */}
      {showLabel && (
        <div className="text-center font-medium">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="text-xl"
          >
            {Math.round(clampedValue)}%
          </motion.span>
        </div>
      )}
    </div>
  );
}