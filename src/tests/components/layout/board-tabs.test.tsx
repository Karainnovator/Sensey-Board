/**
 * BoardTabs Component Tests
 */

import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BoardTabs } from '@/components/layout/board-tabs';

// Mock usePathname
const mockPathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('BoardTabs', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/board/board-1/backlog');
  });

  it('renders both tabs', () => {
    render(<BoardTabs boardId="board-1" />);
    expect(screen.getByText('Backlog')).toBeInTheDocument();
    expect(screen.getByText('Sprint')).toBeInTheDocument();
  });

  it('highlights active tab (Backlog)', () => {
    mockPathname.mockReturnValue('/board/board-1/backlog');
    render(<BoardTabs boardId="board-1" />);

    const backlogTab = screen.getByText('Backlog').closest('a');
    expect(backlogTab).toHaveAttribute('aria-current', 'page');
  });

  it('highlights active tab (Sprint)', () => {
    mockPathname.mockReturnValue('/board/board-1/sprint');
    render(<BoardTabs boardId="board-1" />);

    const sprintTab = screen.getByText('Sprint').closest('a');
    expect(sprintTab).toHaveAttribute('aria-current', 'page');
  });

  it('creates correct links', () => {
    render(<BoardTabs boardId="board-1" />);

    const backlogLink = screen.getByText('Backlog').closest('a');
    const sprintLink = screen.getByText('Sprint').closest('a');

    expect(backlogLink).toHaveAttribute('href', '/board/board-1/backlog');
    expect(sprintLink).toHaveAttribute('href', '/board/board-1/sprint');
  });

  it('shows active indicator for current tab', () => {
    mockPathname.mockReturnValue('/board/board-1/backlog');
    const { container } = render(<BoardTabs boardId="board-1" />);

    const activeIndicator = container.querySelector('.bg-sakura-500');
    expect(activeIndicator).toBeInTheDocument();
  });

  it('has proper navigation ARIA label', () => {
    render(<BoardTabs boardId="board-1" />);
    expect(screen.getByLabelText('Board navigation tabs')).toBeInTheDocument();
  });

  it('applies focus styles', () => {
    render(<BoardTabs boardId="board-1" />);
    const backlogLink = screen.getByText('Backlog').closest('a');
    expect(backlogLink?.className).toContain('focus-visible:ring-2');
  });

  it('uses different board IDs correctly', () => {
    render(<BoardTabs boardId="board-123" />);

    const backlogLink = screen.getByText('Backlog').closest('a');
    const sprintLink = screen.getByText('Sprint').closest('a');

    expect(backlogLink).toHaveAttribute('href', '/board/board-123/backlog');
    expect(sprintLink).toHaveAttribute('href', '/board/board-123/sprint');
  });

  it('does not show active indicator for inactive tab', () => {
    mockPathname.mockReturnValue('/board/board-1/backlog');
    render(<BoardTabs boardId="board-1" />);

    const sprintTab = screen.getByText('Sprint').closest('a');
    expect(sprintTab).not.toHaveAttribute('aria-current');
  });
});
