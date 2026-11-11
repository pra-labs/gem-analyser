'use client';

import { useSyncExternalStore, useCallback } from 'react';
import { PipelineStage, PipelineItem } from '@/types/bid';

const STORAGE_KEY = 'gem_analyser_saved_bids';
const PIPELINE_KEY = 'gem_analyser_pipeline_stages';

function getStoredSavedBids(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

function getStoredPipeline(): Record<string, PipelineStage> {
  if (typeof window === 'undefined') return {};
  try {
    const item = localStorage.getItem(PIPELINE_KEY);
    return item ? JSON.parse(item) : {};
  } catch {
    return {};
  }
}

let listeners: Array<() => void> = [];
let cachedSavedIds: Set<string> = new Set();
let cachedPipeline: Record<string, PipelineStage> = {};
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
    cachedPipeline = getStoredPipeline();
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
    const nextPipeline = { ...cachedPipeline };

    if (next.has(id)) {
      next.delete(id);
      delete nextPipeline[id];
    } else {
      next.add(id);
      nextPipeline[id] = 'saved';
    }

    cachedSavedIds = next;
    cachedPipeline = nextPipeline;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      localStorage.setItem(PIPELINE_KEY, JSON.stringify(nextPipeline));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
    emitChange();
  }, []);

  const updateStage = useCallback((id: string, stage: PipelineStage) => {
    cachedPipeline = {
      ...cachedPipeline,
      [id]: stage,
    };
    try {
      localStorage.setItem(PIPELINE_KEY, JSON.stringify(cachedPipeline));
    } catch (e) {
      console.error('Failed to update stage in localStorage', e);
    }
    emitChange();
  }, []);

  const getStage = useCallback((id: string): PipelineStage => {
    return cachedPipeline[id] || 'saved';
  }, []);

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);

  return {
    savedIds,
    toggleSave,
    isSaved,
    savedCount: savedIds.size,
    pipeline: cachedPipeline,
    updateStage,
    getStage,
  };
}
