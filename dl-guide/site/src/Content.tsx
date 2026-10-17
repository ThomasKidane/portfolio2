import { Component, Suspense, lazy, useEffect, useState, type ComponentType, type HTMLAttributes, type ReactNode } from 'react';
import { MDXProvider } from '@mdx-js/react';
import { AlertTriangle, BookOpen, ChevronDown, Info as InfoIcon, Lightbulb, Link2 } from 'lucide-react';
import { problems as catalogProblems, route, safeUrl, text, record } from './catalog';
import { useGuideProgress } from './context';

const documents = import.meta.glob<{ default: ComponentType }>('../../content/**/*.mdx');
const normal = (path: string) => path.replaceAll('\\', '/').replace(/^.*?(?:content\/)/, '').replace(/^\.\//, '').replace(/^\//, '');
export function findDocument(...candidates: (string | undefined)[]): string | undefined {
  for (const candidate of candidates) {
    if (!candidate) continue;
    const clean = normal(candidate);
    const exact = Object.keys(documents).find(key => normal(key) === clean);
    if (exact) return exact;
    const matches = Object.keys(documents).filter(key => normal(key).endsWith(`/${clean}`));
    if (matches.length === 1) return matches[0];
  }
}
const loaded = new Map<string, ReturnType<typeof lazy>>();
class ContentBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="callout warning">This lesson could not be loaded. Please reload the page. Your progress is stored separately.</div> : this.props.children; }
}
export function Content({ document, fallback }: { document?: string; fallback?: ReactNode }) {
  if (!document) return <>{fallback ?? <p className="muted">The written lesson is not available in this build yet.</p>}</>;
  if (!loaded.has(document)) loaded.set(document, lazy(documents[document]));
  const Document = loaded.get(document)!;
  return <ContentBoundary key={document}><Suspense fallback={<p className="muted" role="status">Opening the lesson…</p>}><MDXProvider components={mdxComponents}><Document /></MDXProvider></Suspense></ContentBoundary>;
}
function Callout({ kind, title, children }: { kind: string; title?: string; children?: ReactNode }) {
  const Icon = kind === 'warning' ? AlertTriangle : kind === 'tip' ? Lightbulb : InfoIcon;
  return <aside className={`callout ${kind}`}><Icon size={19} aria-hidden="true" /><div><strong>{title ?? ({ info: 'Good to know', warning: 'A note of caution', tip: 'A little intuition', optional: 'Go a little deeper' }[kind])}</strong><div>{children}</div></div></aside>;
}
export const Info = (props: { title?: string; children?: ReactNode }) => <Callout kind="info" {...props} />;
export const Warning = (props: { title?: string; children?: ReactNode }) => <Callout kind="warning" {...props} />;
export const Tip = (props: { title?: string; children?: ReactNode }) => <Callout kind="tip" {...props} />;
export const Optional = (props: { title?: string; children?: ReactNode }) => <details className="disclosure optional"><summary>{props.title ?? 'Optional · A deeper look'}<ChevronDown size={16} /></summary><div>{props.children}</div></details>;
export const Spoiler = ({ title, children }: { title?: string; children?: ReactNode }) => <details className="disclosure"><summary>{title ?? 'Reveal explanation'}<ChevronDown size={16} /></summary><div>{children}</div></details>;
export function Resources({ children, items }: { children?: ReactNode; items?: unknown[] }) {
  return <section className="resources"><h3><BookOpen size={18} /> Further reading</h3>{children}{items && <ul>{items.map((item, index) => { const r = record(item); const url = safeUrl(r.url ?? r.href); return <li key={index}>{url ? <a href={url} target="_blank" rel="noreferrer">{text(r.title ?? r.name, url)}</a> : text(item)}</li>; })}</ul>}</section>;
}
export function ProblemTable({ problems, ids }: { problems?: unknown[]; ids?: string[] }) {
  const { progress } = useGuideProgress();
  const selected = ids ?? problems?.map(p => typeof p === 'string' ? p : text(record(p).id));
  const items = selected ? selected.map(id => catalogProblems.find(p => p.id === id)).filter(Boolean) : catalogProblems;
  return <div className="problem-list">{items.map(p => p && <a className="problem-row" key={p.id} href={route('problem', p.id)}><span className={`status-dot status-${(progress.problems[p.id]?.status ?? 'Not Attempted').replaceAll(' ', '-').toLowerCase()}`} /><span><strong>{p.title}</strong><small>{p.difficulty} · {p.budget || 'Self-paced'}</small></span><span className="row-status">{progress.problems[p.id]?.status ?? 'Not Attempted'}</span><span aria-hidden="true">↗</span></a>)}</div>;
}
const headingId = (children: ReactNode): string => {
  const flatten = (value: ReactNode): string => typeof value === 'string' || typeof value === 'number' ? String(value) : Array.isArray(value) ? value.map(flatten).join('') : value && typeof value === 'object' && 'props' in value ? flatten((value.props as { children?: ReactNode }).children) : '';
  return flatten(children).toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-');
};
function Heading({ level, children, id, ...props }: HTMLAttributes<HTMLHeadingElement> & { level: 2 | 3 | 4 }) {
  const Tag = `h${level}` as 'h2' | 'h3' | 'h4'; const anchor = id ?? headingId(children);
  return <Tag id={anchor} {...props}>{children}<a className="heading-link" aria-label={`Link to section ${anchor}`} href={`${location.hash.split('?')[0]}?section=${encodeURIComponent(anchor)}`}><Link2 size={15} /></a></Tag>;
}
function ContentLink({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  let target = href;
  if (href?.startsWith('#') && !href.startsWith('#/')) target = `${location.hash.split('?')[0]}?section=${encodeURIComponent(href.slice(1))}`;
  if (href && !href.startsWith('#') && !/^(?:https?:|mailto:)/.test(href)) {
    const match = /(?:modules|module)\/([^/#.]+)(?:\.mdx)?/.exec(href);
    const problem = /problems?\/([^/#.]+)/.exec(href);
    if (match) target = route('module', match[1]);
    else if (problem) target = route('problem', problem[1]);
  }
  if (target && /^(?:javascript|data|vbscript):/i.test(target)) target = undefined;
  const external = /^https?:/.test(target ?? '');
  return <a {...props} href={target} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>{children}</a>;
}
export const mdxComponents = {
  Info, Warning, Tip, Optional, Spoiler, Resources, ProblemTable,
  h2: (p: HTMLAttributes<HTMLHeadingElement>) => <Heading level={2} {...p} />,
  h3: (p: HTMLAttributes<HTMLHeadingElement>) => <Heading level={3} {...p} />,
  h4: (p: HTMLAttributes<HTMLHeadingElement>) => <Heading level={4} {...p} />,
  a: ContentLink,
};
export function TableOfContents({ watch }: { watch: string }) {
  const [headings, setHeadings] = useState<{ id: string; title: string; level: number }[]>([]);
  useEffect(() => {
    const collect = () => setHeadings([...document.querySelectorAll('.prose h2[id], .prose h3[id]')].map(h => ({ id: h.id, title: h.textContent ?? '', level: Number(h.tagName.slice(1)) })));
    collect(); const observer = new MutationObserver(collect);
    const article = document.querySelector('.prose'); if (article) observer.observe(article, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [watch]);
  return headings.length ? <aside className="toc"><span className="eyebrow">On this page</span><nav aria-label="Table of contents">{headings.map((h, i) => <a key={`${h.id}-${i}`} className={h.level === 3 ? 'toc-sub' : ''} href={`${location.hash.split('?')[0]}?section=${encodeURIComponent(h.id)}`}>{h.title}</a>)}</nav><div className="toc-note">Small steps.<br />Lasting understanding.</div></aside> : null;
}
