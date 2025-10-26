import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import textarea from '../textarea';

describe('textarea', () => {

  it('renders without crashing', () => {
    render(<textarea data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    render(<textarea title="Test Title" data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toHaveTextContent('Test Title');
  });
  
});
