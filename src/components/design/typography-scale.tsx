import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Typography Scale Component
 * Provides consistent typography across the Sensey Board application
 * Based on the design system in visual-design-reference.md
 */

interface TypographyProps {
  className?: string;
  children: React.ReactNode;
}

export function H1({ className, children }: TypographyProps) {
  return (
    <h1
      className={cn(
        'text-4xl font-semibold tracking-tight text-foreground',
        className
      )}
    >
      {children}
    </h1>
  );
}

export function H2({ className, children }: TypographyProps) {
  return (
    <h2
      className={cn(
        'text-3xl font-semibold tracking-tight text-foreground',
        className
      )}
    >
      {children}
    </h2>
  );
}

export function H3({ className, children }: TypographyProps) {
  return (
    <h3
      className={cn(
        'text-2xl font-semibold tracking-tight text-foreground',
        className
      )}
    >
      {children}
    </h3>
  );
}

export function H4({ className, children }: TypographyProps) {
  return (
    <h4
      className={cn(
        'text-xl font-semibold tracking-tight text-foreground',
        className
      )}
    >
      {children}
    </h4>
  );
}

export function H5({ className, children }: TypographyProps) {
  return (
    <h5
      className={cn(
        'text-lg font-semibold tracking-tight text-foreground',
        className
      )}
    >
      {children}
    </h5>
  );
}

export function H6({ className, children }: TypographyProps) {
  return (
    <h6
      className={cn(
        'text-base font-semibold tracking-tight text-foreground',
        className
      )}
    >
      {children}
    </h6>
  );
}

export function Paragraph({ className, children }: TypographyProps) {
  return (
    <p className={cn('text-base leading-7 text-foreground', className)}>
      {children}
    </p>
  );
}

export function Lead({ className, children }: TypographyProps) {
  return (
    <p
      className={cn(
        'text-lg leading-7 text-muted-foreground font-normal',
        className
      )}
    >
      {children}
    </p>
  );
}

export function Large({ className, children }: TypographyProps) {
  return (
    <div className={cn('text-lg font-semibold text-foreground', className)}>
      {children}
    </div>
  );
}

export function Small({ className, children }: TypographyProps) {
  return (
    <small
      className={cn(
        'text-sm font-medium leading-none text-foreground',
        className
      )}
    >
      {children}
    </small>
  );
}

export function Subtle({ className, children }: TypographyProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
  );
}

export function Muted({ className, children }: TypographyProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
  );
}

export function Code({ className, children }: TypographyProps) {
  return (
    <code
      className={cn(
        'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
        className
      )}
    >
      {children}
    </code>
  );
}

export function InlineCode({ className, children }: TypographyProps) {
  return (
    <code
      className={cn(
        'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm',
        className
      )}
    >
      {children}
    </code>
  );
}

export function Blockquote({ className, children }: TypographyProps) {
  return (
    <blockquote
      className={cn('mt-6 border-l-2 border-primary pl-6 italic', className)}
    >
      {children}
    </blockquote>
  );
}

export function List({ className, children }: TypographyProps) {
  return (
    <ul className={cn('my-6 ml-6 list-disc [&>li]:mt-2', className)}>
      {children}
    </ul>
  );
}

/**
 * Typography variants for specific UI elements
 */

export function BoardTitle({ className, children }: TypographyProps) {
  return (
    <h2
      className={cn(
        'text-2xl font-semibold tracking-tight text-foreground',
        className
      )}
    >
      {children}
    </h2>
  );
}

export function BoardDescription({ className, children }: TypographyProps) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
  );
}

export function TicketTitle({ className, children }: TypographyProps) {
  return (
    <h3
      className={cn(
        'text-sm font-medium leading-tight text-foreground line-clamp-2',
        className
      )}
    >
      {children}
    </h3>
  );
}

export function TicketKey({ className, children }: TypographyProps) {
  return (
    <span
      className={cn('text-xs font-semibold text-muted-foreground', className)}
    >
      {children}
    </span>
  );
}

export function SectionTitle({ className, children }: TypographyProps) {
  return (
    <h2
      className={cn(
        'text-xl font-semibold tracking-tight text-foreground',
        className
      )}
    >
      {children}
    </h2>
  );
}

export function Label({ className, children }: TypographyProps) {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none text-foreground',
        className
      )}
    >
      {children}
    </label>
  );
}

export function EmptyStateTitle({ className, children }: TypographyProps) {
  return (
    <h3
      className={cn(
        'text-lg font-semibold text-foreground text-center',
        className
      )}
    >
      {children}
    </h3>
  );
}

export function EmptyStateDescription({
  className,
  children,
}: TypographyProps) {
  return (
    <p
      className={cn(
        'text-sm text-muted-foreground text-center max-w-md',
        className
      )}
    >
      {children}
    </p>
  );
}

/**
 * Typography export object for convenient usage
 */
export const Typography = {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Paragraph,
  Lead,
  Large,
  Small,
  Subtle,
  Muted,
  Code,
  InlineCode,
  Blockquote,
  List,
  BoardTitle,
  BoardDescription,
  TicketTitle,
  TicketKey,
  SectionTitle,
  Label,
  EmptyStateTitle,
  EmptyStateDescription,
};
