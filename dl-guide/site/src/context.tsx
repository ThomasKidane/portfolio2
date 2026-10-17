import { createContext, useContext } from 'react';
import type { ProgressContextValue } from './useProgress';
export const ProgressContext = createContext<ProgressContextValue | null>(null);
export function useGuideProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('Progress provider is missing.');
  return context;
}
