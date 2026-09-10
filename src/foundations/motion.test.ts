import { expect, it } from 'vitest';
// `?raw` (declared by `vite/client.d.ts`, already in `tsconfig.app.json`'s
// `types`) reads the file as plain text without touching Node's `fs`/`path`
// (untyped here — `tsconfig.app.json` carries no `"node"` types) and without
// `new URL('./motion.css', import.meta.url)`, which Vite statically rewrites
// into a dev-server asset URL that `fs.readFileSync` would then reject.
import css from './motion.css?raw';

it('disables every animated class under prefers-reduced-motion', () => {
  const animated = [...css.matchAll(/^\.([a-z-]+) \{[^}]*animation:/gm)].map((m) => m[1]);
  const reduced = css.slice(css.indexOf('prefers-reduced-motion'));
  for (const name of animated) {
    expect(reduced).toContain(`.${name}`);
  }
});
