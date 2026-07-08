import { render, screen } from '@testing-library/react';

import { Prose } from './prose.component';

describe('Prose', () => {
  it('renders long-form content preserving heading semantics', () => {
    render(
      <Prose>
        <h2>Sezione</h2>
        <p>Paragrafo.</p>
      </Prose>,
    );
    expect(
      screen.getByRole('heading', { level: 2, name: 'Sezione' }),
    ).toBeTruthy();
    expect(screen.getByText('Paragrafo.')).toBeTruthy();
  });
});
