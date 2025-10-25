import AIThinkingParameters from '@/components/AIThinkingParameters';
import AnimatedEventCard from '@/components/AnimatedEventCard';
import CardDeckView from '@/components/CardDeckView';
import StreamingText from '@/components/StreamingText';
import { Text, View } from '@/components/Themed';
import { useDiscoveryEvents } from '@/contexts/discovery-events-context';
import { useEvents } from '@/contexts/events-context';
import { useLocation } from '@/contexts/location-context';
import { loadViewMode, saveViewMode, ViewMode } from '@/utils/view-mode-storage';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Image } from 'expo-image';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Keyboard, StatusBar, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, VirtualizedList } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

// SVG Icon Components
const MapPinIcon = () => (
  <Svg width={34} height={33} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
      fill="white"
      fillOpacity={0.54}
      stroke="white"
      strokeOpacity={0.54}
      strokeWidth={2}
    />
  </Svg>
);

const LocationIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <Path
      d="M8 1.333A4.667 4.667 0 003.333 6c0 3.5 4.667 8.667 4.667 8.667S12.667 9.5 12.667 6A4.667 4.667 0 008 1.333zm0 6.334A1.667 1.667 0 116.333 6 1.667 1.667 0 018 7.667z"
      fill="white"
    />
  </Svg>
);

const CalendarIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <Path
      d="M12.667 2.667h-1.334V2a.667.667 0 00-1.333 0v.667H6V2a.667.667 0 00-1.333 0v.667H3.333A1.333 1.333 0 002 4v9.333A1.333 1.333 0 003.333 14.667h9.334A1.333 1.333 0 0014 13.333V4a1.333 1.333 0 00-1.333-1.333zm0 10.666H3.333V6.667h9.334v6.666z"
      fill="white"
    />
  </Svg>
);

const ShareIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"
      fill="white"
    />
  </Svg>
);

const RefreshIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M17.65 6.35A7.95 7.95 0 0012 4a8 8 0 108 8h-2a6 6 0 11-6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="white" fillOpacity={0.8} />
  </Svg>
);

const MyLocationIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" fill="white" fillOpacity={0.7} />
  </Svg>
);

const DeckViewIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" fill="white" fillOpacity={0.7} />
    <Path d="M7 7h10v2H7zM7 11h10v2H7zM7 15h7v2H7z" fill="white" fillOpacity={0.7} />
  </Svg>
);

const ListViewIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" fill="white" fillOpacity={0.7} />
  </Svg>
);

export default function HomeScreen() {
  const location = useLocation();
  const discoveryEvents = useDiscoveryEvents();
  const { addSavedEvent } = useEvents();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const expansion = useSharedValue(0);
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [showStreamingText, setShowStreamingText] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentDeckIndex, setCurrentDeckIndex] = useState(0);
  const tabBarHeight = useBottomTabBarHeight();
  const [containerHeight, setContainerHeight] = useState(0);
  const viewportHeight = Math.max(0, containerHeight - tabBarHeight);

  // Use discovered events from context
  const EVENTS = discoveryEvents.discoveredEvents;
  const VISIBLE_EVENTS = useMemo(() => EVENTS.filter(e => !dismissedIds.has(e.id)), [EVENTS, dismissedIds]);
  const EVENTS_LENGTH = VISIBLE_EVENTS.length;
  const INFINITE_COUNT = 100000;
  const INITIAL_INDEX = useMemo(() => {
    if (EVENTS_LENGTH === 0) return 0;
    const mid = Math.floor(INFINITE_COUNT / 2);
    return mid - (mid % EVENTS_LENGTH); // align to first item
  }, [EVENTS_LENGTH]);

  // Load saved view mode preference
  useEffect(() => {
    loadViewMode().then(setViewMode);
  }, []);

  // Request location on first launch if not asked before
  useEffect(() => {
    if (!location.isLoading && !location.permissionAsked && !location.currentLocation) {
      location.requestLocation();
    }
  }, [location.isLoading, location.permissionAsked, location.currentLocation]);

  // Initialize searchText from currentLocation
  useEffect(() => {
    if (location.currentLocation && !searchText) {
      setSearchText(location.currentLocation);
    }
  }, [location.currentLocation]);

  // Fetch events when location changes
  useEffect(() => {
    if (location.currentLocation && !location.isLoading) {
      discoveryEvents.fetchEvents(location.currentLocation);
    }
  }, [location.currentLocation, location.isLoading]);

  // Clear dismissed cards when location changes
  useEffect(() => {
    setDismissedIds(new Set());
    setFlippedIndex(null);
  }, [location.currentLocation]);

  // Show streaming text when new events are loaded
  useEffect(() => {
    if (location.currentLocation && EVENTS_LENGTH > 0 && !discoveryEvents.isLoading && !discoveryEvents.cacheHit) {
      setShowStreamingText(true);
      const timer = setTimeout(() => {
        setShowStreamingText(false);
      }, 3000); // Show for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [EVENTS_LENGTH, discoveryEvents.isLoading, discoveryEvents.cacheHit, location.currentLocation]);

  // Animate expansion when isExpanded changes
  useEffect(() => {
    expansion.value = withSpring(isExpanded ? 1 : 0, {
      damping: 20,
      stiffness: 150,
    });
  }, [isExpanded]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(
        expansion.value,
        [0, 1],
        [40, 170]
      ),
      height: 48,
      borderRadius: interpolate(
        expansion.value,
        [0, 1],
        [20, 8]
      ),
      backgroundColor: interpolate(
        expansion.value,
        [0, 1],
        [0, 0.54]
      ) as any,
      borderWidth: interpolate(
        expansion.value,
        [0, 1],
        [0, 1]
      ),
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(expansion.value, [0, 0.3], [1, 0]),
      transform: [
        {
          scale: interpolate(expansion.value, [0, 0.3], [1, 0.8]),
        },
      ],
    };
  });

  const textInputAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(expansion.value, [0.5, 1], [0, 1]),
    };
  });

  const handlePress = () => {
    if (!isExpanded) {
      // Populate with current location when opening
      if (location.currentLocation) {
        setSearchText(location.currentLocation);
      }
      setIsExpanded(true);
    }
  };

  const handleBlur = () => {
    // Save location when closing search
    const trimmedText = searchText.trim();
    if (trimmedText && trimmedText !== location.currentLocation) {
      location.setManualLocation(trimmedText);
    } else if (!trimmedText && location.currentLocation) {
      // Restore current location if user cleared the text
      setSearchText(location.currentLocation);
    }
    setIsExpanded(false);
  };

  const handleSubmit = async () => {
    const trimmedText = searchText.trim();
    if (trimmedText) {
      location.setManualLocation(trimmedText);
      // Force refresh to fetch new events with updated prompt
      await discoveryEvents.refreshEvents(trimmedText);
    }
    setIsExpanded(false);
    Keyboard.dismiss();
  };

  const handleUseCurrentLocation = async () => {
    setIsRequestingLocation(true);
    await location.requestLocation();
    setIsRequestingLocation(false);
    if (location.currentLocation) {
      setSearchText(location.currentLocation);
      // Force refresh to fetch new events for GPS location
      await discoveryEvents.refreshEvents(location.currentLocation);
    }
  };

  const handleOutsidePress = () => {
    if (isExpanded) {
      setIsExpanded(false);
      Keyboard.dismiss();
    }
  };

  const handleRefresh = async () => {
    setDismissedIds(new Set());
    setFlippedIndex(null);
    setCurrentDeckIndex(0);
    if (location.currentLocation) {
      await discoveryEvents.refreshEvents(location.currentLocation);
    }
  };

  const handleToggleView = async () => {
    const newMode: ViewMode = viewMode === 'list' ? 'deck' : 'list';
    setViewMode(newMode);
    await saveViewMode(newMode);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with Logo, View Toggle, and Location Pin */}
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/ballot-logo-258118.png')}
          style={styles.logo}
          contentFit="contain"
          transition={100}
        />
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={handleToggleView}
            style={styles.viewToggleButton}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${viewMode === 'list' ? 'deck' : 'list'} view`}
          >
            {viewMode === 'list' ? <DeckViewIcon /> : <ListViewIcon />}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.locationButtonContainer}
            onPress={handlePress}
            activeOpacity={1}
          >
          <Animated.View style={[styles.locationButton, animatedStyle]}>
            <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
              <MapPinIcon />
            </Animated.View>
            {isExpanded && (
              <Animated.View style={[styles.textInputContainer, textInputAnimatedStyle]}>
                <Svg width={20} height={24} viewBox="0 0 24 24" fill="none" style={styles.inputIcon}>
                  <Path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                    fill="white"
                    fillOpacity={0.54}
                    stroke="white"
                    strokeOpacity={0.54}
                    strokeWidth={2}
                  />
                </Svg>
                <TextInput
                  style={styles.textInput}
                  placeholder="City, State"
                  placeholderTextColor="rgba(255, 255, 255, 0.38)"
                  value={searchText}
                  onChangeText={setSearchText}
                  onBlur={handleBlur}
                  onSubmitEditing={handleSubmit}
                  returnKeyType="done"
                  blurOnSubmit={true}
                  autoFocus={true}
                  autoCorrect={false}
                  autoCapitalize="words"
                />
                <TouchableOpacity
                  onPress={handleUseCurrentLocation}
                  disabled={isRequestingLocation}
                  style={styles.myLocationButton}
                  accessibilityRole="button"
                  accessibilityLabel="Use current location"
                >
                  {isRequestingLocation ? (
                    <ActivityIndicator size="small" color="rgba(255, 255, 255, 0.7)" />
                  ) : (
                    <MyLocationIcon />
                  )}
                </TouchableOpacity>
              </Animated.View>
            )}
          </Animated.View>
        </TouchableOpacity>
        </View>
      </View>

      {/* Main Content - Vertically paged list of event cards */}
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View style={{ flex: 1 }} onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}>
          {/* Show fallback when no location is set */}
          {viewportHeight > 0 && !location.currentLocation && !location.isLoading && (
            <View style={{ height: viewportHeight, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, textAlign: 'center', lineHeight: 24 }}>
                Please enter a location to view local political events!
              </Text>
            </View>
          )}
          {/* Show loading indicator for location */}
          {viewportHeight > 0 && location.isLoading && (
            <View style={{ height: viewportHeight, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="rgba(255, 255, 255, 0.7)" />
              <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 16 }}>Getting your location...</Text>
            </View>
          )}
          {/* Show loading indicator for events */}
          {viewportHeight > 0 && !location.isLoading && location.currentLocation && discoveryEvents.isLoading && (
            <View style={{ height: viewportHeight, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' }}>
              <AIThinkingParameters location={location.currentLocation} />
            </View>
          )}
          {/* Show streaming text when new events are found */}
          {viewportHeight > 0 && location.currentLocation && showStreamingText && (
            <View style={{ height: viewportHeight, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' }}>
              <StreamingText
                text={`Found ${EVENTS_LENGTH} exciting event${EVENTS_LENGTH > 1 ? 's' : ''} in ${location.currentLocation}!`}
                speed={25}
                fontSize={18}
                fontWeight="600"
                textAlign="center"
              />
            </View>
          )}
          {/* Show events when location is set */}
          {viewportHeight > 0 && location.currentLocation && EVENTS_LENGTH > 0 && !showStreamingText && viewMode === 'list' && (
          <VirtualizedList
            data={VISIBLE_EVENTS}
            getItemCount={() => INFINITE_COUNT}
            getItem={(data, index) => {
              const arr = data as typeof VISIBLE_EVENTS;
              if (!arr.length) return null as any;
              return arr[index % arr.length];
            }}
            keyExtractor={(_, i) => `${i}`}
            pagingEnabled
            decelerationRate="fast"
            snapToInterval={viewportHeight}
            snapToAlignment="start"
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            removeClippedSubviews
            windowSize={3}
            maxToRenderPerBatch={3}
            initialNumToRender={3}
            getItemLayout={(_, i) => ({ length: viewportHeight, offset: viewportHeight * i, index: i })}
            initialScrollIndex={INITIAL_INDEX}
            onMomentumScrollEnd={(e) => {
              const i = Math.round(e.nativeEvent.contentOffset.y / viewportHeight);
              if (flippedIndex !== null && flippedIndex !== i) setFlippedIndex(null);
            }}
            renderItem={({ item, index }) => (
              <View style={{ height: viewportHeight, paddingHorizontal: 20 }}>
                <View style={styles.cardContainer}>
                  <AnimatedEventCard
                    event={item}
                    index={index}
                    flipped={flippedIndex === index}
                    onFlip={() => setFlippedIndex(index)}
                    onUnflip={() => setFlippedIndex(null)}
                    onDismiss={(id) => setDismissedIds(prev => new Set([...prev, id]))}
                    deckMode={false}
                  />
                </View>
              </View>
            )}
          />
        )}
        {/* Show deck view when in deck mode */}
        {viewportHeight > 0 && location.currentLocation && EVENTS_LENGTH > 0 && !showStreamingText && viewMode === 'deck' && (
          <CardDeckView
            data={VISIBLE_EVENTS}
            renderCard={(event, index) => (
              <AnimatedEventCard
                event={event}
                index={index}
                flipped={flippedIndex === index}
                onFlip={() => setFlippedIndex(index)}
                onUnflip={() => setFlippedIndex(null)}
                onDismiss={(id) => setDismissedIds(prev => new Set([...prev, id]))}
                deckMode={true}
              />
            )}
            onSwipeUp={(event) => {
              addSavedEvent(event);
              setDismissedIds(prev => new Set([...prev, event.id]));
            }}
            onSwipeDown={(event) => {
              setDismissedIds(prev => new Set([...prev, event.id]));
            }}
            currentIndex={currentDeckIndex}
            onIndexChange={setCurrentDeckIndex}
            containerHeight={viewportHeight}
          />
        )}
        {/* Show "no more events" when location is set but all events dismissed */}
        {viewportHeight > 0 && location.currentLocation && EVENTS_LENGTH === 0 && (
          <View style={{ height: viewportHeight, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>No more events</Text>
            <TouchableOpacity
              onPress={handleRefresh}
              style={{ width: 44, height: 44, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' }}
              accessibilityRole="button"
              accessibilityLabel="Refresh events"
            >
              <RefreshIcon />
            </TouchableOpacity>
          </View>
        )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#000000',
  },
  logo: {
    width: 117,
    height: 29,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  locationButtonContainer: {
    position: 'relative',
  },
  locationButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'rgba(255, 255, 255, 0.54)',
  },
  iconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 2,
    gap: 8,
    width: '100%',
    height: '100%',
  },
  inputIcon: {
    flexShrink: 0,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    fontWeight: '400',
    letterSpacing: 0.4,
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  myLocationButton: {
    flexShrink: 0,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationIcon: {
    width: 34,
    height: 33,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  cardContainer: {
    position: 'relative',
    marginTop: 25,
  },
  eventCard: {
    backgroundColor: '#151515',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
    marginTop: 25,
    zIndex: 2,
  },
  eventImage: {
    width: '100%',
    height: 293,
  },
  eventContent: {
    padding: 20,
  },
  backFaceContainer: {
    backgroundColor: '#151515',
    width: '100%',
    height: '100%',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 30,
    letterSpacing: -0.4,
    marginBottom: 20,
  },
  backTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 27,
    letterSpacing: -0.3,
    marginBottom: 16,
    opacity: 0.92,
  },
  eventDetails: {
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    opacity: 0.54,
  },
  detailIcon: {
    width: 16,
    height: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 16.5,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  viewDetailsButton: {
    flex: 1,
    height: 54,
    backgroundColor: 'transparent',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 22.5,
    letterSpacing: -0.3,
  },
  backButton: {
    height: 54,
    backgroundColor: 'transparent',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: 22.5,
    letterSpacing: -0.3,
  },
  shareButton: {
    width: 54,
    height: 54,
    backgroundColor: 'transparent',
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    width: 24,
    height: 24,
  },
});
