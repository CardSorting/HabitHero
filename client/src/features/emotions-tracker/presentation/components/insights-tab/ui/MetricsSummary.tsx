import React, { ReactNode } from 'react';

interface MetricProps {
  value: string | number | ReactNode;
  label: string;
  icon?: ReactNode;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface MetricsSummaryProps {
  metrics: MetricProps[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

/**
 * Metric component
 * Individual metric with Apple Health styling
 */
const Metric: React.FC<MetricProps> = ({
  value,
  label,
  icon,
  color = 'bg-blue-100 text-blue-600',
  trend
}) => {
  // Color classes
  const colorClasses = color.split(' ');
  const bgColorClass = colorClasses.find(c => c.startsWith('bg-')) || 'bg-blue-100';
  const textColorClass = colorClasses.find(c => c.startsWith('text-')) || 'text-blue-600';
  
  // Trend indicator
  const renderTrendIndicator = () => {
    if (!trend) return null;
    
    const getProps = () => {
      switch (trend) {
        case 'up':
          return { symbol: '↑', class: 'text-green-600' };
        case 'down':
          return { symbol: '↓', class: 'text-red-600' };
        case 'neutral':
          return { symbol: '→', class: 'text-gray-500' };
      }
    };
    
    const { symbol, class: className } = getProps();
    
    return (
      <span className={`ml-1 ${className}`}>{symbol}</span>
    );
  };
  
  return (
    <div className="p-4 flex items-start">
      {icon && (
        <div className={`h-10 w-10 rounded-full ${bgColorClass} flex items-center justify-center mr-3 flex-shrink-0`}>
          <div className={`h-5 w-5 ${textColorClass}`}>{icon}</div>
        </div>
      )}
      <div>
        <div className="flex items-center">
          <span className="text-2xl font-bold">{value}</span>
          {renderTrendIndicator()}
        </div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
};

/**
 * MetricsSummary component
 * Grid of key metrics in Apple Health style
 */
export const MetricsSummary: React.FC<MetricsSummaryProps> = ({
  metrics,
  columns = 3,
  className = ''
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };
  
  return (
    <div className={`grid ${gridCols[columns]} divide-y sm:divide-y-0 sm:divide-x divide-gray-100 ${className}`}>
      {metrics.map((metric, index) => (
        <Metric key={index} {...metric} />
      ))}
    </div>
  );
};

export { Metric };