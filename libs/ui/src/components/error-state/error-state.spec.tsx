import { render, screen } from '@testing-library/react';

import { ErrorState } from './error-state.component';

describe('ErrorState', () => {
  it('renders title as the page heading, description and actions', () => {
    render(
      <ErrorState title="Page not found" description="It is gone.">
        <button>Back</button>
      </ErrorState>,
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeTruthy();
    expect(screen.getByText('It is gone.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy();
  });
});
