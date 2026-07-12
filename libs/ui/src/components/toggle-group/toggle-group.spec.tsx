import { fireEvent, render, screen } from '@testing-library/react';

import { ToggleGroup, ToggleGroupItem } from './toggle-group.component';

function renderGroup(onValueChange = vi.fn()) {
  render(
    <ToggleGroup
      label="Filter by tag"
      value={['meta']}
      onValueChange={onValueChange}
    >
      <ToggleGroupItem value="meta">#meta</ToggleGroupItem>
      <ToggleGroupItem value="architecture">#architecture</ToggleGroupItem>
    </ToggleGroup>,
  );
  return onValueChange;
}

describe('ToggleGroup', () => {
  it('exposes a named toolbar of pressable items — Radix gives it roving arrow-key focus', () => {
    renderGroup();
    expect(screen.getByRole('toolbar', { name: 'Filter by tag' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '#meta' })).toBeTruthy();
  });

  it('marks the selected item as pressed for assistive tech', () => {
    renderGroup();
    expect(
      screen
        .getByRole('button', { name: '#meta' })
        .getAttribute('aria-pressed'),
    ).toBe('true');
    expect(
      screen
        .getByRole('button', { name: '#architecture' })
        .getAttribute('aria-pressed'),
    ).toBe('false');
  });

  it('reports the new selection when an item is toggled', () => {
    const onValueChange = renderGroup();
    fireEvent.click(screen.getByRole('button', { name: '#architecture' }));
    expect(onValueChange).toHaveBeenCalledWith(['meta', 'architecture']);
  });
});
