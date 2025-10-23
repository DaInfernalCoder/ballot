import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { ImageSourcePropType } from 'react-native';

export interface SavedEvent {
  id: string;
  title: string;
  location: string;
  date: string;
  image: ImageSourcePropType;
}

interface EventsState {
  savedEvents: SavedEvent[];
}

type EventsAction =
  | { type: 'ADD_SAVED_EVENT'; payload: SavedEvent }
  | { type: 'REMOVE_SAVED_EVENT'; payload: { id: string } };

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
    default:
      return state;
  }
}

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(eventsReducer, { savedEvents: [] });

  const value = useMemo<EventsContextValue>(() => ({
    savedEvents: state.savedEvents,
    addSavedEvent: (event: SavedEvent) => dispatch({ type: 'ADD_SAVED_EVENT', payload: event }),
    removeSavedEventById: (id: string) => dispatch({ type: 'REMOVE_SAVED_EVENT', payload: { id } }),
    hasSavedEvent: (id: string) => state.savedEvents.some((e) => e.id === id),
  }), [state.savedEvents]);

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents(): EventsContextValue {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used within EventsProvider');
  return ctx;
}


