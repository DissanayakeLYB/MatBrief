/**
 * Article Service
 * 
 * Handles all article-related data operations with Supabase.
 * 
 * Design Decisions:
 * 1. Uses Result pattern (like auth service) for consistent error handling
 * 2. Returns typed Article objects
 * 3. Handles empty states gracefully (empty array, not error)
 * 4. Normalizes database errors to user-friendly messages
 */

import { supabase } from './supabase';
import { Article } from '../types';

/**
 * Result type for article operations.
 * Consistent with AuthResult pattern for uniform error handling across the app.
 */
export type ArticleResult<T> =
  | { data: T; error: null }
  | { data: null; error: ArticleError };

/**
 * Normalized error object for article operations.
 */
export interface ArticleError {
  /** Machine-readable error code for conditional logic */
  code: ArticleErrorCode;
  /** Human-readable message safe to show users */
  message: string;
}

/**
 * All possible article error codes.
 */
export type ArticleErrorCode =
  | 'not_found'
  | 'permission_denied'
  | 'network_error'
  | 'unknown_error';

/**
 * Maps Supabase/Postgres error messages to normalized error codes.
 */
function normalizeArticleError(error: { message: string; code?: string }): ArticleError {
  const msg = error.message.toLowerCase();
  const code = error.code?.toLowerCase() ?? '';

  // Permission/RLS errors
  if (
    msg.includes('permission denied') ||
    msg.includes('row-level security') ||
    code === '42501' ||
    code === 'pgrst301'
  ) {
    return {
      code: 'permission_denied',
      message: 'You do not have permission to view these articles.',
    };
  }

  // Not found
  if (msg.includes('not found') || code === 'pgrst116') {
    return {
      code: 'not_found',
      message: 'Article not found.',
    };
  }

  // Network errors
  if (
    msg.includes('network') ||
    msg.includes('fetch') ||
    msg.includes('connection') ||
    msg.includes('timeout')
  ) {
    return {
      code: 'network_error',
      message: 'Unable to load articles. Please check your internet connection.',
    };
  }

  // Fallback
  return {
    code: 'unknown_error',
    message: 'Unable to load articles. Please try again.',
  };
}

/**
 * Fetches all articles from the database.
 * 
 * @returns Array of articles sorted by createdAt (newest first), or an error
 * 
 * @example
 * const { data, error } = await fetchArticles();
 * if (error) {
 *   showToast(error.message);
 *   return;
 * }
 * // data is Article[] (may be empty)
 * setArticles(data);
 * 
 * @remarks
 * - Returns empty array if no articles exist (not an error)
 * - Sorted by createdAt descending (newest first)
 * - Requires authenticated user (enforced by RLS)
 */
export async function fetchArticles(): Promise<ArticleResult<Article[]>> {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, summary, tags, external_url, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return { data: null, error: normalizeArticleError(error) };
  }

  // Transform snake_case from database to camelCase for TypeScript
  // Supabase returns snake_case column names by default
  const articles: Article[] = (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    summary: row.summary,
    tags: row.tags ?? [],
    externalUrl: row.external_url,
    createdAt: row.created_at,
  }));

  return { data: articles, error: null };
}
