import { createClient } from '@supabase/supabase-js';
import type { Location, LocationInsert } from '../../lib/types/database';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables for testing');
}

/**
 * Create a Supabase client for testing
 */
export function createTestSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Create a Supabase client with service role key (bypasses RLS)
 * Note: This requires SUPABASE_SERVICE_ROLE_KEY to be set
 */
export function createTestSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
  }
  return createClient(SUPABASE_URL, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Clean up test data from the database
 */
export async function cleanupTestData() {
  const admin = createTestSupabaseAdminClient();
  
  // Delete all locations (in a real scenario, you might want to be more selective)
  // For now, we'll delete locations created during tests (you can add a test marker)
  await admin.from('locations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}

/**
 * Seed test locations
 */
export async function seedTestLocations(locations: LocationInsert[]): Promise<Location[]> {
  const admin = createTestSupabaseAdminClient();
  
  const { data, error } = await admin
    .from('locations')
    .insert(locations)
    .select();
  
  if (error) {
    throw new Error(`Failed to seed test locations: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Get all locations from the database
 */
export async function getAllTestLocations(): Promise<Location[]> {
  const client = createTestSupabaseClient();
  
  const { data, error } = await client
    .from('locations')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    throw new Error(`Failed to fetch locations: ${error.message}`);
  }
  
  return data || [];
}

/**
 * Delete a specific location by ID
 */
export async function deleteTestLocation(id: string): Promise<void> {
  const admin = createTestSupabaseAdminClient();
  
  const { error } = await admin
    .from('locations')
    .delete()
    .eq('id', id);
  
  if (error) {
    throw new Error(`Failed to delete location: ${error.message}`);
  }
}

/**
 * Create a test user and return auth token
 */
export async function createTestUser(email: string, password: string) {
  const client = createTestSupabaseClient();
  
  const { data, error } = await client.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }
  
  return data;
}

/**
 * Sign in a test user and return session
 */
export async function signInTestUser(email: string, password: string) {
  const client = createTestSupabaseClient();
  
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    throw new Error(`Failed to sign in test user: ${error.message}`);
  }
  
  return data;
}
