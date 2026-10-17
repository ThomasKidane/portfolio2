import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Index } from 'flexsearch';
import { ArrowUpRight, BookOpen, Command, Search as SearchIcon, X } from 'lucide-react';
import { divisions, humanize, modules, problems, route } from './catalog';

const entries = [
  ...modules.map(m => ({ id: `m:${m.id}`, title: m.title, detail: `${divisions.find(d => d.id === m.division)?.title ?? humanize(m.division)} · Module`, href: route('module', m.id), content: `${m.title} ${m.description} ${m.division} ${m.id}` })),
  ...problems.map(p => ({ id: `p:${p.id}`, title: p.title, detail: `${p.difficulty} · Problem`, href: route('problem', p.id), content: `${p.title} ${p.description} ${p.tags.join(' ')} ${p.id}` })),
];
const index = new Index({ tokenize: 'forward' });
entries.forEach((entry, id) => index.add(id, entry.content));
export function Search() {
  const [query, setQuery] = useState(''); const [open, setOpen] = useState(false); const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null); const wrapper = useRef<HTMLDivElement>(null); const id = useId();
  const results = useMemo(() => query.trim() ? index.search(query.trim(), { limit: 9 }).map(id => entries[Number(id)]).filter(Boolean) : entries.slice(0, 5), [query]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement)?.tagName))) { event.preventDefault(); input.current?.focus(); setOpen(true); }
      if (event.key === 'Escape') setOpen(false);
    };
    const outside = (event: PointerEvent) => { if (!wrapper.current?.contains(event.target as Node)) setOpen(false); };
    window.addEventListener('keydown', keydown); window.addEventListener('pointerdown', outside);
    return () => { window.removeEventListener('keydown', keydown); window.removeEventListener('pointerdown', outside); };
  }, []);
  return <div className="search" ref={wrapper}><SearchIcon size={17} aria-hidden="true" /><label className="sr-only" htmlFor={`${id}-input`}>Search modules and problems</label><input ref={input} id={`${id}-input`} type="search" role="combobox" autoComplete="off" placeholder="Find an idea, a module, a problem…" value={query} aria-expanded={open} aria-controls={`${id}-results`} aria-autocomplete="list" aria-activedescendant={open && results[active] ? `${id}-option-${active}` : undefined} onFocus={() => setOpen(true)} onChange={e => { setQuery(e.target.value); setActive(0); setOpen(true); }} onKeyDown={e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i + 1, results.length - 1)); setOpen(true); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(0, i - 1)); }
    if (e.key === 'Enter' && results[active]) { e.preventDefault(); location.hash = results[active].href; setOpen(false); input.current?.blur(); }
  }} /><kbd><Command size={11} /> K</kbd>{open && <div className="search-popover"><div className="search-label">{query ? 'Search results' : 'Explore the guide'}<button className="icon-button" aria-label="Close search" onClick={() => setOpen(false)}><X size={15} /></button></div><ul id={`${id}-results`} role="listbox" aria-label="Search results">{results.map((result, i) => <li key={result.id} role="option" id={`${id}-option-${i}`} aria-selected={active === i}><a href={result.href} className={active === i ? 'selected' : ''} onClick={() => setOpen(false)} onMouseEnter={() => setActive(i)} tabIndex={-1}><BookOpen size={17} /><span><strong>{result.title}</strong><small>{result.detail}</small></span><ArrowUpRight size={16} /></a></li>)}</ul>{results.length === 0 && <p className="search-empty" role="status">No matches. Try “gradient”, “vision”, or a problem title.</p>}<div className="search-footer">↑ ↓ to explore <span>↵ to open · esc to close</span></div></div>}</div>;
}
