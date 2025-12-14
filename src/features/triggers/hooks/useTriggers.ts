import { useState, useEffect, useCallback } from 'react';
import {
  triggersService,
  TriggerLog,
  CopingStrategy,
  CreateTriggerLogInput,
  TriggerCategory,
} from '../services/triggersService';

interface UseTriggersReturn {
  triggerLogs: TriggerLog[];
  copingStrategies: CopingStrategy[];
  isLoading: boolean;
  error: Error | null;
  stats: {
    totalLogs: number;
    mostCommonTrigger: string | null;
    mostCommonCategory: TriggerCategory | null;
    resistanceRate: number;
    averageIntensity: number;
    triggersByCategory: Record<TriggerCategory, number>;
  };
  logTrigger: (input: CreateTriggerLogInput) => Promise<TriggerLog>;
  deleteTriggerLog: (id: string) => Promise<void>;
  createCopingStrategy: (name: string, description: string | null, category: string) => Promise<CopingStrategy>;
  deleteCopingStrategy: (id: string) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

export function useTriggers(): UseTriggersReturn {
  const [triggerLogs, setTriggerLogs] = useState<TriggerLog[]>([]);
  const [copingStrategies, setCopingStrategies] = useState<CopingStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({
    totalLogs: 0,
    mostCommonTrigger: null as string | null,
    mostCommonCategory: null as TriggerCategory | null,
    resistanceRate: 0,
    averageIntensity: 0,
    triggersByCategory: {
      emotional: 0,
      social: 0,
      environmental: 0,
      physical: 0,
      mental: 0,
      other: 0,
    } as Record<TriggerCategory, number>,
  });

  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [logs, strategies, fetchedStats] = await Promise.all([
        triggersService.getTriggerLogs(PAGE_SIZE, 0),
        triggersService.getCopingStrategies(),
        triggersService.getTriggerStats(),
      ]);

      setTriggerLogs(logs);
      setCopingStrategies(strategies);
      setStats(fetchedStats);
      setOffset(logs.length);
      setHasMore(logs.length === PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    try {
      const moreLogs = await triggersService.getTriggerLogs(PAGE_SIZE, offset);
      setTriggerLogs((prev) => [...prev, ...moreLogs]);
      setOffset((prev) => prev + moreLogs.length);
      setHasMore(moreLogs.length === PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more'));
    }
  }, [hasMore, isLoading, offset]);

  const logTrigger = useCallback(async (input: CreateTriggerLogInput): Promise<TriggerLog> => {
    const newLog = await triggersService.createTriggerLog(input);
    await fetchInitialData(); // Refresh all data including stats
    return newLog;
  }, [fetchInitialData]);

  const deleteTriggerLog = useCallback(async (id: string): Promise<void> => {
    await triggersService.deleteTriggerLog(id);
    setTriggerLogs((prev) => prev.filter((log) => log.id !== id));
    // Refresh stats
    const newStats = await triggersService.getTriggerStats();
    setStats(newStats);
  }, []);

  const createCopingStrategy = useCallback(
    async (name: string, description: string | null, category: string): Promise<CopingStrategy> => {
      const strategy = await triggersService.createCopingStrategy(name, description, category);
      setCopingStrategies((prev) => [...prev, strategy]);
      return strategy;
    },
    []
  );

  const deleteCopingStrategy = useCallback(async (id: string): Promise<void> => {
    await triggersService.deleteCopingStrategy(id);
    setCopingStrategies((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
    triggerLogs,
    copingStrategies,
    isLoading,
    error,
    stats,
    logTrigger,
    deleteTriggerLog,
    createCopingStrategy,
    deleteCopingStrategy,
    loadMore,
    refresh: fetchInitialData,
    hasMore,
  };
}

interface UseCopingStrategiesReturn {
  strategies: CopingStrategy[];
  strategiesByCategory: Record<string, CopingStrategy[]>;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useCopingStrategies(): UseCopingStrategiesReturn {
  const [strategies, setStrategies] = useState<CopingStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStrategies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await triggersService.getCopingStrategies();
      setStrategies(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch strategies'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStrategies();
  }, [fetchStrategies]);

  const strategiesByCategory = strategies.reduce(
    (acc, strategy) => {
      const cat = strategy.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(strategy);
      return acc;
    },
    {} as Record<string, CopingStrategy[]>
  );

  return {
    strategies,
    strategiesByCategory,
    isLoading,
    error,
    refresh: fetchStrategies,
  };
}
