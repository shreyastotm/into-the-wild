import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import radio-group from '../radio-group';







describe('radio-group', () => {
  

  it('renders without crashing', () => {
    render(<radio-group data-testid="radio-group" />);
    expect(screen.getByTestId('radio-group')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    render(<radio-group title="Test Title" data-testid="radio-group" />);
    expect(screen.getByTestId('radio-group')).toHaveTextContent('Test Title');
  });

  

  

  
});
