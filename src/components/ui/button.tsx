import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Primary (CTA) - Sakura gradient
        default:
          'bg-gradient-to-br from-sakura-300 to-sakura-400 text-white shadow-sm hover:-translate-y-0.5 hover:shadow-sakura-glow active:translate-y-0',
        // Secondary - White with border
        secondary:
          'bg-white border border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300',
        // Ghost - Transparent
        ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-700',
        // Destructive/Danger
        destructive: 'bg-error text-white shadow-sm hover:bg-error/90',
        // Outline
        outline:
          'border border-gray-200 bg-transparent text-gray-700 hover:bg-gray-50',
        // Link
        link: 'text-sakura-500 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-8 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
