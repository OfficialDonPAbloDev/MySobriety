import { supabase } from '../../../config/supabase';

export type TriggerCategory =
  | 'emotional'
  | 'social'
  | 'environmental'
  | 'physical'
  | 'mental'
  | 'other';

export type TriggerIntensity = 1 | 2 | 3 | 4 | 5;

export interface TriggerLog {
  id: string;
  user_id: string;
  trigger_name: string;
  category: TriggerCategory;
  intensity: TriggerIntensity;
  situation: string | null;
  coping_strategies_used: string[];
  outcome: 'resisted' | 'partially_resisted' | 'gave_in' | null;
  notes: string | null;
  occurred_at: string;
  created_at: string;
}

export interface CopingStrategy {
  id: string;
  name: string;
  description: string | null;
  category: string;
  is_system: boolean;
  user_id: string | null;
  created_at: string;
}

export interface CreateTriggerLogInput {
  trigger_name: string;
  category: TriggerCategory;
  intensity: TriggerIntensity;
  situation?: string;
  coping_strategies_used?: string[];
  outcome?: 'resisted' | 'partially_resisted' | 'gave_in';
  notes?: string;
  occurred_at?: Date;
}

export const TRIGGER_CATEGORIES: { value: TriggerCategory; label: string; icon: string; description: string }[] = [
  {
    value: 'emotional',
    label: 'Emotional',
    icon: '😢',
    description: 'Stress, anxiety, sadness, anger, loneliness',
  },
  {
    value: 'social',
    label: 'Social',
    icon: '👥',
    description: 'Peer pressure, social events, certain people',
  },
  {
    value: 'environmental',
    label: 'Environmental',
    icon: '🏠',
    description: 'Places, situations, times of day',
  },
  {
    value: 'physical',
    label: 'Physical',
    icon: '🏃',
    description: 'Fatigue, pain, hunger, insomnia',
  },
  {
    value: 'mental',
    label: 'Mental',
    icon: '🧠',
    description: 'Negative thoughts, boredom, memories',
  },
  {
    value: 'other',
    label: 'Other',
    icon: '📌',
    description: 'Other triggers not listed above',
  },
];

export const COMMON_TRIGGERS = [
  { name: 'Stress', category: 'emotional' as TriggerCategory },
  { name: 'Anxiety', category: 'emotional' as TriggerCategory },
  { name: 'Loneliness', category: 'emotional' as TriggerCategory },
  { name: 'Anger', category: 'emotional' as TriggerCategory },
  { name: 'Sadness', category: 'emotional' as TriggerCategory },
  { name: 'Boredom', category: 'mental' as TriggerCategory },
  { name: 'Peer pressure', category: 'social' as TriggerCategory },
  { name: 'Parties/Social events', category: 'social' as TriggerCategory },
  { name: 'Certain people', category: 'social' as TriggerCategory },
  { name: 'Work environment', category: 'environmental' as TriggerCategory },
  { name: 'Home alone', category: 'environmental' as TriggerCategory },
  { name: 'Fatigue', category: 'physical' as TriggerCategory },
  { name: 'Physical pain', category: 'physical' as TriggerCategory },
  { name: 'Insomnia', category: 'physical' as TriggerCategory },
  { name: 'Negative self-talk', category: 'mental' as TriggerCategory },
  { name: 'Memories/Flashbacks', category: 'mental' as TriggerCategory },
];

export const INTENSITY_LABELS = [
  { value: 1 as TriggerIntensity, label: 'Very Low', color: '#10B981' },
  { value: 2 as TriggerIntensity, label: 'Low', color: '#22C55E' },
  { value: 3 as TriggerIntensity, label: 'Moderate', color: '#EAB308' },
  { value: 4 as TriggerIntensity, label: 'High', color: '#F97316' },
  { value: 5 as TriggerIntensity, label: 'Very High', color: '#EF4444' },
];

class TriggersService {
  /**
   * Create a new trigger log
   */
  async createTriggerLog(input: CreateTriggerLogInput): Promise<TriggerLog> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('trigger_logs')
      .insert({
        user_id: user.id,
        trigger_name: input.trigger_name,
        category: input.category,
        intensity: input.intensity,
        situation: input.situation || null,
        coping_strategies_used: input.coping_strategies_used || [],
        outcome: input.outcome || null,
        notes: input.notes || null,
        occurred_at: input.occurred_at?.toISOString() || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating trigger log:', error);
      throw error;
    }

    return data as TriggerLog;
  }

  /**
   * Get trigger logs for the user
   */
  async getTriggerLogs(limit = 50, offset = 0): Promise<TriggerLog[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('trigger_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('occurred_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching trigger logs:', error);
      throw error;
    }

    return (data as TriggerLog[]) || [];
  }

  /**
   * Get trigger logs for a specific date range
   */
  async getTriggerLogsByDateRange(startDate: Date, endDate: Date): Promise<TriggerLog[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('trigger_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('occurred_at', startDate.toISOString())
      .lte('occurred_at', endDate.toISOString())
      .order('occurred_at', { ascending: false });

    if (error) {
      console.error('Error fetching trigger logs by date range:', error);
      throw error;
    }

    return (data as TriggerLog[]) || [];
  }

  /**
   * Delete a trigger log
   */
  async deleteTriggerLog(id: string): Promise<void> {
    const { error } = await supabase.from('trigger_logs').delete().eq('id', id);

    if (error) {
      console.error('Error deleting trigger log:', error);
      throw error;
    }
  }

  /**
   * Get all coping strategies (system + user's custom)
   */
  async getCopingStrategies(): Promise<CopingStrategy[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase
      .from('coping_strategies')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    // Get system strategies and user's custom strategies
    if (user) {
      query = query.or(`is_system.eq.true,user_id.eq.${user.id}`);
    } else {
      query = query.eq('is_system', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching coping strategies:', error);
      throw error;
    }

    return (data as CopingStrategy[]) || [];
  }

  /**
   * Create a custom coping strategy
   */
  async createCopingStrategy(
    name: string,
    description: string | null,
    category: string
  ): Promise<CopingStrategy> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('coping_strategies')
      .insert({
        user_id: user.id,
        name,
        description,
        category,
        is_system: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating coping strategy:', error);
      throw error;
    }

    return data as CopingStrategy;
  }

  /**
   * Delete a custom coping strategy
   */
  async deleteCopingStrategy(id: string): Promise<void> {
    const { error } = await supabase
      .from('coping_strategies')
      .delete()
      .eq('id', id)
      .eq('is_system', false); // Can only delete non-system strategies

    if (error) {
      console.error('Error deleting coping strategy:', error);
      throw error;
    }
  }

  /**
   * Get trigger statistics
   */
  async getTriggerStats(): Promise<{
    totalLogs: number;
    mostCommonTrigger: string | null;
    mostCommonCategory: TriggerCategory | null;
    resistanceRate: number;
    averageIntensity: number;
    triggersByCategory: Record<TriggerCategory, number>;
  }> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        totalLogs: 0,
        mostCommonTrigger: null,
        mostCommonCategory: null,
        resistanceRate: 0,
        averageIntensity: 0,
        triggersByCategory: {
          emotional: 0,
          social: 0,
          environmental: 0,
          physical: 0,
          mental: 0,
          other: 0,
        },
      };
    }

    const { data, error } = await supabase
      .from('trigger_logs')
      .select('trigger_name, category, intensity, outcome')
      .eq('user_id', user.id);

    if (error || !data || data.length === 0) {
      return {
        totalLogs: 0,
        mostCommonTrigger: null,
        mostCommonCategory: null,
        resistanceRate: 0,
        averageIntensity: 0,
        triggersByCategory: {
          emotional: 0,
          social: 0,
          environmental: 0,
          physical: 0,
          mental: 0,
          other: 0,
        },
      };
    }

    // Calculate statistics
    const triggerCounts: Record<string, number> = {};
    const categoryCounts: Record<TriggerCategory, number> = {
      emotional: 0,
      social: 0,
      environmental: 0,
      physical: 0,
      mental: 0,
      other: 0,
    };
    let totalIntensity = 0;
    let resistedCount = 0;
    let outcomesCount = 0;

    data.forEach((log) => {
      // Count triggers
      triggerCounts[log.trigger_name] = (triggerCounts[log.trigger_name] || 0) + 1;

      // Count categories
      categoryCounts[log.category as TriggerCategory]++;

      // Sum intensity
      totalIntensity += log.intensity;

      // Count outcomes
      if (log.outcome) {
        outcomesCount++;
        if (log.outcome === 'resisted' || log.outcome === 'partially_resisted') {
          resistedCount++;
        }
      }
    });

    // Find most common trigger
    const mostCommonTrigger = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Find most common category
    const mostCommonCategory = (Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as TriggerCategory) || null;

    return {
      totalLogs: data.length,
      mostCommonTrigger,
      mostCommonCategory,
      resistanceRate: outcomesCount > 0 ? Math.round((resistedCount / outcomesCount) * 100) : 0,
      averageIntensity: Math.round((totalIntensity / data.length) * 10) / 10,
      triggersByCategory: categoryCounts,
    };
  }
}

export const triggersService = new TriggersService();
