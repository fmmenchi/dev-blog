import { render, screen } from '@testing-library/react';

import { Select } from './select.component';

const OPTIONS = [
  { value: 'newest', label: 'newest first' },
  { value: 'oldest', label: 'oldest first' },
];

describe('Select', () => {
  it('exposes a named combobox showing the current choice', () => {
    render(
      <Select
        label="Sort posts"
        value="newest"
        onValueChange={vi.fn()}
        options={OPTIONS}
      />,
    );
    const trigger = screen.getByRole('combobox', { name: 'Sort posts' });
    expect(trigger).toBeTruthy();
    /* The chosen option must be readable without opening the list. */
    expect(trigger.textContent).toContain('newest first');
  });
});
