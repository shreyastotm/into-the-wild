import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import badge from '../badge';







describe('badge', () => {
  

  it('renders without crashing', () => {
    render(<badge data-testid="badge" />);
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    render(<badge title="Test Title" data-testid="badge" />);
    expect(screen.getByTestId('badge')).toHaveTextContent('Test Title');
  });

  

  

  
});
