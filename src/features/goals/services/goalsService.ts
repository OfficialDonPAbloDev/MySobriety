import { supabase } from '../../../config/supabase';

export type GoalCategory =
  | 'health'
  | 'relationships'
  | 'career'
  | 'personal'
  | 'financial'
  | 'recovery'
  | 'other';

export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  target_date: string | null;
  status: GoalStatus;
  progress: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  steps?: GoalStep[];
}

export interface GoalStep {
  id: string;
  goal_id: string;
  user_id: string;
  title: string;
  is_completed: boolean;
  sort_order: number;
  completed_at: string | null;
  created_at: string;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  category: GoalCategory;
  target_date?: Date;
  steps?: string[];
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  category?: GoalCategory;
  target_date?: Date | null;
  status?: GoalStatus;
  progress?: number;
}

export const GOAL_CATEGORIES: { value: GoalCategory; label: string; icon: string }[] = [
  { value: 'recovery', label: 'Recovery', icon: '💪' },
  { value: 'health', label: 'Health', icon: '❤️' },
  { value: 'relationships', label: 'Relationships', icon: '👥' },
  { value: 'career', label: 'Career', icon: '💼' },
  { value: 'personal', label: 'Personal', icon: '🌟' },
  { value: 'financial', label: 'Financial', icon: '💰' },
  { value: 'other', label: 'Other', icon: '📌' },
];

export const SUGGESTED_GOALS: { title: string; category: GoalCategory; description: string }[] = [
  {
    title: 'Attend 90 meetings in 90 days',
    category: 'recovery',
    description: 'Commit to attending a support group meeting every day for 90 days.',
  },
  {
    title: 'Find a sponsor',
    category: 'recovery',
    description: 'Connect with an experienced person in recovery to guide you.',
  },
  {
    title: 'Complete the 12 steps',
    category: 'recovery',
    description: 'Work through all 12 steps with your sponsor.',
  },
  {
    title: 'Exercise 3 times a week',
    category: 'health',
    description: 'Build a regular exercise routine to improve physical and mental health.',
  },
  {
    title: 'Improve sleep schedule',
    category: 'health',
    description: 'Go to bed and wake up at consistent times.',
  },
  {
    title: 'Rebuild a relationship',
    category: 'relationships',
    description: 'Work on mending a relationship affected by addiction.',
  },
  {
    title: 'Make amends',
    category: 'relationships',
    description: 'Apologize and make amends to those you have harmed.',
  },
  {
    title: 'Find new employment',
    category: 'career',
    description: 'Search for and secure a new job.',
  },
  {
    title: 'Learn a new skill',
    category: 'personal',
    description: 'Develop a new hobby or skill to fill time productively.',
  },
  {
    title: 'Create a budget',
    category: 'financial',
    description: 'Track expenses and create a monthly budget.',
  },
];

class GoalsService {
  /**
   * Create a new goal
   */
  async createGoal(input: CreateGoalInput): Promise<Goal> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        title: input.title,
        description: input.description || null,
        category: input.category,
        target_date: input.target_date?.toISOString().split('T')[0] || null,
        status: 'active',
        progress: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating goal:', error);
      throw error;
    }

    // Create steps if provided
    if (input.steps && input.steps.length > 0) {
      const stepsToInsert = input.steps.map((title, index) => ({
        goal_id: data.id,
        user_id: user.id,
        title,
        sort_order: index,
      }));

      await supabase.from('goal_steps').insert(stepsToInsert);
    }

    return data as Goal;
  }

  /**
   * Update a goal
   */
  async updateGoal(id: string, input: UpdateGoalInput): Promise<Goal> {
    const updateData: Record<string, unknown> = {
      ...input,
      updated_at: new Date().toISOString(),
    };

    if (input.target_date !== undefined) {
      updateData.target_date = input.target_date?.toISOString().split('T')[0] || null;
    }

    if (input.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      updateData.progress = 100;
    }

    const { data, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating goal:', error);
      throw error;
    }

    return data as Goal;
  }

  /**
   * Delete a goal
   */
  async deleteGoal(id: string): Promise<void> {
    const { error } = await supabase.from('goals').delete().eq('id', id);

    if (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }

  /**
   * Get all goals for the user
   */
  async getGoals(status?: GoalStatus): Promise<Goal[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }

    return (data as Goal[]) || [];
  }

  /**
   * Get a single goal with its steps
   */
  async getGoalWithSteps(id: string): Promise<Goal | null> {
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
      .single();

    if (goalError) {
      console.error('Error fetching goal:', goalError);
      throw goalError;
    }

    const { data: steps, error: stepsError } = await supabase
      .from('goal_steps')
      .select('*')
      .eq('goal_id', id)
      .order('sort_order', { ascending: true });

    if (stepsError) {
      console.error('Error fetching goal steps:', stepsError);
    }

    return {
      ...goal,
      steps: steps || [],
    } as Goal;
  }

  /**
   * Add a step to a goal
   */
  async addStep(goalId: string, title: string): Promise<GoalStep> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current max sort order
    const { data: existingSteps } = await supabase
      .from('goal_steps')
      .select('sort_order')
      .eq('goal_id', goalId)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder = existingSteps && existingSteps.length > 0 ? existingSteps[0].sort_order + 1 : 0;

    const { data, error } = await supabase
      .from('goal_steps')
      .insert({
        goal_id: goalId,
        user_id: user.id,
        title,
        sort_order: nextOrder,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding step:', error);
      throw error;
    }

    return data as GoalStep;
  }

  /**
   * Toggle step completion
   */
  async toggleStep(stepId: string, isCompleted: boolean): Promise<GoalStep> {
    const { data, error } = await supabase
      .from('goal_steps')
      .update({
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq('id', stepId)
      .select()
      .single();

    if (error) {
      console.error('Error toggling step:', error);
      throw error;
    }

    return data as GoalStep;
  }

  /**
   * Delete a step
   */
  async deleteStep(stepId: string): Promise<void> {
    const { error } = await supabase.from('goal_steps').delete().eq('id', stepId);

    if (error) {
      console.error('Error deleting step:', error);
      throw error;
    }
  }

  /**
   * Update goal progress based on completed steps
   */
  async recalculateProgress(goalId: string): Promise<number> {
    const { data: steps, error } = await supabase
      .from('goal_steps')
      .select('is_completed')
      .eq('goal_id', goalId);

    if (error || !steps || steps.length === 0) return 0;

    const completedCount = steps.filter((s) => s.is_completed).length;
    const progress = Math.round((completedCount / steps.length) * 100);

    await supabase.from('goals').update({ progress }).eq('id', goalId);

    return progress;
  }

  /**
   * Get goal statistics
   */
  async getStats(): Promise<{
    totalGoals: number;
    activeGoals: number;
    completedGoals: number;
    completionRate: number;
  }> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { totalGoals: 0, activeGoals: 0, completedGoals: 0, completionRate: 0 };

    const { data, error } = await supabase
      .from('goals')
      .select('status')
      .eq('user_id', user.id);

    if (error || !data) {
      return { totalGoals: 0, activeGoals: 0, completedGoals: 0, completionRate: 0 };
    }

    const totalGoals = data.length;
    const activeGoals = data.filter((g) => g.status === 'active').length;
    const completedGoals = data.filter((g) => g.status === 'completed').length;
    const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    return { totalGoals, activeGoals, completedGoals, completionRate };
  }
}

export const goalsService = new GoalsService();
