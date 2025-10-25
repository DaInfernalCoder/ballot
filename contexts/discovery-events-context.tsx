import { DiscoveredEvent } from '@/types/event';
import { cacheEvents, clearCacheForLocation, formatCacheAge, loadCachedEvents } from '@/utils/event-cache';
import { generateEventsForLocation, getFallbackEvents } from '@/utils/event-generation';
import { OpenRouterError } from '@/utils/perplexity-api';
import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';

interface DiscoveryEventsState {
  discoveredEvents: DiscoveredEvent[];
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number | null;
  cacheHit: boolean;
  cacheAge: number | null;
  currentLocation: string | null;
}

type DiscoveryEventsAction =
  | { type: 'FETCH_START'; payload: { location: string } }
  | { type: 'FETCH_SUCCESS'; payload: { events: DiscoveredEvent[]; cacheHit: boolean; cacheAge?: number } }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'CLEAR_EVENTS' }
  | { type: 'SET_FALLBACK_EVENTS' };

interface DiscoveryEventsContextValue extends DiscoveryEventsState {
  fetchEvents: (location: string, forceRefresh?: boolean) => Promise<void>;
  refreshEvents: (location: string) => Promise<void>;
  clearEvents: () => void;
  getCacheAgeDisplay: () => string | null;
}

const DiscoveryEventsContext = createContext<DiscoveryEventsContextValue | undefined>(undefined);

function discoveryEventsReducer(
  state: DiscoveryEventsState,
  action: DiscoveryEventsAction
): DiscoveryEventsState {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
        currentLocation: action.payload.location,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        discoveredEvents: action.payload.events,
        isLoading: false,
        error: null,
        lastFetchTime: Date.now(),
        cacheHit: action.payload.cacheHit,
        cacheAge: action.payload.cacheAge || null,
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'CLEAR_EVENTS':
      return {
        ...state,
        discoveredEvents: [],
        error: null,
        lastFetchTime: null,
        cacheHit: false,
        cacheAge: null,
        currentLocation: null,
      };
    case 'SET_FALLBACK_EVENTS':
      return {
        ...state,
        discoveredEvents: getFallbackEvents(),
        isLoading: false,
        error: 'Using fallback events',
        cacheHit: false,
      };
    default:
      return state;
  }
}

export function DiscoveryEventsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(discoveryEventsReducer, {
    discoveredEvents: [],
    isLoading: false,
    error: null,
    lastFetchTime: null,
    cacheHit: false,
    cacheAge: null,
    currentLocation: null,
  });

  /**
   * Fetch events for a location (with caching)
   */
  const fetchEvents = useCallback(async (location: string, forceRefresh: boolean = false) => {
    if (!location || !location.trim()) {
      console.log('[DiscoveryEvents] No location provided, skipping fetch');
      return;
    }

    const normalizedLocation = location.trim();

    // Don't re-fetch if already loading the same location
    if (state.isLoading && state.currentLocation === normalizedLocation && !forceRefresh) {
      console.log('[DiscoveryEvents] Already loading events for this location');
      return;
    }

    dispatch({ type: 'FETCH_START', payload: { location: normalizedLocation } });

    try {
      // Try to load from cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = await loadCachedEvents(normalizedLocation);
        if (cached && cached.events.length > 0) {
          console.log('[DiscoveryEvents] Using cached events');
          dispatch({
            type: 'FETCH_SUCCESS',
            payload: {
              events: cached.events,
              cacheHit: true,
              cacheAge: cached.age,
            },
          });
          return;
        }
      } else {
        console.log('[DiscoveryEvents] Force refresh - clearing cache');
        await clearCacheForLocation(normalizedLocation);
      }

      // Generate new events
      console.log('[DiscoveryEvents] Generating new events...');
      const events = await generateEventsForLocation(normalizedLocation);

      if (events.length === 0) {
        console.warn('[DiscoveryEvents] No events generated, using fallback');
        dispatch({ type: 'SET_FALLBACK_EVENTS' });
        return;
      }

      // Cache the results
      await cacheEvents(normalizedLocation, events);

      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          events,
          cacheHit: false,
        },
      });

    } catch (error: unknown) {
      console.error('[DiscoveryEvents] Failed to fetch events:', error);

      let errorMessage = 'Failed to load events';

      if (error instanceof OpenRouterError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });

      // Use fallback events on error
      dispatch({ type: 'SET_FALLBACK_EVENTS' });
    }
  }, [state.isLoading, state.currentLocation]);

  /**
   * Refresh events (bypass cache)
   */
  const refreshEvents = useCallback(async (location: string) => {
    console.log('[DiscoveryEvents] Refreshing events...');
    await fetchEvents(location, true);
  }, [fetchEvents]);

  /**
   * Clear all events
   */
  const clearEvents = useCallback(() => {
    dispatch({ type: 'CLEAR_EVENTS' });
  }, []);

  /**
   * Get formatted cache age for display
   */
  const getCacheAgeDisplay = useCallback((): string | null => {
    if (!state.cacheHit || !state.cacheAge) {
      return null;
    }
    return formatCacheAge(state.cacheAge);
  }, [state.cacheHit, state.cacheAge]);

  const value = useMemo<DiscoveryEventsContextValue>(
    () => ({
      discoveredEvents: state.discoveredEvents,
      isLoading: state.isLoading,
      error: state.error,
      lastFetchTime: state.lastFetchTime,
      cacheHit: state.cacheHit,
      cacheAge: state.cacheAge,
      currentLocation: state.currentLocation,
      fetchEvents,
      refreshEvents,
      clearEvents,
      getCacheAgeDisplay,
    }),
    [state, fetchEvents, refreshEvents, clearEvents, getCacheAgeDisplay]
  );

  return (
    <DiscoveryEventsContext.Provider value={value}>
      {children}
    </DiscoveryEventsContext.Provider>
  );
}

export function useDiscoveryEvents(): DiscoveryEventsContextValue {
  const ctx = useContext(DiscoveryEventsContext);
  if (!ctx) {
    throw new Error('useDiscoveryEvents must be used within DiscoveryEventsProvider');
  }
  return ctx;
}
