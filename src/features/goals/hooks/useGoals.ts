import { useState, useEffect, useCallback } from 'react';
import {
  goalsService,
  Goal,
  GoalStep,
  GoalStatus,
  CreateGoalInput,
  UpdateGoalInput,
} from '../services/goalsService';

interface UseGoalsReturn {
  goals: Goal[];
  activeGoals: Goal[];
  completedGoals: Goal[];
  isLoading: boolean;
  error: Error | null;
  stats: {
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    completionRate: number;
  };
  createGoal: (input: CreateGoalInput) => Promise<Goal>;
  updateGoal: (id: string, input: UpdateGoalInput) => Promise<Goal>;
  deleteGoal: (id: string) => Promise<void>;
  completeGoal: (id: string) => Promise<Goal>;
  refreshGoals: () => Promise<void>;
}

export function useGoals(): UseGoalsReturn {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState({
    totalGoals: 0,
    activeGoals: 0,
    completedGoals: 0,
    completionRate: 0,
  });

  const fetchGoals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [fetchedGoals, fetchedStats] = await Promise.all([
        goalsService.getGoals(),
        goalsService.getStats(),
      ]);
      setGoals(fetchedGoals);
      setStats(fetchedStats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch goals'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = useCallback(async (input: CreateGoalInput): Promise<Goal> => {
    const newGoal = await goalsService.createGoal(input);
    await fetchGoals();
    return newGoal;
  }, [fetchGoals]);

  const updateGoal = useCallback(async (id: string, input: UpdateGoalInput): Promise<Goal> => {
    const updatedGoal = await goalsService.updateGoal(id, input);
    await fetchGoals();
    return updatedGoal;
  }, [fetchGoals]);

  const deleteGoal = useCallback(async (id: string): Promise<void> => {
    await goalsService.deleteGoal(id);
    await fetchGoals();
  }, [fetchGoals]);

  const completeGoal = useCallback(async (id: string): Promise<Goal> => {
    const completedGoal = await goalsService.updateGoal(id, { status: 'completed' });
    await fetchGoals();
    return completedGoal;
  }, [fetchGoals]);

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  return {
    goals,
    activeGoals,
    completedGoals,
    isLoading,
    error,
    stats,
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    refreshGoals: fetchGoals,
  };
}

interface UseGoalDetailReturn {
  goal: Goal | null;
  isLoading: boolean;
  error: Error | null;
  addStep: (title: string) => Promise<GoalStep>;
  toggleStep: (stepId: string, isCompleted: boolean) => Promise<void>;
  deleteStep: (stepId: string) => Promise<void>;
  updateProgress: () => Promise<number>;
  refreshGoal: () => Promise<void>;
}

export function useGoalDetail(goalId: string | null): UseGoalDetailReturn {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGoal = useCallback(async () => {
    if (!goalId) {
      setGoal(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const fetchedGoal = await goalsService.getGoalWithSteps(goalId);
      setGoal(fetchedGoal);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch goal'));
    } finally {
      setIsLoading(false);
    }
  }, [goalId]);

  useEffect(() => {
    fetchGoal();
  }, [fetchGoal]);

  const addStep = useCallback(async (title: string): Promise<GoalStep> => {
    if (!goalId) throw new Error('No goal selected');
    const step = await goalsService.addStep(goalId, title);
    await fetchGoal();
    return step;
  }, [goalId, fetchGoal]);

  const toggleStep = useCallback(async (stepId: string, isCompleted: boolean): Promise<void> => {
    await goalsService.toggleStep(stepId, isCompleted);
    if (goalId) {
      await goalsService.recalculateProgress(goalId);
    }
    await fetchGoal();
  }, [goalId, fetchGoal]);

  const deleteStep = useCallback(async (stepId: string): Promise<void> => {
    await goalsService.deleteStep(stepId);
    if (goalId) {
      await goalsService.recalculateProgress(goalId);
    }
    await fetchGoal();
  }, [goalId, fetchGoal]);

  const updateProgress = useCallback(async (): Promise<number> => {
    if (!goalId) return 0;
    const progress = await goalsService.recalculateProgress(goalId);
    await fetchGoal();
    return progress;
  }, [goalId, fetchGoal]);

  return {
    goal,
    isLoading,
    error,
    addStep,
    toggleStep,
    deleteStep,
    updateProgress,
    refreshGoal: fetchGoal,
  };
}
