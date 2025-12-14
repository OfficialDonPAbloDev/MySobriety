import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Environment variables for Supabase configuration
// These should be set in your .env file or app.config.js
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase configuration missing. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// Create Supabase client with type safety
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use a custom storage implementation for React Native
    // This will be configured with SecureStore for production
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Disable for React Native
  },
});

// Export types for convenience
export type { Database };
