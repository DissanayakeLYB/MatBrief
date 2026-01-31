/**
 * Supabase Client Configuration
 * 
 * This file creates a singleton Supabase client for the entire app.
 * 
 * Why a singleton?
 * - Supabase maintains internal state (auth tokens, realtime connections)
 * - Multiple instances would cause duplicate connections and auth issues
 * - One client = consistent state everywhere
 * 
 * Environment Variables (Expo SDK 49+):
 * - EXPO_PUBLIC_ prefix makes vars available in client code
 * - Values are embedded at BUILD time, not runtime
 * - Never commit .env to git — use .env.example as a template
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Read environment variables with validation.
 * 
 * Why validate here instead of just using them?
 * - Fail fast: Better to crash immediately with a clear message
 *   than to get cryptic "undefined" errors later
 * - Developer experience: New team members immediately know what's missing
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL environment variable.\n' +
    'Create a .env file with your Supabase URL.\n' +
    'Get it from: https://app.supabase.com → Your Project → Settings → API'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable.\n' +
    'Create a .env file with your Supabase anon key.\n' +
    'Get it from: https://app.supabase.com → Your Project → Settings → API'
  );
}

/**
 * The Supabase client instance.
 * 
 * Usage:
 * ```typescript
 * import { supabase } from '@/services';
 * 
 * // Auth
 * const { data, error } = await supabase.auth.signInWithPassword({
 *   email: 'user@example.com',
 *   password: 'password'
 * });
 * 
 * // Database
 * const { data: users } = await supabase.from('users').select('*');
 * 
 * // Realtime
 * supabase.channel('room1').on('broadcast', { event: 'message' }, callback);
 * ```
 * 
 * Type Safety:
 * For full type safety with your database schema, generate types:
 * ```bash
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
 * ```
 * Then use: createClient<Database>(...)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    /**
     * Persist auth state across app restarts.
     * Uses AsyncStorage on React Native (auto-detected by Supabase).
     */
    persistSession: true,
    
    /**
     * Automatically refresh tokens before they expire.
     * Prevents users from being logged out unexpectedly.
     */
    autoRefreshToken: true,
    
    /**
     * Detect session from URL (for OAuth redirects).
     * Set to false if you're not using OAuth providers.
     */
    detectSessionInUrl: false,
  },
});
