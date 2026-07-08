import { render, screen } from '@testing-library/react';

import { Badge } from './badge.component';

describe('Badge', () => {
  it('renders its label', () => {
    render(<Badge>typescript</Badge>);
    expect(screen.getByText('typescript')).toBeTruthy();
  });
});
