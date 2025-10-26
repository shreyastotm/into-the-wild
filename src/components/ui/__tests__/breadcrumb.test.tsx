import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import breadcrumb from '../breadcrumb';

describe('breadcrumb', () => {

  it('renders without crashing', () => {
    render(<breadcrumb  />);
    expect(screen.getByText(/breadcrumb|Submit|Save|Login|Register|Sign/i)).toBeInTheDocument();
  });
  
});
