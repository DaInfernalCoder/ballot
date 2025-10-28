import Constants from 'expo-constants';

/**
 * Environment configuration
 *
 * In Expo, environment variables can be accessed via:
 * 1. expo-constants (from app.config.js extra field)
 * 2. process.env (during build time)
 *
 * This file provides a centralized way to access environment variables.
 */

interface EnvConfig {
  OPENROUTER_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  UNSPLASH_ACCESS_KEY: string;
}

/**
 * Get environment configuration
 *
 * Note: In development, environment variables from .env.local should be available.
 * If not, you may need to restart the dev server after adding/changing env vars.
 */
function getEnvConfig(): EnvConfig {
  // Try to get from expo-constants first (most reliable in Expo)
  const extra = Constants.expoConfig?.extra || {};

  const openRouterKey = extra.OPENROUTER_API_KEY ||
                       process.env.OPENROUTER_API_KEY ||
                       '';
  const supabaseUrl = extra.SUPABASE_URL ||
                     process.env.EXPO_PUBLIC_SUPABASE_URL ||
                     '';
  const supabaseKey = extra.SUPABASE_KEY ||
                     process.env.EXPO_PUBLIC_SUPABASE_KEY ||
                     '';
  const unsplashKey = extra.UNSPLASH_ACCESS_KEY ||
                     process.env.UNSPLASH_ACCESS_KEY ||
                     '';

  // Validate required variables
  if (!openRouterKey) {
    console.warn(
      '[ENV] OPENROUTER_API_KEY not found. ' +
      'Make sure .env.local exists and restart the dev server with: npm start --clear'
    );
  }

  if (!unsplashKey) {
    console.warn(
      '[ENV] UNSPLASH_ACCESS_KEY not found. ' +
      'Make sure .env.local exists and restart the dev server with: npm start --clear'
    );
  }

  return {
    OPENROUTER_API_KEY: openRouterKey,
    SUPABASE_URL: supabaseUrl,
    SUPABASE_KEY: supabaseKey,
    UNSPLASH_ACCESS_KEY: unsplashKey,
  };
}

// Export singleton instance
export const ENV = getEnvConfig();

// Helper to check if env is properly configured
export function isEnvConfigured(): boolean {
  return !!ENV.OPENROUTER_API_KEY;
}

// Helper to get a safe env var (returns empty string if not found)
export function getEnv(key: keyof EnvConfig): string {
  return ENV[key] || '';
}
