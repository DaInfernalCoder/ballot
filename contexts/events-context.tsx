import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { ImageSourcePropType } from 'react-native';
import { getImageFromKey, getKeyFromImage } from '@/utils/image-mapping';
import { loadSavedEvents, saveSavedEvents, SerializedEvent } from '@/utils/storage';

export interface SavedEvent {
  id: string;
  title: string;
  location: string;
  date: string;
  image: ImageSourcePropType;
  imageKey: string; // For serialization
}

interface EventsState {
  savedEvents: SavedEvent[];
  isLoading: boolean;
}

type EventsAction =
  | { type: 'ADD_SAVED_EVENT'; payload: SavedEvent }
  | { type: 'REMOVE_SAVED_EVENT'; payload: { id: string } }
  | { type: 'HYDRATE_EVENTS'; payload: SavedEvent[] }
  | { type: 'SET_LOADING'; payload: boolean };

interface EventsContextValue extends EventsState {
  addSavedEvent: (event: SavedEvent) => void;
  removeSavedEventById: (id: string) => void;
  hasSavedEvent: (id: string) => boolean;
}

const EventsContext = createContext<EventsContextValue | undefined>(undefined);

function eventsReducer(state: EventsState, action: EventsAction): EventsState {
  switch (action.type) {
    case 'ADD_SAVED_EVENT': {
      const exists = state.savedEvents.some((e) => e.id === action.payload.id);
      if (exists) return state;
      return { ...state, savedEvents: [action.payload, ...state.savedEvents] };
    }
    case 'REMOVE_SAVED_EVENT': {
      return {
        ...state,
        savedEvents: state.savedEvents.filter((e) => e.id !== action.payload.id),
      };
    }
    case 'HYDRATE_EVENTS': {
      return {
        ...state,
        savedEvents: action.payload,
        isLoading: false,
      };
    }
    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload,
      };
    }
    default:
      return state;
  }
}

/**
 * Convert SavedEvent to SerializedEvent for AsyncStorage
 */
function serializeEvent(event: SavedEvent): SerializedEvent {
  return {
    id: event.id,
    title: event.title,
    location: event.location,
    date: event.date,
    imageKey: event.imageKey,
  };
}

/**
 * Convert SerializedEvent to SavedEvent (restore image from key)
 */
function deserializeEvent(serialized: SerializedEvent): SavedEvent {
  return {
    ...serialized,
    image: getImageFromKey(serialized.imageKey),
  };
}

/**
 * Persist events to AsyncStorage
 */
async function persistEvents(events: SavedEvent[]): Promise<void> {
  try {
    const serialized = events.map(serializeEvent);
    await saveSavedEvents(serialized);
  } catch (error) {
    console.error('[EventsContext] Failed to persist events:', error);
  }
}

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(eventsReducer, {
    savedEvents: [],
    isLoading: true,
  });

  // Load events from AsyncStorage on mount
  useEffect(() => {
    async function hydrateEvents() {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const serializedEvents = await loadSavedEvents();
        const events = serializedEvents.map(deserializeEvent);
        dispatch({ type: 'HYDRATE_EVENTS', payload: events });
      } catch (error) {
        console.error('[EventsContext] Failed to hydrate events:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }

    hydrateEvents();
  }, []);

  const value = useMemo<EventsContextValue>(() => ({
    savedEvents: state.savedEvents,
    isLoading: state.isLoading,
    addSavedEvent: (event: SavedEvent) => {
      dispatch({ type: 'ADD_SAVED_EVENT', payload: event });
      // Persist after state update
      setTimeout(() => {
        persistEvents([event, ...state.savedEvents.filter(e => e.id !== event.id)]);
      }, 0);
    },
    removeSavedEventById: (id: string) => {
      dispatch({ type: 'REMOVE_SAVED_EVENT', payload: { id } });
      // Persist after state update
      setTimeout(() => {
        persistEvents(state.savedEvents.filter(e => e.id !== id));
      }, 0);
    },
    hasSavedEvent: (id: string) => state.savedEvents.some((e) => e.id === id),
  }), [state.savedEvents, state.isLoading]);

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents(): EventsContextValue {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used within EventsProvider');
  return ctx;
}


