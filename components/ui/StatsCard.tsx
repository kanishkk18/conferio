import React from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  icon?: React.ReactNode;
  title: string;
  value: string;
  color?: 'green' | 'yellow' | 'purple' | 'blue' | 'default';
  subtitle?: string;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  icon, 
  title, 
  value, 
  color = 'default', 
  subtitle,
  className 
}) => {
  const colorClasses = {
    green: 'green-card',
    yellow: 'yellow-card',
    purple: 'purple-card',
    blue: 'blue-card',
    default: 'bg-gradient-to-br from-[#3793FF] to-[#0017E4]'
  };

  return (
    <div className={cn(colorClasses[color], "p-4 px-6 flex rounded-xl h-full flex-col", className)}>
      <div className="flex justify-between items-start">
        <div>
          {subtitle && <p className="text-xs opacity-80 mb-1">{subtitle}</p>}
          <p className={cn("text-sm font-medium", color === 'yellow' ? "text-black" : "text-white")}>{title}</p>
          <p className={cn("text-xl font-bold mt-1", color === 'yellow' ? "text-black" : "text-white")}>{value}</p>
        </div>
        {icon && <div>{icon}</div>}
      </div>
    </div>
  );
};

export default StatsCard;
