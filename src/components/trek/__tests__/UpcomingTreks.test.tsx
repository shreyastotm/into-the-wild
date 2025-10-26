import { createClient } from '@supabase/supabase-js';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import UpcomingTreks from '../UpcomingTreks';

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

// Wrapper for Router
const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('UpcomingTreks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithRouter(<UpcomingTreks data-testid="upcomingtreks" />);
    expect(screen.getByTestId('upcomingtreks')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    renderWithRouter(<UpcomingTreks title="Test Title" data-testid="upcomingtreks" />);
    expect(screen.getByTestId('upcomingtreks')).toHaveTextContent('Test Title');
  });

  it('handles user interactions', () => {
    const handleClick = vi.fn();
    renderWithRouter(<UpcomingTreks onClick={handleClick} data-testid="upcomingtreks" />);
    fireEvent.click(screen.getByTestId('upcomingtreks'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('updates state correctly', async () => {
    renderWithRouter(<UpcomingTreks data-testid="upcomingtreks" />);
    fireEvent.click(screen.getByTestId('upcomingtreks'));
    await waitFor(() => {
      expect(screen.getByTestId('upcomingtreks')).toHaveTextContent(/updated|changed|new/i);
    });
  });

  it('interacts with Supabase correctly', async () => {
    renderWithRouter(<UpcomingTreks data-testid="upcomingtreks" />);
    // Verify Supabase client was created
    expect(createClient).toHaveBeenCalled();
    
    // Test component behavior that uses Supabase
    // This will depend on the specific component
  });
});
