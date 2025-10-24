import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CostsStep from '../CostsStep';







describe('CostsStep', () => {
  

  it('renders without crashing', () => {
    render(<CostsStep data-testid="costsstep" />);
    expect(screen.getByTestId('costsstep')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    render(<CostsStep title="Test Title" data-testid="costsstep" />);
    expect(screen.getByTestId('costsstep')).toHaveTextContent('Test Title');
  });

  it('handles user interactions', () => {
    const handleClick = vi.fn();
    render(<CostsStep onClick={handleClick} data-testid="costsstep" />);
    fireEvent.click(screen.getByTestId('costsstep'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('updates state correctly', async () => {
    render(<CostsStep data-testid="costsstep" />);
    fireEvent.click(screen.getByTestId('costsstep'));
    await waitFor(() => {
      expect(screen.getByTestId('costsstep')).toHaveTextContent(/updated|changed|new/i);
    });
  });

  
});
