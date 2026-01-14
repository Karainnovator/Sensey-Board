/**
 * Badge Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  it('renders correctly with text', () => {
    render(<Badge>Badge Text</Badge>);
    expect(screen.getByText('Badge Text')).toBeInTheDocument();
  });

  it('applies default variant', () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-primary');
  });

  it('applies secondary variant', () => {
    const { container } = render(<Badge variant="secondary">Secondary</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-secondary');
  });

  it('applies destructive variant', () => {
    const { container } = render(<Badge variant="destructive">Error</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-destructive');
  });

  it('applies outline variant', () => {
    const { container } = render(<Badge variant="outline">Outline</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('text-foreground');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Badge className="custom-class">Custom</Badge>
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('custom-class');
  });

  it('renders as a div element', () => {
    const { container } = render(<Badge>Test</Badge>);
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('supports children nodes', () => {
    render(
      <Badge>
        <span>Icon</span>
        <span>Text</span>
      </Badge>
    );
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });

  it('forwards HTML attributes', () => {
    render(<Badge data-testid="test-badge">Test</Badge>);
    expect(screen.getByTestId('test-badge')).toBeInTheDocument();
  });

  it('supports aria-label for accessibility', () => {
    render(<Badge aria-label="Status badge">Active</Badge>);
    expect(screen.getByLabelText('Status badge')).toBeInTheDocument();
  });

  it('combines variant and custom classes correctly', () => {
    const { container } = render(
      <Badge variant="secondary" className="ml-2">
        Combined
      </Badge>
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-secondary');
    expect(badge.className).toContain('ml-2');
  });
});
