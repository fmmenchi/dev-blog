import { render, screen } from '@testing-library/react';

import { EmptyState } from './empty-state.component';

describe('EmptyState', () => {
  it('renders the title, the description and the actions', () => {
    render(
      <EmptyState title="No posts yet" description="The first one is coming.">
        <button>Subscribe</button>
      </EmptyState>,
    );
    expect(screen.getByText('No posts yet')).toBeTruthy();
    expect(screen.getByText('The first one is coming.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Subscribe' })).toBeTruthy();
  });

  it('never renders a heading: the page already owns its outline', () => {
    render(<EmptyState title="No projects yet" />);
    expect(screen.queryByRole('heading')).toBeNull();
  });
});
