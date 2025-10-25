import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiscoveredEvent } from '@/types/event';

const CACHE_KEY_PREFIX = '@ballot:event-cache:';
const DEFAULT_TTL = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

/**
 * Cache entry structure
 */
interface CacheEntry {
  location: string;
  events: DiscoveredEvent[];
  timestamp: number;
  version: number; // For future migrations
}

/**
 * Normalize location string for consistent cache keys
 */
function normalizeLocation(location: string): string {
  return location
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Get cache key for a location
 */
function getCacheKey(location: string): string {
  return `${CACHE_KEY_PREFIX}${normalizeLocation(location)}`;
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(entry: CacheEntry, ttl: number = DEFAULT_TTL): boolean {
  const now = Date.now();
  const age = now - entry.timestamp;
  return age < ttl;
}

/**
 * Save events to cache
 */
export async function cacheEvents(
  location: string,
  events: DiscoveredEvent[]
): Promise<void> {
  try {
    const cacheKey = getCacheKey(location);
    const cacheEntry: CacheEntry = {
      location,
      events,
      timestamp: Date.now(),
      version: 1,
    };

    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    console.log(`[EventCache] Cached ${events.length} events for ${location}`);
  } catch (error) {
    console.error('[EventCache] Failed to cache events:', error);
    // Don't throw - caching is optional
  }
}

/**
 * Load events from cache
 */
export async function loadCachedEvents(
  location: string,
  ttl: number = DEFAULT_TTL
): Promise<{ events: DiscoveredEvent[]; cacheHit: boolean; age?: number } | null> {
  try {
    const cacheKey = getCacheKey(location);
    const cached = await AsyncStorage.getItem(cacheKey);

    if (!cached) {
      console.log(`[EventCache] No cache found for ${location}`);
      return null;
    }

    const entry: CacheEntry = JSON.parse(cached);

    // Validate cache structure
    if (!entry.events || !Array.isArray(entry.events) || !entry.timestamp) {
      console.warn('[EventCache] Invalid cache structure, clearing...');
      await clearCacheForLocation(location);
      return null;
    }

    const age = Date.now() - entry.timestamp;
    const isValid = isCacheValid(entry, ttl);

    if (!isValid) {
      console.log(`[EventCache] Cache expired for ${location} (age: ${Math.round(age / 1000 / 60)}min)`);
      return null;
    }

    console.log(`[EventCache] Cache hit for ${location} (age: ${Math.round(age / 1000 / 60)}min, ${entry.events.length} events)`);

    return {
      events: entry.events,
      cacheHit: true,
      age,
    };
  } catch (error) {
    console.error('[EventCache] Failed to load cached events:', error);
    return null;
  }
}

/**
 * Clear cache for a specific location
 */
export async function clearCacheForLocation(location: string): Promise<void> {
  try {
    const cacheKey = getCacheKey(location);
    await AsyncStorage.removeItem(cacheKey);
    console.log(`[EventCache] Cleared cache for ${location}`);
  } catch (error) {
    console.error('[EventCache] Failed to clear cache:', error);
  }
}

/**
 * Clear all event caches
 */
export async function clearAllEventCaches(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_KEY_PREFIX));

    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`[EventCache] Cleared ${cacheKeys.length} cache entries`);
    }
  } catch (error) {
    console.error('[EventCache] Failed to clear all caches:', error);
  }
}

/**
 * Get cache info for a location (without loading events)
 */
export async function getCacheInfo(location: string): Promise<{
  exists: boolean;
  age?: number;
  isValid?: boolean;
  eventCount?: number;
} | null> {
  try {
    const cacheKey = getCacheKey(location);
    const cached = await AsyncStorage.getItem(cacheKey);

    if (!cached) {
      return { exists: false };
    }

    const entry: CacheEntry = JSON.parse(cached);
    const age = Date.now() - entry.timestamp;
    const isValid = isCacheValid(entry);

    return {
      exists: true,
      age,
      isValid,
      eventCount: entry.events?.length || 0,
    };
  } catch (error) {
    console.error('[EventCache] Failed to get cache info:', error);
    return null;
  }
}

/**
 * Format cache age for display (e.g., "2h ago", "30min ago")
 */
export function formatCacheAge(ageMs: number): string {
  const minutes = Math.floor(ageMs / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}min ago`;
  } else {
    return 'Just now';
  }
}
