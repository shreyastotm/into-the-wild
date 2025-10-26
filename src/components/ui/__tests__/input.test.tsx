import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import input from '../input';

describe('input', () => {

  it('renders without crashing', () => {
    render(<input data-testid="input" />);
    expect(screen.getByTestId('input')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    render(<input title="Test Title" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveTextContent('Test Title');
  });
  
});
