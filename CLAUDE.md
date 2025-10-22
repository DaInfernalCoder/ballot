# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native Expo app called "Ballot" - an event management app with swipeable cards and delete functionality. The app uses Expo Router for file-based routing and is configured exclusively for dark mode.

## Development Commands

### Running the App
```bash
npm start           # Start Expo dev server with QR code
npm run android     # Start on Android emulator/device
npm run ios         # Start on iOS simulator/device
npm run web         # Start web version
```

### Package Management
```bash
npm install         # Install dependencies (required after cloning)
```

Note: No test, lint, or build scripts are currently configured in package.json.

## Architecture

### Routing & Navigation
- **Expo Router** (v6): File-based routing system (similar to Next.js)
- Entry point: `app/_layout.tsx` - handles font loading, custom splash screen, and dark theme enforcement
- Tab navigation: `app/(tabs)/_layout.tsx` - defines two main tabs with custom SVG icons
- Typed routes enabled via `experiments.typedRoutes` in app.json
- Navigation uses `@react-navigation/native` with custom dark theme overrides

### State Management
- **No global state manager** - uses local component state with React hooks
- Event data is currently hardcoded in components
- Delete functionality tracked via local state (`deletedEvents` array in Events screen)
- Modal state managed locally in parent components

### Animation System
This app heavily relies on animations for interactions:

**React Native Reanimated** (v4.1.1):
- Primary animation library for performant 60fps animations
- Uses `useSharedValue()` and `useAnimatedStyle()` for worklet-based animations
- **IMPORTANT**: Reanimated plugin must be the **last** plugin in babel.config.js
- Key animations: swipe gestures, card deletion, height collapse

**React Native Gesture Handler** (v2.22.1):
- Pan gestures for swipe-to-delete functionality
- `GestureHandlerRootView` wraps entire app in root layout
- Multi-threshold detection: 60% swipe = auto-delete, partial swipe = reveal delete button

**Native Animated API**:
- Used in `SplashScreenComponent.tsx` for splash animations
- Parallel fade-in and scale effects

### Component Patterns

**Swipe-to-Delete Pattern** (`SwipeableEventCard.tsx`):
- Reusable wrapper component that adds swipe gesture to any child content
- Context tracking for smooth animation continuation
- Auto-delete threshold (60% of screen width) or manual confirmation
- Prevents interaction during deletion with `isDeleting` flag
- Animates card off-screen with height collapse for smooth list updates

**Theme System**:
- Dark mode only (enforced via `app.json: userInterfaceStyle: "dark"`)
- Colors defined in `constants/Colors.ts` (supports light/dark but app uses dark only)
- `useColorScheme()` hook from React Native
- `useThemeColor()` utility in `components/Themed.tsx`
- Themed components: `ThemedText` and `ThemedView` wrappers

**SVG Assets**:
- SVG files imported as React components (configured via metro.config.js)
- Used for tab icons and inline icons
- Custom SVG transformer: `react-native-svg-transformer`

### Directory Structure

```
app/                    # Expo Router file-based routing
├── (tabs)/            # Tab navigation group
│   ├── _layout.tsx    # Tab bar configuration
│   ├── index.tsx      # Home screen (featured event)
│   └── two.tsx        # Events screen (swipeable list)
├── _layout.tsx        # Root layout (fonts, splash, theme)
└── modal.tsx          # Modal screen example

components/             # Reusable React components
├── SwipeableEventCard.tsx         # Swipe gesture wrapper
├── DeleteConfirmationModal.tsx    # Animated modal
├── SplashScreenComponent.tsx      # Custom splash animation
└── Themed.tsx                     # Theme-aware wrappers

constants/
└── Colors.ts          # Theme color definitions

assets/
├── images/            # PNG/SVG assets
└── fonts/             # Custom fonts
```

## Configuration Files

### TypeScript
- Path alias: `@/*` maps to root directory
- Strict mode enabled
- Includes SVG type definitions (svg.d.ts)

### Metro Bundler
- Custom transformer for SVG files (metro.config.js)
- SVG files treated as source files, not assets
- Required for importing SVG as React components

### Babel
- Uses `babel-preset-expo`
- **CRITICAL**: `react-native-reanimated/plugin` must be last in plugins array

### Expo Config (app.json)
- Bundle identifier: `com.ballot.app`
- New Architecture enabled (`newArchEnabled: true`)
- Edge-to-edge enabled on Android
- Predictive back gesture disabled on Android
- Portrait orientation only

## Key Implementation Details

### Gesture Thresholds
- Full delete: Pan gesture > 60% of screen width triggers auto-delete
- Partial swipe: < 60% reveals delete button, snaps back on release
- Active offset prevents accidental triggers during vertical scrolling

### Animation Timing
- Spring animations: used for natural snap-back and modal entry
- Timing animations: used for delete action and fade effects
- Height collapse: smooth removal from list without jarring jumps

### Data Flow
- Events stored as hardcoded array in components
- Grouped by date categories
- Client-side filtering based on `deletedEvents` state
- Delete confirmation modal gates destructive actions

## Platform Support

- iOS: Supports tablets
- Android: Edge-to-edge UI, adaptive icons
- Web: Uses Metro bundler with static output

## Dependencies to Note

When adding animation features, be aware:
- Reanimated and Gesture Handler work together for complex gestures
- Babel plugin order matters (Reanimated last)
- SVG transformer affects how image assets are imported
- Safe area context handles notches/home indicators
