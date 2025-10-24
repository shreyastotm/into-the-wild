import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import menubar from '../menubar';







describe('menubar', () => {
  

  it('renders without crashing', () => {
    render(<menubar data-testid="menubar" />);
    expect(screen.getByTestId('menubar')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    render(<menubar title="Test Title" data-testid="menubar" />);
    expect(screen.getByTestId('menubar')).toHaveTextContent('Test Title');
  });

  

  

  
});
