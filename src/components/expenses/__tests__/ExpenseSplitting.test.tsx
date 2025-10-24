import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ExpenseSplitting from '../ExpenseSplitting';

import { BrowserRouter } from 'react-router-dom';



// Wrapper for Router
const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('ExpenseSplitting', () => {
  

  it('renders without crashing', () => {
    renderWithRouter(<ExpenseSplitting data-testid="expensesplitting" />);
    expect(screen.getByTestId('expensesplitting')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    renderWithRouter(<ExpenseSplitting title="Test Title" data-testid="expensesplitting" />);
    expect(screen.getByTestId('expensesplitting')).toHaveTextContent('Test Title');
  });

  it('handles user interactions', () => {
    const handleClick = vi.fn();
    renderWithRouter(<ExpenseSplitting onClick={handleClick} data-testid="expensesplitting" />);
    fireEvent.click(screen.getByTestId('expensesplitting'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('updates state correctly', async () => {
    renderWithRouter(<ExpenseSplitting data-testid="expensesplitting" />);
    fireEvent.click(screen.getByTestId('expensesplitting'));
    await waitFor(() => {
      expect(screen.getByTestId('expensesplitting')).toHaveTextContent(/updated|changed|new/i);
    });
  });

  
});
