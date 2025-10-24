import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import chart from '../chart';







describe('chart', () => {
  

  it('renders without crashing', () => {
    render(<chart data-testid="chart" />);
    expect(screen.getByTestId('chart')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    render(<chart title="Test Title" data-testid="chart" />);
    expect(screen.getByTestId('chart')).toHaveTextContent('Test Title');
  });

  

  

  
});
