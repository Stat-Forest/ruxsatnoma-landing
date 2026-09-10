import { expect, it } from 'vitest';
// `?raw` reads the file as plain text without touching Node's `fs`/`path`
// (untyped here — `tsconfig.app.json` carries no `"node"` types) and without
// `new URL('./motion.css', import.meta.url)`, which Vite statically rewrites
// into a dev-server asset URL that `fs.readFileSync` would then reject.
//
// It also returns an EMPTY STRING unless `vite.config.ts`'s `rawCssPlugin`
// is in the pipeline: `@tailwindcss/vite` claims every `.css` id, `?raw` and
// all. That is how every assertion in this file passed while matching
// nothing — hence the `toBeGreaterThan(0)` guards below, which are the only
// thing standing between "the contract holds" and "the test found no
// classes to check".
import css from './motion.css?raw';

// The AT-RULE, not the first mention of the phrase: a prose comment above
// `.card-lift` says "`prefers-reduced-motion` must turn off", and slicing
// from there swept the `.hero-slide`/`.hero-dot` DECLARATIONS into `reduced`
// — so every one of them "contained" its own class name and the checks below
// could never fail.
const MEDIA_BLOCK = '@media (prefers-reduced-motion: reduce)';
const reduced = css.slice(css.indexOf(MEDIA_BLOCK));

it('reads the stylesheet it is supposed to be checking', () => {
  expect(css).toContain(MEDIA_BLOCK);
  // The slice must start AT the block, not somewhere above it.
  expect(reduced.startsWith(MEDIA_BLOCK)).toBe(true);
});

it('disables every animated class under prefers-reduced-motion', () => {
  const animated = [...css.matchAll(/^\.([a-z-]+) \{[^}]*animation:/gm)].map((m) => m[1]);
  expect(animated.length).toBeGreaterThan(0);
  for (const name of animated) {
    expect(reduced, `.${name} animates but is never disabled`).toContain(`.${name}`);
  }
});

/**
 * A `transition:` is movement too, and the block has always had to turn off
 * `.card-lift`/`.thumb-zoom` by hand. Two more arrived with the hero
 * carousel, because the previous version of this file only looked for
 * `animation:`.
 */
it('disables every transitioning class under prefers-reduced-motion', () => {
  const transitioning = [...css.matchAll(/^\.([a-z-]+) \{[^}]*transition:/gm)].map((m) => m[1]);
  expect(transitioning.length).toBeGreaterThan(0);
  for (const name of transitioning) {
    expect(reduced, `.${name} transitions but is never disabled`).toContain(`.${name}`);
  }
});

/**
 * The escape scanning one stylesheet could never see. `animate-spin`,
 * `animate-pulse` and `animate-in` are Tailwind's and tw-animate-css's own
 * utilities, declared in stylesheets this one does not own — so a spinner, a
 * skeleton and an entering panel all kept moving for a viewer who had asked
 * the site to hold still.
 *
 * The hero carousel was the same miss from the other direction: its
 * transition was an INLINE style, which no stylesheet can reach. That one is
 * now `.hero-slide` in `motion.css` and the test above covers it; this one
 * scans the source for `animate-*` class names, so the next utility someone
 * reaches for has to be added to the reduced-motion block or fail here.
 *
 * `import.meta.glob` is Vite's own (typed by `vite/client`), so this stays
 * inside the same no-`fs` constraint as the `?raw` import above.
 */
it('disables every Tailwind animate-* utility the source actually uses', () => {
  const sources = import.meta.glob('../**/*.{ts,tsx}', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;

  const used = new Set<string>();
  for (const [path, source] of Object.entries(sources)) {
    if (path.includes('.test.')) continue;
    for (const match of source.matchAll(/\banimate-[a-z0-9-]+/g)) used.add(match[0]);
  }

  expect(used.size).toBeGreaterThan(0);
  for (const name of used) {
    expect(reduced, `.${name} is used in the source but never disabled`).toContain(`.${name}`);
  }
});
