import { supabase } from '../../../config/supabase';

export type MoodRating = 1 | 2 | 3 | 4 | 5;

export interface CheckIn {
  id: string;
  user_id: string;
  check_in_date: string;
  mood_rating: MoodRating;
  craving_level: number; // 0-10
  notes?: string;
  triggers?: string[];
  coping_strategies_used?: string[];
  is_sober: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCheckInInput {
  mood_rating: MoodRating;
  craving_level: number;
  notes?: string;
  triggers?: string[];
  coping_strategies_used?: string[];
  is_sober?: boolean;
}

export const MOOD_OPTIONS = [
  { value: 1 as MoodRating, label: 'Struggling', emoji: '😢', color: '#EF4444' },
  { value: 2 as MoodRating, label: 'Difficult', emoji: '😔', color: '#F97316' },
  { value: 3 as MoodRating, label: 'Okay', emoji: '😐', color: '#EAB308' },
  { value: 4 as MoodRating, label: 'Good', emoji: '🙂', color: '#22C55E' },
  { value: 5 as MoodRating, label: 'Great', emoji: '😊', color: '#10B981' },
];

export const COMMON_TRIGGERS = [
  'Stress',
  'Boredom',
  'Social situations',
  'Loneliness',
  'Anxiety',
  'Depression',
  'Celebration',
  'Peer pressure',
  'Financial problems',
  'Relationship issues',
  'Work problems',
  'Physical pain',
  'Insomnia',
  'Hunger',
  'Fatigue',
];

export const COPING_STRATEGIES = [
  'Called a friend/sponsor',
  'Attended a meeting',
  'Exercise/physical activity',
  'Meditation/breathing',
  'Journaling',
  'Distraction activity',
  'Prayer/spiritual practice',
  'Read recovery literature',
  'Ate a healthy meal',
  'Got enough sleep',
  'Talked to therapist',
  'Used grounding techniques',
  'Took a walk',
  'Listened to music',
  'Practiced gratitude',
];

class CheckInService {
  /**
   * Create a new check-in
   */
  async createCheckIn(input: CreateCheckInInput): Promise<CheckIn> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const today = new Date().toISOString().split('T')[0];

    // Check if already checked in today
    const { data: existing } = await supabase
      .from('check_ins')
      .select('id')
      .eq('user_id', user.id)
      .eq('check_in_date', today)
      .single();

    if (existing) {
      // Update existing check-in
      return this.updateCheckIn(existing.id, input);
    }

    // Create new check-in
    const { data, error } = await supabase
      .from('check_ins')
      .insert({
        user_id: user.id,
        check_in_date: today,
        mood_rating: input.mood_rating,
        craving_level: input.craving_level,
        notes: input.notes,
        triggers: input.triggers,
        coping_strategies_used: input.coping_strategies_used,
        is_sober: input.is_sober ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating check-in:', error);
      throw error;
    }

    return data as CheckIn;
  }

  /**
   * Update an existing check-in
   */
  async updateCheckIn(id: string, input: Partial<CreateCheckInInput>): Promise<CheckIn> {
    const { data, error } = await supabase
      .from('check_ins')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating check-in:', error);
      throw error;
    }

    return data as CheckIn;
  }

  /**
   * Get today's check-in
   */
  async getTodayCheckIn(): Promise<CheckIn | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id)
      .eq('check_in_date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching today check-in:', error);
      throw error;
    }

    return data as CheckIn | null;
  }

  /**
   * Get check-in history
   */
  async getCheckInHistory(limit: number = 30): Promise<CheckIn[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id)
      .order('check_in_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching check-in history:', error);
      throw error;
    }

    return (data as CheckIn[]) || [];
  }

  /**
   * Get check-in streak (consecutive days)
   */
  async getCheckInStreak(): Promise<number> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data, error } = await supabase
      .from('check_ins')
      .select('check_in_date')
      .eq('user_id', user.id)
      .order('check_in_date', { ascending: false })
      .limit(365);

    if (error || !data) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < data.length; i++) {
      const checkInDate = new Date(data[i].check_in_date);
      checkInDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (checkInDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Get average mood for a period
   */
  async getAverageMood(days: number = 7): Promise<number> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return 0;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('check_ins')
      .select('mood_rating')
      .eq('user_id', user.id)
      .gte('check_in_date', startDate.toISOString().split('T')[0]);

    if (error || !data || data.length === 0) return 0;

    const sum = data.reduce((acc, item) => acc + item.mood_rating, 0);
    return Math.round((sum / data.length) * 10) / 10;
  }
}

export const checkInService = new CheckInService();
