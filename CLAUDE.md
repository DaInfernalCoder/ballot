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

## Key Architecture Patterns

### File-Based Routing (Expo Router)
- `app/_layout.tsx`: Root layout with theme provider & EventsContext
- `app/(tabs)/`: Tab navigation group
  - `index.tsx`: Home screen (event discovery)
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

### State Management (EventsContext)

Global state managed via Context API in `contexts/events-context.tsx`:

```typescript
// Provided methods
addSavedEvent(event)      // Adds event (prevents duplicates)
removeSavedEventById(id)  // Removes by ID
hasSavedEvent(id)         // Check if saved
savedEvents               // Array of saved events
```

**Limitations**:
- No persistence (in-memory only, lost on app restart)
- No AsyncStorage integration
- No timestamps or sorting

**Future improvement**: Add AsyncStorage for persistence

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
- No lazy loading of images implemented yet
- No caching strategy implemented yet

## Current Limitations & Context

1. **No Backend**: All event data is mocked in `app/(tabs)/index.tsx`
2. **No Persistence**: Events lost on app close (no AsyncStorage)
3. **No Tests**: Test infrastructure not set up (only `react-test-renderer` in devDeps)
4. **Location Button**: Expandable search button is UI-only, not functional
5. **Dark Mode Only**: No light theme support

## Data Structure

Events follow this structure:
```typescript
{
  id: string;
  title: string;
  location: string;
  date: string;
  image: ImageSourcePropType;  // require() or { uri }
}
```

## Common Development Tasks

When adding new event cards:
1. Add event object to `EVENTS` array in `app/(tabs)/index.tsx`
2. Add image to `assets/images/`
3. Import and reference in event object

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

## Recent Development History

```
56a1561 - Fixed location button
a74b996 - Add refresh functionality
2ffa4d1 - Quizlet-like card swiping fixed
b857224 - Quizlet-like card swiping
1ebd1be - Flippable card implementation
d58ad19 - Swipeable card
0561967 - Swipe to delete animation
```

The app recently went through major gesture system implementation. Core UX is stable but backend integration is next priority.
