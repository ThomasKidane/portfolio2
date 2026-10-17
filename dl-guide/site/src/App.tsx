import { useEffect, useState } from 'react';
import { ArrowUpRight, BookOpen, ChartNoAxesCombined, Check, ChevronDown, ChevronRight, ExternalLink, GitBranch, LayoutDashboard, Menu, Moon, Sun, X } from 'lucide-react';
import { catalogMissing, divisions, divisionFor, modules, problems, route } from './catalog';
import { ProgressContext } from './context';
import { useProgress } from './useProgress';
import { Search } from './Search';
import { Dashboard } from './Dashboard';
import { ModulePage, ProblemPage } from './Lessons';
import { Timeline } from './Timeline';
import { ProgressPage } from './ProgressPage';

function useHashRoute() {
  const [hash, setHash] = useState(location.hash || '#/');
  useEffect(() => { const change = () => setHash(location.hash || '#/'); window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change); }, []);
  const [path, query] = hash.replace(/^#/, '').split('?');
  const [, page = '', encoded = ''] = path.split('/');
  let id = ''; try { id = decodeURIComponent(encoded); } catch { /* Invalid routes display the not-found view. */ }
  return { page, id, section: new URLSearchParams(query).get('section'), path };
}
export function GuideMark({ size = 34 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true"><rect x="1" y="1" width="34" height="34" rx="10" fill="currentColor" fillOpacity=".12" /><path d="M11 11v14h6c7 0 10-14 0-14h-6Z" stroke="currentColor" strokeWidth="1.8" /><path d="m11 18 8-7m-8 14 12-11" stroke="currentColor" strokeWidth="1.2" /><circle cx="11" cy="11" r="2" fill="currentColor" /><circle cx="11" cy="25" r="2" fill="currentColor" /><circle cx="25" cy="18" r="2" fill="currentColor" /></svg>;
}
export default function App() {
  const api = useProgress(); const current = useHashRoute();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(document.documentElement.dataset.theme === 'dark');
  const module = modules.find(m => m.id === current.id); const problem = problems.find(p => p.id === current.id);
  useEffect(() => {
    setMobileOpen(false);
    if (!current.section) { window.scrollTo({ top: 0, behavior: 'instant' }); document.getElementById('main-content')?.focus({ preventScroll: true }); }
    else {
      const go = () => document.getElementById(current.section!)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      go(); const observer = new MutationObserver(go); const main = document.getElementById('main-content');
      if (main) observer.observe(main, { childList: true, subtree: true });
      const timeout = window.setTimeout(() => observer.disconnect(), 1500);
      return () => { observer.disconnect(); clearTimeout(timeout); };
    }
  }, [current.path, current.section]);
  useEffect(() => {
    const title = current.page === 'module' ? module?.title : current.page === 'problem' ? problem?.title : current.page === 'timeline' ? 'The learning map' : current.page === 'progress' ? 'Your progress' : 'Your learning dashboard';
    document.title = `${title ?? 'Page not found'} · DL Guide`;
  }, [current.page, module, problem]);
  useEffect(() => {
    if (!mobileOpen) return;
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close);
  }, [mobileOpen]);
  const toggleTheme = () => { const next = !dark; setDark(next); document.documentElement.dataset.theme = next ? 'dark' : 'light'; try { localStorage.setItem('dl-guide:theme', next ? 'dark' : 'light'); } catch { /* Theme remains usable without storage. */ } };
  const completed = problems.filter(p => api.progress.problems[p.id]?.status === 'Solved').length;
  return <ProgressContext value={api}><a className="skip-link" href="#main-content" onClick={e => { e.preventDefault(); document.getElementById('main-content')?.focus(); }}>Skip to content</a>
    {mobileOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`} aria-label="Main navigation"><a href="#/" className="brand"><GuideMark /><span>DL GUIDE<small>LEARN BY IMPLEMENTING</small></span></a><button className="mobile-close icon-button" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={20} /></button>
      <div className="sidebar-scroll"><div className="nav-label">Your workspace</div><nav className="workspace-nav"><a className={!current.page ? 'active' : ''} aria-current={!current.page ? 'page' : undefined} href="#/"><LayoutDashboard size={17} />Overview</a><a className={current.page === 'timeline' ? 'active' : ''} aria-current={current.page === 'timeline' ? 'page' : undefined} href="#/timeline"><GitBranch size={17} />Learning map<span className="nav-new">EXPLORE</span></a><a className={current.page === 'progress' ? 'active' : ''} aria-current={current.page === 'progress' ? 'page' : undefined} href="#/progress"><ChartNoAxesCombined size={17} />My progress</a></nav>
        <div className="nav-label curriculum-label">The curriculum<span>{String(modules.length).padStart(2, '0')}</span></div><nav className="division-nav">{divisions.map((d, index) => <details key={d.id} open={index === 0 || module?.division === d.id || divisions.length < 4}><summary><span className="division-dot" style={{ background: d.color }} /><span>{d.title}</span><ChevronDown size={13} /></summary><div className="module-nav">{modules.filter(m => m.division === d.id).map(m => <a className={current.page === 'module' && current.id === m.id ? 'active' : ''} aria-current={current.page === 'module' && current.id === m.id ? 'page' : undefined} key={m.id} href={route('module', m.id)}>{api.progress.modules[m.id]?.completed ? <Check size={12} className="read-check" /> : <span className="module-bullet" />}<span>{m.title}</span>{m.contest && <small>LAB</small>}</a>)}</div></details>)}</nav>
        {!modules.length && <p className="sidebar-empty">Your curriculum will appear here when the catalog is generated.</p>}
      </div><div className="sidebar-bottom"><div className="sidebar-progress"><span>Your journey</span><span>{completed} / {problems.length}</span></div><div className="mini-progress"><span style={{ width: `${problems.length ? completed / problems.length * 100 : 0}%` }} /></div><p>A little progress, every day.</p><a className="sidebar-about" href="https://usaco.guide/" target="_blank" rel="noreferrer"><BookOpen size={14} /> Inspired by USACO Guide<ExternalLink size={12} /></a></div>
    </aside>
    <div className="app-shell"><header className="topbar"><button className="icon-button mobile-menu" aria-label="Open navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><Menu size={21} /></button><div className="breadcrumb"><span>Workspace</span><ChevronRight size={12} /><strong>{current.page === 'module' ? divisionFor(module?.division ?? '')?.title ?? 'Module' : current.page === 'problem' ? 'Practice' : current.page === 'timeline' ? 'Learning map' : current.page === 'progress' ? 'My progress' : 'Overview'}</strong></div><Search /><div className="header-actions"><span className="local-label"><span />Local-first learning</span><button className="icon-button theme-button" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title={dark ? 'Light mode' : 'Dark mode'} onClick={toggleTheme}>{dark ? <Sun size={19} /> : <Moon size={19} />}</button><a className="profile-mark" href="#/progress" aria-label="Your learning progress">You</a></div></header>
      <main id="main-content" tabIndex={-1}>
        {api.error && <div className="global-alert" role="alert">{api.error}<a href="#/progress">Manage progress <ArrowUpRight size={13} /></a></div>}
        {api.notice && <div className="global-notice" role="status">{api.notice}<button className="icon-button" aria-label="Dismiss notification" onClick={api.clearNotice}><X size={15} /></button></div>}
        {catalogMissing && <div className="global-alert">The catalog has not been generated yet. This build intentionally shows no invented modules or problems.</div>}
        {!current.page ? <Dashboard /> : current.page === 'module' && module ? <ModulePage module={module} /> : current.page === 'problem' && problem ? <ProblemPage problem={problem} /> : current.page === 'timeline' ? <Timeline /> : current.page === 'progress' ? <ProgressPage /> : <div className="page empty-state"><BookOpen size={38} /><h1>A page yet to be written.</h1><p>This module or problem isn’t in the current catalog.</p><a className="button primary" href="#/">Back to the overview</a></div>}
      </main><footer className="footer"><span>dl.guide <span className="footer-separator">/</span> Learn deeply. Build deliberately.</span><span>An independent, open learning project. <a href="https://usaco.guide/" target="_blank" rel="noreferrer">Inspired by USACO Guide <ArrowUpRight size={11} /></a><small>Original implementation; no source copied.</small></span></footer>
    </div></ProgressContext>;
}
