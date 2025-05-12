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
    <div className="py-2 px-1 flex flex-col items-center text-center">
      <div className="flex items-center justify-center">
        <span className="text-xl font-bold">{value}</span>
        {renderTrendIndicator()}
      </div>
      <div className="text-[10px] text-gray-500 mt-0.5">{label}</div>
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