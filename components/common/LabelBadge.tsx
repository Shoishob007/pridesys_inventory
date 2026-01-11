import { cn } from '@/lib/utils';
import { LabelColor } from '@/types';

interface LabelBadgeProps {
  name: string;
  color: LabelColor;
  className?: string;
}

const colorClasses: Record<LabelColor, string> = {
  blue: 'label-blue',
  green: 'label-green',
  red: 'label-red',
  orange: 'label-orange',
  purple: 'label-purple',
  yellow: 'label-yellow',
};

export function LabelBadge({ name, color, className }: LabelBadgeProps) {
  return (
    <span className={cn('label-badge', colorClasses[color], className)}>
      {name}
    </span>
  );
}
