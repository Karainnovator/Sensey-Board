/**
 * TicketPriorityIcon Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  TicketPriorityIcon,
  getPriorityLabel,
  getPriorityColorClass,
} from '@/components/ticket/ticket-priority-icon';

describe('TicketPriorityIcon', () => {
  it('renders lowest priority with correct label', () => {
    render(<TicketPriorityIcon priority="LOWEST" />);
    expect(screen.getByLabelText(/priority: lowest/i)).toBeInTheDocument();
  });

  it('renders low priority with correct label', () => {
    render(<TicketPriorityIcon priority="LOW" />);
    expect(screen.getByLabelText(/priority: low/i)).toBeInTheDocument();
  });

  it('renders medium priority with correct label', () => {
    render(<TicketPriorityIcon priority="MEDIUM" />);
    expect(screen.getByLabelText(/priority: medium/i)).toBeInTheDocument();
  });

  it('renders high priority with correct label', () => {
    render(<TicketPriorityIcon priority="HIGH" />);
    expect(screen.getByLabelText(/priority: high/i)).toBeInTheDocument();
  });

  it('renders highest priority with correct label', () => {
    render(<TicketPriorityIcon priority="HIGHEST" />);
    expect(screen.getByLabelText(/priority: highest/i)).toBeInTheDocument();
  });

  it('applies custom size', () => {
    const { container } = render(
      <TicketPriorityIcon priority="MEDIUM" size={24} />
    );
    const icon = container.querySelector('svg');
    expect(icon).toHaveAttribute('width', '24');
    expect(icon).toHaveAttribute('height', '24');
  });

  it('applies custom className', () => {
    const { container } = render(
      <TicketPriorityIcon priority="HIGH" className="custom-class" />
    );
    const icon = container.querySelector('svg');
    expect(icon?.className).toContain('custom-class');
  });

  it('has correct color for LOWEST priority', () => {
    const { container } = render(<TicketPriorityIcon priority="LOWEST" />);
    const icon = container.querySelector('svg');
    expect(icon?.className).toContain('text-gray-400');
  });

  it('has correct color for LOW priority', () => {
    const { container } = render(<TicketPriorityIcon priority="LOW" />);
    const icon = container.querySelector('svg');
    expect(icon?.className).toContain('text-blue-500');
  });

  it('has correct color for MEDIUM priority', () => {
    const { container } = render(<TicketPriorityIcon priority="MEDIUM" />);
    const icon = container.querySelector('svg');
    expect(icon?.className).toContain('text-gray-500');
  });

  it('has correct color for HIGH priority', () => {
    const { container } = render(<TicketPriorityIcon priority="HIGH" />);
    const icon = container.querySelector('svg');
    expect(icon?.className).toContain('text-orange-500');
  });

  it('has correct color for HIGHEST priority', () => {
    const { container } = render(<TicketPriorityIcon priority="HIGHEST" />);
    const icon = container.querySelector('svg');
    expect(icon?.className).toContain('text-red-500');
  });
});

describe('getPriorityLabel', () => {
  it('returns correct label for each priority', () => {
    expect(getPriorityLabel('LOWEST')).toBe('Lowest');
    expect(getPriorityLabel('LOW')).toBe('Low');
    expect(getPriorityLabel('MEDIUM')).toBe('Medium');
    expect(getPriorityLabel('HIGH')).toBe('High');
    expect(getPriorityLabel('HIGHEST')).toBe('Highest');
  });
});

describe('getPriorityColorClass', () => {
  it('returns correct color class for each priority', () => {
    expect(getPriorityColorClass('LOWEST')).toBe('text-gray-400');
    expect(getPriorityColorClass('LOW')).toBe('text-blue-500');
    expect(getPriorityColorClass('MEDIUM')).toBe('text-gray-500');
    expect(getPriorityColorClass('HIGH')).toBe('text-orange-500');
    expect(getPriorityColorClass('HIGHEST')).toBe('text-red-500');
  });
});
