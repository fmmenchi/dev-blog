import { fireEvent, render, screen } from '@testing-library/react';

import { Button } from './button.component';

describe('Button', () => {
  it('renders a native button with an accessible name', () => {
    render(<Button>Salva</Button>);
    expect(screen.getByRole('button', { name: 'Salva' })).toBeTruthy();
  });

  it('defaults to type="button" so it never submits forms by accident', () => {
    render(<Button>Salva</Button>);
    expect(screen.getByRole('button').getAttribute('type')).toBe('button');
  });

  it('fires onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Salva</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is not clickable when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Salva
      </Button>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Salva' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders a link, not a button, when given an href', () => {
    render(
      <Button asChild>
        <a href="mailto:hi@example.com">Say hi</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Say hi' });
    expect(link.getAttribute('href')).toBe('mailto:hi@example.com');
    expect(screen.queryByRole('button')).toBeNull();
    /* Slot must not leak a type attribute onto an anchor. */
    expect(link.getAttribute('type')).toBeNull();
  });
});
