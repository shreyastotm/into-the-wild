import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import BasicDetailsStep from '../BasicDetailsStep';

describe('BasicDetailsStep', () => {

  it('renders without crashing', () => {
    render(<BasicDetailsStep data-testid="basicdetailsstep" />);
    expect(screen.getByTestId('basicdetailsstep')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    render(<BasicDetailsStep title="Test Title" data-testid="basicdetailsstep" />);
    expect(screen.getByTestId('basicdetailsstep')).toHaveTextContent('Test Title');
  });

  it('handles user interactions', () => {
    const handleClick = vi.fn();
    render(<BasicDetailsStep onClick={handleClick} data-testid="basicdetailsstep" />);
    fireEvent.click(screen.getByTestId('basicdetailsstep'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('updates state correctly', async () => {
    render(<BasicDetailsStep data-testid="basicdetailsstep" />);
    fireEvent.click(screen.getByTestId('basicdetailsstep'));
    await waitFor(() => {
      expect(screen.getByTestId('basicdetailsstep')).toHaveTextContent(/updated|changed|new/i);
    });
  });
  
});
