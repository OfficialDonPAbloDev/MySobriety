import { supabase } from '../config/supabase';

/**
 * Test Supabase connection and basic operations
 * Run this to verify your backend is properly configured
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  results: {
    connection: boolean;
    authService: boolean;
    brandingConfig: boolean;
    emergencyResources: boolean;
  };
  errors: string[];
}> {
  const results = {
    connection: false,
    authService: false,
    brandingConfig: false,
    emergencyResources: false,
  };
  const errors: string[] = [];

  // Test 1: Basic connection - fetch branding config (public table)
  try {
    const { data, error } = await supabase
      .from('branding_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) {
      errors.push(`Branding config error: ${error.message}`);
    } else if (data) {
      results.connection = true;
      results.brandingConfig = true;
      const brandingData = data as Record<string, unknown>;
      console.log('✅ Connection successful - Branding config:', brandingData.app_name);
    }
  } catch (err) {
    errors.push(`Connection test failed: ${err}`);
  }

  // Test 2: Auth service availability
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      errors.push(`Auth service error: ${error.message}`);
    } else {
      results.authService = true;
      console.log('✅ Auth service available');
    }
  } catch (err) {
    errors.push(`Auth test failed: ${err}`);
  }

  // Test 3: Emergency resources (public read)
  try {
    const { data, error } = await supabase
      .from('emergency_resources')
      .select('name, phone_number, resource_type')
      .eq('is_active', true)
      .limit(5);

    if (error) {
      errors.push(`Emergency resources error: ${error.message}`);
    } else if (data && data.length > 0) {
      results.emergencyResources = true;
      console.log(`✅ Emergency resources available: ${data.length} resources found`);
    }
  } catch (err) {
    errors.push(`Emergency resources test failed: ${err}`);
  }

  const success = Object.values(results).every(Boolean);

  if (success) {
    console.log('\n🎉 All Supabase connection tests passed!');
  } else {
    console.log('\n⚠️ Some tests failed. Check errors:', errors);
  }

  return { success, results, errors };
}
