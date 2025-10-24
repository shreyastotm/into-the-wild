import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CampingDetailsStep from '../CampingDetailsStep';







describe('CampingDetailsStep', () => {
  

  it('renders without crashing', () => {
    render(<CampingDetailsStep data-testid="campingdetailsstep" />);
    expect(screen.getByTestId('campingdetailsstep')).toBeInTheDocument();
  });

  it('accepts and displays props correctly', () => {
    render(<CampingDetailsStep title="Test Title" data-testid="campingdetailsstep" />);
    expect(screen.getByTestId('campingdetailsstep')).toHaveTextContent('Test Title');
  });

  it('handles user interactions', () => {
    const handleClick = vi.fn();
    render(<CampingDetailsStep onClick={handleClick} data-testid="campingdetailsstep" />);
    fireEvent.click(screen.getByTestId('campingdetailsstep'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  

  
});
