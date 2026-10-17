import { describe, expect, it } from 'vitest';
import { canReveal, emptyProgress, loadProgress, mergeProgress, parseProgress, saveProgress, serializeProgress, STATUSES, STORAGE_KEY, validateProgress, type Progress } from './progress';

const timestamp = '2026-01-01T00:00:00.000Z';
const fixture = (): Progress => ({ version: 1, updatedAt: timestamp, problems: { 'gradient-descent': { status: 'Solving', notes: 'Try a lower learning rate. λ=0.1', bestScore: 0.87, updatedAt: timestamp } }, modules: { foundations: { completed: true, updatedAt: timestamp } } });

describe('versioned progress import / export', () => {
  it('round-trips statuses, unicode notes, scores, and reading progress', () => {
    expect(parseProgress(serializeProgress(fixture()))).toEqual(fixture());
  });
  it('supports all five manual statuses and optional scores', () => {
    for (const status of STATUSES) {
      const value = fixture(); value.problems['gradient-descent'].status = status;
      delete value.problems['gradient-descent'].bestScore;
      expect(parseProgress(serializeProgress(value))).toEqual(value);
    }
  });
  it('never unlocks solutions before an attempt status', () => {
    expect(canReveal('Not Attempted')).toBe(false);
    for (const status of STATUSES.slice(1)) expect(canReveal(status)).toBe(true);
  });
  it('rejects malformed JSON, null, arrays, and unsupported versions', () => {
    for (const json of ['{', 'null', '[]', '{}', '{"version":2}']) expect(() => parseProgress(json)).toThrow();
  });
  it('rejects invalid entries atomically without changing existing progress', () => {
    const current = fixture(); const before = serializeProgress(current);
    const incoming = fixture(); (incoming.problems['gradient-descent'] as unknown as Record<string, unknown>).status = 'Certified';
    expect(() => mergeProgress(current, parseProgress(JSON.stringify(incoming)))).toThrow('Nothing was imported');
    expect(serializeProgress(current)).toBe(before);
  });
  it('rejects invalid dates, scores, notes, and oversized imports', () => {
    for (const change of [{ updatedAt: 'yesterday' }, { bestScore: '0.99' }, { bestScore: Infinity }, { notes: 42 }, { notes: 'a'.repeat(50001) }]) {
      const value = fixture(); Object.assign(value.problems['gradient-descent'], change);
      expect(() => validateProgress(value)).toThrow();
    }
    expect(() => parseProgress(' '.repeat(2_000_001))).toThrow('2 MB');
    expect(() => validateProgress({ ...fixture(), updatedAt: '2026-99-99T00:00:00Z' })).toThrow();
  });
  it('rejects prototype-pollution keys', () => {
    const value = JSON.parse(serializeProgress(fixture()));
    Object.defineProperty(value.problems, '__proto__', { value: fixture().problems['gradient-descent'], enumerable: true });
    expect(() => validateProgress(value)).toThrow();
    expect(({} as Record<string, unknown>).status).toBeUndefined();
  });
  it('merges by entry timestamp and preserves newer notes, including unknown catalog IDs', () => {
    const current = fixture(); const incoming = fixture();
    current.problems['gradient-descent'].updatedAt = '2026-02-01T00:00:00Z';
    current.problems['gradient-descent'].notes = 'Newer personal notes';
    incoming.problems['future-problem'] = { status: 'Reviewing', notes: 'Keep when curriculum changes', updatedAt: timestamp };
    const merged = mergeProgress(current, incoming);
    expect(merged.problems['gradient-descent'].notes).toBe('Newer personal notes');
    expect(merged.problems['future-problem'].status).toBe('Reviewing');
    expect(current.problems['future-problem']).toBeUndefined();
  });
  it('uses newer incoming module state and preserves equal-time local edits', () => {
    const current = fixture(); const incoming = fixture();
    incoming.modules.foundations = { completed: false, updatedAt: '2026-03-01T00:00:00Z' };
    incoming.problems['gradient-descent'].notes = 'Equal timestamp';
    const merged = mergeProgress(current, incoming);
    expect(merged.modules.foundations.completed).toBe(false);
    expect(merged.problems['gradient-descent'].notes).toBe(current.problems['gradient-descent'].notes);
  });
});

describe('resilient local storage', () => {
  it('starts empty when no data is stored', () => {
    const loaded = loadProgress({ getItem: () => null });
    expect(loaded.progress.problems).toEqual({}); expect(loaded.error).toBeUndefined();
  });
  it('loads validated progress and writes the correct versioned key', () => {
    expect(loadProgress({ getItem: () => serializeProgress(fixture()) }).progress).toEqual(fixture());
    const values = new Map<string, string>();
    expect(saveProgress({ setItem: (key, value) => { values.set(key, value); } }, fixture())).toBeUndefined();
    expect(parseProgress(values.get(STORAGE_KEY)!)).toEqual(fixture());
  });
  it('reports denied storage without throwing or mutating in-memory progress', () => {
    expect(loadProgress({ getItem: () => { throw new Error('Denied'); } }).error).toContain('unavailable');
    const value = fixture();
    expect(saveProgress({ setItem: () => { throw new Error('QuotaExceeded'); } }, value)).toContain('could not be saved');
    expect(value).toEqual(fixture());
  });
  it('keeps corrupt saved data untouched and requires explicit recovery', () => {
    const corrupt = '{"lost":'; const loaded = loadProgress({ getItem: () => corrupt });
    expect(loaded.corrupt).toBe(true); expect(loaded.error).toContain('original is untouched');
    expect(loaded.progress.problems).toEqual({});
  });
  it('exports an empty progress document that can be imported', () => {
    const empty = emptyProgress(); expect(parseProgress(serializeProgress(empty))).toEqual(empty);
  });
});
