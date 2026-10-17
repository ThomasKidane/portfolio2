import { describe, expect, it } from 'vitest';
import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { catalogMissing, divisions, modules, problems } from './catalog';

const guideRoot = resolve(import.meta.dirname, '../..');
const documents = import.meta.glob<{ default: ComponentType }>('../../content/**/*.mdx');
const normalized = (path: string) => path.replace(/^.*?content\//, '');

describe('generated catalog integration', () => {
  it('places Advanced research after Platinum without inventing graded problems', () => {
    if (catalogMissing) return;
    expect(divisions.map(d => d.id)).toEqual(['bronze', 'silver', 'gold', 'platinum', 'advanced']);
    const research = modules.filter(m => m.division === 'advanced');
    expect(research.length).toBeGreaterThanOrEqual(8);
    expect(modules.at(-1)?.division).toBe('advanced');
    const positions = new Map(modules.map((m, index) => [m.id, index]));
    for (const module of research) {
      expect(module.research, module.id).toBe(true);
      expect(module.contest, module.id).toBe(false);
      expect(module.problems, module.id).toEqual([]);
      for (const prerequisite of module.prerequisites) {
        expect(positions.has(prerequisite), prerequisite).toBe(true);
        expect(positions.get(prerequisite), prerequisite).toBeLessThan(positions.get(module.id)!);
      }
    }
  });
  it('keeps unique IDs and every problem reachable through the curriculum', () => {
    if (catalogMissing) return;
    expect(new Set(problems.map(p => p.id)).size).toBe(problems.length);
    expect(new Set(modules.map(m => m.id)).size).toBe(modules.length);
    const linked = new Set(modules.flatMap(m => m.problems));
    expect(problems.filter(p => !linked.has(p.id)).map(p => p.id)).toEqual([]);
    expect([...linked].filter(id => !problems.some(p => p.id === id))).toEqual([]);
  });
  it('includes every source lesson and editorial in the MDX build graph', () => {
    if (catalogMissing) return;
    const available = new Set(Object.keys(documents).map(normalized));
    for (const module of modules) if (module.source) expect(available.has(normalized(module.source)), module.id).toBe(true);
    for (const problem of problems) {
      if (problem.source) expect(existsSync(resolve(guideRoot, problem.source)), problem.id).toBe(true);
      if (problem.editorial.endsWith('.mdx')) expect(available.has(normalized(problem.editorial)), problem.id).toBe(true);
    }
  });
  it('compiles and renders every actual MDX document without leaking YAML frontmatter', async () => {
    for (const [path, load] of Object.entries(documents)) {
      const { default: Document } = await load();
      const html = renderToStaticMarkup(createElement(Document));
      expect(html, path).toContain('<h1>');
      expect(html, path).not.toMatch(/(?:<p>|<pre>)(?:---|id:|status: draft)/);
      expect(html, path).not.toContain('title: &quot;');
      expect(html, path).not.toContain('katex-error');
      if (path.includes('/advanced/')) {
        expect(html, path).toContain('katex-display');
        expect(html, path).toContain('https://');
      }
    }
  }, 30000);
  it('renders display LaTeX as KaTeX, never code, in all 54 model lessons and editorials', async () => {
    const lessons = Object.entries(documents).filter(([path]) =>
      path.endsWith('/module.mdx') && !path.includes('/contest/') && !path.includes('/advanced/'));
    expect(lessons).toHaveLength(54);
    for (const [path, load] of lessons) {
      const editorial = Object.entries(documents).find(([candidate]) =>
        candidate.startsWith(path.replace(/module\.mdx$/, 'problems/')) && candidate.endsWith('/editorial.mdx'));
      expect(editorial, path).toBeDefined();
      for (const [documentPath, loadDocument] of [[path, load], editorial!] as const) {
        const source = readFileSync(resolve(import.meta.dirname, documentPath), 'utf8');
        expect(source, documentPath).toMatch(/^\$\$\n\\begin\{aligned\}[\s\S]*?\\end\{aligned\}\n\$\$$/m);
        const math = source.match(/^\$\$\n([\s\S]*?)\n\$\$$/m)?.[1];
        expect(math, documentPath).not.toContain('&lt;');
        expect(source, documentPath).not.toMatch(/`[^`]*\$\$[^`]*`/);
        const { default: Document } = await loadDocument();
        const html = renderToStaticMarkup(createElement(Document));
        expect(html, documentPath).toContain('class="katex-display"');
        expect(html, documentPath).toContain('class="katex-mathml"');
        expect(html, documentPath).not.toContain('katex-error');
        expect(html, documentPath).not.toMatch(/<code\b[^>]*>[\s\S]*?(?:class="katex|\\begin\{|\$\$)[\s\S]*?<\/code>/);
        expect(html, documentPath).not.toContain('$$');
      }
    }
  }, 30000);
  it('preserves actual configured notebook URLs rather than placeholder links', () => {
    if (catalogMissing) return;
    for (const problem of problems) {
      for (const link of Object.values(problem.links)) if (link) {
        expect(link).not.toMatch(/(?:example\.com|YOUR_ORG|YOUR_REPO)/i);
        expect(link).toMatch(/^https?:\/\//);
      }
    }
  });
  it('ensures source frontmatter is recognized separately from lesson prose', () => {
    if (catalogMissing) return;
    for (const module of modules) {
      if (!module.source) continue;
      const source = readFileSync(resolve(guideRoot, module.source), 'utf8');
      expect(source).toMatch(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
    }
  });
});
