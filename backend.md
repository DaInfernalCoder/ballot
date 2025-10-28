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
- [x] The API search doesn't really work every time, logs an error with the API fetch. Figure out why these are happening. The solution was adding a 60 second cooldown between searches. **UPDATE**: Cooldown removed as requested.
- [x] Should remove the fallback test cards and instead just show the search failed, with a retry button

#### 3.2 Visual Indicators
- [ ] Should have visual indicators of which card you're at and how many are left
- [ ] Something that's engaging to see when AI response is loading 

#### 3.3 View Details Generation (Sonar Pro)
- [x] This will use Perplexity Sonar Pro to create the back of the cards when view details is clicked
- [x] Implement "View Details" backend that triggers on card flip
- [x] Generate back-of-card data structure:
  - [x] Top section: Venue name, full address (with map link), organizer, website link
  - [x] Bottom section: "Impact of This Event" paragraph, three pre-generated Q&A pairs (Who is this for?, Why does it matter?, What should I expect?) under that similar to recently asked question in the google ui when viewing search results 

#### 3.3.1 Fixing scrolling 
- [ ]  I'm not able to scroll the card when the text get's longer than the horizontal limits of the card viewport
- [ ] The scrolling on the front of the card is not working when starting on the middle of the screen. Might not be super user friendly since people don't know where to start scrolling 
- [ ] The current scrolling mechanism on the back of the card where you start from the close details card might not be super intuitive.

#### 3.4 Loading Animation & Cache
- [ ] Add loading animation trigger point before API call
- [ ] Add AI text generation animation trigger point after API response
- [ ] Cache detailed view data per event to avoid regenerating

### 4. Image Integration
- [x] Set up Unsplash API integration for event images
- [ ] Implement 15 fallback curated images for common event types
- [ ] Create image URL validation and error handling, if image api doesn't return an image, use the fallback image
- [x] Implement progressive loading, the loader that was initally for the perplexity response should now also include the images loading

## Phase 2: Database & Cloud Services

### 5. Push Notifications
- [x] Install expo-notifications package
- [x] Configure notification permissions and settings in app.json
- [x] Implement local notification scheduling for saved events
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
- [] `expo-notifications`
- [ ] `@supabase/supabase-js`
- [ ] Any additional utility packages for API handling

### Environment Variables
- [x] `PERPLEXITY_API_KEY` - For AI content generation
- [x] `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- [x] `EXPO_PUBLIC_SUPABASE_KEY` - Supabase public key
- [x] `UNSPLASH_ACCESS_KEY` - For event images (optional)

### API Services Setup
- [x] Perplexity AI API access and key configuration
- [x] Unsplash API access for images
- [ ] Supabase project creation and configuration
- [ ] Test API connections and rate limits

## Success Metrics

### Functional Requirements
- [x] Users can save events that persist across app restarts
- [x] Location detection works and filters events appropriately
- [x] AI generates relevant civic events with accurate details
- [x] Images load reliably and are contextually appropriate
- [x] Push notifications work for saved events
- [x] App functions offline with cached data

