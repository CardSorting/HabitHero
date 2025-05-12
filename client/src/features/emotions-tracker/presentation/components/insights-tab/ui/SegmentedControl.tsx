import React from 'react';
import { cva } from 'class-variance-authority';

interface SegmentOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

// Define variants for different sizes
const segmentedControlVariants = cva(
  "relative flex rounded-lg p-0.5 bg-gray-100", 
  {
    variants: {
      size: {
        sm: "text-xs h-7",
        md: "text-sm h-9",
        lg: "text-base h-10",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      }
    },
    defaultVariants: {
      size: 'md',
      fullWidth: false,
    }
  }
);

const segmentButtonVariants = cva(
  "relative z-10 flex items-center justify-center font-medium transition-colors", 
  {
    variants: {
      size: {
        sm: "px-2.5 py-1",
        md: "px-3 py-1.5",
        lg: "px-4 py-2",
      },
      active: {
        true: "text-gray-900",
        false: "text-gray-600 hover:text-gray-900",
      }
    },
    defaultVariants: {
      size: 'md',
      active: false,
    }
  }
);

/**
 * SegmentedControl component - Apple-style segmented picker
 * Provides a modern, cohesive interface for selecting between options
 */
export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = false
}) => {
  // Find the active index
  const activeIndex = options.findIndex(option => option.value === value);
  
  return (
    <div className={segmentedControlVariants({ size, fullWidth })}>
      {/* Background pill that slides */}
      {activeIndex >= 0 && (
        <div 
          className="absolute inset-0 z-0 p-0.5 transition-transform duration-200 ease-out"
          style={{ 
            transform: `translateX(${activeIndex * 100}%)`,
            width: `${100 / options.length}%`,
          }}
        >
          <div className="h-full w-full bg-white rounded-md shadow-sm"></div>
        </div>
      )}
      
      {/* Buttons */}
      {options.map((option) => (
        <button
          key={option.value}
          className={segmentButtonVariants({ 
            size, 
            active: option.value === value,
          })}
          style={{ flex: fullWidth ? 1 : 'initial' }}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};