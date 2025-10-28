import { ImageSourcePropType } from 'react-native';

/**
 * Q&A pair for event details view
 */
export interface EventQAPair {
  question: string;
  answer: string;
}

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
  link?: string; // External link to event details
  sourceUrls?: string[]; // Source URLs from Perplexity
  tags?: string[]; // Event tags/categories
  venue?: string; // Venue name
  organizer?: string; // Event organizer
  websiteLink?: string; // Event website URL
  impactStatement?: string; // Why this event matters (for details view)
  qaPairs?: EventQAPair[]; // 3 Q&A pairs for details view
  imageUrl?: string; // Unsplash image URL (prioritized over local image)
}

/**
 * Saved event in user's collection
 */
export interface SavedEvent extends BaseEvent {
  address?: string;
  time?: string;
  aiOverview?: string;
  link?: string;
  sourceUrls?: string[];
  tags?: string[];
  venue?: string;
  organizer?: string;
  websiteLink?: string;
  impactStatement?: string;
  qaPairs?: EventQAPair[];
  imageUrl?: string; // Unsplash image URL (prioritized over local image)
  notificationId?: string; // Scheduled notification ID for this event
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
  organizer?: string;
  website_link?: string;
  impact_statement?: string;
  qa_pairs?: Array<{
    question: string;
    answer: string;
  }>;
  unsplash_image_keyword?: string; // Keyword for Unsplash image search
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
  imageUrl?: string; // Unsplash image URL
  address?: string;
  time?: string;
  aiOverview?: string;
  link?: string;
  sourceUrls?: string[];
  tags?: string[];
  venue?: string;
  organizer?: string;
  websiteLink?: string;
  impactStatement?: string;
  qaPairs?: EventQAPair[];
  notificationId?: string; // Scheduled notification ID for this event
}
