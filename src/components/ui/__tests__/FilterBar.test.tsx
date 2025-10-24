import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import FilterBar from '../FilterBar';







describe('FilterBar', () => {
  

  it('renders without crashing', () => {
    render(<FilterBar data-testid="filterbar" />);
    expect(screen.getByTestId('filterbar')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    render(<FilterBar title="Test Title" data-testid="filterbar" />);
    expect(screen.getByTestId('filterbar')).toHaveTextContent('Test Title');
  });

  it('handles user interactions', () => {
    const handleClick = vi.fn();
    render(<FilterBar onClick={handleClick} data-testid="filterbar" />);
    fireEvent.click(screen.getByTestId('filterbar'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('updates state correctly', async () => {
    render(<FilterBar data-testid="filterbar" />);
    fireEvent.click(screen.getByTestId('filterbar'));
    await waitFor(() => {
      expect(screen.getByTestId('filterbar')).toHaveTextContent(/updated|changed|new/i);
    });
  });

  
});
