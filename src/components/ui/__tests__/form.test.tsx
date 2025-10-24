import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import form from '../form';







describe('form', () => {
  

  it('renders without crashing', () => {
    render(<form data-testid="form" />);
    expect(screen.getByTestId('form')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    render(<form title="Test Title" data-testid="form" />);
    expect(screen.getByTestId('form')).toHaveTextContent('Test Title');
  });

  

  

  
});
