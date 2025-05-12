import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Sector, ResponsiveContainer } from 'recharts';
import { CategoryDistribution, CategoryColorConfig, DEFAULT_CATEGORY_COLORS } from '../../../../domain/emotion-categories-analysis';

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
    
    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill={colors[name] || '#666'}
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
              fill={colors[entry.name] || '#ccc'} 
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