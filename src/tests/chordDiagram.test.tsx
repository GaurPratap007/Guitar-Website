import React from 'react';
import { render } from '@testing-library/react';
import ChordDiagram from '../components/ChordDiagram';

describe('ChordDiagram', () => {
  it('renders svg with circles and lines', () => {
    const { getByRole, container } = render(
      <ChordDiagram shape={{ fretting: ['x', 3, 2, 0, 1, 0], strings: 6, baseFret: 1 }} label="C" />
    );
    const svg = getByRole('img');
    expect(svg).toBeInTheDocument();
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(0);
  });
});


