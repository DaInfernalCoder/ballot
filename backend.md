# Backend MVP Implementation Checklist

## Overview
Transform the static MVP into a dynamic, location-aware civic event discovery platform with AI-generated content, persistent storage, and push notifications.

## Phase 1: Core Backend Infrastructure

### 1. Local Storage Persistence
- [ ] Install and configure AsyncStorage for saved events persistence
- [ ] Update EventsContext to load/save events from AsyncStorage on app start
- [ ] Add loading states while hydrating saved events from storage
- [ ] Implement data migration for future app updates

### 2. Location Services
- [ ] Install expo-location package
- [ ] Add location permissions to app.json
- [ ] Implement GPS-based location detection on app launch
- [ ] Create location search functionality for the expandable button
- [ ] Add location preference storage and retrieval
- [ ] Handle location permission denials gracefully

### 3. Perplexity AI Integration
- [ ] Create API service for Perplexity chat completions
- [ ] Implement event generation endpoint (title, location, date, description)
- [ ] Create structured event details generation (address, how to apply, purpose, etc.)
- [ ] Add API response caching (6-24 hour cache durations)
- [ ] Implement fallback data for API failures
- [ ] Add rate limiting and retry logic

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

## Phase 3: When we have more users and need to store data in a database

### 6. Supabase Setup
- [ ] Initialize Supabase project and configure connection
- [ ] Create database schema for users, saved events, location preferences
- [ ] Implement Row Level Security (RLS) policies for data protection
- [ ] Set up Supabase Storage for cached images and user data
- [ ] Add cross-device sync for saved events
- [ ] Configure environment variables for Supabase credentials

## Dependencies & Environment Setup

### Required Packages
- [ ] `@react-native-async-storage/async-storage`
- [ ] `expo-location`
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
- [ ] Users can save events that persist across app restarts
- [ ] Location detection works and filters events appropriately
- [ ] AI generates relevant civic events with accurate details
- [ ] Images load reliably and are contextually appropriate
- [ ] Push notifications work for saved events
- [ ] App functions offline with cached data

