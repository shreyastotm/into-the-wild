import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import context-menu from '../context-menu';







describe('context-menu', () => {
  

  it('renders without crashing', () => {
    render(<context-menu data-testid="context-menu" />);
    expect(screen.getByTestId('context-menu')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    render(<context-menu title="Test Title" data-testid="context-menu" />);
    expect(screen.getByTestId('context-menu')).toHaveTextContent('Test Title');
  });

  

  

  
});
