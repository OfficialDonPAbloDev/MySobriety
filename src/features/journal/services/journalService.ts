import { supabase } from '../../../config/supabase';

export interface JournalEntry {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  mood_rating: number | null;
  tags: string[];
  is_favorite: boolean;
  entry_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateJournalEntryInput {
  title?: string;
  content: string;
  mood_rating?: number;
  tags?: string[];
  entry_date?: Date;
}

export interface UpdateJournalEntryInput {
  title?: string;
  content?: string;
  mood_rating?: number;
  tags?: string[];
  is_favorite?: boolean;
}

export const JOURNAL_TAGS = [
  'gratitude',
  'reflection',
  'challenges',
  'progress',
  'goals',
  'triggers',
  'coping',
  'relationships',
  'health',
  'work',
  'therapy',
  'meetings',
  'milestones',
  'feelings',
  'insights',
];

export const JOURNAL_PROMPTS = [
  "What are three things you're grateful for today?",
  "How did you handle a challenging moment today?",
  "What's one thing you did today that you're proud of?",
  "Describe a moment when you felt strong in your recovery.",
  "What did you learn about yourself this week?",
  "Who supported you today, and how did it feel?",
  "What triggers did you notice today? How did you cope?",
  "Write about a goal you're working toward.",
  "What would you tell your past self about recovery?",
  "Describe how your life has changed since getting sober.",
  "What's something you're looking forward to?",
  "How are you taking care of yourself today?",
  "Write about a relationship that has improved in recovery.",
  "What does sobriety mean to you today?",
  "Describe a moment of peace you experienced recently.",
];

class JournalService {
  /**
   * Create a new journal entry
   */
  async createEntry(input: CreateJournalEntryInput): Promise<JournalEntry> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const entryDate = input.entry_date
      ? input.entry_date.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        title: input.title || null,
        content: input.content,
        mood_rating: input.mood_rating || null,
        tags: input.tags || [],
        entry_date: entryDate,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating journal entry:', error);
      throw error;
    }

    return data as JournalEntry;
  }

  /**
   * Update an existing journal entry
   */
  async updateEntry(id: string, input: UpdateJournalEntryInput): Promise<JournalEntry> {
    const { data, error } = await supabase
      .from('journal_entries')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating journal entry:', error);
      throw error;
    }

    return data as JournalEntry;
  }

  /**
   * Delete a journal entry
   */
  async deleteEntry(id: string): Promise<void> {
    const { error } = await supabase.from('journal_entries').delete().eq('id', id);

    if (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }
  }

  /**
   * Get a single journal entry
   */
  async getEntry(id: string): Promise<JournalEntry | null> {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching journal entry:', error);
      throw error;
    }

    return data as JournalEntry | null;
  }

  /**
   * Get all journal entries for the user
   */
  async getEntries(options?: {
    limit?: number;
    offset?: number;
    tag?: string;
    startDate?: Date;
    endDate?: Date;
    favoritesOnly?: boolean;
  }): Promise<JournalEntry[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false });

    if (options?.tag) {
      query = query.contains('tags', [options.tag]);
    }

    if (options?.startDate) {
      query = query.gte('entry_date', options.startDate.toISOString().split('T')[0]);
    }

    if (options?.endDate) {
      query = query.lte('entry_date', options.endDate.toISOString().split('T')[0]);
    }

    if (options?.favoritesOnly) {
      query = query.eq('is_favorite', true);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching journal entries:', error);
      throw error;
    }

    return (data as JournalEntry[]) || [];
  }

  /**
   * Search journal entries by keyword
   */
  async searchEntries(keyword: string): Promise<JournalEntry[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`)
      .order('entry_date', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error searching journal entries:', error);
      throw error;
    }

    return (data as JournalEntry[]) || [];
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    const { error } = await supabase
      .from('journal_entries')
      .update({ is_favorite: isFavorite })
      .eq('id', id);

    if (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  /**
   * Get entries for a specific month (for calendar view)
   */
  async getEntriesByMonth(year: number, month: number): Promise<JournalEntry[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('entry_date', startDate.toISOString().split('T')[0])
      .lte('entry_date', endDate.toISOString().split('T')[0])
      .order('entry_date', { ascending: false });

    if (error) {
      console.error('Error fetching monthly entries:', error);
      throw error;
    }

    return (data as JournalEntry[]) || [];
  }

  /**
   * Get a random journal prompt
   */
  getRandomPrompt(): string {
    return JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
  }

  /**
   * Get entry count stats
   */
  async getStats(): Promise<{ totalEntries: number; thisMonth: number; streak: number }> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { totalEntries: 0, thisMonth: 0, streak: 0 };

    // Get total count
    const { count: totalEntries } = await supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Get this month count
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const { count: thisMonth } = await supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('entry_date', startOfMonth.toISOString().split('T')[0]);

    // Calculate streak (consecutive days with entries)
    const { data: recentEntries } = await supabase
      .from('journal_entries')
      .select('entry_date')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(365);

    let streak = 0;
    if (recentEntries && recentEntries.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const entryDates = new Set(recentEntries.map((e) => e.entry_date));

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];

        if (entryDates.has(dateStr)) {
          streak++;
        } else if (i > 0) {
          // Allow missing today, but break on other gaps
          break;
        }
      }
    }

    return {
      totalEntries: totalEntries || 0,
      thisMonth: thisMonth || 0,
      streak,
    };
  }
}

export const journalService = new JournalService();
