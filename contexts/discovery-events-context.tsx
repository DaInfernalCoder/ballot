import { DiscoveredEvent } from '@/types/event';
import { generateEventsForLocation } from '@/utils/event-generation';
import { OpenRouterError } from '@/utils/perplexity-api';
import React, { createContext, useCallback, useContext, useMemo, useReducer } from 'react';

interface DiscoveryEventsState {
  discoveredEvents: DiscoveredEvent[];
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number | null;
  lastSearchStartTime: number | null;
  currentLocation: string | null;
}

type DiscoveryEventsAction =
  | { type: 'FETCH_START'; payload: { location: string } }
  | { type: 'FETCH_SUCCESS'; payload: { events: DiscoveredEvent[] } }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'CLEAR_EVENTS' };

interface DiscoveryEventsContextValue extends DiscoveryEventsState {
  fetchEvents: (location: string) => Promise<void>;
  refreshEvents: (location: string) => Promise<void>;
  clearEvents: () => void;
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
        lastSearchStartTime: Date.now(),
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        discoveredEvents: action.payload.events,
        isLoading: false,
        error: null,
        lastFetchTime: Date.now(),
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
        currentLocation: null,
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
    lastSearchStartTime: null,
    currentLocation: null,
  });

  /**
   * Fetch events for a location (no caching)
   */
  const fetchEvents = useCallback(async (location: string) => {
    if (!location || !location.trim()) {
      console.log('[DiscoveryEvents] No location provided, skipping fetch');
      return;
    }

    const normalizedLocation = location.trim();

    dispatch({ type: 'FETCH_START', payload: { location: normalizedLocation } });

    try {
      // Generate events directly from API
      console.log('[DiscoveryEvents] Fetching events from API...');
      const events = await generateEventsForLocation(normalizedLocation);

      dispatch({
        type: 'FETCH_SUCCESS',
        payload: { events },
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
    }
  }, []);

  /**
   * Refresh events
   */
  const refreshEvents = useCallback(async (location: string) => {
    console.log('[DiscoveryEvents] Refreshing events...');
    await fetchEvents(location);
  }, [fetchEvents]);

  /**
   * Clear all events
   */
  const clearEvents = useCallback(() => {
    dispatch({ type: 'CLEAR_EVENTS' });
  }, []);

  const value = useMemo<DiscoveryEventsContextValue>(
    () => ({
      discoveredEvents: state.discoveredEvents,
      isLoading: state.isLoading,
      error: state.error,
      lastFetchTime: state.lastFetchTime,
      lastSearchStartTime: state.lastSearchStartTime,
      currentLocation: state.currentLocation,
      fetchEvents,
      refreshEvents,
      clearEvents,
    }),
    [state, fetchEvents, refreshEvents, clearEvents]
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
