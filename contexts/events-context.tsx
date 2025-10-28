import { SavedEvent } from '@/types/event';
import { getImageFromKey } from '@/utils/image-mapping';
import { loadSavedEvents, saveSavedEvents, SerializedEvent } from '@/utils/storage';
import { cancelNotification, scheduleEventNotification } from '@/utils/notifications';
import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

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
  addSavedEvent: (event: SavedEvent) => Promise<void>;
  removeSavedEventById: (id: string) => Promise<void>;
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
    imageUrl: event.imageUrl,
    address: event.address,
    time: event.time,
    aiOverview: event.aiOverview,
    link: event.link,
    sourceUrls: event.sourceUrls,
    tags: event.tags,
    venue: event.venue,
    organizer: event.organizer,
    websiteLink: event.websiteLink,
    impactStatement: event.impactStatement,
    qaPairs: event.qaPairs,
    notificationId: event.notificationId,
  };
}

/**
 * Convert SerializedEvent to SavedEvent (restore image from key)
 */
function deserializeEvent(serialized: SerializedEvent): SavedEvent {
  return {
    ...serialized,
    image: getImageFromKey(serialized.imageKey),
    imageUrl: serialized.imageUrl,
    address: serialized.address,
    time: serialized.time,
    aiOverview: serialized.aiOverview,
    link: serialized.link,
    sourceUrls: serialized.sourceUrls,
    tags: serialized.tags,
    venue: serialized.venue,
    organizer: serialized.organizer,
    websiteLink: serialized.websiteLink,
    impactStatement: serialized.impactStatement,
    qaPairs: serialized.qaPairs,
    notificationId: serialized.notificationId,
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
    addSavedEvent: async (event: SavedEvent) => {
      // Schedule notification for this event
      const notificationId = await scheduleEventNotification(event);

      // Add notification ID to event if scheduled
      const eventWithNotification: SavedEvent = {
        ...event,
        notificationId: notificationId || undefined,
      };

      dispatch({ type: 'ADD_SAVED_EVENT', payload: eventWithNotification });

      // Persist after state update
      setTimeout(() => {
        persistEvents([eventWithNotification, ...state.savedEvents.filter(e => e.id !== event.id)]);
      }, 0);
    },
    removeSavedEventById: async (id: string) => {
      // Find the event to get its notification ID
      const event = state.savedEvents.find(e => e.id === id);

      // Cancel notification if it exists
      if (event?.notificationId) {
        await cancelNotification(event.notificationId);
      }

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


