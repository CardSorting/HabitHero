import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Sector, ResponsiveContainer } from 'recharts';
import { 
  DEFAULT_CATEGORY_COLORS, 
  EmotionCategory,
  CategoryDistribution,
  CategoryColorConfig
} from '../../../../domain/emotion-categories-analysis';

interface PieChartRendererProps {
  data: CategoryDistribution[];
  colors?: CategoryColorConfig;
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  totalCount?: number;
  activeIndex?: number;
  onPieEnter?: (data: any, index: number) => void;
}

/**
 * Component for rendering emotion categories pie chart
 */
export const PieChartRenderer: React.FC<PieChartRendererProps> = ({
  data,
  colors = DEFAULT_CATEGORY_COLORS,
  innerRadius = 30,
  outerRadius = 80,
  paddingAngle = 2,
  totalCount,
  activeIndex,
  onPieEnter
}) => {
  // Render custom labels for the pie chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Get the correct color for the category
    const getLabelColor = (categoryName: string): string => {
      // Map specific capitalized name categories to our lowercase defined colors
      switch (categoryName) {
        case 'Positive': return DEFAULT_CATEGORY_COLORS.positive;
        case 'Negative': return DEFAULT_CATEGORY_COLORS.negative;
        case 'Neutral': return DEFAULT_CATEGORY_COLORS.neutral;
        default: return '#666';
      }
    };
    
    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill={getLabelColor(name)}
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="medium"
      >
        {name} ({(percent * 100).toFixed(0)}%)
      </text>
    ) : null;
  };

  // Render active shape (for interactive pie chart)
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    
    return (
      <g>
        <text x={cx} y={cy} dy={0} textAnchor="middle" fill="#333" fontSize={16} fontWeight="bold">
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={18} textAnchor="middle" fill="#666" fontSize={12}>
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-36 flex items-center justify-center text-muted-foreground">
        Not enough data to show category distribution
      </div>
    );
  }

  // Map category names to their correct color values
  const getCategoryColor = (categoryName: string): string => {
    // Convert the first letter to lowercase for matching with our constants
    const normalizedCategory = categoryName.charAt(0).toLowerCase() + categoryName.slice(1);
    
    // Map specific capitalized name categories to our lowercase defined colors
    switch (categoryName) {
      case 'Positive': return DEFAULT_CATEGORY_COLORS.positive;
      case 'Negative': return DEFAULT_CATEGORY_COLORS.negative;
      case 'Neutral': return DEFAULT_CATEGORY_COLORS.neutral;
      default: return '#ccc';
    }
  };
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          paddingAngle={paddingAngle}
          dataKey="value"
          label={renderCustomizedLabel}
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          onMouseEnter={onPieEnter}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getCategoryColor(entry.name)} 
              stroke="#fff"
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`${value} occurrences`, 'Count']}
        />
        {totalCount !== undefined && (
          <>
            <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="font-bold" fontSize={18}>
              {totalCount}
            </text>
            <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fill="#666" fontSize={12}>
              Total
            </text>
          </>
        )}
      </PieChart>
    </ResponsiveContainer>
  );
};