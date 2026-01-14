/**
 * BoardCard Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BoardCard, CreateBoardCard } from '@/components/board/board-card';
import { mockBoardMember, mockUser } from '@/tests/utils/test-helpers';

describe('BoardCard', () => {
  const defaultProps = {
    id: 'board-1',
    name: 'Test Board',
    description: 'A test board',
    color: '#FFB7C5',
    icon: '🎯',
    members: [mockBoardMember],
    ticketCount: 5,
  };

  it('renders board name', () => {
    render(<BoardCard {...defaultProps} />);
    expect(screen.getByText('Test Board')).toBeInTheDocument();
  });

  it('renders board description', () => {
    render(<BoardCard {...defaultProps} />);
    expect(screen.getByText('A test board')).toBeInTheDocument();
  });

  it('renders board icon', () => {
    render(<BoardCard {...defaultProps} />);
    expect(screen.getByText('🎯')).toBeInTheDocument();
  });

  it('renders ticket count', () => {
    render(<BoardCard {...defaultProps} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('tickets')).toBeInTheDocument();
  });

  it('renders singular ticket text when count is 1', () => {
    render(<BoardCard {...defaultProps} ticketCount={1} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('ticket')).toBeInTheDocument();
  });

  it('renders member avatars', () => {
    render(<BoardCard {...defaultProps} />);
    const avatar = screen.getByText('TU'); // Test User initials
    expect(avatar).toBeInTheDocument();
  });

  it('shows up to 3 members and remaining count', () => {
    const members = [
      {
        ...mockBoardMember,
        id: '1',
        user: { ...mockUser, id: '1', name: 'User One' },
      },
      {
        ...mockBoardMember,
        id: '2',
        user: { ...mockUser, id: '2', name: 'User Two' },
      },
      {
        ...mockBoardMember,
        id: '3',
        user: { ...mockUser, id: '3', name: 'User Three' },
      },
      {
        ...mockBoardMember,
        id: '4',
        user: { ...mockUser, id: '4', name: 'User Four' },
      },
      {
        ...mockBoardMember,
        id: '5',
        user: { ...mockUser, id: '5', name: 'User Five' },
      },
    ];
    render(<BoardCard {...defaultProps} members={members} />);
    expect(screen.getByText('+2')).toBeInTheDocument(); // 5 - 3 = +2
  });

  it('does not show remaining count when members <= 3', () => {
    const members = [
      {
        ...mockBoardMember,
        id: '1',
        user: { ...mockUser, id: '1', name: 'User One' },
      },
      {
        ...mockBoardMember,
        id: '2',
        user: { ...mockUser, id: '2', name: 'User Two' },
      },
    ];
    render(<BoardCard {...defaultProps} members={members} />);
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('renders as a link to board detail page', () => {
    const { container } = render(<BoardCard {...defaultProps} />);
    const link = container.querySelector('a');
    expect(link).toHaveAttribute('href', '/board/board-1');
  });

  it('handles null description', () => {
    render(<BoardCard {...defaultProps} description={null} />);
    expect(screen.queryByText('A test board')).not.toBeInTheDocument();
  });

  it('handles null icon', () => {
    render(<BoardCard {...defaultProps} icon={null} />);
    expect(screen.queryByText('🎯')).not.toBeInTheDocument();
  });

  it('applies gradient style with board color', () => {
    const { container } = render(<BoardCard {...defaultProps} />);
    const card = container.querySelector('.group');
    expect(card).toHaveStyle({
      background: expect.stringContaining('#FFB7C5'),
    });
  });
});

describe('CreateBoardCard', () => {
  it('renders create board text', () => {
    render(<CreateBoardCard onClick={() => {}} />);
    expect(screen.getByText('Create Board')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<CreateBoardCard onClick={() => {}} />);
    expect(screen.getByText('Start a new project')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<CreateBoardCard onClick={onClick} />);

    const card = screen.getByText('Create Board').closest('.group');
    expect(card).toBeInTheDocument();

    if (card) {
      await user.click(card);
      expect(onClick).toHaveBeenCalled();
    }
  });

  it('has dashed border', () => {
    const { container } = render(<CreateBoardCard onClick={() => {}} />);
    const card = container.querySelector('.border-dashed');
    expect(card).toBeInTheDocument();
  });

  it('renders plus icon', () => {
    const { container } = render(<CreateBoardCard onClick={() => {}} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
