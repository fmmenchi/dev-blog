import { render, screen } from '@testing-library/react';

import { Card } from './card.component';

describe('Card', () => {
  it('renders its content', () => {
    render(<Card>Contenuto</Card>);
    expect(screen.getByText('Contenuto')).toBeTruthy();
  });

  it('renders as an article when asked', () => {
    render(<Card as="article">Post</Card>);
    expect(screen.getByRole('article')).toBeTruthy();
  });
});
