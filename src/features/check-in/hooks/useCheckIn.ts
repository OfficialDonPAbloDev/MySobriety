import { useState, useEffect, useCallback } from 'react';
import { checkInService, CheckIn, CreateCheckInInput, MoodRating } from '../services/checkInService';

interface UseCheckInReturn {
  // Data
  todayCheckIn: CheckIn | null;
  checkInHistory: CheckIn[];
  streak: number;
  averageMood: number;
  hasCheckedInToday: boolean;

  // State
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  submitCheckIn: (input: CreateCheckInInput) => Promise<void>;
  refreshData: () => Promise<void>;
}

export function useCheckIn(): UseCheckInReturn {
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null);
  const [checkInHistory, setCheckInHistory] = useState<CheckIn[]>([]);
  const [streak, setStreak] = useState(0);
  const [averageMood, setAverageMood] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [today, history, currentStreak, avgMood] = await Promise.all([
        checkInService.getTodayCheckIn(),
        checkInService.getCheckInHistory(30),
        checkInService.getCheckInStreak(),
        checkInService.getAverageMood(7),
      ]);

      setTodayCheckIn(today);
      setCheckInHistory(history);
      setStreak(currentStreak);
      setAverageMood(avgMood);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load check-in data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const submitCheckIn = useCallback(async (input: CreateCheckInInput) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const checkIn = await checkInService.createCheckIn(input);
      setTodayCheckIn(checkIn);

      // Refresh all data after submission
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit check-in');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [loadData]);

  return {
    todayCheckIn,
    checkInHistory,
    streak,
    averageMood,
    hasCheckedInToday: !!todayCheckIn,
    isLoading,
    isSubmitting,
    error,
    submitCheckIn,
    refreshData: loadData,
  };
}
