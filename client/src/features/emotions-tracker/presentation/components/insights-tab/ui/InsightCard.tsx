import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface InsightCardProps {
  title: string;
  icon: ReactNode;
  iconBackground: string;
  iconColor: string;
  children: ReactNode;
  fullWidth?: boolean;
}

/**
 * Consistent card component for insights sections
 * Following Apple Health's consistent, clean card design
 */
export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  icon,
  iconBackground,
  iconColor,
  children,
  fullWidth = false
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden ${fullWidth ? 'col-span-full' : ''}`}>
      <div className="p-5">
        <div className="flex items-center mb-4">
          <div className={`h-8 w-8 rounded-full ${iconBackground} flex items-center justify-center mr-3`}>
            <div className={`h-5 w-5 ${iconColor}`}>{icon}</div>
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        {children}
      </div>
    </div>
  );
};

/**
 * Card header for consistent styling across insight cards
 */
export const InsightCardHeader: React.FC<{ title: string; subtitle?: string; action?: ReactNode }> = ({
  title,
  subtitle,
  action
}) => {
  return (
    <div className="flex items-center justify-between mb-3">
      <div>
        <div className="text-sm font-medium text-gray-700">{title}</div>
        {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

/**
 * Content container for insight card
 */
export const InsightCardContent: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`bg-white p-4 rounded-lg border border-gray-100 ${className}`}>
      {children}
    </div>
  );
};