/**
 * EmptyState Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptyState } from '@/components/shared/empty-state';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        title="No items found"
        description="There are no items to display"
      />
    );

    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(
      screen.getByText('There are no items to display')
    ).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(
      <EmptyState
        icon={<span data-testid="test-icon">📋</span>}
        title="No items"
        description="Description"
      />
    );

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders action button when provided', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <EmptyState
        title="No items"
        description="Description"
        action={{
          label: 'Create Item',
          onClick: handleClick,
        }}
      />
    );

    const button = screen.getByText('Create Item');
    expect(button).toBeInTheDocument();

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not render action button when not provided', () => {
    render(<EmptyState title="No items" description="Description" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders without errors', () => {
    const { container } = render(
      <EmptyState title="No items" description="Description" />
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
