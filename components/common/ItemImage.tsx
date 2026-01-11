import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItemImageProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

export function ItemImage({ src, alt, size = 'md', className }: ItemImageProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden',
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <Package className="h-5 w-5 text-primary" />
      )}
    </div>
  );
}
