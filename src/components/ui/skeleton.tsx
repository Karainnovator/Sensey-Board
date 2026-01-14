import { cn } from '@/lib/utils';

/**
 * Skeleton Component with Shimmer Animation
 *
 * Implements the shimmer effect as specified in visual-design-reference.md:
 * - Background: gray-200
 * - Shimmer: white gradient moving left-to-right
 * - Duration: 1.5s
 * - Easing: linear, infinite
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-gray-200 dark:bg-gray-800',
        'before:absolute before:inset-0',
        'before:-translate-x-full before:animate-shimmer',
        'before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent dark:before:via-white/10',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
