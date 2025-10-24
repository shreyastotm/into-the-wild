import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import dropdown-menu from '../dropdown-menu';







describe('dropdown-menu', () => {
  

  it('renders without crashing', () => {
    render(<dropdown-menu data-testid="dropdown-menu" />);
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    render(<dropdown-menu title="Test Title" data-testid="dropdown-menu" />);
    expect(screen.getByTestId('dropdown-menu')).toHaveTextContent('Test Title');
  });

  

  

  
});
