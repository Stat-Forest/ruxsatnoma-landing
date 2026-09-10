import { render, screen } from '@testing-library/react';
import { it, expect } from 'vitest';
import { Button } from './button';

// Regression test for the Tailwind v4 preflight rule `svg { display: block }`:
// an icon passed as a raw child (rather than via `leftIcon`/`rightIcon`) used
// to land inside a plain `<span>{children}</span>` wrapper, whose own box made
// the icon wrap onto its own line instead of sitting beside the label. The
// wrapper now uses `display: contents` so its children become direct flex
// items of the (already `inline-flex`) button.
it('keeps an icon passed as a child inline with the label', () => {
  render(
    <Button>
      <svg data-testid="icon" className="w-4 h-4" />
      Label
    </Button>,
  );

  const button = screen.getByRole('button');
  const icon = screen.getByTestId('icon');

  // jsdom does not lay out, so the DOM tree still nests the icon inside the
  // children wrapper — what matters is that the wrapper carries `display:
  // contents` (Tailwind's `contents` class), which drops its own box so its
  // children act as direct flex items of the (already `inline-flex`) button
  // instead of wrapping onto their own line.
  const wrapper = icon.parentElement;
  expect(wrapper).not.toBeNull();
  expect(wrapper).toHaveClass('contents');
  expect(wrapper?.parentElement).toBe(button);
  expect(button).toHaveClass('inline-flex');
});
