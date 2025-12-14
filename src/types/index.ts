// Re-export all types from this index file
export * from './navigation';

// Common types used across the app

export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SobrietyRecord {
  id: string;
  userId: string;
  substanceType: 'alcohol' | 'drugs' | 'gambling' | 'custom';
  customLabel?: string;
  startDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  id: string;
  userId: string;
  checkInDate: string;
  checkInTime: string;
  moodRating: number; // 1-10
  energyLevel: number; // 1-10
  cravingLevel: number; // 0-10
  notes?: string;
  isSober: boolean;
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  description?: string;
  type: 'hotline' | 'personal' | 'treatment_center' | 'support_group';
  available?: string;
  isNational: boolean;
}

export interface Milestone {
  id: string;
  type: string;
  label: string;
  days: number;
  achieved: boolean;
  achievedAt?: string;
}
