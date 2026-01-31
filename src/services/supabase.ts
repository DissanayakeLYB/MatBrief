/**
 * Supabase Client Configuration
 * 
 * This file initializes the Supabase client that we'll use throughout the app
 * for authentication, database queries, and real-time subscriptions.
 * 
 * TODO: Replace with your actual Supabase credentials from:
 * https://app.supabase.com → Your Project → Settings → API
 */

import { createClient } from '@supabase/supabase-js';

// These should be moved to environment variables in production
// For now, we use placeholders that you'll replace
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
