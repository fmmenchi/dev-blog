import { fireEvent, render, screen } from '@testing-library/react';

import { AccentSwitcher } from './accent-switcher.component';

/* The control cycles: it always OFFERS the next accent, and says which one. */
function chip() {
  return screen.getByRole('button', { name: /Change accent color to/i });
}

describe('AccentSwitcher', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dataset['accent'] = 'yellow';
    render(<AccentSwitcher />);
  });

  it('offers the next accent, by name and not by colour alone', () => {
    /* WCAG 1.4.1: the swatch is decorative and aria-hidden, so the NAME has to be
       there — colour cannot be the only way to know what the button does. */
    expect(chip().textContent).toContain('lime');
    expect(chip().getAttribute('aria-label')).toBe(
      'Change accent color to lime',
    );
  });

  it('takes its border from the accent it is offering', () => {
    /*
     * The border used to be `border-border`: the separator grey, 1.18:1 against the
     * background, so the control had no visible edge and only found one on hover —
     * which a phone does not have.
     *
     * It must be the SAME value as the swatch, or the two drift and nobody notices:
     * this is an inline style, and no linter reads it.
     */
    const swatch = chip().querySelector('[aria-hidden="true"]');
    expect(chip().style.borderColor).toBe('var(--accent-lime-base)');
    expect((swatch as HTMLElement).style.background).toBe(
      chip().style.borderColor,
    );
  });

  it('switches the accent, and says so out loud', () => {
    fireEvent.click(chip());

    expect(document.documentElement.dataset['accent']).toBe('lime');
    /* The change is otherwise silent — nothing else on the page announces it. */
    expect(screen.getByRole('status').textContent).toBe(
      'Accent colour changed to lime',
    );
    /* And now it offers the one after that, border and swatch following along. */
    expect(chip().textContent).toContain('amber');
    expect(chip().style.borderColor).toBe('var(--accent-amber-base)');
  });

  it('remembers the choice', () => {
    fireEvent.click(chip());
    expect(localStorage.getItem('fabio-accent')).toBe('lime');
  });
});
