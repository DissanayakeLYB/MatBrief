/**
 * Environment Variable Type Declarations
 * 
 * This file tells TypeScript about our environment variables.
 * 
 * Why is this needed?
 * process.env values are typed as `string | undefined` by default.
 * This declaration provides proper typing and IDE autocomplete.
 * 
 * Note: Expo SDK 49+ uses EXPO_PUBLIC_ prefix for client-accessible env vars.
 * These are embedded at build time, NOT runtime — so they're safe to use
 * but changes require a rebuild.
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /**
       * Your Supabase project URL
       * @example "https://abc123xyz.supabase.co"
       */
      EXPO_PUBLIC_SUPABASE_URL: string;
      
      /**
       * Your Supabase anonymous/public key
       * This key is safe to expose in client code — it only allows
       * operations permitted by your Row Level Security policies.
       */
      EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
    }
  }
}

// This export makes this file a module (required for global augmentation)
export {};
