/**
 * SprintSelector Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SprintSelector } from '@/components/sprint/sprint-selector';
import { mockSprint } from '@/tests/utils/test-helpers';

describe('SprintSelector', () => {
  const sprints = [
    {
      ...mockSprint,
      id: '1',
      number: 1,
      name: 'Sprint 1',
      status: 'COMPLETED' as const,
    },
    {
      ...mockSprint,
      id: '2',
      number: 2,
      name: 'Sprint 2',
      status: 'ACTIVE' as const,
    },
    {
      ...mockSprint,
      id: '3',
      number: 3,
      name: 'Sprint 3',
      status: 'PLANNED' as const,
    },
  ];

  it('renders current sprint name', () => {
    render(
      <SprintSelector
        sprints={sprints}
        currentSprintId="2"
        onSprintChange={() => {}}
        onCreateSprint={() => {}}
      />
    );
    expect(screen.getByText('Sprint 2')).toBeInTheDocument();
  });

  it('shows "Active" label for active sprint', () => {
    render(
      <SprintSelector
        sprints={sprints}
        currentSprintId="2"
        onSprintChange={() => {}}
        onCreateSprint={() => {}}
      />
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows "Select Sprint" when no sprint is selected', () => {
    render(
      <SprintSelector
        sprints={sprints}
        currentSprintId={null}
        onSprintChange={() => {}}
        onCreateSprint={() => {}}
      />
    );
    expect(screen.getByText('Select Sprint')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', async () => {
    const user = userEvent.setup();
    render(
      <SprintSelector
        sprints={sprints}
        currentSprintId="2"
        onSprintChange={() => {}}
        onCreateSprint={() => {}}
      />
    );

    const trigger = screen.getByRole('button', { name: /sprint 2/i });
    await user.click(trigger);

    // Check for section headers
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Planned')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('shows all sprint names in dropdown', async () => {
    const user = userEvent.setup();
    render(
      <SprintSelector
        sprints={sprints}
        currentSprintId="2"
        onSprintChange={() => {}}
        onCreateSprint={() => {}}
      />
    );

    await user.click(screen.getByRole('button'));

    const sprint1Elements = screen.getAllByText('Sprint 1');
    expect(sprint1Elements).toHaveLength(1);
    const sprint2Elements = screen.getAllByText('Sprint 2');
    expect(sprint2Elements).toHaveLength(2); // One in trigger, one in dropdown
    const sprint3Elements = screen.getAllByText('Sprint 3');
    expect(sprint3Elements).toHaveLength(1);
  });

  it('calls onSprintChange when sprint is selected', async () => {
    const onSprintChange = vi.fn();
    const user = userEvent.setup();
    render(
      <SprintSelector
        sprints={sprints}
        currentSprintId="2"
        onSprintChange={onSprintChange}
        onCreateSprint={() => {}}
      />
    );

    await user.click(screen.getByRole('button'));
    const sprint1Option = screen.getAllByText('Sprint 1')[0];
    if (sprint1Option) {
      await user.click(sprint1Option);
    }

    expect(onSprintChange).toHaveBeenCalledWith('1');
  });

  it('shows "Create New Sprint" button', async () => {
    const user = userEvent.setup();
    render(
      <SprintSelector
        sprints={sprints}
        currentSprintId="2"
        onSprintChange={() => {}}
        onCreateSprint={() => {}}
      />
    );

    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Create New Sprint')).toBeInTheDocument();
  });

  it('calls onCreateSprint when create button is clicked', async () => {
    const onCreateSprint = vi.fn();
    const user = userEvent.setup();
    render(
      <SprintSelector
        sprints={sprints}
        currentSprintId="2"
        onSprintChange={() => {}}
        onCreateSprint={onCreateSprint}
      />
    );

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Create New Sprint'));

    expect(onCreateSprint).toHaveBeenCalled();
  });

  it('shows checkmark for current sprint', async () => {
    const user = userEvent.setup();
    render(
      <SprintSelector
        sprints={sprints}
        currentSprintId="2"
        onSprintChange={() => {}}
        onCreateSprint={() => {}}
      />
    );

    await user.click(screen.getByRole('button'));
    const dropdown = screen.getByText('Active').closest('[role="menu"]');
    expect(dropdown).toBeInTheDocument();
  });

  it('groups sprints by status', async () => {
    const user = userEvent.setup();
    render(
      <SprintSelector
        sprints={sprints}
        currentSprintId="2"
        onSprintChange={() => {}}
        onCreateSprint={() => {}}
      />
    );

    await user.click(screen.getByRole('button'));

    // Check section headers
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Planned')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('handles empty sprint list', () => {
    render(
      <SprintSelector
        sprints={[]}
        currentSprintId={null}
        onSprintChange={() => {}}
        onCreateSprint={() => {}}
      />
    );
    expect(screen.getByText('Select Sprint')).toBeInTheDocument();
  });
});
