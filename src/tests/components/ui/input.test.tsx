/**
 * Input Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';

describe('Input', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('accepts and displays user input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);

    const input = screen.getByPlaceholderText('Type here');
    await user.type(input, 'Hello World');

    expect(input).toHaveValue('Hello World');
  });

  it('handles onChange event', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Input placeholder="Type here" onChange={onChange} />);

    const input = screen.getByPlaceholderText('Type here');
    await user.type(input, 'Test');

    expect(onChange).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Input className="custom-class" placeholder="Test" />);
    const input = screen.getByPlaceholderText('Test');
    expect(input.className).toContain('custom-class');
  });

  it('can be disabled', () => {
    render(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
  });

  it('supports different input types', () => {
    const { rerender } = render(<Input type="text" placeholder="Text" />);
    expect(screen.getByPlaceholderText('Text')).toHaveAttribute('type', 'text');

    rerender(<Input type="email" placeholder="Email" />);
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute(
      'type',
      'email'
    );

    rerender(<Input type="password" placeholder="Password" />);
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute(
      'type',
      'password'
    );
  });

  it('supports default value', () => {
    render(<Input defaultValue="Default text" />);
    expect(screen.getByDisplayValue('Default text')).toBeInTheDocument();
  });

  it('supports controlled value', () => {
    const { rerender } = render(<Input value="Initial" onChange={() => {}} />);
    expect(screen.getByDisplayValue('Initial')).toBeInTheDocument();

    rerender(<Input value="Updated" onChange={() => {}} />);
    expect(screen.getByDisplayValue('Updated')).toBeInTheDocument();
  });

  it('supports required attribute', () => {
    render(<Input required placeholder="Required field" />);
    expect(screen.getByPlaceholderText('Required field')).toBeRequired();
  });

  it('supports readonly attribute', () => {
    render(<Input readOnly value="Read only" />);
    const input = screen.getByDisplayValue('Read only');
    expect(input).toHaveAttribute('readonly');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} placeholder="Test" />);
    expect(ref).toHaveBeenCalled();
  });

  it('supports maxLength attribute', () => {
    render(<Input maxLength={10} placeholder="Max 10 chars" />);
    expect(screen.getByPlaceholderText('Max 10 chars')).toHaveAttribute(
      'maxLength',
      '10'
    );
  });

  it('supports aria-label for accessibility', () => {
    render(<Input aria-label="Search field" placeholder="Search" />);
    expect(screen.getByLabelText('Search field')).toBeInTheDocument();
  });
});
