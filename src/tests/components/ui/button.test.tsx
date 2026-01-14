/**
 * Button Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByText('Delete');
    expect(button.className).toContain('destructive');
  });

  it('applies size classes', () => {
    render(<Button size="lg">Large Button</Button>);
    const button = screen.getByText('Large Button');
    expect(button.className).toContain('h-10');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
  });

  it('supports custom className', () => {
    render(<Button className="custom-class">Button</Button>);
    const button = screen.getByText('Button');
    expect(button.className).toContain('custom-class');
  });

  it('renders as child component when asChild is true', () => {
    render(
      <Button asChild>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/test">Link Button</a>
      </Button>
    );
    const link = screen.getByText('Link Button');
    expect(link.tagName).toBe('A');
  });
});
