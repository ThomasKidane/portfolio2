import generated from './generated/catalog.json';

type Data = Record<string, unknown>;
export const record = (v: unknown): Data => v && typeof v === 'object' && !Array.isArray(v) ? v as Data : {};
export const text = (v: unknown, fallback = ''): string => typeof v === 'string' || typeof v === 'number' ? String(v) : fallback;
const list = (v: unknown): unknown[] => Array.isArray(v) ? v : [];
export const strings = (v: unknown): string[] => list(v).map(x => typeof x === 'object' ? text(record(x).id ?? record(x).title ?? record(x).name) : text(x)).filter(Boolean);
export const humanize = (v: string) => v.replace(/[-_]/g, ' ').replace(/\b\w/g, s => s.toUpperCase());
export const route = (type: 'module' | 'problem', id: string) => `#/${type}/${encodeURIComponent(id)}`;
export function safeUrl(v: unknown): string | undefined {
  const value = text(v).trim();
  if (!value || /^(?:javascript|data|vbscript):/i.test(value) || value.startsWith('//')) return;
  if (/^https?:\/\//i.test(value) || value.startsWith('/') || value.startsWith('./') || value.startsWith('../')) return value;
}
export interface Problem {
  id: string; title: string; division: string; difficulty: string; description: string;
  budget: string; targets: unknown; hints: unknown[]; tags: string[];
  source: string; statement: string; editorial: string; solution: string;
  links: { colab?: string; github?: string; download?: string };
  draft: boolean; calibrated: boolean; raw: Data;
}
export interface Module {
  id: string; title: string; division: string; description: string;
  source: string; path: string; problems: string[]; prerequisites: string[];
  year?: number; contest: boolean; duration: string; raw: Data;
}
export interface Division { id: string; title: string; description: string; color: string }
const input = record(generated);
export const config = record(input.config);
export const catalogMissing = input.catalogMissing === true;
const problemInput = Array.isArray(input.problems) ? input.problems : Object.entries(record(input.problems)).map(([id, value]) => ({ id, ...record(value) }));
export const problems: Problem[] = problemInput.map((value, index) => {
  const p = record(value); const links = record(p.links); const budget = p.budget ?? p.time_budget ?? p.timeBudget ?? p.time_limit;
  return {
    id: text(p.id ?? p.slug, `problem-${index}`), title: text(p.title ?? p.name, `Problem ${index + 1}`),
    division: text(p.division, 'foundations'), difficulty: text(p.difficulty ?? p.level, 'Practice'),
    description: text(p.description ?? p.summary), budget: typeof budget === 'object' ? Object.entries(record(budget)).map(([k,v]) => `${humanize(k)}: ${typeof v === 'object' ? JSON.stringify(v) : text(v)}`).join(' · ') : text(budget),
    targets: p.targets ?? p.target ?? p.scoring, hints: list(p.hints), tags: strings(p.tags ?? p.topics),
    source: text(p.source ?? p.path), statement: text(p.statement ?? p.statement_source ?? p.statement_path),
    editorial: text(p.editorial ?? p.editorial_path), solution: text(p.reference_solution ?? p.solution ?? p.solution_path),
    links: { colab: safeUrl(links.colab), github: safeUrl(links.github), download: safeUrl(links.download) },
    draft: p.draft !== false && text(p.status).toLowerCase() !== 'published',
    calibrated: p.calibrated === true || text(p.calibration).toLowerCase() === 'calibrated', raw: p,
  };
});
const moduleInput = Array.isArray(input.modules) ? input.modules : Object.entries(record(input.modules)).map(([id, value]) => ({ id, ...record(value) }));
export const modules: Module[] = moduleInput.map((value, index) => {
  const m = record(value); const contest = record(m.contest);
  const linkedYears = strings(m.problems).map(id => Number(problems.find(p => p.id === id)?.raw.year)).filter(y => Number.isFinite(y) && y > 1900 && y < 2200);
  const year = Number(m.year ?? m.timeline_year ?? record(m.timeline).year ?? (linkedYears.length ? Math.min(...linkedYears) : undefined));
  return {
    id: text(m.id ?? m.slug, `module-${index}`), title: text(m.title ?? m.name, `Module ${index + 1}`), division: text(m.division, 'foundations'),
    description: text(m.description ?? m.summary), source: text(m.source ?? m.source_path), path: text(m.path),
    problems: strings(m.problems), prerequisites: strings(m.prerequisites ?? m.dependencies ?? m.requires),
    year: Number.isFinite(year) && year > 1900 && year < 2200 ? year : undefined,
    contest: !!m.contest, duration: text(contest.duration ?? contest.time_limit ?? m.duration ?? m.time_limit), raw: m,
  };
});
const colors = ['#4169E1', '#6888ED', '#3454B4', '#809AEB', '#5069B8'];
const divisionOrder = ['bronze', 'silver', 'gold', 'platinum'];
const rank = (id: string) => divisionOrder.includes(id.toLowerCase()) ? divisionOrder.indexOf(id.toLowerCase()) : divisionOrder.length;
modules.sort((a,b) => rank(a.division) - rank(b.division) || Number(a.contest) - Number(b.contest));
const divisionConfig = config.divisions;
const divisionRows = Array.isArray(divisionConfig) ? divisionConfig : Object.entries(record(divisionConfig)).map(([id, value]) => ({ id, ...(typeof value === 'string' ? { title: value } : record(value)) }));
const found = new Map<string, Data>();
divisionRows.forEach(d => { const r = typeof d === 'string' ? { id: d } : record(d); const id = text(r.id ?? r.slug ?? r.name); if(id) found.set(id, r); });
modules.forEach(m => { if (!found.has(m.division)) found.set(m.division, {}); });
export const divisions: Division[] = [...found.entries()].sort(([a],[b]) => rank(a)-rank(b)).map(([id, d], i) => ({ id, title: text(d.title ?? d.name, humanize(id)), description: text(d.description), color: /^#[\da-f]{3,8}$/i.test(text(d.color)) ? text(d.color) : colors[i % colors.length] }));
export const divisionFor = (id: string) => divisions.find(d => d.id === id);
export const moduleProblems = (module: Module) => module.problems.map(id => problems.find(p => p.id === id)).filter((p): p is Problem => !!p);
export const parentsFor = (problem: Problem) => modules.filter(m => m.problems.includes(problem.id));
export function displayValue(value: unknown): string {
  if (value == null) return 'Not specified';
  if (Array.isArray(value)) return value.map(displayValue).join(' · ');
  if (typeof value === 'object') return Object.entries(record(value)).map(([key, item]) => `${humanize(key)}: ${displayValue(item)}`).join(' · ');
  return String(value);
}
