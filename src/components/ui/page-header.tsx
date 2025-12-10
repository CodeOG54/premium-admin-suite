import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn(
      "mb-4 md:mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
      className
    )}>
      <div className="space-y-0.5 md:space-y-1 animate-slide-in-left min-w-0">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-foreground truncate">
          {title}
        </h1>
        {description && (
          <p className="text-sm md:text-base text-muted-foreground line-clamp-2">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 animate-fade-in shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
