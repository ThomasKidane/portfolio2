export const STORAGE_KEY = 'dl-guide:progress:v1';
export const STATUSES = ['Not Attempted', 'Solving', 'Solved', 'Reviewing', 'Skipped'] as const;
export type Status = typeof STATUSES[number];
export interface Entry { status: Status; notes: string; bestScore?: number; updatedAt: string }
export interface ReadingEntry { completed: boolean; updatedAt: string }
export interface Progress { version: 1; updatedAt: string; problems: Record<string, Entry>; modules: Record<string, ReadingEntry> }
export const emptyProgress = (): Progress => ({ version: 1, updatedAt: new Date().toISOString(), problems: {}, modules: {} });
export const defaultEntry = (): Entry => ({ status: 'Not Attempted', notes: '', updatedAt: new Date().toISOString() });
const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const validDate = (v: unknown): v is string => typeof v === 'string' && v.length <= 40 && /^\d{4}-\d{2}-\d{2}T/.test(v) && Number.isFinite(Date.parse(v));
const validId = (id: string) => id.length > 0 && id.length <= 240 && !['__proto__', 'constructor', 'prototype'].includes(id);
export function validateProgress(value: unknown): Progress {
  if (!isObject(value) || value.version !== 1) throw new Error('Unsupported progress format. Expected a version 1 DL Guide export.');
  if (!validDate(value.updatedAt) || !isObject(value.problems) || !isObject(value.modules)) throw new Error('Invalid progress file: missing timestamp, problems, or modules.');
  if (Object.keys(value.problems).length > 10000 || Object.keys(value.modules).length > 10000) throw new Error('This progress file contains too many records.');
  const result: Progress = { version: 1, updatedAt: value.updatedAt, problems: {}, modules: {} };
  for (const [id, entry] of Object.entries(value.problems)) {
    if (!validId(id) || !isObject(entry) || !STATUSES.includes(entry.status as Status) || typeof entry.notes !== 'string' || entry.notes.length > 50000 || !validDate(entry.updatedAt)) throw new Error(`Invalid progress entry: ${id.slice(0, 80)}. Nothing was imported.`);
    if (entry.bestScore !== undefined && (typeof entry.bestScore !== 'number' || !Number.isFinite(entry.bestScore))) throw new Error(`Invalid best score for ${id}. Nothing was imported.`);
    result.problems[id] = { status: entry.status as Status, notes: entry.notes, updatedAt: entry.updatedAt, ...(entry.bestScore !== undefined ? { bestScore: entry.bestScore as number } : {}) };
  }
  for (const [id, entry] of Object.entries(value.modules)) {
    if (!validId(id) || !isObject(entry) || typeof entry.completed !== 'boolean' || !validDate(entry.updatedAt)) throw new Error(`Invalid reading progress: ${id.slice(0,80)}. Nothing was imported.`);
    result.modules[id] = { completed: entry.completed, updatedAt: entry.updatedAt };
  }
  return result;
}
export function parseProgress(json: string): Progress {
  if (json.length > 2_000_000) throw new Error('Progress files must be smaller than 2 MB. Nothing was imported.');
  let value: unknown;
  try { value = JSON.parse(json); } catch { throw new Error('This is not a valid JSON file. Your existing progress has not changed.'); }
  return validateProgress(value);
}
export const serializeProgress = (progress: Progress) => JSON.stringify(validateProgress(progress), null, 2);
export function mergeProgress(current: Progress, incoming: Progress): Progress {
  const merge = <T extends { updatedAt: string }>(a: Record<string, T>, b: Record<string, T>) => {
    const result = { ...a };
    for (const [id, entry] of Object.entries(b)) if (!result[id] || Date.parse(entry.updatedAt) > Date.parse(result[id].updatedAt)) result[id] = entry;
    return result;
  };
  return { version: 1, updatedAt: Date.parse(incoming.updatedAt) > Date.parse(current.updatedAt) ? incoming.updatedAt : current.updatedAt, problems: merge(current.problems, incoming.problems), modules: merge(current.modules, incoming.modules) };
}
export function loadProgress(storage: Pick<Storage, 'getItem'>): { progress: Progress; error?: string; corrupt?: boolean } {
  let stored: string | null;
  try { stored = storage.getItem(STORAGE_KEY); } catch { return { progress: emptyProgress(), error: 'Browser storage is unavailable. Changes stay in this tab only; export a backup before leaving.' }; }
  if (!stored) return { progress: emptyProgress() };
  try { return { progress: parseProgress(stored) }; } catch { return { progress: emptyProgress(), corrupt: true, error: 'Saved progress could not be read. The original is untouched. Export your work in this tab, then explicitly reset the unreadable saved copy in Progress.' }; }
}
export function saveProgress(storage: Pick<Storage, 'setItem'>, progress: Progress): string | undefined {
  try { storage.setItem(STORAGE_KEY, serializeProgress(progress)); } catch { return 'Progress could not be saved (storage denied or full). Your changes remain in this tab. Export a backup before leaving.'; }
}
export const canReveal = (status: Status) => status !== 'Not Attempted';
