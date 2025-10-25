import { ImageSourcePropType } from 'react-native';

/**
 * Base event structure shared across the app
 */
export interface BaseEvent {
  id: string;
  title: string;
  location: string; // City, State format
  date: string; // Display format (e.g., "Dec 12, 2024 • 7:30 PM")
  image: ImageSourcePropType;
  imageKey: string; // For serialization
}

/**
 * Event discovered from AI generation (not yet saved)
 */
export interface DiscoveredEvent extends BaseEvent {
  address?: string; // Full street address
  time?: string; // Separate time field (e.g., "7:30 PM")
  aiOverview?: string; // AI-generated summary
}

/**
 * Saved event in user's collection
 */
export interface SavedEvent extends BaseEvent {
  address?: string;
  time?: string;
  aiOverview?: string;
}

/**
 * Raw event data from Perplexity API (before transformation)
 */
export interface PerplexityEventData {
  name: string;
  date: string; // ISO 8601 format (YYYY-MM-DD)
  time: {
    start: string; // ISO 8601 datetime with offset
    end?: string; // ISO 8601 datetime with offset (optional)
  };
  address: {
    venue: string;
    street: string;
    city: string;
    state: string;
    postal_code?: string;
    country?: string;
  };
  location?: {
    lat: number;
    lon: number;
  };
  ai_overview: string;
  link?: string;
  source_urls: string[];
  tags?: string[];
}

/**
 * Serialized event for AsyncStorage
 */
export interface SerializedEvent {
  id: string;
  title: string;
  location: string;
  date: string;
  imageKey: string;
  address?: string;
  time?: string;
  aiOverview?: string;
}
