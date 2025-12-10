import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, description, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      "stat-card animate-fade-in p-4 md:p-6",
      className
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 md:space-y-2 min-w-0 flex-1">
          <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-foreground truncate">{value}</p>
          {description && (
            <p className="text-xs md:text-sm text-muted-foreground truncate">{description}</p>
          )}
          {trend && (
            <div className={cn(
              "inline-flex items-center gap-1 rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-medium",
              trend.isPositive 
                ? "bg-success/10 text-success" 
                : "bg-destructive/10 text-destructive"
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div className="rounded-lg md:rounded-xl bg-primary/10 p-2 md:p-3 shrink-0">
          <Icon className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
