# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ballot is a React Native mobile app built with Expo Router for discovering and curating local political/civic events. Features card-based browsing with advanced gesture interactions (swipe, flip, delete) and saved events management.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run ios        # iPhone 16 Pro simulator
npm run android    # Android emulator
npm run web        # Web browser
```

## Tech Stack

- **Framework**: React Native 0.81.5 with Expo ~54.0.18
- **Routing**: Expo Router ~6.0.13 (file-based routing)
- **Language**: TypeScript (strict mode)
- **Animation**: react-native-reanimated ~4.1.1 (60fps native thread)
- **Gestures**: react-native-gesture-handler ~2.22.1
- **State**: Context API + useReducer (no Redux)
- **SVG**: react-native-svg with metro transformer
- **Storage**: @react-native-async-storage/async-storage ~2.2.0 (event caching & persistence)
- **AI**: OpenRouter API with Perplexity Sonar Pro model (civic event generation)
- **Environment**: expo-constants + dotenv (API key management)

## Environment Setup

### Environment Variables
The project uses `.env.local` for API keys and configuration:

```bash
OPENROUTER_API_KEY=...    # Required for AI-powered event discovery (OpenRouter API)
SUPABASE_URL=...          # Future backend integration
SUPABASE_KEY=...          # Future backend integration
```

**Loading mechanism**:
- `app.config.js` loads `.env.local` via dotenv
- `config/env.ts` exposes vars via expo-constants
- Falls back to 3 sample events if OpenRouter API key is missing/invalid

## Key Architecture Patterns

### File-Based Routing (Expo Router)
- `app/_layout.tsx`: Root layout with EventsContext, LocationProvider, and DiscoveryEventsContext
- `app/(tabs)/`: Tab navigation group
  - `index.tsx`: Home screen (AI-powered event discovery)
  - `two.tsx`: Events screen (saved events)
- Typed routes enabled (`typedRoutes: true` in app.json)

### Three-Layer Gesture System

This app has a complex gesture hierarchy that requires careful coordination:

1. **SwipeActionCard** (horizontal): Wraps event cards on home screen
   - Right swipe (+30% threshold) = Add to saved events
   - Left swipe (-30% threshold) = Dismiss card
   - Shows "Add"/"Delete" badges during swipe
   - Location: `components/SwipeActionCard.tsx`

2. **FlippableCard** (3D flip): Card flip animation
   - Front/back view switching with perspective transform
   - 300ms animation, platform-specific cameraDistance for Android
   - Location: `components/FlippableCard.tsx`

3. **SwipeableEventCard** (vertical): iOS-style swipe-to-delete on events screen
   - Partial swipe (< 60%) reveals red delete button
   - Full swipe (>= 60%) auto-deletes with confirmation
   - Location: `components/SwipeableEventCard.tsx`

**IMPORTANT**: When modifying gestures, test all three layers together. Gesture conflicts can break the UX.

### State Management (Dual-Context Architecture)

The app uses two separate contexts for different concerns:

#### 1. EventsContext (Saved Events)
**Location**: `contexts/events-context.tsx`
**Purpose**: Manages user's personally saved events (curated collection)

```typescript
// Provided methods
addSavedEvent(event)         // Adds event with AsyncStorage persistence
removeSavedEventById(id)     // Removes by ID, updates AsyncStorage
hasSavedEvent(id)            // Check if event is saved
savedEvents                  // Array of saved events
```

**Storage**:
- Persisted to AsyncStorage at key `@ballot:saved_events`
- Survives app restarts
- Synchronized on every add/remove operation

#### 2. DiscoveryEventsContext (AI-Generated Events)
**Location**: `contexts/discovery-events-context.tsx`
**Purpose**: Manages location-based event discovery via Perplexity AI

```typescript
// State
discoveredEvents: DiscoveredEvent[]   // AI-generated events for current location
isLoading: boolean                     // Fetch in progress
error: string | null                   // Error message if fetch failed
cacheHit: boolean                      // Whether data came from cache
cacheAge: number | null                // Time since cache was written (ms)
currentLocation: string | null         // Location of current discovery
lastFetchTime: number | null           // Unix timestamp of last fetch

// Methods
fetchEvents(location, forceRefresh?)   // Fetch with 12-hour cache support
refreshEvents(location)                // Force bypass cache
clearEvents()                          // Reset discovery state
getCacheAgeDisplay()                   // Format cache age (e.g., "2h ago")
```

**Cache Strategy**:
- **TTL**: 12 hours (configurable in `utils/event-cache.ts`)
- **Storage key**: `@ballot:event-cache:{normalized-location}`
- **Auto-expiry**: Stale caches deleted on load
- **Bypass**: Use `refreshEvents()` or `forceRefresh: true`

**Error Handling**:
- Network failures: 3 retry attempts with exponential backoff
- Rate limiting: Respects `Retry-After` header
- Complete API failure: Falls back to 3 sample events (see `utils/event-generation.ts`)

#### Provider Hierarchy (app/_layout.tsx)
```jsx
GestureHandlerRootView
  └─ EventsProvider (saved events with AsyncStorage)
      └─ LocationProvider (GPS + manual location)
          └─ DiscoveryEventsProvider (AI-generated events with caching)
              └─ ThemeProvider
                  └─ Stack Navigator
```

### Quizlet-Style Infinite Card Swiping

Home screen uses `VirtualizedList` with virtual infinite scrolling:

```typescript
// Pattern in app/(tabs)/index.tsx
VISIBLE_EVENTS = EVENTS.filter(e => !dismissedIds.has(e.id))
INITIAL_INDEX = (INFINITE_COUNT/2) - (INFINITE_COUNT/2) % EVENTS_LENGTH
// Access via: data[index % data.length]
```

- Full-screen vertical paging (one card at a time)
- Modulo mapping creates infinite scroll illusion
- Dismissed cards filtered out dynamically
- Refresh button resets dismissed state
- `windowSize=3` for performance (only 3 cards rendered)

**Why this pattern**: Simulates Tinder/Quizlet UX without re-rendering entire list

### SVG Icon System

SVGs are imported as React components via metro transformer:

```typescript
import HomeIcon from '@/assets/images/home-icon.svg';
<HomeIcon width={24} height={24} opacity={focused ? 1 : 0.5} />
```

**Setup**: `metro.config.js` configured with `react-native-svg-transformer`

### AI-Powered Event Discovery System

#### OpenRouter API Integration
**File**: `utils/perplexity-api.ts`
**Provider**: OpenRouter (https://openrouter.ai)
**Model**: `perplexity/sonar-pro` (reasoning-capable search model via OpenRouter)
**Endpoint**: `https://openrouter.ai/api/v1/chat/completions`

**Request Configuration**:
```typescript
{
  model: "perplexity/sonar-pro",
  temperature: 0.2,        // Low temp for consistent structured output
  max_tokens: 5000,        // Large context for detailed event data
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'HTTP-Referer': 'https://ballot.app',  // Optional: for OpenRouter rankings
    'X-Title': 'Ballot',                    // Optional: for OpenRouter rankings
  }
}
```

**Retry Logic**:
- Max 3 attempts for network errors
- Exponential backoff: 1s, 2s, 4s
- Rate limit (429): Respects `Retry-After` header
- Timeout: 30 seconds per request

**Prompt Architecture**:
- **System**: Instructs to return valid JSON only
- **User**: Location + date range + event type filters + max count
- **Output**: JSON schema with cards array (name, date, time, address, ai_overview, link, source_urls, tags)

#### Event Generation Flow
**File**: `utils/event-generation.ts`

1. Call OpenRouter API with Perplexity Sonar Pro model and location
2. Parse response (handles `<think>` tags, markdown code fences)
3. Validate each event via `validateEventData()`
4. Transform `PerplexityEventData` → `DiscoveredEvent`
5. Generate stable hash-based IDs: `event-{hash(title+date+location)}-{timestamp}`
6. Assign random images from pool (event1-5, event-image)
7. Filter invalid events, return array

**Fallback Events**: If API fails completely, returns 3 hardcoded sample events for Phoenix/Austin/Seattle

#### Event Caching System
**File**: `utils/event-cache.ts`

**Cache Entry Structure**:
```typescript
{
  location: string,           // Normalized location string
  events: SerializedEvent[],  // Array of serialized events
  timestamp: number,          // When cached (Unix ms)
  version: number             // Schema version (currently 1)
}
```

**Cache Operations**:
- `saveCachedEvents(location, events)` - Write to AsyncStorage
- `loadCachedEvents(location, ttl?)` - Load with TTL check (default 12h)
- `clearCachedEvents(location)` - Delete specific location cache
- `clearAllCaches()` - Wipe all event caches

**TTL Calculation**:
```typescript
const age = Date.now() - cacheEntry.timestamp;
if (age > ttl) {
  // Expired - delete and return null
  await clearCachedEvents(location);
  return null;
}
```

**Location Normalization**: Lowercased, trimmed, consistent formatting for cache key matching

### Three-Tier Type System

**Why three types?** Different representations for API, runtime, and storage.

**File**: `types/event.ts`

#### Tier 1: PerplexityEventData (API Raw Format)
```typescript
{
  name: string;
  date: string;                  // ISO 8601 or human-readable
  time: { start: string; end?: string; };
  address: {
    venue?: string;
    street?: string;
    city: string;
    state: string;
    postal_code?: string;
    country?: string;
  };
  location?: { lat: number; lon: number; };
  ai_overview: string;
  link?: string;
  source_urls?: string[];
  tags?: string[];
}
```

#### Tier 2: DiscoveredEvent (App Runtime Format)
```typescript
{
  id: string;                    // Generated hash-based ID
  title: string;
  location: string;              // Display-formatted location string
  date: string;                  // Human-readable date
  time: string;                  // Human-readable time range
  image: ImageSourcePropType;    // require() statement (not serializable)
  imageKey: string;              // For serialization (e.g., "event1")
  aiOverview: string;
  link?: string;
  sourceUrls?: string[];
  tags?: string[];
  venue?: string;
  address?: string;
}
```

#### Tier 3: SerializedEvent (Persistence Format)
```typescript
{
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  imageKey: string;              // NOT ImageSourcePropType - uses key instead
  aiOverview: string;
  link?: string;
  sourceUrls?: string[];
  tags?: string[];
  venue?: string;
  address?: string;
  version?: number;              // For future migrations
}
```

**Transformation Flow**:
```
Perplexity API Response
  ↓ (parsePerplexityResponse)
PerplexityEventData[]
  ↓ (transformToDiscoveredEvent)
DiscoveredEvent[]
  ↓ (serializeEvent)
SerializedEvent[]
  ↓ (AsyncStorage)
Cache Entry { location, events: SerializedEvent[], timestamp, version }
```

**Deserialization** (when loading from cache):
```
SerializedEvent[]
  ↓ (deserializeEvent - maps imageKey → ImageSourcePropType)
DiscoveredEvent[]
  ↓ (displayed in UI)
```

### Image Serialization Pattern

**Problem**: Cannot serialize `require('@/assets/images/event1.jpg')` to AsyncStorage (it's a function call, not JSON-serializable)

**Solution**: Two-way mapping system

**File**: `utils/image-mapping.ts`

```typescript
// Available image keys
type ImageKey = "event1" | "event2" | "event3" | "event4" | "event5" | "event-image";

// Mapping functions
getImageFromKey(key: ImageKey): ImageSourcePropType
getKeyFromImage(image: ImageSourcePropType): ImageKey
```

**Usage**:

```typescript
// When saving to cache (DiscoveredEvent → SerializedEvent)
const serialized: SerializedEvent = {
  ...event,
  imageKey: getKeyFromImage(event.image),  // Convert require() → "event1"
  // Remove image field (not serializable)
};

// When loading from cache (SerializedEvent → DiscoveredEvent)
const discovered: DiscoveredEvent = {
  ...serialized,
  image: getImageFromKey(serialized.imageKey),  // Convert "event1" → require()
};
```

**Important**: Always use `getKeyFromImage()` and `getImageFromKey()` for bidirectional conversion. Never hardcode image keys in event objects.

## Important Configuration Files

### babel.config.js
**CRITICAL**: Must include `react-native-reanimated/plugin` as last plugin for worklets to function.

### app.json
- `userInterfaceStyle: "dark"` - Dark theme only, no light mode
- `newArchEnabled: true` - React Native New Architecture enabled
- `experiments.typedRoutes: true` - Type-safe routing

### tsconfig.json
- Path alias: `@/*` maps to project root
- Use `@/` for all imports to components, contexts, constants

## Code Style Conventions

### General Principles
- Write concise, technical TypeScript code
- Use functional and declarative programming; avoid classes
- Use descriptive variable names with auxiliary verbs (isLoading, hasError)
- Structure files: exported component, subcomponents, helpers, static content, types

### TypeScript
- Use TypeScript for all code; prefer interfaces over types
- Avoid enums; use maps instead
- Use functional components with TypeScript interfaces
- Strict mode enabled

### React Native Patterns
- Use "function" keyword for pure functions
- Avoid unnecessary curly braces in conditionals
- Use declarative JSX
- Minimize useState/useEffect; prefer context and reducers
- Memoize expensive operations with useMemo/useCallback

### Animations
- Use `react-native-reanimated` for all animations (not Animated API)
- Use `useSharedValue` for gesture tracking (runs on native thread)
- Use `withSpring` for natural physics-based animations
- Use `withTiming` for precise timed animations

### File Naming
- Use lowercase with dashes for directories (e.g., `home-event-card/`)
- Favor named exports for components
- Platform-specific files: `file.ts` / `file.web.ts`

### Error Handling
- Handle errors at beginning of functions
- Use early returns for error conditions
- Avoid unnecessary else statements; use if-return pattern
- No global error boundaries implemented yet

### Performance
- Use `VirtualizedList` with `windowSize`, `maxToRenderPerBatch` for lists
- Use `removeClippedSubviews` on long lists
- Lazy loading of images not needed (local assets loaded instantly)
- Event caching implemented with 12-hour TTL in AsyncStorage
- API calls minimized via cache-first strategy

## Current Limitations & Context

1. **Supabase Integration**: Environment variables present but not yet implemented
2. **Search Radius**: No distance-based filtering (Perplexity returns any events in location)
3. **No Tests**: Test infrastructure not set up (only `react-test-renderer` in devDeps)
4. **Image Pool**: Limited to 6 static event images (randomly assigned)
5. **Dark Mode Only**: No light theme support
6. **Event Updates**: No mechanism to update cached events from backend (cache-only invalidation)
7. **OpenRouter Limits**: API has rate limits and costs per request (pay-per-token)

## Data Structure

**Note**: Home screen now uses `DiscoveredEvent` type from `types/event.ts` (see Three-Tier Type System).

Saved events (EventsContext) use this structure:
```typescript
{
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  image: ImageSourcePropType;
  imageKey: string;
  aiOverview: string;
  link?: string;
  sourceUrls?: string[];
  tags?: string[];
  venue?: string;
  address?: string;
}
```

## Common Development Tasks

When adding new event images:
1. Add image file to `assets/images/` (e.g., `event6.jpg`)
2. Update `utils/image-mapping.ts`:
   - Add new key to `ImageKey` type
   - Add mapping in `IMAGE_MAP` object
   - Add reverse mapping in `getKeyFromImage()`
3. Update `getRandomImage()` in `utils/event-generation.ts` to include new image

When modifying event generation logic:
1. Update prompt in `generateEventsForLocation()` (`utils/event-generation.ts`)
2. Adjust `validateEventData()` if changing required fields
3. Test with `forceRefresh` to bypass cache
4. Check error handling with invalid API responses

When changing cache TTL:
1. Modify `DEFAULT_CACHE_TTL_MS` in `utils/event-cache.ts`
2. Or pass custom `ttl` parameter to `loadCachedEvents()`
3. Remember: Changes don't affect already-cached entries

When modifying gestures:
1. Test all three gesture layers together
2. Check `simultaneous()` handlers in gesture configs
3. Verify spring animations don't conflict
4. Test on both iOS and Android

When adding new screens:
1. Create file in `app/` directory (file-based routing)
2. Access via `router.push('/screen-name')`
3. Add to `_layout.tsx` if needs special layout

## Architecture Decisions

**Why Context API instead of Redux?**
Small app with simple state. useReducer provides enough structure without extra dependencies.

**Why VirtualizedList instead of FlatList?**
Allows custom virtualization logic for infinite scrolling pattern. FlatList doesn't support modulo-based index mapping.

**Why Reanimated instead of Animated API?**
Reanimated runs on native thread (60fps), critical for gesture-driven animations. Industry standard for modern React Native apps.

**Why Gesture Handler instead of PanResponder?**
Better performance, better conflict resolution with ScrollView, seamless integration with Reanimated.

**Why OpenRouter with Perplexity Sonar Pro?**
OpenRouter provides unified API access to multiple LLM providers with better rate limits and easier management. Perplexity's Sonar Pro model excels at real-time web search and structured output. Returns citations and sources, critical for civic event verification.

**Why 12-hour cache TTL?**
Balances fresh data with API cost/rate limits. Political events rarely change hourly. Users can manually refresh if needed.

**Why separate DiscoveryEventsContext from EventsContext?**
Clear separation of concerns: discovery (ephemeral, location-based, cached) vs saved (persistent, user-curated, no expiry).

**Why three-tier type system?**
API format (PerplexityEventData) differs from UI needs (DiscoveredEvent) and storage constraints (SerializedEvent). Each tier optimized for its domain.

**Why hash-based event IDs?**
Deterministic IDs prevent duplicates when refreshing same location. Same event = same hash = deduplication works automatically.

## Recent Development History

```
20975ea - Local storage (AsyncStorage integration)
6d5de78 - Location (GPS-based event discovery)
56a1561 - Fixed location button
a74b996 - Add refresh functionality
2ffa4d1 - Quizlet-like card swiping fixed
b857224 - Quizlet-like card swiping
1ebd1be - Flippable card implementation
```

The app recently completed major AI integration (OpenRouter API with Perplexity Sonar Pro for event discovery) with smart caching and AsyncStorage persistence. Core discovery flow is production-ready.
