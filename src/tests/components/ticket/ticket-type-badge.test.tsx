/**
 * TicketTypeBadge Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TicketTypeBadge } from '@/components/ticket/ticket-type-badge';

describe('TicketTypeBadge', () => {
  it('renders ISSUE type correctly', () => {
    render(<TicketTypeBadge type="ISSUE" />);
    expect(screen.getByText('ISSUE')).toBeInTheDocument();
  });

  it('renders FIX type correctly', () => {
    render(<TicketTypeBadge type="FIX" />);
    expect(screen.getByText('FIX')).toBeInTheDocument();
  });

  it('renders HOTFIX type correctly', () => {
    render(<TicketTypeBadge type="HOTFIX" />);
    expect(screen.getByText('HOTFIX')).toBeInTheDocument();
  });

  it('renders PROBLEM type correctly', () => {
    render(<TicketTypeBadge type="PROBLEM" />);
    expect(screen.getByText('PROBLEM')).toBeInTheDocument();
  });

  it('applies correct color classes for ISSUE', () => {
    const { container } = render(<TicketTypeBadge type="ISSUE" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-ticket-issue');
  });

  it('applies correct color classes for FIX', () => {
    const { container } = render(<TicketTypeBadge type="FIX" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-ticket-fix');
  });

  it('applies correct color classes for HOTFIX', () => {
    const { container } = render(<TicketTypeBadge type="HOTFIX" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-ticket-hotfix');
  });

  it('applies correct color classes for PROBLEM', () => {
    const { container } = render(<TicketTypeBadge type="PROBLEM" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-ticket-problem');
  });
});
