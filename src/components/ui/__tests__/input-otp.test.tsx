import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import input-otp from '../input-otp';







describe('input-otp', () => {
  

  it('renders without crashing', () => {
    render(<input-otp data-testid="input-otp" />);
    expect(screen.getByTestId('input-otp')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    render(<input-otp title="Test Title" data-testid="input-otp" />);
    expect(screen.getByTestId('input-otp')).toHaveTextContent('Test Title');
  });

  

  

  
});
