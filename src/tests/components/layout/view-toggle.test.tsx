/**
 * ViewToggle Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewToggle } from '@/components/layout/view-toggle';

describe('ViewToggle', () => {
  it('renders both view options', () => {
    render(<ViewToggle view="kanban" onViewChange={() => {}} />);
    expect(
      screen.getByRole('button', { name: /switch to list view/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /switch to kanban view/i })
    ).toBeInTheDocument();
  });

  it('renders with list and board labels', () => {
    render(<ViewToggle view="kanban" onViewChange={() => {}} />);
    expect(screen.getByText('List')).toBeInTheDocument();
    expect(screen.getByText('Board')).toBeInTheDocument();
  });

  it('highlights kanban view when active', () => {
    render(<ViewToggle view="kanban" onViewChange={() => {}} />);
    const kanbanBtn = screen.getByRole('button', {
      name: /switch to kanban view/i,
    });
    expect(kanbanBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('highlights list view when active', () => {
    render(<ViewToggle view="list" onViewChange={() => {}} />);
    const listBtn = screen.getByRole('button', {
      name: /switch to list view/i,
    });
    expect(listBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onViewChange when list view is clicked', async () => {
    const onViewChange = vi.fn();
    const user = userEvent.setup();
    render(<ViewToggle view="kanban" onViewChange={onViewChange} />);

    await user.click(
      screen.getByRole('button', { name: /switch to list view/i })
    );
    expect(onViewChange).toHaveBeenCalledWith('list');
  });

  it('calls onViewChange when kanban view is clicked', async () => {
    const onViewChange = vi.fn();
    const user = userEvent.setup();
    render(<ViewToggle view="list" onViewChange={onViewChange} />);

    await user.click(
      screen.getByRole('button', { name: /switch to kanban view/i })
    );
    expect(onViewChange).toHaveBeenCalledWith('kanban');
  });

  it('has proper ARIA role for group', () => {
    const { container } = render(
      <ViewToggle view="kanban" onViewChange={() => {}} />
    );
    expect(container.querySelector('[role="group"]')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <ViewToggle
        view="kanban"
        onViewChange={() => {}}
        className="custom-class"
      />
    );
    const group = container.querySelector('[role="group"]');
    expect(group?.className).toContain('custom-class');
  });

  it('shows correct icons for each view', () => {
    const { container } = render(
      <ViewToggle view="kanban" onViewChange={() => {}} />
    );
    const icons = container.querySelectorAll('svg');
    expect(icons).toHaveLength(2); // List icon and Kanban icon
  });

  it('does not call onViewChange when clicking the already active view', async () => {
    const onViewChange = vi.fn();
    const user = userEvent.setup();
    render(<ViewToggle view="kanban" onViewChange={onViewChange} />);

    // Click on already active kanban view
    await user.click(
      screen.getByRole('button', { name: /switch to kanban view/i })
    );
    expect(onViewChange).toHaveBeenCalledWith('kanban');
    expect(onViewChange).toHaveBeenCalledTimes(1);
  });
});
