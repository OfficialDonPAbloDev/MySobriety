import { useState, useEffect, useCallback } from 'react';
import {
  journalService,
  JournalEntry,
  CreateJournalEntryInput,
  UpdateJournalEntryInput,
} from '../services/journalService';

interface UseJournalReturn {
  entries: JournalEntry[];
  isLoading: boolean;
  error: string | null;
  stats: { totalEntries: number; thisMonth: number; streak: number };

  // Actions
  createEntry: (input: CreateJournalEntryInput) => Promise<JournalEntry>;
  updateEntry: (id: string, input: UpdateJournalEntryInput) => Promise<JournalEntry>;
  deleteEntry: (id: string) => Promise<void>;
  toggleFavorite: (id: string, isFavorite: boolean) => Promise<void>;
  searchEntries: (keyword: string) => Promise<JournalEntry[]>;
  refreshEntries: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useJournal(): UseJournalReturn {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalEntries: 0, thisMonth: 0, streak: 0 });
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const loadEntries = useCallback(async (reset = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const currentOffset = reset ? 0 : offset;
      const newEntries = await journalService.getEntries({
        limit: LIMIT,
        offset: currentOffset,
      });

      if (reset) {
        setEntries(newEntries);
        setOffset(LIMIT);
      } else {
        setEntries((prev) => [...prev, ...newEntries]);
        setOffset((prev) => prev + LIMIT);
      }

      setHasMore(newEntries.length === LIMIT);

      // Also load stats
      const journalStats = await journalService.getStats();
      setStats(journalStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journal entries');
    } finally {
      setIsLoading(false);
    }
  }, [offset]);

  useEffect(() => {
    loadEntries(true);
  }, []);

  const createEntry = useCallback(async (input: CreateJournalEntryInput) => {
    try {
      const newEntry = await journalService.createEntry(input);
      setEntries((prev) => [newEntry, ...prev]);
      setStats((prev) => ({
        ...prev,
        totalEntries: prev.totalEntries + 1,
        thisMonth: prev.thisMonth + 1,
      }));
      return newEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create entry');
      throw err;
    }
  }, []);

  const updateEntry = useCallback(async (id: string, input: UpdateJournalEntryInput) => {
    try {
      const updatedEntry = await journalService.updateEntry(id, input);
      setEntries((prev) =>
        prev.map((entry) => (entry.id === id ? updatedEntry : entry))
      );
      return updatedEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entry');
      throw err;
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      await journalService.deleteEntry(id);
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
      setStats((prev) => ({
        ...prev,
        totalEntries: Math.max(0, prev.totalEntries - 1),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
      throw err;
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string, isFavorite: boolean) => {
    try {
      await journalService.toggleFavorite(id, isFavorite);
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, is_favorite: isFavorite } : entry
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
      throw err;
    }
  }, []);

  const searchEntries = useCallback(async (keyword: string) => {
    try {
      return await journalService.searchEntries(keyword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search entries');
      throw err;
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await loadEntries(false);
  }, [hasMore, isLoading, loadEntries]);

  const refreshEntries = useCallback(async () => {
    await loadEntries(true);
  }, [loadEntries]);

  return {
    entries,
    isLoading,
    error,
    stats,
    createEntry,
    updateEntry,
    deleteEntry,
    toggleFavorite,
    searchEntries,
    refreshEntries,
    loadMore,
    hasMore,
  };
}
