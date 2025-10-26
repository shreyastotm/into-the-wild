import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import TrekRatings from '../TrekRatings';

// Wrapper for Router
const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('TrekRatings', () => {

  it('renders without crashing', () => {
    renderWithRouter(<TrekRatings data-testid="trekratings" />);
    expect(screen.getByTestId('trekratings')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    renderWithRouter(<TrekRatings title="Test Title" data-testid="trekratings" />);
    expect(screen.getByTestId('trekratings')).toHaveTextContent('Test Title');
  });

  it('handles user interactions', () => {
    const handleClick = vi.fn();
    renderWithRouter(<TrekRatings onClick={handleClick} data-testid="trekratings" />);
    fireEvent.click(screen.getByTestId('trekratings'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('updates state correctly', async () => {
    renderWithRouter(<TrekRatings data-testid="trekratings" />);
    fireEvent.click(screen.getByTestId('trekratings'));
    await waitFor(() => {
      expect(screen.getByTestId('trekratings')).toHaveTextContent(/updated|changed|new/i);
    });
  });
  
});
