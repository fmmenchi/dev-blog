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

  /*
   * The variants exist to spare the pages a hand-written class list, so what is
   * worth asserting is that each one still resolves to the width and the gutter
   * the pages used to write themselves.
   */
  it('is the content width with the page gutter by default', () => {
    render(<Container as="main">Pagina</Container>);

    const shell = screen.getByRole('main');
    expect(shell.className).toContain('max-w-content');
    expect(shell.className).toContain('px-8');
  });

  it('narrows to the measure width for long-form prose', () => {
    render(
      <Container as="main" width="measure">
        Prosa
      </Container>,
    );

    expect(screen.getByRole('main').className).toContain('max-w-measure');
  });

  it('uses the tighter mobile gutter in a bar', () => {
    render(
      <Container as="header" padding="bar">
        Barra
      </Container>,
    );

    const bar = screen.getByRole('banner');
    expect(bar.className).toContain('px-4');
    expect(bar.className).toContain('md:px-8');
  });
});
