import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NatureInspiredButton from '../NatureInspiredButton';







describe('NatureInspiredButton', () => {
  

  it('renders without crashing', () => {
    render(<NatureInspiredButton data-testid="natureinspiredbutton" />);
    expect(screen.getByTestId('natureinspiredbutton')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    render(<NatureInspiredButton title="Test Title" data-testid="natureinspiredbutton" />);
    expect(screen.getByTestId('natureinspiredbutton')).toHaveTextContent('Test Title');
  });

  it('handles user interactions', () => {
    const handleClick = vi.fn();
    render(<NatureInspiredButton onClick={handleClick} data-testid="natureinspiredbutton" />);
    fireEvent.click(screen.getByTestId('natureinspiredbutton'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('updates state correctly', async () => {
    render(<NatureInspiredButton data-testid="natureinspiredbutton" />);
    fireEvent.click(screen.getByTestId('natureinspiredbutton'));
    await waitFor(() => {
      expect(screen.getByTestId('natureinspiredbutton')).toHaveTextContent(/updated|changed|new/i);
    });
  });

  
});
