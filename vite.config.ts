import { readFileSync } from 'node:fs'
import path from 'path'
import { defineConfig } from 'vitest/config'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const RAW_CSS_PREFIX = '\0raw-css:'
// The virtual id has to end in `.js`, not `.css`. Vite decides what is a
// stylesheet from the id's EXTENSION, so `\0raw-css:/…/motion.css` still
// looked like one: `vite:css-post` claimed it straight back and emitted an
// empty module, exactly as if this plugin were not in the pipeline.
const RAW_CSS_SUFFIX = '.js'

/**
 * `import css from './something.css?raw'` returns an EMPTY STRING without
 * this. `@tailwindcss/vite` claims every `.css` id, `?raw` query and all,
 * and hands back its own processed output — which for a file that declares
 * no utilities is nothing at all.
 *
 * That is not a theoretical problem: `src/foundations/motion.test.ts` reads
 * `motion.css?raw` to enforce that every animated class is listed in the
 * `prefers-reduced-motion` block, and it was matching an empty string. It
 * looped over zero classes and passed, for as long as it has existed.
 *
 * Resolving to a `\0`-prefixed VIRTUAL module is what keeps the CSS pipeline
 * off it; `load` then returns the bytes on disk as a JS string, which is
 * what `?raw` means everywhere else in Vite.
 */
function rawCssPlugin(): Plugin {
  return {
    name: 'ruxsatnoma:raw-css',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer || !source.endsWith('.css?raw')) return null
      const importerFile = importer.split('?')[0]
      const file = path.resolve(path.dirname(importerFile), source.slice(0, -'?raw'.length))
      return `${RAW_CSS_PREFIX}${file}${RAW_CSS_SUFFIX}`
    },
    load(id) {
      if (!id.startsWith(RAW_CSS_PREFIX)) return null
      const file = id.slice(RAW_CSS_PREFIX.length, -RAW_CSS_SUFFIX.length)
      return `export default ${JSON.stringify(readFileSync(file, 'utf8'))};`
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [rawCssPlugin(), react(), tailwindcss()],
  server: {
    port: 5174,
    host: true,
    proxy: {
      '/api': {
        target: 'https://dev-api.ruxsatnoma-urmon.uz',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    // Same reasoning as the adminka's: any date rendered in the viewer's
    // local time makes an assertion machine-dependent, and Uzbekistan has one
    // zone and no DST.
    env: { TZ: 'Asia/Tashkent' },
  },
})
