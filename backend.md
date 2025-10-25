# Backend MVP Implementation Checklist

## Overview & Goal
Transform the static MVP into a dynamic, location-aware civic event discovery platform with AI-generated content, persistent storage, and push notifications.

## Phase 1: Core Backend Infrastructure

### 1. Local Storage Persistence ✅
- [x] Install and configure AsyncStorage for saved events persistence
- [x] Update EventsContext to load/save events from AsyncStorage on app start
- [x] Add loading states while hydrating saved events from storage
- [x] Implement data migration for future app updates

### 2. Location Services ✅
- [x] Install expo-location package
- [x] Add location permissions to app.json
- [x] Implement GPS-based location detection on app launch
- [x] Create location search functionality for the expandable button
- [x] Add location preference storage and retrieval
- [x] Handle location permission denials gracefully

### 3. Perplexity AI Integration
#### 3.1 Card Generation (Sonar Pro) ✅
- [x] Create API service wrapper for Perplexity API using the API key from the .env.local file
  - **Implementation**: `utils/perplexity-api.ts` with full error handling
- [x] Use the Perplexity Sonar Pro to generate event cards
  - **Implementation**: Uses `sonar-pro` model with temperature 0.2 for consistent output
- [x] Implement event card generation endpoint that takes user location as input using location data that's already stored
  - **Implementation**: `contexts/discovery-events-context.tsx` with `fetchEvents()` method
- [x] Generate cards with required fields: location, name, AI overview, date, time, address
  - **Implementation**: Three-tier type system (PerplexityEventData → DiscoveredEvent → SerializedEvent)
- [x] Create the prompt for the Perplexity Sonar Pro to generate event cards
  - **Implementation**: `utils/event-generation.ts` - generates civic/political events with structured JSON output
- [x] Target: Generate maximum possible civic/political events for the next month
  - **Implementation**: Prompt configured for month-long event discovery with search_recency_filter
- [x] Add API response caching (6-24 hour cache durations)
  - **Implementation**: 12-hour TTL cache system in `utils/event-cache.ts` with AsyncStorage
- [x] Implement fallback data for API failures
  - **Implementation**: 3 hardcoded sample events (Phoenix/Austin/Seattle) when API fails
- [x] Add rate limiting and retry logic
  - **Implementation**: 3 retry attempts with exponential backoff (1s, 2s, 4s), respects Retry-After header
- [x] Trigger generation on location change or manual refresh
  - **Implementation**: DiscoveryEventsContext with `fetchEvents()` and `refreshEvents()` methods

#### 3.2 View Details Generation (Sonar Pro)
- [ ] This will use Perplexity Sonar Pro to creat the back of the cards when view details is clicked
- [ ] Implement &quot;View Details&quot; backend that triggers on card flip
- [ ] Generate back-of-card data structure:
  - [ ] Top section: Venue name, full address (with map link), organizer, website link/RSVP button
  - [ ] Middle section: &quot;Impact of This Event&quot; paragraph, three pre-generated Q&A pairs (Who is this for?, Why does it matter?, What should I expect?) under that
  - [ ] Bottom section: Interactive Q&A in the next section
- [ ] Add loading animation trigger point before API call
- [ ] Add AI text generation animation trigger point after API response
- [ ] Cache detailed view data per event to avoid regenerating

#### 3.3 Interactive Q&A Feature (Sonar Pro)
- [ ] Implement user question submission endpoint, this will be inside the view details section of the card, under everything else
- [ ] Design prompt structure: event context + user question → factual 1-3 sentence answer
- [ ] Include event data in prompt: title, date, time, venue, organizer, AI overview, source URLs
- [ ] Handle question submission with same loading/generation animations
- [ ] Display answer in collapsible Q&A format with source citation
- example prompt for this: When user types a question, send:

You are an assistant for Ballot. Use the provided event data and real web context to answer user questions factually and briefly.

EVENT CONTEXT:
{event_title}
Date: {date}, Time: {time}
Venue: {venue}
Organizer: {organizer}
Description: {ai_overview}
Links: {source_urls}

USER QUESTION:
{user_input}

Return 1-3 sentence factual answer.
- [ ] Replace previous user-submitted Q&A on new question (only show one at a time)
- [ ] Add error handling for invalid questions or API failures

#### 3.4 Prompt Engineering
- [ ] Define Sonar Reasoning Pro prompt for card generation (location-based civic event discovery)
- [ ] Define Sonar Pro prompt for detailed view generation (structured event information)
- [ ] Define Sonar Pro prompt template for user questions (factual event Q&A with context)
- [ ] Document prompt templates in codebase for easy iteration

### 4. Image Integration
- [ ] Set up Unsplash API integration for event images
- [ ] Implement fallback curated images for common event types
- [ ] Add image caching and optimization for mobile
- [ ] Create image URL validation and error handling
- [ ] Implement progressive loading with placeholders

## Phase 2: Database & Cloud Services

### 5. Push Notifications
- [ ] Install expo-notifications package
- [ ] Configure notification permissions and settings in app.json
- [ ] Implement local notification scheduling for saved events
- [ ] Add reminder preference options (1 hour, 1 day, 1 week before)
- [ ] Create notification tap handling to navigate to events
- [ ] Add notification management (cancel, update) for removed events

## Phase 3: Scaling for more users

### 6. Supabase Setup
- [ ] Initialize Supabase project and configure connection
- [ ] Create database schema for users, saved events, location preferences
- [ ] Implement Row Level Security (RLS) policies for data protection
- [ ] Set up Supabase Storage for cached images and user data
- [ ] Add cross-device sync for saved events
- [ ] Configure environment variables for Supabase credentials

## Dependencies & Environment Setup

### Required Packages
- [x] `@react-native-async-storage/async-storage`
- [x] `expo-location`
- [ ] `expo-notifications`
- [ ] `@supabase/supabase-js`
- [ ] Any additional utility packages for API handling

### Environment Variables
- [ ] `PERPLEXITY_API_KEY` - For AI content generation
- [ ] `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `EXPO_PUBLIC_SUPABASE_KEY` - Supabase public key
- [ ] `UNSPLASH_ACCESS_KEY` - For event images (optional)

### API Services Setup
- [ ] Perplexity AI API access and key configuration
- [ ] Unsplash API access for images
- [ ] Supabase project creation and configuration
- [ ] Test API connections and rate limits

## Success Metrics

### Functional Requirements
- [x] Users can save events that persist across app restarts
- [x] Location detection works and filters events appropriately
- [ ] AI generates relevant civic events with accurate details
- [ ] Images load reliably and are contextually appropriate
- [ ] Push notifications work for saved events
- [ ] App functions offline with cached data

