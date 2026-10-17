import { useCallback, useEffect, useRef, useState } from 'react';
import { defaultEntry, emptyProgress, loadProgress, mergeProgress, parseProgress, saveProgress, serializeProgress, STORAGE_KEY, type Entry, type Progress } from './progress';

export function useProgress() {
  const [initial] = useState(() => { try { return loadProgress(window.localStorage); } catch { return { progress: emptyProgress(), error: 'Browser storage is unavailable. Export a backup to keep your work.' }; } });
  const [progress, setProgress] = useState(initial.progress);
  const latest = useRef(progress);
  const blocked = useRef(!!initial.corrupt);
  const [error, setError] = useState(initial.error ?? '');
  const [notice, setNotice] = useState('');
  const commit = useCallback((next: Progress) => {
    latest.current = next; setProgress(next);
    if (!blocked.current) {
      try { setError(saveProgress(window.localStorage, next) ?? ''); } catch { setError('Browser storage is unavailable. Export a backup before leaving.'); }
    }
  }, []);
  useEffect(() => {
    const listener = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      if (!event.newValue) { setNotice('Saved progress was removed in another tab. This tab keeps its current copy; export it if needed.'); return; }
      try {
        const next = mergeProgress(latest.current, parseProgress(event.newValue));
        latest.current = next; setProgress(next); setNotice('Progress synced from another tab.');
      } catch { setError('Another tab wrote unreadable progress. Your current progress has been kept.'); }
    };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, []);
  return {
    progress, error, notice, clearNotice: () => setNotice(''), storageBlocked: blocked.current,
    updateProblem: (id: string, change: Partial<Entry>) => {
      const now = new Date().toISOString(); const current = latest.current;
      commit({ ...current, updatedAt: now, problems: { ...current.problems, [id]: { ...(current.problems[id] ?? defaultEntry()), ...change, updatedAt: now } } });
    },
    updateModule: (id: string, completed: boolean) => {
      const now = new Date().toISOString(); const current = latest.current;
      commit({ ...current, updatedAt: now, modules: { ...current.modules, [id]: { completed, updatedAt: now } } });
    },
    importProgress: (content: string) => {
      const incoming = parseProgress(content);
      commit(mergeProgress(latest.current, incoming));
      setNotice('Progress imported. Newer entries were merged; existing notes were kept when newer.');
    },
    exportProgress: () => {
      const blob = new Blob([serializeProgress(latest.current)], { type: 'application/json' });
      const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
      anchor.href = url; anchor.download = 'progress.json'; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    resetUnreadableStorage: () => {
      if (!window.confirm('Replace the unreadable saved copy with the progress currently in this tab? Export a backup first. This cannot be undone.')) return;
      blocked.current = false; commit(latest.current);
    },
  };
}
export type ProgressContextValue = ReturnType<typeof useProgress>;
