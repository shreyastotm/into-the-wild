import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import toast from '../toast';







describe('toast', () => {
  

  it('renders without crashing', () => {
    render(<toast data-testid="toast" />);
    expect(screen.getByTestId('toast')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    render(<toast title="Test Title" data-testid="toast" />);
    expect(screen.getByTestId('toast')).toHaveTextContent('Test Title');
  });

  

  

  
});
