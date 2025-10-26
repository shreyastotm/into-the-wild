import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import sidebar from '../sidebar';

describe('sidebar', () => {

  it('renders without crashing', () => {
    render(<sidebar data-testid="sidebar" />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    render(<sidebar title="Test Title" data-testid="sidebar" />);
    expect(screen.getByTestId('sidebar')).toHaveTextContent('Test Title');
  });

  it('handles user interactions', () => {
    const handleClick = vi.fn();
    render(<sidebar onClick={handleClick} data-testid="sidebar" />);
    fireEvent.click(screen.getByTestId('sidebar'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('updates state correctly', async () => {
    render(<sidebar data-testid="sidebar" />);
    fireEvent.click(screen.getByTestId('sidebar'));
    await waitFor(() => {
      expect(screen.getByTestId('sidebar')).toHaveTextContent(/updated|changed|new/i);
    });
  });
  
});
