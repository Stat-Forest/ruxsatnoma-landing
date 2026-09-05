import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cabinetUrl, CABINET_PATHS, goToCabinet, navigation } from './cabinet';

describe('cabinetUrl', () => {
  it('joins the configured origin with a path, with exactly one slash', () => {
    vi.stubEnv('VITE_ADMIN_BASE_URL', 'https://dev-admin.ruxsatnoma-urmon.uz/');
    expect(cabinetUrl('/my/applications/new')).toBe(
      'https://dev-admin.ruxsatnoma-urmon.uz/my/applications/new',
    );
  });

  it('refuses to build a URL when the origin is not configured', () => {
    vi.stubEnv('VITE_ADMIN_BASE_URL', '');
    // Loud, not silent: an unset origin is how every sign-in button on this
    // site came to point at a page that could not sign anyone in.
    expect(() => cabinetUrl('/')).toThrow(/VITE_ADMIN_BASE_URL/);
  });
});

describe('goToCabinet', () => {
  beforeEach(() => vi.unstubAllEnvs());

  it('navigates the current tab, never opens a second one', () => {
    vi.stubEnv('VITE_ADMIN_BASE_URL', 'https://admin.example.uz');
    const assign = vi.spyOn(navigation, 'assign').mockImplementation(() => {});
    const open = vi.spyOn(window, 'open');
    goToCabinet(CABINET_PATHS.wizard);
    expect(assign).toHaveBeenCalledWith('https://admin.example.uz/my/applications/new');
    expect(open).not.toHaveBeenCalled();
  });
});
