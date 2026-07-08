import { render, screen } from '@testing-library/react';

import { Container } from './container.component';

describe('Container', () => {
  it('renders its content', () => {
    render(<Container>Contenuto</Container>);
    expect(screen.getByText('Contenuto')).toBeTruthy();
  });

  it('renders the main landmark when asked', () => {
    render(<Container as="main">Pagina</Container>);
    expect(screen.getByRole('main')).toBeTruthy();
  });
});
