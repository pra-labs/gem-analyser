'use client';

import { useSyncExternalStore, useCallback } from 'react';

const STORAGE_KEY = 'gem_analyser_saved_bids';

function getStoredSavedBids(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

let listeners: Array<() => void> = [];
let cachedSavedIds: Set<string> = new Set();
const SERVER_SNAPSHOT = new Set<string>();
let isInitialized = false;

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): Set<string> {
  if (!isInitialized && typeof window !== 'undefined') {
    cachedSavedIds = new Set(getStoredSavedBids());
    isInitialized = true;
  }
  return cachedSavedIds;
}

function getServerSnapshot(): Set<string> {
  return SERVER_SNAPSHOT;
}

export function useSavedBids() {
  const savedIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleSave = useCallback((id: string) => {
    const next = new Set(cachedSavedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    cachedSavedIds = next;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
    emitChange();
  }, []);

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);

  return {
    savedIds,
    toggleSave,
    isSaved,
    savedCount: savedIds.size,
  };
}
