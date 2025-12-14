// Environment configuration
// These values are read from environment variables or .env files

export const env = {
  // Supabase configuration
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },

  // App configuration
  app: {
    name: 'My Sobriety',
    version: '1.0.0',
    environment: process.env.EXPO_PUBLIC_APP_ENV || 'development',
  },

  // Feature flags
  features: {
    enableCommunity: process.env.EXPO_PUBLIC_ENABLE_COMMUNITY === 'true',
    enableAnalytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
  },
} as const;

// Validate required environment variables in development
export function validateEnv(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}
