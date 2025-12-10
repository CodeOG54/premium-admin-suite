import { cn } from '@/lib/utils';

type StatusType = 'Approved' | 'Pending' | 'Denied' | 'Present' | 'Absent';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusClasses: Record<StatusType, string> = {
    Approved: 'status-approved',
    Present: 'status-present',
    Pending: 'status-pending',
    Denied: 'status-denied',
    Absent: 'status-absent',
  };

  return (
    <span className={cn('status-badge', statusClasses[status], className)}>
      {status}
    </span>
  );
}
