import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import breadcrumb from '../breadcrumb';







describe('breadcrumb', () => {
  

  it('renders without crashing', () => {
    render(<breadcrumb  />);
    expect(screen.getByText(/breadcrumb|Submit|Save|Login|Register|Sign/i)).toBeInTheDocument();
  });

  

  

  

  
});
