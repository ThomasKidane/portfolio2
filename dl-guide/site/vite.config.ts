import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkFrontmatter from 'remark-frontmatter';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const catalog = resolve(root, 'src/generated/catalog.json');

// A missing catalog is an explicit empty state, never a set of invented lessons.
// The content toolchain owns this file. This plugin does not write to it.
function catalogSource(): Plugin {
  const virtualId = '\0dl-guide-catalog';
  return {
    name: 'dl-guide-catalog',
    resolveId(id) {
      if (id === './generated/catalog.json') return virtualId;
    },
    load(id) {
      if (id !== virtualId) return;
      this.addWatchFile(catalog);
      if (!existsSync(catalog)) {
        this.warn('No generated catalog yet. The guide will display its empty state. Run the content toolchain before publishing.');
        return 'export default { problems: [], modules: [], config: {}, catalogMissing: true };';
      }
      return `export default ${JSON.stringify(JSON.parse(readFileSync(catalog, 'utf8')))};`;
    },
    handleHotUpdate({ file, server }) {
      if (file === catalog) server.ws.send({ type: 'full-reload' });
    },
  };
}

export default defineConfig({
  base: process.env.DL_GUIDE_BASE || '/dl-guide/',
  plugins: [catalogSource(), mdx({
    providerImportSource: '@mdx-js/react',
    remarkPlugins: [remarkFrontmatter, remarkGfm, remarkMath],
    rehypePlugins: [rehypeKatex, rehypeHighlight],
  }), react()],
  resolve: { dedupe: ['react', 'react-dom', '@mdx-js/react'] },
  server: { fs: { allow: [resolve(root, '..')] } },
  build: { outDir: 'dist', emptyOutDir: true },
});
