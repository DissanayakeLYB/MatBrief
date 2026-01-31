/**
 * Services barrel export
 * 
 * This "barrel file" re-exports everything from the services folder.
 * It allows cleaner imports elsewhere:
 * 
 * Instead of: import { supabase } from '../services/supabase';
 * We can do:  import { supabase } from '../services';
 */

export { supabase } from './supabase';

export {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  type AuthResult,
  type AuthError,
  type AuthErrorCode,
} from './auth';

export {
  fetchArticles,
  type ArticleResult,
  type ArticleError,
  type ArticleErrorCode,
} from './articles';
