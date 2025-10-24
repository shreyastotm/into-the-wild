import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import calendar from '../calendar';







describe('calendar', () => {
  

  it('renders without crashing', () => {
    render(<calendar data-testid="calendar" />);
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    render(<calendar title="Test Title" data-testid="calendar" />);
    expect(screen.getByTestId('calendar')).toHaveTextContent('Test Title');
  });

  

  

  
});
