import { useState, useEffect, useCallback, useRef } from 'react';
import { sobrietyService, SobrietyRecord } from '../services/sobrietyService';
import {
  calculateSobrietyTime,
  SobrietyTime,
  getAchievedMilestones,
  getNextMilestone,
  getDaysUntilNextMilestone,
  Milestone,
  MILESTONES,
} from '../utils/timeCalculations';

interface UseSobrietyTrackerReturn {
  // Data
  sobrietyRecord: SobrietyRecord | null;
  sobrietyTime: SobrietyTime | null;
  milestones: Milestone[];
  nextMilestone: (typeof MILESTONES)[0] | null;
  daysUntilNextMilestone: number;

  // State
  isLoading: boolean;
  error: string | null;

  // Actions
  setSobrietyDate: (date: Date, notes?: string) => Promise<void>;
  resetSobriety: (notes?: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useSobrietyTracker(): UseSobrietyTrackerReturn {
  const [sobrietyRecord, setSobrietyRecord] = useState<SobrietyRecord | null>(null);
  const [sobrietyTime, setSobrietyTime] = useState<SobrietyTime | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate time and milestones
  const updateCalculations = useCallback((record: SobrietyRecord | null) => {
    if (!record) {
      setSobrietyTime(null);
      setMilestones([]);
      return;
    }

    const startDate = new Date(record.start_date);
    const time = calculateSobrietyTime(startDate);
    setSobrietyTime(time);

    const achieved = getAchievedMilestones(time.totalDays, startDate);
    setMilestones(achieved);
  }, []);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const record = await sobrietyService.getActiveSobrietyRecord();
      setSobrietyRecord(record);
      updateCalculations(record);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sobriety data');
    } finally {
      setIsLoading(false);
    }
  }, [updateCalculations]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set up real-time updates for the counter (separate effect)
  useEffect(() => {
    // Only start interval if we have a record
    if (!sobrietyRecord) {
      return;
    }

    // Update every second for real-time counter
    intervalRef.current = setInterval(() => {
      const startDate = new Date(sobrietyRecord.start_date);
      const time = calculateSobrietyTime(startDate);
      setSobrietyTime(time);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sobrietyRecord?.id, sobrietyRecord?.start_date]);

  // Set sobriety date
  const setSobrietyDate = useCallback(async (date: Date, notes?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const record = await sobrietyService.createSobrietyRecord({
        start_date: date,
        notes,
      });

      setSobrietyRecord(record);
      updateCalculations(record);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set sobriety date');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [updateCalculations]);

  // Reset sobriety
  const resetSobriety = useCallback(async (notes?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const record = await sobrietyService.resetSobriety(notes);
      setSobrietyRecord(record);
      updateCalculations(record);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset sobriety');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [updateCalculations]);

  // Derived values
  const nextMilestone = sobrietyTime ? getNextMilestone(sobrietyTime.totalDays) : null;
  const daysUntilNextMilestone = sobrietyTime ? getDaysUntilNextMilestone(sobrietyTime.totalDays) : 0;

  return {
    sobrietyRecord,
    sobrietyTime,
    milestones,
    nextMilestone,
    daysUntilNextMilestone,
    isLoading,
    error,
    setSobrietyDate,
    resetSobriety,
    refreshData: loadData,
  };
}
