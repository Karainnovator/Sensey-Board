/**
 * TicketRow Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TicketRow, TicketListHeader } from '@/components/ticket/ticket-row';
import {
  mockTicket,
  mockUser,
  createMockTicketWithSubTickets,
} from '@/tests/utils/test-helpers';

describe('TicketRow', () => {
  const defaultTicket = {
    ...mockTicket,
    assignee: mockUser,
    reviewerId: null,
    percentage: 0,
    weight: 1,
    missionRank: null,
    projectId: null,
  };

  it('renders ticket key', () => {
    render(<TicketRow ticket={defaultTicket} />);
    expect(screen.getByText('TEST-1')).toBeInTheDocument();
  });

  it('renders ticket title', () => {
    render(<TicketRow ticket={defaultTicket} />);
    expect(screen.getByText('Test Ticket')).toBeInTheDocument();
  });

  it('renders assignee name', () => {
    render(<TicketRow ticket={defaultTicket} />);
    expect(screen.getByText('Test')).toBeInTheDocument(); // First name only
  });

  it('shows "Unassigned" when no assignee', () => {
    const ticketWithoutAssignee = {
      ...mockTicket,
      assignee: null,
      reviewerId: null,
      percentage: 0,
      weight: 1,
      missionRank: null,
      projectId: null,
    };
    render(<TicketRow ticket={ticketWithoutAssignee} />);
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  it('renders correct status label', () => {
    render(
      <TicketRow
        ticket={{
          ...defaultTicket,
          status: 'TODO',
          reviewerId: null,
          percentage: 0,
          weight: 1,
          missionRank: null,
          projectId: null,
        }}
      />
    );
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('calls onClick when title is clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<TicketRow ticket={defaultTicket} onClick={onClick} />);

    await user.click(screen.getByText('Test Ticket'));
    expect(onClick).toHaveBeenCalled();
  });

  it('renders at correct height for level 0', () => {
    const { container } = render(
      <TicketRow ticket={defaultTicket} level={0} />
    );
    const row = container.querySelector('.h-12');
    expect(row).toBeInTheDocument();
  });

  it('renders at correct height for sub-ticket', () => {
    const { container } = render(
      <TicketRow ticket={defaultTicket} level={1} />
    );
    const row = container.querySelector('.h-10');
    expect(row).toBeInTheDocument();
  });

  it('indents based on level', () => {
    const { container } = render(
      <TicketRow ticket={defaultTicket} level={2} />
    );
    const row = container.firstChild as HTMLElement;
    expect(row.style.paddingLeft).toBe('64px'); // 2 * 24 + 16
  });

  it('hides expand button when no sub-tickets', () => {
    const { container } = render(<TicketRow ticket={defaultTicket} />);
    const expandButton = container.querySelector('button');
    expect(expandButton?.className).toContain('invisible');
  });

  it('shows expand button when has sub-tickets', () => {
    const ticketWithSubs = createMockTicketWithSubTickets('TEST-1', 2);
    const { container } = render(<TicketRow ticket={ticketWithSubs} />);
    const expandButton = container.querySelector('button');
    expect(expandButton?.className).not.toContain('invisible');
  });

  it('toggles sub-tickets on expand button click', async () => {
    const ticketWithSubs = createMockTicketWithSubTickets('TEST-1', 2);
    const user = userEvent.setup();
    render(<TicketRow ticket={ticketWithSubs} />);

    // Initially expanded, sub-tickets should be visible
    expect(screen.getByText('TEST-1.1')).toBeInTheDocument();

    // Click to collapse
    const expandButton = screen.getAllByRole('button')[0];
    if (expandButton) {
      await user.click(expandButton);
    }

    // Sub-tickets should be hidden
    expect(screen.queryByText('TEST-1.1')).not.toBeInTheDocument();
  });

  it('renders sub-tickets recursively', () => {
    const ticketWithSubs = createMockTicketWithSubTickets('TEST-1', 2);
    render(<TicketRow ticket={ticketWithSubs} />);

    expect(screen.getByText('TEST-1.1')).toBeInTheDocument();
    expect(screen.getByText('TEST-1.2')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <TicketRow ticket={defaultTicket} className="custom-class" />
    );
    const row = container.firstChild as HTMLElement;
    expect(row.className).toContain('custom-class');
  });

  it('renders assignee avatar initials', () => {
    render(<TicketRow ticket={defaultTicket} />);
    expect(screen.getByText('TU')).toBeInTheDocument(); // Test User
  });

  it('shows different status icons', () => {
    const { rerender } = render(
      <TicketRow
        ticket={{
          ...defaultTicket,
          status: 'TODO',
          reviewerId: null,
          percentage: 0,
          weight: 1,
          missionRank: null,
          projectId: null,
        }}
      />
    );
    expect(screen.getByText('▣')).toBeInTheDocument();

    rerender(
      <TicketRow
        ticket={{
          ...defaultTicket,
          status: 'DONE',
          reviewerId: null,
          percentage: 0,
          weight: 1,
          missionRank: null,
          projectId: null,
        }}
      />
    );
    expect(screen.getByText('✓')).toBeInTheDocument();
  });
});

describe('TicketListHeader', () => {
  it('renders all column headers', () => {
    render(<TicketListHeader />);

    expect(screen.getByText('Key')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('Assignee')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('has correct styling for headers', () => {
    const { container } = render(<TicketListHeader />);
    const headers = container.querySelectorAll(
      '.text-xs.font-semibold.uppercase'
    );
    expect(headers.length).toBeGreaterThan(0);
  });
});
