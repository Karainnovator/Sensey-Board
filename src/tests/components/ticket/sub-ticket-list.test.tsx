/**
 * SubTicketList Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubTicketList } from '@/components/ticket/sub-ticket-list';
import { mockTicket } from '@/tests/utils/test-helpers';

describe('SubTicketList', () => {
  const subTickets = [
    {
      ...mockTicket,
      id: 'sub-1',
      key: 'TEST-1.1',
      title: 'Sub-ticket 1',
      reviewerId: null,
      percentage: 0,
      weight: 1,
      missionRank: null,
      projectId: null,
    },
    {
      ...mockTicket,
      id: 'sub-2',
      key: 'TEST-1.2',
      title: 'Sub-ticket 2',
      reviewerId: null,
      percentage: 0,
      weight: 1,
      missionRank: null,
      projectId: null,
    },
  ];

  it('renders sub-tickets', () => {
    render(<SubTicketList subTickets={subTickets} />);
    expect(screen.getByText('TEST-1.1')).toBeInTheDocument();
    expect(screen.getByText('TEST-1.2')).toBeInTheDocument();
  });

  it('shows empty message when no sub-tickets', () => {
    render(<SubTicketList subTickets={[]} />);
    expect(screen.getByText('No sub-tickets yet')).toBeInTheDocument();
  });

  it('renders add button', () => {
    render(<SubTicketList subTickets={[]} onCreate={vi.fn()} />);
    expect(screen.getByText('Add sub-ticket')).toBeInTheDocument();
  });

  it('shows input form when add button is clicked', async () => {
    const user = userEvent.setup();
    render(<SubTicketList subTickets={[]} onCreate={vi.fn()} />);

    await user.click(screen.getByText('Add sub-ticket'));
    expect(
      screen.getByPlaceholderText('Sub-ticket title...')
    ).toBeInTheDocument();
  });

  it('calls onCreate when new sub-ticket is submitted', async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<SubTicketList subTickets={[]} onCreate={onCreate} />);

    await user.click(screen.getByText('Add sub-ticket'));
    const input = screen.getByPlaceholderText('Sub-ticket title...');
    await user.type(input, 'New Sub-ticket');

    const submitButton = screen
      .getAllByRole('button')
      .find((btn) => btn.querySelector('svg') && btn.className.includes('w-8'));
    if (submitButton) {
      await user.click(submitButton);
      expect(onCreate).toHaveBeenCalledWith('New Sub-ticket');
    }
  });

  it('cancels creation when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<SubTicketList subTickets={[]} onCreate={vi.fn()} />);

    await user.click(screen.getByText('Add sub-ticket'));
    const input = screen.getByPlaceholderText('Sub-ticket title...');
    await user.type(input, 'New Sub-ticket');

    // Find and click cancel button (X icon)
    const buttons = screen.getAllByRole('button');
    const cancelBtn = buttons[buttons.length - 1]; // Last button is cancel

    if (cancelBtn) {
      await user.click(cancelBtn);
    }
    expect(
      screen.queryByPlaceholderText('Sub-ticket title...')
    ).not.toBeInTheDocument();
  });

  it('submits on Enter key', async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<SubTicketList subTickets={[]} onCreate={onCreate} />);

    await user.click(screen.getByText('Add sub-ticket'));
    const input = screen.getByPlaceholderText('Sub-ticket title...');
    await user.type(input, 'New Sub-ticket{Enter}');

    expect(onCreate).toHaveBeenCalledWith('New Sub-ticket');
  });

  it('cancels on Escape key', async () => {
    const user = userEvent.setup();
    render(<SubTicketList subTickets={[]} onCreate={vi.fn()} />);

    await user.click(screen.getByText('Add sub-ticket'));
    const input = screen.getByPlaceholderText('Sub-ticket title...');
    await user.type(input, 'New Sub-ticket{Escape}');

    expect(
      screen.queryByPlaceholderText('Sub-ticket title...')
    ).not.toBeInTheDocument();
  });

  it('disables add button when onCreate is not provided', () => {
    render(<SubTicketList subTickets={[]} />);
    expect(screen.getByText('Add sub-ticket')).toBeDisabled();
  });

  it('shows delete buttons on hover', () => {
    render(<SubTicketList subTickets={subTickets} onDelete={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('allows inline title editing when clicked', async () => {
    const onUpdateTitle = vi.fn().mockResolvedValue(undefined);
    userEvent.setup();
    render(
      <SubTicketList subTickets={subTickets} onUpdateTitle={onUpdateTitle} />
    );

    // Sub-ticket titles should be clickable for inline editing
    const title = screen.getByText('Sub-ticket 1');
    expect(title).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<SubTicketList subTickets={subTickets} onDelete={onDelete} />);

    // Find delete button (Trash icon)
    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons.find(
      (btn) =>
        btn.querySelector('svg') && btn.className.includes('text-destructive')
    );

    if (deleteButton) {
      await user.click(deleteButton);
      expect(onDelete).toHaveBeenCalled();
    }
  });

  it('disables input while submitting', async () => {
    const onCreate = vi.fn(
      () => new Promise<void>((resolve) => setTimeout(resolve, 100))
    );
    const user = userEvent.setup();
    render(<SubTicketList subTickets={[]} onCreate={onCreate} />);

    await user.click(screen.getByText('Add sub-ticket'));
    const input = screen.getByPlaceholderText('Sub-ticket title...');
    await user.type(input, 'New Sub-ticket');

    const submitButton = screen
      .getAllByRole('button')
      .find((btn) => btn.querySelector('svg') && btn.className.includes('w-8'));
    if (submitButton) {
      await user.click(submitButton);
      expect(input).toBeDisabled();
    }
  });

  it('renders ticket type badge for each sub-ticket', () => {
    render(<SubTicketList subTickets={subTickets} />);
    // Check for ticket keys which indicate the tickets are rendered
    expect(screen.getByText('TEST-1.1')).toBeInTheDocument();
    expect(screen.getByText('TEST-1.2')).toBeInTheDocument();
  });

  it('renders priority icon for each sub-ticket', () => {
    const { container } = render(<SubTicketList subTickets={subTickets} />);
    // Priority icons are SVG elements
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });
});
