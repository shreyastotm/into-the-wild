import { createClient } from '@supabase/supabase-js';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ExpenseTable from '../ExpenseTable';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }),
      signIn: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      match: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      update: vi.fn().mockResolvedValue({ data: {}, error: null }),
      delete: vi.fn().mockResolvedValue({ data: {}, error: null }),
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/image.jpg' } }),
      }),
    },
  })),
}));

describe('ExpenseTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<ExpenseTable data-testid="expensetable" />);
    expect(screen.getByTestId('expensetable')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    render(<ExpenseTable title="Test Title" data-testid="expensetable" />);
    expect(screen.getByTestId('expensetable')).toHaveTextContent('Test Title');
  });

  it('handles user interactions', () => {
    const handleClick = vi.fn();
    render(<ExpenseTable onClick={handleClick} data-testid="expensetable" />);
    fireEvent.click(screen.getByTestId('expensetable'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('updates state correctly', async () => {
    render(<ExpenseTable data-testid="expensetable" />);
    fireEvent.click(screen.getByTestId('expensetable'));
    await waitFor(() => {
      expect(screen.getByTestId('expensetable')).toHaveTextContent(/updated|changed|new/i);
    });
  });

  it('interacts with Supabase correctly', async () => {
    render(<ExpenseTable data-testid="expensetable" />);
    // Verify Supabase client was created
    expect(createClient).toHaveBeenCalled();
    
    // Test component behavior that uses Supabase
    // This will depend on the specific component
  });
});
