import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { AlertTriangle, CheckCircle2, Circle, HelpCircle, XCircle } from 'lucide-react';

interface ComplexityIndicatorProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  maxValue?: number;
  className?: string;
}

/**
 * Smart Color-Coded Complexity Indicator Component
 * 
 * This component provides a visual representation of code complexity
 * using a color-coded scale from green (simple) to red (complex).
 */
export default function ComplexityIndicator({
  value,
  size = 'md',
  showLabel = true,
  maxValue = 5,
  className,
}: ComplexityIndicatorProps) {
  // Ensure value is within range
  const normalizedValue = Math.max(1, Math.min(value, maxValue));
  
  // Get percentage for visual representation
  const percentage = (normalizedValue / maxValue) * 100;
  
  // Get complexity label
  const complexityLabel = getComplexityLabel(normalizedValue, maxValue);
  
  // Get complexity color
  const complexityColor = getComplexityColor(normalizedValue, maxValue);
  
  // Get complexity icon
  const ComplexityIcon = getComplexityIcon(normalizedValue, maxValue);
  
  // Determine size classes
  const sizeClasses = {
    sm: 'h-1.5 text-xs',
    md: 'h-2 text-sm',
    lg: 'h-3 text-base',
  };
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <div className={cn('flex items-center gap-2', className)}>
          {/* Progress bar representation */}
          <div className="flex-1">
            <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizeClasses[size])}>
              <div 
                className={cn('h-full rounded-full', complexityColor.bg)}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
          
          {/* Icon indicator */}
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              <ComplexityIcon className={cn(complexityColor.text, iconSizes[size])} />
              
              {/* Optional label */}
              {showLabel && (
                <span className={cn('font-medium', complexityColor.text)}>
                  {complexityLabel}
                </span>
              )}
            </div>
          </TooltipTrigger>
        </div>
        
        <TooltipContent className="p-2">
          <div className="flex flex-col gap-1">
            <p className="font-medium">Code Complexity: {normalizedValue}/{maxValue}</p>
            <p className="text-xs text-muted-foreground">{getComplexityDescription(normalizedValue, maxValue)}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Helper functions for complexity information

function getComplexityLabel(value: number, maxValue: number): string {
  if (maxValue === 5) {
    const labels = [
      'Very Simple',
      'Simple',
      'Moderate',
      'Complex',
      'Very Complex',
    ];
    return labels[value - 1] || 'Unknown';
  } else {
    // For other scales, generate appropriate labels
    if (value <= maxValue * 0.2) return 'Very Simple';
    if (value <= maxValue * 0.4) return 'Simple';
    if (value <= maxValue * 0.6) return 'Moderate';
    if (value <= maxValue * 0.8) return 'Complex';
    return 'Very Complex';
  }
}

function getComplexityDescription(value: number, maxValue: number): string {
  if (maxValue === 5) {
    const descriptions = [
      'Straightforward code with clear purpose and minimal logic branching.',
      'Clean code with some basic logic and minimal nesting.',
      'Balanced complexity with reasonable control flow and moderate nesting.',
      'Higher complexity with multiple nested conditions and/or loops.',
      'Very intricate logic with deep nesting and significant cognitive load to understand.',
    ];
    return descriptions[value - 1] || '';
  } else {
    // For other scales, generate appropriate descriptions
    if (value <= maxValue * 0.2) return 'Straightforward code with clear purpose and minimal logic branching.';
    if (value <= maxValue * 0.4) return 'Clean code with some basic logic and minimal nesting.';
    if (value <= maxValue * 0.6) return 'Balanced complexity with reasonable control flow and moderate nesting.';
    if (value <= maxValue * 0.8) return 'Higher complexity with multiple nested conditions and/or loops.';
    return 'Very intricate logic with deep nesting and significant cognitive load to understand.';
  }
}

function getComplexityColor(value: number, maxValue: number): { bg: string, text: string } {
  if (value <= maxValue * 0.2) {
    return { bg: 'bg-green-500', text: 'text-green-500' };
  } else if (value <= maxValue * 0.4) {
    return { bg: 'bg-green-400', text: 'text-green-500' };
  } else if (value <= maxValue * 0.6) {
    return { bg: 'bg-yellow-400', text: 'text-yellow-600' };
  } else if (value <= maxValue * 0.8) {
    return { bg: 'bg-orange-500', text: 'text-orange-500' };
  } else {
    return { bg: 'bg-red-500', text: 'text-red-500' };
  }
}

function getComplexityIcon(value: number, maxValue: number) {
  if (value <= maxValue * 0.2) {
    return CheckCircle2;
  } else if (value <= maxValue * 0.4) {
    return Circle;
  } else if (value <= maxValue * 0.6) {
    return HelpCircle;
  } else if (value <= maxValue * 0.8) {
    return AlertTriangle;
  } else {
    return XCircle;
  }
}