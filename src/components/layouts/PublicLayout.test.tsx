import { expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PublicLayout } from './PublicLayout';
import { I18nProvider } from '../../i18n';

function renderLayout(onNavigate = vi.fn()) {
  return render(
    <I18nProvider>
      <PublicLayout onNavigate={onNavigate}>
        <div>Main content</div>
      </PublicLayout>
    </I18nProvider>
  );
}

it('opens and closes mobile menu on hamburger button click', async () => {
  const onNavigate = vi.fn();
  renderLayout(onNavigate);

  const toggleBtn = screen.getByRole('button', { name: /Menyuni ochish/i });
  expect(toggleBtn).toBeInTheDocument();

  // Initially mobile menu is not rendered
  expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();

  // Click hamburger to open
  await userEvent.click(toggleBtn);
  expect(screen.getByRole('button', { name: /Menyuni yopish/i })).toBeInTheDocument();
  
  const mobileMenu = screen.getByTestId('mobile-menu');
  expect(mobileMenu).toBeInTheDocument();

  // Navigation items are inside mobile menu
  const faqLink = within(mobileMenu).getByRole('button', { name: 'Savollar' });
  expect(faqLink).toBeInTheDocument();

  // Click a navigation item
  await userEvent.click(faqLink);
  expect(onNavigate).toHaveBeenCalledWith('faq');

  // Drawer closes after navigation
  expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
});
