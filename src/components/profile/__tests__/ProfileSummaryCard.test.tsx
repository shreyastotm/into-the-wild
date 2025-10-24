import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProfileSummaryCard from '../ProfileSummaryCard';







describe('ProfileSummaryCard', () => {
  

  it('renders without crashing', () => {
    render(<ProfileSummaryCard  />);
    expect(screen.getByText(/ProfileSummaryCard|Submit|Save|Login|Register|Sign/i)).toBeInTheDocument();
  });

  

  

  it('updates state correctly', async () => {
    render(<ProfileSummaryCard data-testid="profilesummarycard" />);
    fireEvent.click(screen.getByTestId('profilesummarycard'));
    await waitFor(() => {
      expect(screen.getByTestId('profilesummarycard')).toHaveTextContent(/updated|changed|new/i);
    });
  });

  
});
