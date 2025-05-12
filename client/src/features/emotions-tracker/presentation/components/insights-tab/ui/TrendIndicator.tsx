import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

type TrendDirection = 'up' | 'down' | 'neutral';
type TrendSize = 'sm' | 'md' | 'lg';

interface TrendIndicatorProps {
  direction: TrendDirection;
  value?: string | number;
  showValue?: boolean;
  label?: string;
  size?: TrendSize;
  className?: string;
}

/**
 * TrendIndicator component
 * Displays a visual indicator for trends in Apple Health style
 */
export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  direction,
  value,
  showValue = true,
  label,
  size = 'md',
  className = ''
}) => {
  // Determine the icon and color based on the trend direction
  const getIconProps = () => {
    switch (direction) {
      case 'up':
        return {
          icon: <TrendingUp />,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'down':
        return {
          icon: <TrendingDown />,
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
      case 'neutral':
        return {
          icon: <ArrowRight />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50'
        };
    }
  };

  // Size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'text-xs',
          icon: 'h-3 w-3',
          badge: 'h-5 w-5'
        };
      case 'lg':
        return {
          container: 'text-base',
          icon: 'h-5 w-5',
          badge: 'h-8 w-8'
        };
      default: // 'md'
        return {
          container: 'text-sm',
          icon: 'h-4 w-4',
          badge: 'h-6 w-6'
        };
    }
  };

  const { icon, color, bgColor } = getIconProps();
  const { container, icon: iconSize, badge } = getSizeClasses();

  return (
    <div className={`flex items-center ${container} ${className}`}>
      <div className={`${badge} rounded-full ${bgColor} flex items-center justify-center mr-2`}>
        <div className={`${iconSize} ${color}`}>{icon}</div>
      </div>
      {showValue && value && (
        <span className={`font-medium ${color}`}>{value}</span>
      )}
      {label && (
        <span className="text-gray-600 ml-1">{label}</span>
      )}
    </div>
  );
};