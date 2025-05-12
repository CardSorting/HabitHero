import React, { ReactNode } from 'react';
import { cva } from 'class-variance-authority';

type DataBadgeSize = 'sm' | 'md' | 'lg';
type DataBadgeIntent = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface DataBadgeProps {
  value: string | number | ReactNode;
  label?: string;
  size?: DataBadgeSize;
  intent?: DataBadgeIntent;
  className?: string;
  trend?: 'up' | 'down' | 'neutral';
  showTrend?: boolean;
}

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md transition-colors", 
  {
    variants: {
      size: {
        sm: "text-xs px-1.5 py-0.5 h-5",
        md: "text-sm px-2 py-0.5 h-6",
        lg: "text-base px-2.5 py-1 h-8",
      },
      intent: {
        primary: "bg-blue-100 text-blue-800 font-medium",
        secondary: "bg-purple-100 text-purple-800 font-medium",
        success: "bg-green-100 text-green-800 font-medium",
        warning: "bg-amber-100 text-amber-800 font-medium",
        danger: "bg-red-100 text-red-800 font-medium",
        info: "bg-cyan-100 text-cyan-800 font-medium",
        neutral: "bg-gray-100 text-gray-800 font-medium",
      }
    },
    defaultVariants: {
      size: 'md',
      intent: 'primary',
    }
  }
);

const labelVariants = cva(
  "block font-normal", 
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-xs",
        lg: "text-sm",
      }
    },
    defaultVariants: {
      size: 'md',
    }
  }
);

/**
 * DataBadge component
 * Displays values with optional trend indicators in Apple Health style
 */
export const DataBadge: React.FC<DataBadgeProps> = ({
  value,
  label,
  size = 'md',
  intent = 'primary',
  className = '',
  trend,
  showTrend = false
}) => {
  // Trend indicator arrow
  const renderTrendIndicator = () => {
    if (!showTrend || !trend) return null;
    
    switch (trend) {
      case 'up':
        return <span className="text-green-600 ml-1">↑</span>;
      case 'down':
        return <span className="text-red-600 ml-1">↓</span>;
      case 'neutral':
        return <span className="text-gray-500 ml-1">→</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className={badgeVariants({ size, intent, className })}>
        <span>{value}</span>
        {renderTrendIndicator()}
      </div>
      {label && (
        <span className={labelVariants({ size })}>
          {label}
        </span>
      )}
    </div>
  );
};