import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import HorizontalTrekScroll from '../HorizontalTrekScroll';

describe('HorizontalTrekScroll', () => {

  it('renders without crashing', () => {
    render(<HorizontalTrekScroll data-testid="horizontaltrekscroll" />);
    expect(screen.getByTestId('horizontaltrekscroll')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    render(<HorizontalTrekScroll title="Test Title" data-testid="horizontaltrekscroll" />);
    expect(screen.getByTestId('horizontaltrekscroll')).toHaveTextContent('Test Title');
  });

  it('handles user interactions', () => {
    const handleClick = vi.fn();
    render(<HorizontalTrekScroll onClick={handleClick} data-testid="horizontaltrekscroll" />);
    fireEvent.click(screen.getByTestId('horizontaltrekscroll'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('updates state correctly', async () => {
    render(<HorizontalTrekScroll data-testid="horizontaltrekscroll" />);
    fireEvent.click(screen.getByTestId('horizontaltrekscroll'));
    await waitFor(() => {
      expect(screen.getByTestId('horizontaltrekscroll')).toHaveTextContent(/updated|changed|new/i);
    });
  });
  
});
