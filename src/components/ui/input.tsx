import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends React.ComponentProps<'input'> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-lg border-[1.5px] border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition-all duration-150',
          'placeholder:text-gray-400',
          'focus:outline-none focus:border-sakura-300 focus:ring-[3px] focus:ring-sakura-100',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          error && 'border-error focus:border-error focus:ring-error-light',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
