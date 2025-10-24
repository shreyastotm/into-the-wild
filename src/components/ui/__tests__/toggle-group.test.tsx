import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import toggle-group from '../toggle-group';







describe('toggle-group', () => {
  

  it('renders without crashing', () => {
    render(<toggle-group data-testid="toggle-group" />);
    expect(screen.getByTestId('toggle-group')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    render(<toggle-group title="Test Title" data-testid="toggle-group" />);
    expect(screen.getByTestId('toggle-group')).toHaveTextContent('Test Title');
  });

  

  

  
});
