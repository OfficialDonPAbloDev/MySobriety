import { supabase } from '../../../config/supabase';

export interface SobrietyRecord {
  id: string;
  user_id: string;
  start_date: string;
  substance_type: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSobrietyRecordInput {
  start_date: Date;
  substance_type?: string;
  notes?: string;
}

export interface MilestoneRecord {
  id: string;
  user_id: string;
  sobriety_record_id: string;
  milestone_type: string;
  milestone_name: string;
  days_achieved: number;
  achieved_at: string;
  celebrated: boolean;
  created_at: string;
}

class SobrietyService {
  /**
   * Get the active sobriety record for the current user
   */
  async getActiveSobrietyRecord(): Promise<SobrietyRecord | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('sobriety_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found
      console.error('Error fetching sobriety record:', error);
      throw error;
    }

    return data as SobrietyRecord | null;
  }

  /**
   * Create a new sobriety record
   */
  async createSobrietyRecord(input: CreateSobrietyRecordInput): Promise<SobrietyRecord> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Deactivate any existing active records
    await supabase
      .from('sobriety_records')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('is_active', true);

    // Create new record
    const { data, error } = await supabase
      .from('sobriety_records')
      .insert({
        user_id: user.id,
        start_date: input.start_date.toISOString(),
        substance_type: input.substance_type || 'general',
        notes: input.notes,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating sobriety record:', error);
      throw error;
    }

    return data as SobrietyRecord;
  }

  /**
   * Update an existing sobriety record
   */
  async updateSobrietyRecord(
    id: string,
    updates: Partial<Pick<SobrietyRecord, 'start_date' | 'substance_type' | 'notes'>>
  ): Promise<SobrietyRecord> {
    const { data, error } = await supabase
      .from('sobriety_records')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating sobriety record:', error);
      throw error;
    }

    return data as SobrietyRecord;
  }

  /**
   * Reset sobriety (create a new record with today's date)
   */
  async resetSobriety(notes?: string): Promise<SobrietyRecord> {
    return this.createSobrietyRecord({
      start_date: new Date(),
      notes: notes || 'Reset sobriety counter',
    });
  }

  /**
   * Get all sobriety records for the user (history)
   */
  async getSobrietyHistory(): Promise<SobrietyRecord[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('sobriety_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sobriety history:', error);
      throw error;
    }

    return (data as SobrietyRecord[]) || [];
  }

  /**
   * Record a milestone achievement
   */
  async recordMilestone(
    sobrietyRecordId: string,
    milestoneType: string,
    milestoneName: string,
    daysAchieved: number
  ): Promise<MilestoneRecord> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if milestone already exists
    const { data: existing } = await supabase
      .from('milestones')
      .select('id')
      .eq('sobriety_record_id', sobrietyRecordId)
      .eq('milestone_type', milestoneType)
      .single();

    if (existing) {
      // Return existing milestone
      const { data } = await supabase
        .from('milestones')
        .select('*')
        .eq('id', existing.id)
        .single();
      return data as MilestoneRecord;
    }

    // Create new milestone record
    const { data, error } = await supabase
      .from('milestones')
      .insert({
        user_id: user.id,
        sobriety_record_id: sobrietyRecordId,
        milestone_type: milestoneType,
        milestone_name: milestoneName,
        days_achieved: daysAchieved,
        achieved_at: new Date().toISOString(),
        celebrated: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording milestone:', error);
      throw error;
    }

    return data as MilestoneRecord;
  }

  /**
   * Get milestones for a sobriety record
   */
  async getMilestones(sobrietyRecordId: string): Promise<MilestoneRecord[]> {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('sobriety_record_id', sobrietyRecordId)
      .order('days_achieved', { ascending: true });

    if (error) {
      console.error('Error fetching milestones:', error);
      throw error;
    }

    return (data as MilestoneRecord[]) || [];
  }

  /**
   * Mark a milestone as celebrated
   */
  async celebrateMilestone(milestoneId: string): Promise<void> {
    const { error } = await supabase
      .from('milestones')
      .update({ celebrated: true })
      .eq('id', milestoneId);

    if (error) {
      console.error('Error celebrating milestone:', error);
      throw error;
    }
  }
}

export const sobrietyService = new SobrietyService();
