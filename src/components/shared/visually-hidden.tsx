/**
 * Visually Hidden Component
 *
 * Hides content visually but keeps it accessible to screen readers
 * Alternative to sr-only class for dynamic content
 */

interface VisuallyHiddenProps {
  children: React.ReactNode;
  /**
   * Whether to make the content visible on focus
   */
  focusable?: boolean;
}

export function VisuallyHidden({
  children,
  focusable = false,
}: VisuallyHiddenProps) {
  return (
    <span
      className={
        focusable
          ? 'sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground'
          : 'sr-only'
      }
    >
      {children}
    </span>
  );
}
