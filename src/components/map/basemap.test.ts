import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

it('draws on a plain ground with no basemap configured, and shows no attribution', async () => {
  vi.stubEnv('VITE_MAP_STYLE_URL', '');
  const { mapStyle, attributionOption } = await import('./basemap');
  const style = mapStyle('#EAF1EB');
  expect(typeof style).toBe('object');
  expect(style).toMatchObject({ version: 8, sources: {} });
  expect(attributionOption()).toBe(false);
});

it('uses the configured style URL as the basemap, with the attribution the tiles require', async () => {
  vi.stubEnv('VITE_MAP_STYLE_URL', 'https://tiles.example/styles/bright');
  const { mapStyle, attributionOption } = await import('./basemap');
  expect(mapStyle('#EAF1EB')).toBe('https://tiles.example/styles/bright');
  expect(attributionOption()).toEqual({ compact: true });
});
